import { instance } from '../lib/axios';

/**
 * Shipment API Services
 * Response structure:
 * {
 *   shipmentId: string,
 *   orderId: string,
 *   trackingNumber: string,
 *   carrier: string,
 *   status: "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "RETURNED" | "CANCELLED",
 *   shippingFee: number,
 *   estimatedDelivery: ISO date string,
 *   deliveredAt: ISO date string | null,
 *   shippedAt: ISO date string | null,
 *   createdAt: ISO date string,
 *   updatedAt: ISO date string,
 *   trackings: [
 *     {
 *       trackingId: string,
 *       status: string,
 *       location: string,
 *       description: string,
 *       trackedAt: ISO date string
 *     }
 *   ]
 * }
 */

// ============================================
// 👤 BUYER ENDPOINTS
// ============================================

/**
 * Lấy thông tin vận chuyển của một đơn hàng (Buyer view)
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise} Shipment data với trackings
 */
export const getShipmentByOrder = async (orderId) => {
  try {
    const response = await instance.get(`/shipping/order/${orderId}`);
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error getting shipment by order:', error);
    throw error;
  }
};

/**
 * Lấy danh sách vận chuyển của user (buyer + seller shipments)
 * @param {object} params - Query parameters {skip, take, status, sortBy, sortOrder}
 * @returns {Promise} List of shipments
 */
export const getMyShipments = async (params = {}) => {
  try {
    const response = await instance.get('/shipping/my-shipments', { params });
    return {
      ...response.data,
      items: response.data.items?.map(item => validateShipmentResponse(item)) || []
    };
  } catch (error) {
    console.error('Error getting my shipments:', error);
    throw error;
  }
};

/**
 * Lấy thống kê shipments của user
 * @returns {Promise} Stats object {pending, inTransit, delivered, failed, cancelled}
 */
export const getShipmentStats = async () => {
  try {
    const response = await instance.get('/shipping/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting shipment stats:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết shipment theo ID
 * @param {string} shipmentId - ID của shipment
 * @returns {Promise} Shipment data
 */
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await instance.get(`/shipping/${shipmentId}`);
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error getting shipment by ID:', error);
    throw error;
  }
};

// ============================================
// 📦 SELLER ENDPOINTS
// ============================================

/**
 * Xác nhận đã chuẩn bị hàng xong (Seller)
 * @param {string} shipmentId - ID của shipment
 * @returns {Promise} Updated shipment data
 */
export const confirmShipmentReady = async (shipmentId) => {
  try {
    const response = await instance.patch(`/shipping/${shipmentId}/confirm-ready`);
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error confirming shipment ready:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái vận chuyển thủ công (Seller/Admin)
 * @param {string} shipmentId - ID của shipment
 * @param {object} updateData - Data to update {status, location, description}
 * @returns {Promise} Updated shipment data
 */
export const updateShipmentStatus = async (shipmentId, updateData) => {
  try {
    const response = await instance.patch(`/shipping/${shipmentId}/status`, updateData);
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    throw error;
  }
};

/**
 * Thêm tracking update (Seller/Admin/System)
 * @param {string} shipmentId - ID của shipment
 * @param {object} trackingData - Tracking data {status, location, description}
 * @returns {Promise} Updated shipment data
 */
export const addShipmentTracking = async (shipmentId, trackingData) => {
  try {
    const response = await instance.post(`/shipping/${shipmentId}/tracking`, trackingData);
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error adding shipment tracking:', error);
    throw error;
  }
};

/**
 * Hủy vận chuyển (Seller/Admin)
 * @param {string} shipmentId - ID của shipment
 * @param {object} cancelData - Cancel data {reason}
 * @returns {Promise} Updated shipment data
 */
export const cancelShipment = async (shipmentId, cancelData = {}) => {
  try {
    const response = await instance.patch(`/shipping/${shipmentId}/cancel`, cancelData);
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    throw error;
  }
};

// ============================================
// 🏢 SELLER GET ENDPOINTS
// ============================================

/**
 * Lấy danh sách shipments chờ xác nhận (Seller)
 * @returns {Promise} List of pending shipments
 */
export const getSellerPendingShipments = async () => {
  try {
    const response = await instance.get('/shipping/my-shipments', {
      params: {
        status: 'PENDING',
        sortBy: 'createdAt',
        sortOrder: 'asc'
      }
    });
    return {
      ...response.data,
      items: response.data.items?.map(item => validateShipmentResponse(item)) || []
    };
  } catch (error) {
    console.error('Error getting seller pending shipments:', error);
    throw error;
  }
};

/**
 * Lấy danh sách shipments đang vận chuyển (Seller)
 * @returns {Promise} List of in-transit shipments
 */
export const getSellerInTransitShipments = async () => {
  try {
    const response = await instance.get('/shipping/my-shipments', {
      params: {
        status: 'IN_TRANSIT',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      }
    });
    return {
      ...response.data,
      items: response.data.items?.map(item => validateShipmentResponse(item)) || []
    };
  } catch (error) {
    console.error('Error getting seller in-transit shipments:', error);
    throw error;
  }
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Validate và transform shipment response
 * Đảm bảo tất cả fields luôn có giá trị
 * @param {object} data - Raw shipment data from API
 * @returns {object} Validated shipment data
 */
const validateShipmentResponse = (data) => {
  if (!data) {
    throw new Error('Invalid shipment data');
  }

  return {
    shipmentId: data.shipmentId || '',
    orderId: data.orderId || '',
    trackingNumber: data.trackingNumber || 'N/A',
    carrier: data.carrier || 'Unknown',
    status: data.status || 'PENDING',
    shippingFee: data.shippingFee || 0,
    estimatedDelivery: data.estimatedDelivery || null,
    deliveredAt: data.deliveredAt || null,
    shippedAt: data.shippedAt || null,
    shopConfirmedAt: data.shopConfirmedAt || null,
    cancelledAt: data.cancelledAt || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    trackings: Array.isArray(data.trackings)
      ? data.trackings.map(tracking => ({
          trackingId: tracking.trackingId || '',
          status: tracking.status || '',
          location: tracking.location || '',
          description: tracking.description || '',
          trackedAt: tracking.trackedAt || new Date().toISOString(),
        }))
      : [],
  };
};

/**
 * Map status sang Vietnamese
 * @param {string} status - English status
 * @returns {string} Vietnamese status
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    'PENDING': 'Chờ xử lý',
    'PICKED_UP': 'Đã lấy hàng',
    'IN_TRANSIT': 'Đang vận chuyển',
    'OUT_FOR_DELIVERY': 'Sắp giao',
    'DELIVERED': 'Đã giao',
    'FAILED': 'Giao không thành công',
    'RETURNED': 'Đã trả lại',
    'CANCELLED': 'Đã hủy',
  };
  return statusMap[status] || status;
};

/**
 * Lấy màu cho status
 * @param {string} status - Status code
 * @returns {string} Color code (hex)
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'PENDING': '#FCD34D',
    'PICKED_UP': '#A78BFA',
    'IN_TRANSIT': '#60A5FA',
    'OUT_FOR_DELIVERY': '#34D399',
    'DELIVERED': '#22C55E',
    'FAILED': '#EF4444',
    'RETURNED': '#F97316',
    'CANCELLED': '#6B7280',
  };
  return colorMap[status] || '#CBD5E1';
};
