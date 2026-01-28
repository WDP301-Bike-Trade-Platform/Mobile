import { instance } from '../lib/axios';

export const getCategories = async () => {
  try {
    const response = await instance.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};