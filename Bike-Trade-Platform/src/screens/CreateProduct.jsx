import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { getCategories } from "../services/api.products";
import { uploadMultipleMedia } from "../services/api.media";

const CreateProduct = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

  const bikeTypes = ["ROAD", "MOUNTAIN", "HYBRID", "BMX", "CRUISER", "OTHER"];
  const materials = ["ALUMINUM", "STEEL", "CARBON", "TITANIUM", "COMPOSITE"];
  const brakeTypes = ["RIM", "DISC", "CANTILEVER", "V-BRAKE"];
  const wheelSizes = ["20\"", "24\"", "26\"", "27.5\"", "29\"", "700c"];
  const usageLevels = ["LIGHT", "MODERATE", "HEAVY"];
  const frameSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories(1);
      let categoriesData = [];
      if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      setCategories(categoriesData);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Request camera roll permissions
  useEffect(() => {
    requestMediaPermissions();
  }, []);

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
        aspect: [4, 3],
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
    if (!formData.category_id || !formData.brand || !formData.model || !formData.price) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to create product
      console.log("Creating product with data:", formData);
      console.log("Selected images:", selectedImages);
      
      // If there are images, upload them
      if (selectedImages.length > 0) {
        const imageUris = selectedImages.map((img) => img.uri);
        // TODO: uploadMultipleMedia will be called after product is created with listing_id
        console.log("Images to upload:", imageUris);
      }
      
      Alert.alert("Success", "Product created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create product: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, field, placeholder, keyboardType = "default", required = false }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
        {label} {required && <Text style={{ color: "#FF4444" }}>*</Text>}
      </Text>
      <TextInput
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: "#222",
        }}
        placeholderTextColor="#999"
      />
    </View>
  );

  const SelectField = ({ label, field, options, required = false }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 }}>
        {label} {required && <Text style={{ color: "#FF4444" }}>*</Text>}
      </Text>
      <Pressable
        onPress={() => setShowCategoryDropdown(field === "category_id" ? !showCategoryDropdown : null)}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: formData[field] ? "#222" : "#999" }}>
          {formData[field] ? (
            field === "category_id"
              ? categories.find((c) => c.category_id === formData[field])?.name || "Select"
              : formData[field]
          ) : (
            `Select ${label}`
          )}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
      </Pressable>

      {field === "category_id" && showCategoryDropdown && (
        <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, maxHeight: 200 }}>
          <ScrollView>
            {categories.map((cat) => (
              <Pressable
                key={cat.category_id}
                onPress={() => {
                  handleInputChange("category_id", cat.category_id);
                  setShowCategoryDropdown(false);
                }}
                style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}
              >
                <Text style={{ fontSize: 14, color: "#222" }}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f5f7f8" }}
    >
      <SafeAreaView style={{ flex: 1 }}>
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
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 20 }}>
            Bike Details
          </Text>

          <SelectField label="Brand" field="category_id" options={categories} required />
          <InputField label="Model" field="model" placeholder="e.g., Escape 3" required />
          <InputField label="Year" field="year" placeholder={new Date().getFullYear().toString()} keyboardType="numeric" />
          <InputField label="Price (₫)" field="price" placeholder="8500000" keyboardType="numeric" required />

          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
            Specifications
          </Text>

          <SelectField label="Bike Type" field="bike_type" options={bikeTypes} />
          <SelectField label="Material" field="material" options={materials} />
          <SelectField label="Brake Type" field="brake_type" options={brakeTypes} />
          <InputField label="Wheel Size" field="wheel_size" placeholder="e.g., 700c" />
          <SelectField label="Usage Level" field="usage_level" options={usageLevels} />
          <InputField label="Mileage (km)" field="mileage_km" placeholder="1200" keyboardType="numeric" />
          <InputField label="Groupset" field="groupset" placeholder="e.g., Shimano 105" />
          <SelectField label="Frame Size" field="frame_size" options={frameSizes} />

          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 16, marginTop: 16 }}>
            Condition & Info
          </Text>

          <InputField label="Frame Serial" field="frame_serial" placeholder="Serial number" />
          <InputField
            label="Description"
            field="description"
            placeholder="Describe the bike condition, history, and any special features..."
            multiline={true}
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
    </KeyboardAvoidingView>
  );
};

export default CreateProduct;
