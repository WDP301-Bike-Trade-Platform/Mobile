import { createContext, useContext, useEffect, useState } from "react";
import { instance } from "../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlatformSettingsProvider } from "./PlatformSettingsProvider";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tokenRefreshListener, setTokenRefreshListener] = useState(null);
  const [platformSettings, setPlatformSettings] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
    fetchPlatformSettings();
    
    // Set up response interceptor to detect when refresh token fails
    const interceptor = instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If refresh token failed (401 after retry), logout user
        if (error.config?._retry && error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );
    
    // Cleanup interceptor on unmount
    return () => {
      instance.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");
      if (token) {
        setIsAuthenticated(true);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.log("Error checking auth status:", error);
    } finally {
      setAuthLoading(false);
    }
  };


  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userData");
  };

  const fetchPlatformSettings = async () => {
    try {
      const settings = await getPlatformSettings(true);
      setPlatformSettings(settings);
    } catch (error) {
      console.log("Error fetching platform settings:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        authLoading,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default AppProvider;
