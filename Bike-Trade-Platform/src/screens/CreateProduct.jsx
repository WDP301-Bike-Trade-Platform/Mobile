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
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { uploadMultipleImagesToSupabase } from "../services/api.supabase";
import { getCategories } from "../services/api.category";
import { createProduct } from "../services/api.products";
import Dropdown from "../component/DropDown";

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [categories, setCategories] = useState([]);


  // Form fields
  const [formData, setFormData] = useState({
    category_id: "",
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
    requestMediaPermissions();
    fetchCategories();
  }, []);

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
    if (!formData.category_id || !formData.brand || !formData.model || !formData.price || 
        !formData.year || !formData.bike_type || !formData.material || !formData.brake_type ||
        !formData.usage_level || !formData.mileage_km || !formData.groupset || 
        !formData.frame_size || !formData.frame_serial || !formData.description) {
      Alert.alert("Error", "Please fill in all required fields");
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
    const mileageNum = parseInt(formData.mileage_km);
    if (isNaN(mileageNum) || mileageNum < 0) {
      Alert.alert("Error", "Mileage must be a valid positive number");
      return;
    }

    // Validate images
    if (selectedImages.length < 3) {
      Alert.alert("Error", "Please select at least 3 images");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrls = [];

      // If there are images, upload them to Supabase
      if (selectedImages.length > 0) {
        console.log("Uploading images to Supabase...");
        const imageUris = selectedImages.map((img) => img.uri);
        imageUrls = await uploadMultipleImagesToSupabase(imageUris);
        console.log("Uploaded image URLs:", imageUrls);
      }

      // TODO: Create product with API
      const productData = {
        category_id: formData.category_id,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        bike_type: formData.bike_type,
        material: formData.material,
        brake_type: formData.brake_type,
        wheel_size: formData.wheel_size,
        usage_level: formData.usage_level,
        mileage_km: parseInt(formData.mileage_km),
        groupset: formData.groupset,
        frame_size: formData.frame_size,
        is_original: formData.is_original,
        has_receipt: formData.has_receipt,
        frame_serial: formData.frame_serial,
        description: formData.description,
        images: imageUrls,
      };
      console.log("Creating product with data:", JSON.stringify(productData, null, 2));
      const response = await createProduct(productData);
      console.log("Product created successfully:", response);
      
      
      
      Alert.alert("Success", "Product created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Show detailed error message
      let errorMessage = "Failed to create product";
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
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>Create Listing</Text>
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
           Category <Text style={{ color: "#FF4444" }}>*</Text>
          </Text>
          <Dropdown
            data={(categories || []).map((category) => ({
              value: category.category_id.toString(),
              label: category.name,
            }))}
            onChange={(item) => handleInputChange("category_id", item.value)}
            placeholder="Please select a category"
          />
        </View>

        <InputField label="Brand" field="brand" placeholder="e.g., Trek, Giant, Specialized" required value={formData.brand} onChangeText={(value) => handleInputChange("brand", value)} />
        <InputField label="Model" field="model" placeholder="e.g., Escape 3" required value={formData.model} onChangeText={(value) => handleInputChange("model", value)} />
        <InputField label="Year" field="year" placeholder={new Date().getFullYear().toString()} keyboardType="numeric" required value={formData.year} onChangeText={(value) => handleInputChange("year", value)} />
        <InputField label="Price (₫)" field="price" placeholder="8500000" keyboardType="numeric" required value={formData.price} onChangeText={(value) => handleInputChange("price", value)} />

        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
          Specifications
        </Text>

        <InputField label="Bike Type" field="bike_type" placeholder="e.g., ROAD, MOUNTAIN, HYBRID" required value={formData.bike_type} onChangeText={(value) => handleInputChange("bike_type", value)} />
        {/* Material Dropdown */}
        {/* <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
            Material <Text style={{ color: "#FF4444" }}>*</Text>
          </Text>
          <View style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <RNPickerSelect onValueChange={(value) => handleInputChange("material", value)} value={formData.material} placeholder={{ label: '-- Select material --', value: '' }} items={[
              { label: 'Carbon', value: 'CARBON' },
              { label: 'Aluminum', value: 'ALUMINUM' },
              { label: 'Steel', value: 'STEEL' },
            ]} style={{
              inputIOS: {
                height: 50,
                paddingHorizontal: 12,
                paddingVertical: 14,
                fontSize: 14,
                color: '#222',
              },
              inputAndroid: {
                height: 50,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 14,
                color: '#222',
              },
            }} />
          </View>
        </View> */}

        {/* Brake Type Dropdown */}
        {/* <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
            Brake Type <Text style={{ color: "#FF4444" }}>*</Text>
          </Text>
          <View style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <RNPickerSelect onValueChange={(value) => handleInputChange("brake_type", value)} value={formData.brake_type} placeholder={{ label: '-- Select brake type --', value: '' }} items={[
              { label: 'Disc Brake', value: 'DISC' },
              { label: 'Rim Brake', value: 'RIM' },
            ]} style={{
              inputIOS: {
                height: 50,
                paddingHorizontal: 12,
                paddingVertical: 14,
                fontSize: 14,
                color: '#222',
              },
              inputAndroid: {
                height: 50,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 14,
                color: '#222',
              },
            }} />
          </View>
        </View> */}
        <InputField label="Material" field="material" placeholder="e.g., ALUMINUM, STEEL, CARBON" required value={formData.material} onChangeText={(value) => handleInputChange("material", value)} />
        <InputField label="Brake Type" field="brake_type" placeholder="e.g., RIM, DISC, V-BRAKE" required value={formData.brake_type} onChangeText={(value) => handleInputChange("brake_type", value)} />
        <InputField label="Wheel Size" field="wheel_size" placeholder='e.g., 700c, 26", 29"' required value={formData.wheel_size} onChangeText={(value) => handleInputChange("wheel_size", value)} />
        <InputField label="Usage Level" field="usage_level" placeholder="e.g., LIGHT, MODERATE, HEAVY" required value={formData.usage_level} onChangeText={(value) => handleInputChange("usage_level", value)} />   
        {/* Usage Level Dropdown */}
        {/* <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
            Usage Level <Text style={{ color: "#FF4444" }}>*</Text>
          </Text>
          <View style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            
            <RNPickerSelect onValueChange={(value) => handleInputChange("usage_level", value)} value={formData.usage_level} placeholder={{ label: '-- Select usage level --', value: '' }} items={[
              { label: 'Light (Occasional rides)', value: 'LIGHT' },
              { label: 'Medium (Regular use)', value: 'MEDIUM' },
              { label: 'Heavy (Intensive use)', value: 'HEAVY' },
            ]} style={{
              inputIOS: {
                height: 50,
                paddingHorizontal: 12,
                paddingVertical: 14,
                fontSize: 14,
                color: '#222',
              },
              inputAndroid: {
                height: 50,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 14,
                color: '#222',
              },
            }} />
          </View>
        </View> */}

        <InputField label="Mileage (km)" field="mileage_km" placeholder="1200" keyboardType="numeric" required value={formData.mileage_km} onChangeText={(value) => handleInputChange("mileage_km", value)} />
        <InputField label="Groupset" field="groupset" placeholder="e.g., Shimano 105" required value={formData.groupset} onChangeText={(value) => handleInputChange("groupset", value)} />
        <InputField label="Frame Size" field="frame_size" placeholder="e.g., S, M, L, XL" required value={formData.frame_size} onChangeText={(value) => handleInputChange("frame_size", value)} />

        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
          Condition & Info
        </Text>

        <InputField label="Frame Serial" field="frame_serial" placeholder="Serial number" value={formData.frame_serial} required  onChangeText={(value) => handleInputChange("frame_serial", value)} />
        <InputField
          label="Description"
          field="description"
          placeholder="Describe the bike condition, history, and any special features..."
          multiline={true}
          required 
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
                Create Listing
              </Text>
            )}
          </Pressable>
        </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProduct;
