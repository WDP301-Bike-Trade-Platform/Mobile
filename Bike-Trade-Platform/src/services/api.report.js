import { instance } from "../lib/axios";

//tạo báo cáo mới
export const createReport = async (reportData) => {
  try {
    const response = await instance.post("/reports", reportData);
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

//hủy báo cáo chính mình nếu đang pending
export const cancelReport = async (reportId) => {
  try {
    const response = await instance.patch(`/reports/${reportId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error canceling report:", error);
    throw error;
  }
};

//lấy danh sách báo cáo của người dùng cho admin
export const getUserReports = async () => {
  try {
    const response = await instance.get("/reports/admin");
    return response.data;
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw error;
  }
};

//lấy chi tiết một báo cáo
export const getReportDetails = async (reportId) => {
    try {
        const response = await instance.get(`/reports/admin/${reportId}`);
        return response.data;
    }
    catch (error) {        
        console.error("Error fetching report details:", error);
        throw error;
    }
};

//xử lí báo cáo
export const handleReport = async (reportId, action) => {
    try {
        const response = await instance.patch(`/reports/admin/${reportId}/process`, { action });
        return response.data;
    }
    catch (error) {
        console.error("Error handling report:", error);
        throw error;
    }
};