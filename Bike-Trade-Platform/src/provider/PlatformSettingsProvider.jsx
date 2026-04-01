import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../services/api.settings';

export const PlatformSettingsContext = createContext();

// Default values matching backend defaults
const DEFAULT_SETTINGS = {
  deposit_rate: 0.1,
  platform_fee_rate: 0.1,
  escrow_hold_hours: 72,
  remaining_payment_window_min: 10,
  shipping_fee: 35000,
};

/**
 * PlatformSettingsProvider
 * Fetches and caches platform settings from the backend.
 * Provides settings globally to all components in the app.
 */
export const PlatformSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicSettings();
      setSettings({
        deposit_rate: data?.deposit_rate ?? DEFAULT_SETTINGS.deposit_rate,
        platform_fee_rate: data?.platform_fee_rate ?? DEFAULT_SETTINGS.platform_fee_rate,
        escrow_hold_hours: data?.escrow_hold_hours ?? DEFAULT_SETTINGS.escrow_hold_hours,
        remaining_payment_window_min: data?.remaining_payment_window_min ?? DEFAULT_SETTINGS.remaining_payment_window_min,
        shipping_fee: data?.shipping_fee ?? DEFAULT_SETTINGS.shipping_fee,
      });
      setLastFetch(Date.now());
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
      setError(err.message);
      // Keep using default settings on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Refresh settings every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchSettings, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  const value = {
    settings,
    loading,
    error,
    lastFetch,
    refreshSettings: fetchSettings,
  };

  return (
    <PlatformSettingsContext.Provider value={value}>
      {children}
    </PlatformSettingsContext.Provider>
  );
};

/**
 * Hook to use platform settings
 */
export const usePlatformSettings = () => {
  const context = React.useContext(PlatformSettingsContext);
  if (!context) {
    throw new Error('usePlatformSettings must be used within PlatformSettingsProvider');
  }
  return context;
};
