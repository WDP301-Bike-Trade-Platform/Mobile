import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  createAddress,
  updateAddress,
  getAddressById,
} from "../services/api.address";

const AddEditAddress = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addressId, address: existingAddress } = route.params || {};

  const isEditMode = !!addressId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);

  useEffect(() => {
    if (existingAddress) {
      populateForm(existingAddress);
    } else if (addressId) {
      fetchAddress();
    }
  }, []);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const data = await getAddressById(addressId);
      const addressData = data?.data || data;
      populateForm(addressData);
    } catch (error) {
      console.log("Error loading address:", error);
      Alert.alert("Error", "Failed to load address");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (address) => {
    setLabel(address.label || "");
    setRecipientName(address.recipient_name || "");
    setPhone(address.phone || "");
    setAddressLine1(address.address_line1 || "");
    setAddressLine2(address.address_line2 || "");
    setWard(address.ward || "");
    setDistrict(address.district || "");
    setCity(address.city || "");
    setPostalCode(address.postal_code || "");
    setIsDefault(address.is_default || false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!addressLine1.trim()) {
      Alert.alert("Validation", "Address line 1 is required");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Validation", "City is required");
      return;
    }

    try {
      setSubmitting(true);

      const addressData = {
        label: label || null,
        recipient_name: recipientName || null,
        phone: phone || null,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        ward: ward || null,
        district: district || null,
        city: city,
        postal_code: postalCode || null,
        country: "Vietnam",
        is_default: isDefault,
      };

      if (isEditMode) {
        await updateAddress(addressId, addressData);
        Alert.alert("Success", "Address updated successfully");
      } else {
        await createAddress(addressData);
        Alert.alert("Success", "Address created successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.log("Error saving address:", error);
      console.log("Error response:", error.response?.data);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save address"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const SelectField = ({ label, value, options, onSelect, placeholder }) => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#111827",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => setLabelDropdownOpen(!labelDropdownOpen)}
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text
          style={{ fontSize: 14, color: value ? "#111827" : "#9ca3af" }}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={labelDropdownOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </Pressable>

      {labelDropdownOpen && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderTopWidth: 0,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: "#fff",
            overflow: "hidden",
            position: "absolute",
            top: 70,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onSelect(option);
                setLabelDropdownOpen(false);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 14, color: "#111827" }}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f6f7f8",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#389cfa" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
          {isEditMode ? "Edit Address" : "Add Address"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 120,
        }}
      >
        <View style={{ zIndex: 1000 }}>
          {/* Label */}
          <SelectField
            label="Label (Optional)"
            value={label}
            options={["Home", "Office", "Other"]}
            onSelect={setLabel}
            placeholder="Select label"
          />
        </View>

        {/* Recipient Name */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Recipient Name (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Enter recipient name"
            placeholderTextColor="#9ca3af"
            value={recipientName}
            onChangeText={setRecipientName}
            editable={!submitting}
          />
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Phone (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Enter phone number"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!submitting}
          />
        </View>

        {/* Address Line 1 */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Address Line 1 *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Street address, P.O. box"
            placeholderTextColor="#9ca3af"
            value={addressLine1}
            onChangeText={setAddressLine1}
            editable={!submitting}
            multiline
          />
        </View>

        {/* Address Line 2 */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Address Line 2 (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Apartment, suite, unit, building"
            placeholderTextColor="#9ca3af"
            value={addressLine2}
            onChangeText={setAddressLine2}
            editable={!submitting}
          />
        </View>

        {/* Ward */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Ward (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Enter ward"
            placeholderTextColor="#9ca3af"
            value={ward}
            onChangeText={setWard}
            editable={!submitting}
          />
        </View>

        {/* District */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            District (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Enter district"
            placeholderTextColor="#9ca3af"
            value={district}
            onChangeText={setDistrict}
            editable={!submitting}
          />
        </View>

        {/* City */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            City *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Enter city"
            placeholderTextColor="#9ca3af"
            value={city}
            onChangeText={setCity}
            editable={!submitting}
          />
        </View>

        {/* Postal Code */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Postal Code (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              backgroundColor: "#fff",
            }}
            placeholder="Enter postal code"
            placeholderTextColor="#9ca3af"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            editable={!submitting}
          />
        </View>

        {/* Set as Default */}
        <Pressable
          onPress={() => setIsDefault(!isDefault)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: isDefault ? "#389cfa" : "#d1d5db",
              backgroundColor: isDefault ? "#389cfa" : "#fff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isDefault && (
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
            )}
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Set as default address
          </Text>
        </Pressable>

        {/* Save Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => ({
            backgroundColor: "#389cfa",
            paddingVertical: 14,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            opacity: pressed || submitting ? 0.7 : 1,
          })}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
              {isEditMode ? "Update Address" : "Add Address"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddEditAddress;
