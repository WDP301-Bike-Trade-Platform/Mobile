import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { uploadMultipleImagesToSupabase } from "../services/api.supabase";
import { getCategories } from "../services/api.category";
import { createProduct } from "../services/api.products";
import { updateListing } from "../services/api.sellerListings";
import { decimalToNumber } from "../utils/formatters";
import { checkProfileComplete } from "../utils/profileCheck";
import { useAppContext } from "../provider/AppProvider";
import Dropdown from "../component/DropDown";
import { usePlatformSettings } from "../provider/PlatformSettingsProvider";

// Separate InputField component to prevent re-renders
const InputField = memo(({ label, field, placeholder, keyboardType = "default", required = false, multiline = false, value, onChangeText }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
      {label} {required && <Text style={{ color: "#FF4444" }}>*</Text>}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      blurOnSubmit={false}
      scrollEnabled={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      numberOfLines={multiline ? 4 : 1}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#222",
        minHeight: multiline ? 100 : 40,
      }}
      placeholderTextColor="#999"
    />
  </View>
), (prev, next) => {
  return prev.value === next.value && prev.field === next.field;
});

const CreateProduct = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { settings } = usePlatformSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const { platformSettings } = useAppContext();
  const platformFeeRate = platformSettings?.platform_fee_rate ?? 0.07;

  // Get edit mode data from route params
  const isEdit = route.params?.isEdit;
  const productData = route.params?.productData;


  // Form fields
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear().toString(),
    price: "",
    bike_type: "",
    material: "",
    brake_type: "",
    wheel_size: "",
    usage_level: "",
    mileage_km: "",
    groupset: "",
    frame_size: "",
    is_original: true,
    has_receipt: false,
    frame_serial: "",
    description: "",
    images: [],
  });

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Request camera roll permissions and fetch categories
  useEffect(() => {
    // Check profile before allowing to create
    if (!isEdit) {
      checkProfileComplete(navigation).then((user) => {
        if (!user) navigation.goBack();
      });
    }
    requestMediaPermissions();
    fetchCategories();
    
    // Load existing data if in edit mode
    if (isEdit && productData) {
      loadExistingData();
    }
  }, [isEdit, productData]);

  const loadExistingData = () => {
    if (!productData) return;
    
    setFormData({
      category_id: productData.vehicle?.category_id || "",
      title: productData.title || "",
      brand: productData.vehicle?.brand || "",
      model: productData.vehicle?.model || "",
      year: productData.vehicle?.year?.toString() || new Date().getFullYear().toString(),
      price: decimalToNumber(productData.vehicle?.price)?.toString() || productData.price?.toString() || "",
      bike_type: productData.vehicle?.bike_type || "",
      material: productData.vehicle?.material || "",
      brake_type: productData.vehicle?.brake_type || "",
      wheel_size: productData.vehicle?.wheel_size || "",
      usage_level: productData.vehicle?.usage_level || "",
      mileage_km: productData.vehicle?.mileage_km?.toString() || "",
      groupset: productData.vehicle?.groupset || "",
      frame_size: productData.vehicle?.frame_size || "",
      is_original: productData.vehicle?.is_original !== false,
      has_receipt: productData.vehicle?.has_receipt === true,
      frame_serial: productData.vehicle?.frame_serial || "",
      description: productData.vehicle?.description || "",
      images: [],
    });
    
    // Load existing images
    if (productData.media && productData.media.length > 0) {
      const existingImages = productData.media.map(img => ({
        uri: img.file_url,
        type: "image/jpeg",
        isExisting: true
      }));
      setSelectedImages(existingImages);
    } else if (productData.images && productData.images.length > 0) {
      // Fallback for old data structure
      const existingImages = productData.images.map(img => ({
        uri: img.url || img,
        type: "image/jpeg",
        isExisting: true
      }));
      setSelectedImages(existingImages);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      // Handle different response structures
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      // Alert.alert("Error", "Failed to load categories");
    }
  };

  const requestMediaPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera roll permissions to select images.");
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultiple: true,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          type: "image/jpeg",
        }));
        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images: " + error.message);
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.brand || !formData.model || !formData.price || 
        !formData.year || !formData.bike_type || !formData.material || !formData.brake_type) {
      Alert.alert("Error", "Please fill in all required fields (*)");
      return;
    }

    // Validate year
    const yearNum = parseInt(formData.year);
    if (isNaN(yearNum) || yearNum < 1990) {
      Alert.alert("Error", "Year must be a valid number and not less than 1990");
      return;
    }

    // Validate price
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Error", "Price must be a valid positive number");
      return;
    }

    // Validate mileage
    if (formData.mileage_km && formData.mileage_km.trim() !== "") {
      const mileageNum = parseInt(formData.mileage_km);
      if (isNaN(mileageNum) || mileageNum < 0) {
        Alert.alert("Error", "Mileage must be a valid positive number");
        return;
      }
    }

    // Validate images (only for new listings)
    if (!isEdit && selectedImages.length < 3) {
      Alert.alert("Error", "Please select at least 3 images");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrls = [];

      // Handle images - separate existing from new ones
      const existingImages = selectedImages.filter(img => img.isExisting);
      const newImages = selectedImages.filter(img => !img.isExisting);
      
      // Keep existing image URLs
      imageUrls = existingImages.map(img => img.uri);
      
      // Upload new images to Supabase if any
      if (newImages.length > 0) {
        console.log("Uploading new images to Supabase...");
        const newImageUris = newImages.map((img) => img.uri);
        const uploadedUrls = await uploadMultipleImagesToSupabase(newImageUris);
        imageUrls = [...imageUrls, ...uploadedUrls];
        console.log("Uploaded image URLs:", uploadedUrls);
      }

      const submissionData = {
        category_id: formData.category_id || undefined,
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        bike_type: formData.bike_type,
        material: formData.material,
        brake_type: formData.brake_type,
        wheel_size: formData.wheel_size || undefined,
        usage_level: formData.usage_level || undefined,
        mileage_km: formData.mileage_km && formData.mileage_km.trim() !== "" ? parseInt(formData.mileage_km) : undefined,
        groupset: formData.groupset || undefined,
        frame_size: formData.frame_size || undefined,
        is_original: formData.is_original,
        has_receipt: formData.has_receipt,
        frame_serial: formData.frame_serial || undefined,
        description: formData.description || undefined,
        images: imageUrls,
      };
      
      console.log(`${isEdit ? 'Updating' : 'Creating'} product with data:`, JSON.stringify(submissionData, null, 2));
      
      let response;
      if (isEdit && productData) {
        response = await updateListing(productData.id, submissionData);
        console.log("Product updated successfully:", response);
      } else {
        response = await createProduct(submissionData);
        console.log("Product created successfully:", response);
      }
      
      Alert.alert("Success", `Product ${isEdit ? 'updated' : 'created'} successfully!`);
      navigation.goBack();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Show detailed error message
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} product`;
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join("\n");
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#222" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>
          {isEdit ? 'Edit Listing' : 'Create Listing'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 20 }}>
          Bike Details
        </Text>

        {/* Category Dropdown */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
           Category
          </Text>
          <Dropdown
            data={(categories || []).map((category) => ({
              value: category.category_id || category.id,
              label: category.name,
            }))}
            onChange={(item) => handleInputChange("category_id", item.value)}
            placeholder="Please select a category"
            selectedValue={formData.category_id}
          />
        </View>

        <InputField label="Title" field="title" placeholder="e.g., Sell Bicycle " required value={formData.title} onChangeText={(value) => handleInputChange("title", value)} />
        <InputField label="Brand" field="brand" placeholder="e.g., Trek, Giant, Specialized" required value={formData.brand} onChangeText={(value) => handleInputChange("brand", value)} />
        <InputField label="Model" field="model" placeholder="e.g., Escape 3" required value={formData.model} onChangeText={(value) => handleInputChange("model", value)} />
        <InputField label="Year" field="year" placeholder={new Date().getFullYear().toString()} keyboardType="numeric" required value={formData.year} onChangeText={(value) => handleInputChange("year", value)} />
        <InputField label="Price (₫)" field="price" placeholder="8500000" keyboardType="numeric" required value={formData.price} onChangeText={(value) => handleInputChange("price", value)} />
        
        {formData.price && !isNaN(parseFloat(formData.price)) && parseFloat(formData.price) > 0 && (
          <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, marginTop: -4, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: '#64748b' }}>Selling Price</Text>
              <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>
                ₫{parseFloat(formData.price).toLocaleString("vi-VN")}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, color: '#ef4444' }}>Platform Fee ({Math.round(settings.platform_fee_rate * 100)}%)</Text>
              <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '600' }}>
                - ₫{(parseFloat(formData.price) * settings.platform_fee_rate).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#0f172a', fontWeight: '700' }}>You will receive</Text>
              <Text style={{ fontSize: 16, color: '#16a34a', fontWeight: '800' }}>
                ₫{(parseFloat(formData.price) * (1 - platformFeeRate)).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        )}

        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
          Specifications
        </Text>

        <InputField label="Bike Type" field="bike_type" placeholder="e.g., ROAD, MOUNTAIN, HYBRID" required value={formData.bike_type} onChangeText={(value) => handleInputChange("bike_type", value)} />
        
        <InputField label="Material" field="material" placeholder="e.g., ALUMINUM, STEEL, CARBON" required value={formData.material} onChangeText={(value) => handleInputChange("material", value)} />
        <InputField label="Brake Type" field="brake_type" placeholder="e.g., RIM, DISC, V-BRAKE" required value={formData.brake_type} onChangeText={(value) => handleInputChange("brake_type", value)} />
        <InputField label="Wheel Size" field="wheel_size" placeholder='e.g., 700c, 26", 29"' value={formData.wheel_size} onChangeText={(value) => handleInputChange("wheel_size", value)} />
        <InputField label="Usage Level" field="usage_level" placeholder="e.g., LIGHT, MODERATE, HEAVY" value={formData.usage_level} onChangeText={(value) => handleInputChange("usage_level", value)} />   
       

        <InputField label="Mileage (km)" field="mileage_km" placeholder="1200" keyboardType="numeric" value={formData.mileage_km} onChangeText={(value) => handleInputChange("mileage_km", value)} />
        <InputField label="Groupset" field="groupset" placeholder="e.g., Shimano 105" value={formData.groupset} onChangeText={(value) => handleInputChange("groupset", value)} />
        <InputField label="Frame Size" field="frame_size" placeholder="e.g., S, M, L, XL" value={formData.frame_size} onChangeText={(value) => handleInputChange("frame_size", value)} />

        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
          Condition & Info
        </Text>

        <InputField label="Frame Serial" field="frame_serial" placeholder="Serial number" value={formData.frame_serial} onChangeText={(value) => handleInputChange("frame_serial", value)} />
        <InputField
          label="Description"
          field="description"
          placeholder="Describe the bike condition, history, and any special features..."
          multiline={true}
          value={formData.description}
          onChangeText={(value) => handleInputChange("description", value)}
        />

          {/* Images Section */}
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
            Photos
          </Text>

          {/* Add Images Button */}
          <Pressable
            onPress={pickImages}
            disabled={isLoading}
            style={{
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#359EFF",
              borderRadius: 8,
              paddingVertical: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <MaterialCommunityIcons name="plus" size={32} color="#359EFF" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#359EFF", marginTop: 8 }}>
              Add Photos ({selectedImages.length})
            </Text>
            <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              Tap to select images from gallery
            </Text>
          </Pressable>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <FlatList
                data={selectedImages}
                keyExtractor={(_, index) => index.toString()}
                numColumns={3}
                columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      flex: 1,
                      height: 100,
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        borderRadius: 12,
                        padding: 4,
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={16} color="#fff" />
                    </Pressable>
                  </View>
                )}
              />
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: "#359EFF",
              paddingVertical: 14,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 30,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
                {isEdit ? 'Update Listing' : 'Create Listing'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProduct;
