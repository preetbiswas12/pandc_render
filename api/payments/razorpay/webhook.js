/**
 * Razorpay webhook relay for pandctexfab.com
 * -----------------------------------------
 * Razorpay POSTs webhook events to this endpoint. The account behind
 * pandctexfab.com is the same Razorpay account registered to
 * pandcjewellery.com, so this relay forwards every event verbatim to the
 * pandcjewellery.com webhook, which owns the order/payment bookkeeping.
 *
 * The raw request body is forwarded byte-for-byte and the
 * `x-razorpay-signature` header is passed through untouched, so the
 * receiving endpoint's HMAC-SHA256 check still validates: the signature is
 * computed over the raw body with the account webhook secret, neither of
 * which this relay modifies.
 *
 * Config (Vercel / Render environment variables):
 *   RAZORPAY_UPSTREAM_WEBHOOK_URL  (required) full URL of the webhook to relay to
 *   RELAY_SHARED_SECRET            (optional) if set, callers must send
 *                                  `x-relay-secret` with the same value
 */

const UPSTREAM = process.env.RAZORPAY_UPSTREAM_WEBHOOK_URL;
const SHARED_SECRET = process.env.RELAY_SHARED_SECRET;

/** Headers worth passing through to the upstream webhook. */
const FORWARDED_HEADERS = [
  'x-razorpay-signature',
  'x-razorpay-event',
  'x-razorpay-delivery',
  'x-razorpay-account-id',
  'content-type',
];

function text(res, status, message) {
  res.statusCode = status;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end(message);
}

export default async function handler(req, res) {
  // Razorpay always POSTs. Anything else is not a delivery attempt.
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return text(res, 405, 'Method Not Allowed');
  }

  if (!UPSTREAM) {
    console.error('[razorpay-relay] RAZORPAY_UPSTREAM_WEBHOOK_URL is not set');
    return text(res, 500, 'Relay not configured');
  }

  if (SHARED_SECRET && req.headers['x-relay-secret'] !== SHARED_SECRET) {
    return text(res, 401, 'Unauthorized');
  }

  // The raw body must be read as bytes and forwarded unchanged, otherwise the
  // HMAC signature on the upstream side will not match.
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks);

  const headers = {};
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers[name];
    if (typeof value === 'string') headers[name] = value;
  }
  // Signalled so the upstream endpoint does not attempt to parse and re-serve.
  headers['x-relayed-from'] = 'pandctexfab.com';

  try {
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    const upstreamText = await upstreamRes.text().catch(() => '');

    console.log(
      `[razorpay-relay] event=${req.headers['x-razorpay-event'] ?? 'unknown'} ` +
        `delivery=${req.headers['x-razorpay-delivery'] ?? 'unknown'} ` +
        `-> ${upstreamRes.status}`
    );

    if (!upstreamRes.ok) {
      // Surfaced in logs rather than returned as a failure: returning non-2xx
      // makes Razorpay retry the same event against this relay repeatedly,
      // which cannot succeed if the mismatch is upstream of us.
      console.error(`[razorpay-relay] upstream error body: ${upstreamText.slice(0, 500)}`);
    }

    // Always 200 so Razorpay marks the delivery processed and stops retrying.
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        ok: true,
        relayed: true,
        upstreamStatus: upstreamRes.status,
      })
    );
  } catch (error) {
    console.error('[razorpay-relay] forward failed:', error);
    return text(res, 200, JSON.stringify({ ok: false, relayed: false }));
  }
}