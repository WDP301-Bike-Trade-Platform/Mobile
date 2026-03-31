import { instance } from "../lib/axios";

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch public platform settings (no auth required).
 * Results are cached in memory for 5 minutes.
 */
export const getPlatformSettings = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - lastFetchTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const response = await instance.get("/settings/public");
    const payload = response?.data;
    const data = payload?.data || payload;
    cachedSettings = data;
    lastFetchTime = Date.now();
    return data;
  } catch (error) {
    console.error("Error fetching platform settings:", error?.message);
    // Return cached or defaults if API fails
    return cachedSettings || {
      deposit_rate: 0.1,
      escrow_hold_hours: 72,
      platform_fee_rate: 0.07,
      remaining_payment_window_min: 3,
      shipping_fee: 35000,
    };
  }
};

/**
 * Clear the in-memory cache (call on logout or when Admin updates settings).
 */
export const clearSettingsCache = () => {
  cachedSettings = null;
  lastFetchTime = 0;
};
