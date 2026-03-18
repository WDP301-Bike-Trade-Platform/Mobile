import { instance } from "../lib/axios";

/**
 * Order API Services
 */

const unwrapApiResponse = (response) => {
  const payload = response?.data;

  if (payload?.success === false) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  return payload;
};

// Tạo order mới từ listing
export const createOrder = async (orderData) => {
  try {
    const response = await instance.post("/orders", orderData);
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Tạo orders từ giỏ hàng (checkout cart)
export const checkoutCart = async (checkoutData) => {
  try {
    const response = await instance.post("/orders/checkout-cart", checkoutData);
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error checking out cart:", error);
    throw error;
  }
};

// Lấy danh sách orders của buyer (người mua)
export const getMyOrders = async (status) => {
  try {
    const params = status ? { status } : {};
    const response = await instance.get("/orders/my-orders", { params });
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error getting my orders:", error);
    throw error;
  }
};

// Lấy danh sách orders cho seller (người bán)
export const getSellerOrders = async (status) => {
  try {
    const params = status ? { status } : {};
    const response = await instance.get("/orders/seller-orders", { params });
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error getting seller orders:", error);
    throw error;
  }
};

// Lấy chi tiết order theo ID
export const getOrderById = async (orderId) => {
  try {
    const response = await instance.get(`/orders/${orderId}`);
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    throw error;
  }
};

// Seller xác nhận đơn hàng
export const confirmOrder = async (orderId, note) => {
  try {
    const encodedOrderId = encodeURIComponent(orderId);
    const url = `/orders/${encodedOrderId}/confirm`;
    const response = await instance.patch(url, {
      note,
    });
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
};

// Buyer hủy đơn hàng
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await instance.patch(`/orders/${orderId}/buyer-cancel`, {
      reason,
    });
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
};

// Seller hoàn thành đơn hàng
export const completeOrder = async (orderId) => {
  try {
    const response = await instance.patch(`/orders/${orderId}/complete`);
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error completing order:", error);
    throw error;
  }
};

// Seller xác nhận đơn hàng (cho escrow)
export const sellerConfirmOrder = async (orderId) => {
  try {
    const encodedOrderId = encodeURIComponent(orderId);
    const url = `/orders/${encodedOrderId}/confirm`;
    const response = await instance.patch(url, {
      note: 'Confirmed by seller',
    });
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
};

// Seller từ chối đơn hàng (cho escrow)
export const sellerRejectOrder = async (orderId, reason) => {
  try {
    const response = await instance.patch(`/orders/${orderId}/seller-reject`, {
      reason,
    });
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error seller rejecting order:", error);
    throw error;
  }
};

/**
 * Order Status Constants
 * Dùng để filter hoặc hiển thị trạng thái
 */
export const OrderStatus = {
  PENDING: "PENDING",
  DEPOSITED: "DEPOSITED",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  FORFEITED: "FORFEITED",
  CANCELLED_BY_BUYER: "CANCELLED_BY_BUYER",
  CANCELLED_BY_SELLER: "CANCELLED_BY_SELLER",
  COMPLETED: "COMPLETED",
};
