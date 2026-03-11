import { instance } from "../lib/axios";


//lấy danh sách yêu thích của người dùng
export const getWishlist = async () => {
  try {
    const response = await instance.get("/wishlist");
    return response.data;
    } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};


//thêm 1 sản phẩm vào danh sách yêu thích
export const addToWishlist = async (listingId) => {
  try {
    const response = await instance.post("/wishlist", { listingId });
    return response.data;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};


//xóa 1 sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = async (listingId) => {
    try {
        const response = await instance.delete(`/wishlist/${listingId}`);
        return response.data;
    } catch (error) {        console.error("Error removing from wishlist:", error);
        throw error;
    }
};

//thêm nhiều sản phẩm vào danh sách yêu thích
export const addMultipleToWishlist = async (listingIds) => {
    try {
        const response = await instance.post("/wishlist/bulk", { listingIds });
        return response.data;
    } catch (error) {        console.error("Error adding multiple to wishlist:", error);
        throw error;
    }
};

//xóa nhiều sản phẩm khỏi danh sách yêu thích
export const removeMultipleFromWishlist = async (listingIds) => {
    try {
        const response = await instance.delete("/wishlist/bulk", { data: { listingIds } });
        return response.data;
    } catch (error) {        console.error("Error removing multiple from wishlist:", error);
        throw error;
    }
};