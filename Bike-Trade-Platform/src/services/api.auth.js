import { instance } from "../lib/axios";
export const login = async (credentials) => {
  const response = await instance.post("/auth/login", credentials);
    return response.data;
};
export const register = async (userInfo) => {
  const response = await instance.post("/auth/register", userInfo);
  return response.data;
}
export const verifyIOTP = async (otpInfo) => {
  const response = await instance.post("/auth/verify-otp", otpInfo);
  return response.data;
}

export const refreshToken = async (refreshToken) => {
  const response = await instance.post("/auth/refresh-token", { refreshToken });
  return response.data;
}