// Razorpay Payment Integration Utility
import { config } from '../config/env';

// Define Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
    on: (event: string, handler: (response: any) => void) => void;
  };
}

declare const window: Window & typeof globalThis;

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Payment options interface
export interface PaymentOptions {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDetails?: string;
  notes?: Record<string, string>;
  onSuccess: (paymentId: string, response: RazorpayResponse) => void;
  onFailure: (error: any) => void;
  onDismiss?: () => void;
}

// Initialize Razorpay payment directly (no backend needed)
export const initiateRazorpayPayment = async (options: PaymentOptions): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded) {
    options.onFailure(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    return;
  }

  const razorpayKey = config.razorpay.keyId;

  if (!razorpayKey) {
    options.onFailure(new Error('Razorpay key is not configured. Please check console for setup instructions.'));
    return;
  }

  const amountInPaise = Math.round(options.amount * 100);

  // Create Razorpay order directly
  const razorpayOptions: RazorpayOptions = {
    key: razorpayKey,
    amount: amountInPaise,
    currency: config.currency.code,
    name: config.app.name,
    description: options.orderDetails || 'Order Payment',
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    notes: options.notes || {},
    theme: {
      color: '#000000',
    },
    handler: (response) => {
      options.onSuccess(response.razorpay_payment_id, response);
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  razorpay.on('payment.failed', (response: any) => {
    options.onFailure(response.error);
  });
  razorpay.open();
};

// Verify payment (client-side validation)
export const verifyPayment = (paymentId: string): boolean => {
  return !!paymentId && paymentId.startsWith('pay_');
};

// Format amount for display
export const formatCurrency = (amount: number): string => {
  return `${config.currency.symbol}${amount.toFixed(2)}`;
};
