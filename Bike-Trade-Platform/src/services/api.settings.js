import { instance } from "../lib/axios";

/**
 * Platform Settings API Services
 * Fetch admin-configurable platform settings (deposit rate, fees, shipping config, etc.)
 */

const unwrapApiResponse = (response) => {
  const payload = response?.data;

  if (payload?.success === false) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  return payload;
};

/**
 * Get public platform settings (no auth required)
 * Returns: deposit_rate, platform_fee_rate, escrow_hold_hours, 
 *          remaining_payment_window_min, shipping_fee
 */
export const getPublicSettings = async () => {
  try {
    const response = await instance.get("/settings/public");
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error fetching public settings:", error);
    throw error;
  }
};

/**
 * Get all platform settings (admin only)
 */
export const getSettings = async () => {
  try {
    const response = await instance.get("/settings");
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};
