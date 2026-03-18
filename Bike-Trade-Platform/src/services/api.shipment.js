import { instance } from '../lib/axios';

/**
 * Shipment API Services
 */

/**
 * Lấy thông tin vận chuyển của một đơn hàng
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise} Shipment data với trackings
 */
export const getShipmentByOrder = async (orderId) => {
  try {
    const response = await instance.get(`/shipping/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting shipment by order:', error);
    throw error;
  }
};

/**
 * Lấy danh sách vận chuyển của người dùng
 * @param {object} params - Query parameters (skip, take, status)
 * @returns {Promise} List of shipments
 */
export const getMyShipments = async (params = {}) => {
  try {
    const response = await instance.get('/shipping/my-shipments', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting my shipments:', error);
    throw error;
  }
};

/**
 * Xác nhận đã chuẩn bị hàng xong (Seller)
 * @param {string} shipmentId - ID của shipment
 * @returns {Promise} Updated shipment data
 */
export const confirmShipmentReady = async (shipmentId) => {
  try {
    const response = await instance.patch(
      `/shipping/${shipmentId}/confirm-ready`
    );
    return response.data;
  } catch (error) {
    console.error('Error confirming shipment ready:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái vận chuyển thủ công (Seller/Admin)
 * @param {string} shipmentId - ID của shipment
 * @param {object} updateData - Data to update (status, location, description)
 * @returns {Promise} Updated shipment data
 */
export const updateShipmentStatus = async (shipmentId, updateData) => {
  try {
    const response = await instance.patch(
      `/shipping/${shipmentId}/status`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating shipment status:', error);
    throw error;
  }
};
