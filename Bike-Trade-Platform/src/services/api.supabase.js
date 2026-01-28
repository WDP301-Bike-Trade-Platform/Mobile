import { supabase } from "../utils/supabase";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Upload image to Supabase storage
 * @param {string} imageUri - URI of the image file to upload
 * @param {string} bucket - Supabase bucket name (default: "images")
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
export const uploadImageToSupabase = async (imageUri, bucket = "images") => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${random}.jpg`;
    const filePath = `listings/${fileName}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, bytes.buffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    throw error;
  }
};

/**
 * Upload multiple images to Supabase
 * @param {Array<string>} imageUris - Array of image URIs to upload
 * @param {string} bucket - Supabase bucket name (default: "images")
 * @returns {Promise<Array<string>>} - Array of public URLs
 */
export const uploadMultipleImagesToSupabase = async (imageUris, bucket = "images") => {
  try {
    const uploadPromises = imageUris.map((uri) => uploadImageToSupabase(uri, bucket));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error uploading multiple images to Supabase:", error);
    throw error;
  }
};

/**
 * Delete image from Supabase
 * @param {string} fileUrl - Public URL of the image to delete
 * @param {string} bucket - Supabase bucket name (default: "images")
 * @returns {Promise<void>}
 */
export const deleteImageFromSupabase = async (fileUrl, bucket = "bike-images") => {
  try {
    // Extract file path from URL
    const filePath = fileUrl.split(`${bucket}/`)[1];
    if (!filePath) {
      throw new Error("Invalid file URL");
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error deleting image from Supabase:", error);
    throw error;
  }
};
