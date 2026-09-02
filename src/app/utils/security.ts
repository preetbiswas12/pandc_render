// Security utilities for input sanitization and validation

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize and trim input
 */
export const sanitizeAndTrim = (input: string): string => {
  return sanitizeInput(input.trim());
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 */
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{1,100}$/;
  return nameRegex.test(name);
};

/**
 * Validate pincode (6 digits for India)
 */
export const isValidPincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

/**
 * Validate phone number (10 digits for India)
 */
export const isValidPhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Sanitize review text (allow basic formatting but block scripts)
 */
export const sanitizeReviewText = (text: string): string => {
  if (!text) return '';
  // Remove any script tags or event handlers
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Validate quantity within allowed range
 */
export const isValidQuantity = (quantity: number, isFabric: boolean): boolean => {
  const min = isFabric ? 2 : 1;
  const max = isFabric ? 30 : 10;
  return Number.isInteger(quantity) && quantity >= min && quantity <= max;
};

/**
 * Escape HTML entities for safe rendering
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
