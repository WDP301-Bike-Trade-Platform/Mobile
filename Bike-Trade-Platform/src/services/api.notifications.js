import { instance } from "../lib/axios";

// Fetch notifications for user
export const fetchNotifications = async (skip = 0, take = 20) => {
  try {
    const response = await instance.get(`/notifications?skip=${skip}&take=${take}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await instance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  try {
    const response = await instance.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    throw error;
  }
};