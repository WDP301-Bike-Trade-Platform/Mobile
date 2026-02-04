import { instance } from "../lib/axios";

/**
 * Lấy tất cả địa chỉ của user
 */
export const getMyAddresses = async () => {
  const response = await instance.get(`/addresses/my-addresses`);
  return response.data;
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = async () => {
  const response = await instance.get(`/addresses/default`);
  return response.data;
};

/**
 * Lấy chi tiết một địa chỉ
 */
export const getAddressById = async (addressId) => {
  const response = await instance.get(`/addresses/${addressId}`);
  return response.data;
};

/**
 * Tạo địa chỉ mới
 */
export const createAddress = async (addressData) => {
  const response = await instance.post(`/addresses`, addressData);
  return response.data;
};

/**
 * Cập nhật địa chỉ
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await instance.patch(`/addresses/${addressId}`, addressData);
  return response.data;
};

/**
 * Đặt địa chỉ làm mặc định
 */
export const setDefaultAddress = async (addressId) => {
  const response = await instance.patch(`/addresses/${addressId}/set-default`);
  return response.data;
};

/**
 * Xóa địa chỉ
 */
export const deleteAddress = async (addressId) => {
  const response = await instance.delete(`/addresses/${addressId}`);
  return response.data;
};
