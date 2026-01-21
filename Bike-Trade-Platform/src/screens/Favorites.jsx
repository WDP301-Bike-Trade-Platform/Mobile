import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../provider/AppProvider";
import { useNavigation } from "@react-navigation/native";
import { useStorageContext } from "../provider/StorageProvider";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Favorites = () => {
  const navigation = useNavigation();
  const { books } = useAppContext();
  const {
    addStorageData: addToFavorites,
    removeStorageData: removeFromFavorites,
    storageData: favorites,
  } = useStorageContext();

  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data with status - in real app, this would come from API/context
  const listings = (favorites || []).map((bike, index) => ({
    ...bike,
    status: index === 0 ? "active" : index === 1 ? "pending" : "sold",
    views: [24, 108, 0][index] || 0,
    soldDate: index === 2 ? "2 days ago" : null,
  }));

  const filteredListings =
    statusFilter === "all"
      ? listings
      : listings.filter((item) => item.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "rgba(51, 158, 255, 0.2)", text: "#13ec5b", label: "Active" };
      case "pending":
        return { bg: "rgba(255, 165, 0, 0.2)", text: "#FF9500", label: "Pending" };
      case "sold":
        return { bg: "rgba(128, 128, 128, 0.2)", text: "#999", label: "Sold" };
      default:
        return { bg: "rgba(51, 158, 255, 0.2)", text: "#359EFF", label: "Active" };
    }
  };

  const handleDelete = (bikeId) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeFromFavorites(bikeId);
          },
        },
      ]
    );
  };

  const handleHide = (bikeId) => {
    Alert.alert(
      "Hide Listing",
      "This listing will be hidden from buyers but you can restore it later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Hide",
          onPress: () => {
            Alert.alert("Success", "Listing has been hidden.");
          },
        },
      ]
    );
  };

  const ListingCard = ({ bike }) => {
    const statusInfo = getStatusColor(bike.status);
    const isSold = bike.status === "sold";

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          marginBottom: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#f0f0f0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          opacity: isSold ? 0.75 : 1,
        }}
      >
        {/* Card Content */}
        <View style={{ flexDirection: "row", gap: 16, padding: 16 }}>
          {/* Image */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundColor: "#f0f0f0",
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: bike.image || "https://random-image-pepebigotes.vercel.app/api/random-image",
              }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
            />
          </View>

          {/* Info */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#111",
                  flex: 1,
                  marginRight: 8,
                }}
                numberOfLines={1}
              >
                {bike.brand} {bike.model}
              </Text>
              <View
                style={{
                  backgroundColor: statusInfo.bg,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: statusInfo.text,
                  }}
                >
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#111",
                marginBottom: 4,
              }}
            >
              ${bike.price}
            </Text>

            {/* Views or Sold Date */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <MaterialCommunityIcons
                name={isSold ? "calendar-today" : "eye"}
                size={12}
                color="#999"
              />
              <Text style={{ fontSize: 11, color: "#999" }}>
                {isSold ? `Sold ${bike.soldDate}` : `${bike.views} views`}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "#fafafa",
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
          }}
        >
          <Pressable
            disabled={isSold}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#e0e0e0",
              borderRadius: 8,
              opacity: isSold ? 0.5 : 1,
            }}
          >
            <MaterialCommunityIcons
              name={isSold ? "pencil-off" : "pencil"}
              size={16}
              color={isSold ? "#999" : "#111"}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isSold ? "#999" : "#111",
              }}
            >
              Edit
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => handleHide(bike.id)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="eye-off"
                size={20}
                color="#999"
              />
            </Pressable>
            <Pressable
              onPress={() => handleDelete(bike.id)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color="#FF4444"
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Header */}
      <SafeAreaView
        style={{
          backgroundColor: "#f5f7f8",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#111",
            }}
          >
            My Listings
          </Text>
          <Pressable
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color="#111"
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Filter Tabs */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#f5f7f8",
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            borderRadius: 8,
            padding: 4,
            gap: 4,
          }}
        >
          {["all", "active", "pending", "sold"].map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setStatusFilter(filter)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor:
                  statusFilter === filter ? "#fff" : "transparent",
                shadowColor:
                  statusFilter === filter ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: statusFilter === filter ? 0.1 : 0,
                shadowRadius: 2,
                elevation: statusFilter === filter ? 1 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color:
                    statusFilter === filter ? "#111" : "#999",
                  textAlign: "center",
                  textTransform: "capitalize",
                }}
              >
                {filter === "all"
                  ? "All"
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ListingCard bike={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        scrollIndicatorInsets={{ right: 1 }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons
                name="bike"
                size={40}
                color="#ccc"
              />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#111",
                marginBottom: 8,
              }}
            >
              No listings yet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
                maxWidth: 200,
              }}
            >
              Tap the + button to start selling your bike today.
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <Pressable
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#359EFF",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#359EFF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
        onPress={() => {
          Alert.alert("Add Listing", "Bike listing creation feature coming soon!");
        }}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#111" />
      </Pressable>
    </View>
  );
};

export default Favorites;
