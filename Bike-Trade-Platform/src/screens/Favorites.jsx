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
import HeaderBar from "../component/HeaderBar";

const Favorites = () => {
  const navigation = useNavigation();
  const {
    addStorageData: addToFavorites,
    removeStorageData: removeFromFavorites,
    storageData: favorites,
  } = useStorageContext();

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredListings =
    statusFilter === "all"
      ? favorites || []
      : (favorites || []).filter((item) => item.status === statusFilter);

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
  const ListingCard = ({ bike }) => {
    // Handle both old and new data formats
    const listingId = bike.listing_id || bike.id;
    const vehicleData = bike.vehicle || bike;
    const mediaData = bike.media || [];
    const firstImage = mediaData.length > 0 
      ? mediaData[0].file_url 
      : (bike.image || "https://random-image-pepebigotes.vercel.app/api/random-image");
    const sellerInfo = bike.seller || {};
    const price = vehicleData.price?.d ? vehicleData.price.d[0] : vehicleData.price;

    return (
        
      <Pressable
        onPress={() => navigation.navigate("Detail", { product: bike })}
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
                uri: firstImage,
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
                {vehicleData.brand} {vehicleData.model}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#111",
                marginBottom: 4,
              }}
            >
              {price && typeof price === "number" ? `₫${Math.round(price).toLocaleString('vi-VN')}` : "N/A"}
            </Text>

            {/* Seller Info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <MaterialCommunityIcons
                name="account"
                size={12}
                color="#999"
              />
              <Text style={{ fontSize: 11, color: "#999" }}>
                {sellerInfo.full_name || "Unknown"}
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
            }}
          >
            <MaterialCommunityIcons
              name="eye"
              size={16}
              color="#111"
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#111",
              }}
            >
              View
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            
            <Pressable
              onPress={() => removeFromFavorites(listingId)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="heart"
                size={20}
                color="#FF4444"
              />
            </Pressable>

            <Pressable
              onPress={() => handleDelete(listingId)}
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
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Header + Filter */}
      <SafeAreaView
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        {/* <View
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
          
        </View> */}
           <HeaderBar
          title="Favorites"
          onBack={() => navigation.goBack()}
        />
        {/* Filter Tabs */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: "#fff",
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
            {["all"].map((filter) => (
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
      </SafeAreaView>

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => (item.listing_id || item.id || Math.random().toString()).toString()}
        renderItem={({ item }) => <ListingCard bike={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
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
