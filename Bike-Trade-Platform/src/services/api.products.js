import { instance } from "../lib/axios";

export const getProducts = async () => {
  try {
    // Try /listings first
    const response = await instance.get("/listingProduct?status=APPROVED");
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      console.log("Endpoint /listings not found, trying /products");
      try {
        const response = await instance.get("/products");
        return response.data;
      } catch (error2) {
        console.log("Endpoint /products not found, trying /vehicles");
        const response = await instance.get("/vehicles");
        return response.data;
      }
    }
    throw error;
  }
};

export const getProductById = async (listingId) => {
  try {
    const response = await instance.get(`/listingProduct/${listingId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        const response = await instance.get(`/products/${listingId}`);
        return response.data;
      } catch (error2) {
        const response = await instance.get(`/vehicles/${listingId}`);
        return response.data;
      }
    }
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await instance.post("/listingProduct/create", productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (listingId, productData) => {
  try {
    const response = await instance.patch(`/listingProduct/${listingId}`, productData);
    return response.data;
  } catch (error) {
    console.log('Update product error', error.message);
  }
};

// Get categories (bike brands)
export const getCategories = async (page = 1) => {
  try {
    const response = await instance.get(`/categories?page=${page}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching categories:", error.message);
    throw error;
  }
};
