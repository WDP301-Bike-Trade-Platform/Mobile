import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getMyAddresses,
  deleteAddress,
  setDefaultAddress,
} from "../services/api.address";

const ManageAddresses = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reload addresses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getMyAddresses();
      setAddresses(data?.data || []);
    } catch (error) {
      console.log("Error loading addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      Alert.alert("Success", "Default address updated");
      fetchAddresses(); // Refresh list
    } catch (error) {
      console.log("Error setting default:", error);
      Alert.alert("Error", "Failed to set default address");
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(addressId);
              Alert.alert("Success", "Address deleted successfully");
              fetchAddresses(); // Refresh list
            } catch (error) {
              console.log("Error deleting address:", error);
              Alert.alert("Error", error.response?.data?.message || "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const AddressCard = ({ address }) => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: address.is_default ? 2 : 1,
        borderColor: address.is_default ? "#389cfa" : "#e5e7eb",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          {address.label && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <MaterialCommunityIcons
                name={
                  address.label === "Home"
                    ? "home"
                    : address.label === "Office"
                    ? "office-building"
                    : "map-marker"
                }
                size={16}
                color="#6b7280"
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginLeft: 6,
                }}
              >
                {address.label}
              </Text>
            </View>
          )}
          {address.is_default && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#dbeafe",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#389cfa",
                }}
              >
                Default
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() =>
              navigation.navigate("AddEditAddress", {
                addressId: address.address_id,
                address: address,
              })
            }
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#f3f4f6",
              justifyContent: "center",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(address.address_id)}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#fee2e2",
              justifyContent: "center",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      {/* Address Info */}
      <View style={{ marginBottom: 12 }}>
        {address.recipient_name && (
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {address.recipient_name}
          </Text>
        )}
        {address.phone && (
          <Text
            style={{
              fontSize: 14,
              color: "#6b7280",
              marginBottom: 6,
            }}
          >
            {address.phone}
          </Text>
        )}
        <Text
          style={{
            fontSize: 14,
            color: "#374151",
            lineHeight: 20,
          }}
        >
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
          {address.ward && `, ${address.ward}`}
          {address.district && `, ${address.district}`}
          {address.city && `, ${address.city}`}
          {address.postal_code && ` ${address.postal_code}`}
        </Text>
      </View>

      {/* Set as Default Button */}
      {!address.is_default && (
        <Pressable
          onPress={() => handleSetDefault(address.address_id)}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#389cfa",
            alignSelf: "flex-start",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#389cfa",
            }}
          >
            Set as Default
          </Text>
        </Pressable>
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
          My Addresses
        </Text>
        <Pressable
          onPress={() => navigation.navigate("AddEditAddress")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#389cfa",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchAddresses();
        }}
      >
        {addresses.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-off"
              size={80}
              color="#d1d5db"
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#9ca3af",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No Addresses Yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#9ca3af",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Add your first address for faster checkout
            </Text>
            <Pressable
              onPress={() => navigation.navigate("AddEditAddress")}
              style={({ pressed }) => ({
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: "#389cfa",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                Add Address
              </Text>
            </Pressable>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard key={address.address_id} address={address} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageAddresses;
