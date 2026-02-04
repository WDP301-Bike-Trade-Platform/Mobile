import { instance } from "../lib/axios";

/**
 * Payment API Services
 */

// Tạo payment link cho listing đơn lẻ
export const createPaymentForListing = async (listingId) => {
  try {
    const response = await instance.post("/payment/create-for-listing", {
      listingId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating payment for listing:", error);
    throw error;
  }
};

// Tạo payment link cho order (nhiều items từ cart)
export const createPaymentForOrder = async (orderId) => {
  try {
    const response = await instance.post("/payment/create-for-order", {
      orderId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating payment for order:", error);
    throw error;
  }
};

// Lấy thông tin thanh toán theo order code
export const getPaymentInfo = async (orderCode) => {
  try {
    const response = await instance.get(`/payment/info/${orderCode}`);
    return response.data;
  } catch (error) {
    console.error("Error getting payment info:", error);
    throw error;
  }
};

// Hủy payment link
export const cancelPayment = async (orderCode, cancellationReason) => {
  try {
    const response = await instance.post("/payment/cancel", {
      orderCode,
      cancellationReason,
    });
    return response.data;
  } catch (error) {
    console.error("Error canceling payment:", error);
    throw error;
  }
};

/**
 * Payment Status Constants
 * Dùng để hiển thị trạng thái thanh toán
 */
export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  PROCESSING: "PROCESSING",
};
