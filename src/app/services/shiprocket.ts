// Shipping Service - Static site version
// Uses config-based shipping rates since backend is removed

import { config } from '../config/env';

interface CartItem {
  productType?: string;
  unit?: string;
  cartQuantity: number;
  [key: string]: any;
}

/**
 * Validate pincode format (6 digits for India)
 */
export const validatePincodeFormat = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

/**
 * Calculate shipping charge based on cart items
 * Fabric: 1-10 meters = ₹199, 11-30 meters = ₹299
 * Saree/Handloom/Suit-set: 1-5 pieces = ₹199, 6-10 pieces = ₹299
 * Mixed orders: charges add up
 */
export const calculateShippingFromCart = (cartItems: CartItem[]): number => {
  let fabricMeters = 0;
  let pieceItems = 0;

  for (const item of cartItems) {
    const isFabric = item.productType === 'fabric' || (!item.productType && item.unit !== 'pieces');
    if (isFabric) {
      fabricMeters += item.cartQuantity;
    } else {
      pieceItems += item.cartQuantity;
    }
  }

  let shipping = 0;

  // Fabric shipping calculation
  if (fabricMeters > 0) {
    if (fabricMeters <= 10) {
      shipping += 199;
    } else {
      shipping += 299;
    }
  }

  // Piece items shipping calculation
  if (pieceItems > 0) {
    if (pieceItems <= 5) {
      shipping += 199;
    } else {
      shipping += 299;
    }
  }

  return shipping;
};

/**
 * Calculate shipping charge for checkout
 * Uses static rates from config since backend is removed
 */
export const calculateShippingCharge = async (
  _destinationPincode: string,
  _weight: number = 0.5,
  subtotal: number = 0,
  cartItems: CartItem[] = []
): Promise<{
  available: boolean;
  cost: number | null;
  message: string;
}> => {
  // Validate pincode format
  if (!validatePincodeFormat(_destinationPincode)) {
    return {
      available: false,
      cost: null,
      message: 'Invalid pincode format (6 digits required)',
    };
  }

  // Free shipping if above threshold
  if (subtotal >= config.shipping.freeThreshold) {
    return {
      available: true,
      cost: 0,
      message: 'Free shipping on this order!',
    };
  }

  // Calculate shipping based on cart items
  const shippingCost = calculateShippingFromCart(cartItems);

  return {
    available: true,
    cost: shippingCost,
    message: shippingCost === 0 ? 'Free shipping' : `Delivery charge: ₹${shippingCost}`,
  };
};

/**
 * Get all available shipping options for a pincode
 */
export const getShippingOptions = async (
  _pincode: string,
  _weight: number = 0.5
): Promise<any[]> => {
  if (!validatePincodeFormat(_pincode)) {
    return [];
  }

  return [
    {
      name: 'Standard Delivery',
      cost: config.shipping.standardCost,
      estimatedDays: '5-7 business days',
    },
    {
      name: 'Express Delivery',
      cost: config.shipping.expressCost,
      estimatedDays: '2-3 business days',
    },
  ];
};

/**
 * Validate pincode and return serviceability status
 */
export const validatePincode = async (
  pincode: string
): Promise<{
  valid: boolean;
  format: boolean;
  serviceable: boolean;
  message: string;
}> => {
  const formatValid = validatePincodeFormat(pincode);

  return {
    valid: formatValid,
    format: formatValid,
    serviceable: formatValid,
    message: formatValid
      ? 'Pincode is valid. Shipping available.'
      : 'Invalid pincode format. Please enter a 6-digit pincode.',
  };
};

/**
 * Format shipping cost for display
 */
export const formatShippingCost = (cost: number): string => {
  return cost === 0 ? 'FREE' : `₹${cost.toFixed(0)}`;
};

/**
 * Get estimated delivery message
 */
export const getDeliveryMessage = (deliveryDays?: number): string => {
  if (!deliveryDays) {
    return 'Delivery time varies by location';
  }

  if (deliveryDays <= 2) {
    return `Express Delivery - ${deliveryDays} days`;
  } else if (deliveryDays <= 5) {
    return `Standard Delivery - ${deliveryDays} days`;
  } else {
    return `Economy Delivery - ${deliveryDays} days`;
  }
};

export default {
  validatePincodeFormat,
  calculateShippingCharge,
  calculateShippingFromCart,
  getShippingOptions,
  validatePincode,
  formatShippingCost,
  getDeliveryMessage,
};
