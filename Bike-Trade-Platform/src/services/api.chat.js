import { instance } from '../lib/axios';

// GET /chats - Lấy danh sách cuộc trò chuyện
export const getChat = async () => {
  try {
    const response = await instance.get('/chats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /chats/:chatId/messages?skip=0&take=20 - Lấy tin nhắn (phân trang)
export const getChatMessages = async (chatId, skip = 0, take = 50) => {
  try {
    const response = await instance.get(`/chats/${chatId}/messages`, {
      params: { skip, take },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /chats/:chatId/messages - Gửi tin nhắn
export const sendMessage = async (chatId, content, imageUrl, type = 'TEXT', offerId = null) => {
  try {
    const body = { type };
    if (content) body.content = content;
    if (imageUrl) body.imageUrl = imageUrl;
    if (offerId) body.offerId = offerId;
    const response = await instance.post(`/chats/${chatId}/messages`, body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /chats - Tạo hoặc lấy cuộc trò chuyện với user khác
export const createChat = async (otherUserId) => {
  try {
    const response = await instance.post('/chats', { otherUserId });
    return response.data;
  } catch (error) {
    throw error;
  }
};