import { instance } from "../lib/axios";

//lấy danh sách yêu cầu kiểm định (theo role: inspector thấy của mình)
export const getInspections = async ({ listingId, requestStatus, page = 1, limit = 10 } = {}) => {
  try {
    const params = { page, limit };
    if (listingId) params.listingId = listingId;
    if (requestStatus) params.requestStatus = requestStatus;
    const response = await instance.get("/inspections", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching inspections:", error);
    throw error;
  }
};

//tạo yêu cầu kiểm định - user
export const createInspectionRequest = async (listingId) => {
  try {
    const response = await instance.post("/inspections", { listingId });
    return response.data;
  } catch (error) {
    console.error("Error creating inspection request:", error);
    throw error;
  }
};

//hủy yêu cầu kiểm định
export const cancelInspectionRequest = async (requestId, cancelReason) => {
  try {
    const response = await instance.patch(`/inspections/${requestId}/cancel`, {
      cancelReason,
    });
    return response.data;
  } catch (error) {
    console.error("Error canceling inspection request:", error);
    throw error;
  }
};

//lấy danh sách yêu cầu kiểm định của người dùng - user
export const getMyInspectionRequests = async ({ requestStatus, page = 1, limit = 10 } = {}) => {
  try {
    const params = { page, limit };
    if (requestStatus) params.requestStatus = requestStatus;
    const response = await instance.get("/inspections/my-requests", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching user inspection requests:", error);
    throw error;
  }
};

//lấy chi tiết một yêu cầu kiểm định
export const getInspectionDetail = async (requestId) => {
  try {
    const response = await instance.get(`/inspections/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inspection detail:", error);
    throw error;
  }
};

//cập nhật yêu cầu kiểm định - inspector/admin
export const updateInspection = async (requestId, updateData) => {
  try {
    const response = await instance.patch(
      `/inspections/${requestId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating inspection:", error);
    throw error;
  }
};

//cập nhật kết quả kiểm định - inspector
export const updateInspectionReport = async (requestId, reportData) => {
  try {
    const response = await instance.patch(
      `/inspections/${requestId}/report`,
      reportData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating inspection report:", error);
    throw error;
  }
};

//inspector tự nhận yêu cầu kiểm định (PENDING → CONFIRMED)
export const assignInspection = async (requestId) => {
  try {
    const response = await instance.post(
      `/inspections/${requestId}/assign`
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning inspection:", error);
    throw error;
  }
};