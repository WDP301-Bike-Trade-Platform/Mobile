import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "userData";

export const authStorage = {
  // Save token
  saveToken: async (token) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.log("Error saving token:", error);
      return false;
    }
  },

  // Get token
  getToken: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.log("Error getting token:", error);
      return null;
    }
  },

  // Remove token (logout)
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return true;
    } catch (error) {
      console.log("Error removing token:", error);
      return false;
    }
  },

  // Save refresh token
  saveRefreshToken: async (refreshToken) => {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      return true;
    } catch (error) {
      console.log("Error saving refresh token:", error);
      return false;
    }
  },

  // Get refresh token
  getRefreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (error) {
      console.log("Error getting refresh token:", error);
      return null;
    }
  },

  // Remove refresh token
  removeRefreshToken: async () => {
    try {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      return true;
    } catch (error) {
      console.log("Error removing refresh token:", error);
      return false;
    }
  },

  // Save user data
  saveUserData: async (userData) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.log("Error saving user data:", error);
      return false;
    }
  },

  // Get user data
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.log("Error getting user data:", error);
      return null;
    }
  },

  // Remove user data
  removeUserData: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      return true;
    } catch (error) {
      console.log("Error removing user data:", error);
      return false;
    }
  },

  // Clear all auth data
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      return true;
    } catch (error) {
      console.log("Error clearing auth data:", error);
      return false;
    }
  },

  // Check if authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Save complete login response
  saveLoginResponse: async (response) => {
    try {
      if (response.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.access_token);
      }
      if (response.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      }
      if (response.user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }
      return true;
    } catch (error) {
      console.log("Error saving login response:", error);
      return false;
    }
  },
};
