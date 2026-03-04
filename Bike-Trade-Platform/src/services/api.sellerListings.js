import { instance } from "../lib/axios";

// Fetch seller's listings
export const fetchSellerListings = async (status = "", skip = 0, take = 15) => {
  try {
    const params = new URLSearchParams();
    params.append('page', Math.floor(skip / take) + 1);
    params.append('limit', take);
    if (status) {
      params.append('status', status);
    }
    
    const response = await instance.get(`/listingProduct/me?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch listing detail for seller
export const fetchSellerListingDetail = async (listingId) => {
  try {
    const response = await instance.get(`/listingProduct/${listingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change status listing 
export const changeListingStatus = async (listingId, status) => {
  try {
    const response = await instance.patch(`/listingProduct/${listingId}/status`, { action: status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Publish listing (alias for changeListingStatus with SHOW action)
export const publishListing = async (listingId) => {
  return changeListingStatus(listingId, "SHOW");
};

// Archive listing (alias for changeListingStatus with HIDE action)
export const archiveListing = async (listingId) => {
  return changeListingStatus(listingId, "HIDE");
};

// Mark as sold (alias for changeListingStatus with SOLD action)
export const markAsSold = async (listingId) => {
  return changeListingStatus(listingId, "SOLD");
};


// Delete listing
export const deleteListing = async (listingId) => {
  try {
    const response = await instance.delete(`/listingProduct/${listingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update listing
export const updateListing = async (listingId, updateData) => {
  try {
    const response = await instance.patch(`/listingProduct/${listingId}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};