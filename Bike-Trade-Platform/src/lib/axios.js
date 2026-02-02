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
      // Don't add token to auth endpoints (login, register, verify-otp)
      const authEndpoints = ["/auth/login", "/auth/register", "/auth/verify-otp"];
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

// Add response interceptor to handle 401/403 errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // console.error("API Error:", {
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   url: error.config?.url,
    //   data: error.response?.data,
    // });
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear auth data
      try {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
      } catch (e) {
        console.log("Error clearing auth data:", e);
      }
      // You can trigger a logout action or navigate to login here
    }
    return Promise.reject(error);
  }
);
