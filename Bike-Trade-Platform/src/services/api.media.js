import { instance } from "../lib/axios";

// Get media for a listing
export const getMediaById = async (listingId) => {
  try {
    const response = await instance.get(`/listings/${listingId}/media`);
    // Response is an array of media objects with structure:
    // { media_id, listing_id, type, file_url, mime_type, size_bytes, is_cover, uploaded_at }
    let mediaData = [];
    if (Array.isArray(response.data)) {
      mediaData = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      mediaData = response.data.data;
    }
    return mediaData;
  } catch (error) {
    console.log("Error fetching media:", error);
    return [];
  }
};

// Upload media/images for a listing
export const uploadMedia = async (listingId, imageUri) => {
  const formData = new FormData();
  
  // Get the file name from the URI
  const fileName = imageUri.split("/").pop();
  
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: fileName,
  });

  const response = await instance.post(
    `/listings/${listingId}/media`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Upload multiple images for a listing
export const uploadMultipleMedia = async (listingId, imageUris) => {
  const formData = new FormData();
  
  imageUris.forEach((imageUri, index) => {
    const fileName = imageUri.split("/").pop();
    formData.append("files", {
      uri: imageUri,
      type: "image/jpeg",
      name: fileName,
    });
  });

  try {
    const response = await instance.post(
      `/listings/${listingId}/media`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error uploading media:", error);
    throw error;
  }
};

// Delete media by ID
export const deleteMedia = async (mediaId) => {
  try {
    const response = await instance.delete(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.log("Error deleting media:", error);
    throw error;
  }
};

// Set cover image for a listing
export const setCoverImage = async (listingId, mediaId) => {
  try {
    const response = await instance.put(
      `/listings/${listingId}/media/${mediaId}/cover`,
      {}
    );
    return response.data;
  } catch (error) {
    console.log("Error setting cover image:", error);
    throw error;
  }
};


