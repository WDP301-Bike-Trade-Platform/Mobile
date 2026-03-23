import { instance } from '../lib/axios';

// POST /offers
export const createOffer = async (listingId, offeredPrice) => {
  try {
    const response = await instance.post('/offers', {
      listingId,
      offeredPrice: Number(offeredPrice),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /offers/:offerId/accept
export const acceptOffer = async (offerId) => {
  try {
    const response = await instance.patch(`/offers/${offerId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /offers/:offerId/reject
export const rejectOffer = async (offerId) => {
  try {
    const response = await instance.patch(`/offers/${offerId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
