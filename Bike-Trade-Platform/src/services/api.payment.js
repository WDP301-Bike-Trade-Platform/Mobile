import { instance } from "../lib/axios";

/**
 * Payment API Services
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

// Tạo payment link cho order
export const createPaymentForOrder = async (
  orderId,
  options = {}
) => {
  try {
    const { paymentStage, platform = 'MOBILE' } = options;
    const body = {
      orderId,
      platform,
      ...(paymentStage ? { paymentStage } : {}),
    };

    const response = await instance.post("/payment/create-for-order", body);
    return unwrapApiResponse(response);
  } catch (error) {
    console.error("Error creating payment for order:", error);
    throw error;
  }
};

// Lấy thông tin thanh toán theo order code
export const getPaymentInfo = async (orderCode) => {
  try {
    const response = await instance.get(`/payment/info/${orderCode}`);
    return unwrapApiResponse(response);
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
    return unwrapApiResponse(response);
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
