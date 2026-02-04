import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const instance = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token (skip for auth endpoints)
instance.interceptors.request.use(
  async (config) => {
    try {
      // Don't add token to auth endpoints (login, register, verify-otp, refresh-token)
      const authEndpoints = ["/auth/login", "/auth/register", "/auth/verify-otp", "/auth/refresh-token"];
      const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      if (!isAuthEndpoint) {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.log("Error getting token from storage:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401/403 errors and auto-refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token API
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { access_token, refresh_token } = response.data;

        // Save new tokens
        await AsyncStorage.setItem("authToken", access_token);
        if (refresh_token) {
          await AsyncStorage.setItem("refreshToken", refresh_token);
        }

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Process queued requests
        processQueue(null, access_token);
        
        isRefreshing = false;

        // Retry original request
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, clear all auth data and logout
        processQueue(refreshError, null);
        isRefreshing = false;
        
        try {
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("refreshToken");
          await AsyncStorage.removeItem("userData");
        } catch (e) {
          console.log("Error clearing auth data:", e);
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For other errors or if refresh failed, reject
    return Promise.reject(error);
  }
);
