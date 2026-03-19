import { instance } from '../lib/axios';

/**
 * Shipment API Services - Updated with new API
 * Response structure:
 * {
 *   shipmentId: string,
 *   orderId: string,
 *   trackingNumber: string | null,
 *   carrier: string | null,
 *   status: "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "RETURNED" | "CANCELLED",
 *   shippingFee: number,
 *   estimatedDelivery: ISO date string | null,
 *   deliveredAt: ISO date string | null,
 *   shippedAt: ISO date string | null,
 *   createdAt: ISO date string,
 *   updatedAt: ISO date string,
 *   trackings: [
 *     {
 *       trackingId: string,
 *       status: string,
 *       location: string | null,
 *       description: string | null,
 *       trackedAt: ISO date string
 *     }
 *   ]
 * }
 */

// ============================================
// 👤 BUYER ENDPOINTS
// ============================================

/**
 * Get shipment information by shipment ID
 * @param {string} shipmentId - Shipment ID
 * @returns {Promise} Shipment data with trackings
 */
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await instance.get(`/shipping/${shipmentId}`);
    return validateShipmentResponse(response.data);
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.error('Error getting shipment by ID:', error);
    }
    throw error;
  }
};

/**
 * Get shipment information for an order (Buyer view)
 * @param {string} orderId - Order ID
 * @returns {Promise} Shipment data with trackings
 */
export const getShipmentByOrder = async (orderId) => {
  try {
    const response = await instance.get(`/shipping/order/${orderId}`);
    return validateShipmentResponse(response.data);
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.error('Error getting shipment by order:', error);
    }
    throw error;
  }
};

/**
 * Get list of user's shipments (buyer + seller shipments)
 * Supports pagination and filtering by status
 * @param {object} params - Query parameters {skip, take, status}
 * @returns {Promise} List of shipments {items: [], total, skip, take}
 */
export const getMyShipments = async (params = {}) => {
  try {
    const queryParams = {
      skip: params.skip || 0,
      take: params.take || 10,
      ...params.status && { status: params.status },
    };
    const response = await instance.get('/shipping/my-shipments', { params: queryParams });
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
 * Get list of pending shipments for seller (helper)
 * @returns {Promise} List of pending shipments
 */
export const getSellerPendingShipments = async () => {
  try {
    return await getMyShipments({ status: 'PENDING' });
  } catch (error) {
    console.error('Error getting seller pending shipments:', error);
    throw error;
  }
};

/**
 * Get list of in-transit shipments for seller (helper)
 * @returns {Promise} List of in-transit shipments
 */
export const getSellerInTransitShipments = async () => {
  try {
    return await getMyShipments({ status: 'IN_TRANSIT' });
  } catch (error) {
    console.error('Error getting seller in-transit shipments:', error);
    throw error;
  }
};

/**
 * Get shipment statistics (summary of shipment counts by status)
 * @returns {Promise} Stats {pending, inTransit, delivered, total}
 */
export const getShipmentStats = async () => {
  try {
    const shipments = await getMyShipments({ take: 100 });
    const items = shipments.items || [];
    
    const stats = {
      total: shipments.total || items.length,
      pending: items.filter(s => s.status === 'PENDING').length,
      inTransit: items.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PICKED_UP' || s.status === 'OUT_FOR_DELIVERY').length,
      delivered: items.filter(s => s.status === 'DELIVERED').length,
      failed: items.filter(s => s.status === 'FAILED' || s.status === 'CANCELLED').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting shipment stats:', error);
    // Return default stats if error
    return { total: 0, pending: 0, inTransit: 0, delivered: 0, failed: 0 };
  }
};

/**
 * Get all shipments (Admin only)
 * @param {object} params - Query parameters {skip, take, status}
 * @returns {Promise} List of all shipments
 */
export const getAllShipments = async (params = {}) => {
  try {
    const queryParams = {
      skip: params.skip || 0,
      take: params.take || 10,
      ...params.status && { status: params.status },
    };
    const response = await instance.get('/shipping', { params: queryParams });
    return {
      ...response.data,
      items: response.data.items?.map(item => validateShipmentResponse(item)) || []
    };
  } catch (error) {
    console.error('Error getting all shipments:', error);
    throw error;
  }
};

// ============================================
// 📦 SELLER ENDPOINTS
// ============================================

/**
 * Confirm that goods are ready for pickup (Seller)
 * @param {string} shipmentId - Shipment ID
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
 * Manually update shipment status (Seller/Admin)
 * @param {string} shipmentId - Shipment ID
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

// ============================================
// 🛠️ ADMIN ENDPOINTS
// ============================================

/**
 * Create shipment from an order (Admin only)
 * Usually used when payment is successful but system hasn't auto-created
 * @param {string} orderId - Order ID
 * @returns {Promise} Created shipment data
 */
export const createShipmentFromOrder = async (orderId) => {
  try {
    const response = await instance.post('/shipping/create-from-order', { orderId });
    return validateShipmentResponse(response.data);
  } catch (error) {
    console.error('Error creating shipment from order:', error);
    throw error;
  }
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Validate and transform shipment response
 * Ensures all fields always have values
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
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    trackings: Array.isArray(data.trackings)
      ? data.trackings.map(tracking => ({
          trackingId: tracking.trackingId || '',
          status: tracking.status || '',
          location: tracking.location || null,
          description: tracking.description || null,
          trackedAt: tracking.trackedAt || new Date().toISOString(),
        }))
      : [],
  };
};

/**
 * Map status to English label
 * @param {string} status - Status code
 * @returns {string} English status label
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    'PENDING': 'Pending',
    'PICKED_UP': 'Picked Up',
    'IN_TRANSIT': 'In Transit',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered',
    'FAILED': 'Failed',
    'RETURNED': 'Returned',
    'CANCELLED': 'Cancelled',
  };
  return statusMap[status] || status;
};

/**
 * Get color for status
 * @param {string} status - Status code
 * @returns {string} Hex color code
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
