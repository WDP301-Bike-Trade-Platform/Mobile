import { instance } from "../lib/axios";

export const getUser = async (userId) => {
  const response = await instance.get(`/user/profile`);
  return response.data;
};

export const updateUser = async (userData) => {
  const response = await instance.put(`/user/profile`, userData);
  return response.data;
};