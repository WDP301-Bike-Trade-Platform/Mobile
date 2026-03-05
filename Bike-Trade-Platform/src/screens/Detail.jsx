import { useRoute, useNavigation } from "@react-navigation/native";
import {
  Text,
  Image,
  ScrollView,
  View,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStorageContext } from "../provider/StorageProvider";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../hooks/useCart";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STATUS_CONFIG = {
  APPROVED: { label: "Available", color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  SOLD: { label: "Sold", color: "#dc2626", bg: "#fee2e2", icon: "tag-check" },
  PENDING_APPROVAL: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: "clock-outline" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2", icon: "close-circle" },
  DRAFT: { label: "Draft", color: "#6b7280", bg: "#f3f4f6", icon: "pencil" },
};

const CONDITION_CONFIG = {
  NEW: { label: "New", color: "#16a34a" },
  LIKE_NEW: { label: "Like New", color: "#059669" },
  USED: { label: "Used", color: "#d97706" },
  HEAVILY_USED: { label: "Heavily Used", color: "#dc2626" },
};

function parsePrice(price) {
  if (!price) return 0;
  if (typeof price === "number") return price;
  if (price.s !== undefined && price.e !== undefined && price.d) {
    const sign = price.s === 1 ? 1 : -1;
    const digits = price.d.join("");
    const exponent = price.e;
    const numStr = digits.substring(0, exponent + 1) + (digits.length > exponent + 1 ? "." + digits.substring(exponent + 1) : "");
    return sign * parseFloat(numStr);
  }
  return parseFloat(price) || 0;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("vi-VN");
}

const SpecCard = ({ icon, label, value }) => (
  <View
    style={{
      width: (SCREEN_WIDTH - 44) / 2,
      backgroundColor: "#fff",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#f0f0f0",
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <MaterialCommunityIcons name={icon} size={14} color="#999" />
      <Text style={{ fontSize: 10, fontWeight: "600", color: "#999", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
    <Text style={{ fontSize: 14, fontWeight: "600", color: "#111" }} numberOfLines={1}>
      {value || "N/A"}
    </Text>
  </View>
);

const BadgeTag = ({ icon, label, active }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: active ? "#dcfce7" : "#fee2e2",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    }}
  >
    <MaterialCommunityIcons name={icon} size={14} color={active ? "#16a34a" : "#dc2626"} />
    <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "#16a34a" : "#dc2626" }}>{label}</Text>
  </View>
);

const Detail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const product = route.params?.product;
  const { addProductToCart, items } = useCart();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const {
    addStorageData: addToFavorites,
    removeStorageData: removeFromFavorites,
    storageData: favorites,
  } = useStorageContext();

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7f8" }}>
        <MaterialCommunityIcons name="bike-fast" size={64} color="#ddd" />
        <Text style={{ color: "#999", marginTop: 12, fontSize: 16 }}>No bike data available</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#359EFF", fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const listingId = product.listing_id || product.id;
  const vehicleData = product.vehicle || product;
  const mediaData = product.media || [];
  const sellerData = product.seller || {};
  const price = parsePrice(vehicleData.price);
  const status = product.status || "APPROVED";
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.APPROVED;
  const conditionInfo = CONDITION_CONFIG[vehicleData.condition] || { label: vehicleData.condition, color: "#6b7280" };
  const isSold = status === "SOLD";

  const images =
    mediaData.length > 0
      ? mediaData.map((m) => m.file_url)
      : [vehicleData.image || "https://placehold.co/600x400?text=No+Image"];

  const isInCart = items.some((item) => item.productId === listingId || item.product?.id === listingId);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await addProductToCart({
        productId: listingId,
        product: {
          id: listingId,
          title: `${vehicleData.brand} ${vehicleData.model}`,
          name: `${vehicleData.brand} ${vehicleData.model}`,
          brand: vehicleData.brand,
          model: vehicleData.model,
          price,
          images,
          ...vehicleData,
        },
        quantity: 1,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isFavorite = favorites?.some((fav) => fav.listing_id === listingId || fav.id === product.id);

  const toggleFavorite = () => {
    if (isFavorite) removeFromFavorites(listingId);
    else addToFavorites(product);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Fixed Top Navigation */}
      <SafeAreaView
        edges={["top"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.92)",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#222" />
        </Pressable>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={toggleFavorite}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.92)",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#FF4444" : "#222"}
            />
          </Pressable>
          <Pressable
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.92)",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#222" />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Image Carousel */}
        <View style={{ width: "100%", height: SCREEN_WIDTH * 0.85, backgroundColor: "#e8e8e8" }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width));
            }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85, resizeMode: "cover" }}
              />
            ))}
          </ScrollView>

          {/* Image Counter */}
          <View
            style={{
              position: "absolute",
              bottom: 40,
              right: 16,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              {currentSlide + 1}/{images.length}
            </Text>
          </View>

          {/* Dots */}
          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {images.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === currentSlide ? "#359EFF" : "rgba(255,255,255,0.6)",
                  width: i === currentSlide ? 20 : 6,
                }}
              />
            ))}
          </View>

          {/* Status Badge on Image */}
          {isSold && (
            <View
              style={{
                position: "absolute",
                top: 100,
                left: 16,
                backgroundColor: statusInfo.bg,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
              }}
            >
              <MaterialCommunityIcons name={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: statusInfo.color }}>{statusInfo.label}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View
          style={{
            marginTop: -24,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: "#f5f7f8",
            paddingTop: 20,
            paddingBottom: 120,
          }}
        >
          {/* Title, Price & Status */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#e8f4ff",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <MaterialCommunityIcons name="bike" size={13} color="#359EFF" />
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#359EFF" }}>{vehicleData.bike_type || "Bike"}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: conditionInfo.color + "18",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: conditionInfo.color }}>{conditionInfo.label}</Text>
              </View>
              {!isSold && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: statusInfo.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusInfo.color }} />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: statusInfo.color }}>{statusInfo.label}</Text>
                </View>
              )}
            </View>

            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", lineHeight: 28, marginBottom: 6 }}>
              {vehicleData.brand} {vehicleData.model}
            </Text>

            <Text style={{ fontSize: 26, fontWeight: "800", color: "#359EFF", marginBottom: 8 }}>
              {price ? `₫${price.toLocaleString("vi-VN")}` : "Contact for price"}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#999" />
                <Text style={{ fontSize: 12, color: "#999" }}>{formatTimeAgo(product.created_at)}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MaterialCommunityIcons name="calendar" size={14} color="#999" />
                <Text style={{ fontSize: 12, color: "#999" }}>{vehicleData.year}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MaterialCommunityIcons name="road-variant" size={14} color="#999" />
                <Text style={{ fontSize: 12, color: "#999" }}>{vehicleData.mileage_km ?? "N/A"} km</Text>
              </View>
            </View>
          </View>

          {/* Seller Card */}
          <Pressable
            style={{
              marginHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              paddingHorizontal: 14,
              paddingVertical: 14,
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#f0f0f0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 3,
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ position: "relative" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#e8f4ff",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#359EFF" }}>
                    {(sellerData.full_name || "U").charAt(0).toUpperCase()}
                  </Text>
                </View>
                {sellerData.is_verified && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -1,
                      right: -1,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: "#359EFF",
                      borderWidth: 2,
                      borderColor: "#fff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons name="check" size={9} color="#fff" />
                  </View>
                )}
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#111" }}>
                    {sellerData.full_name || "Unknown Seller"}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                  Member since {sellerData.created_at ? new Date(sellerData.created_at).toLocaleDateString("vi-VN") : "N/A"}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#ccc" />
          </Pressable>

          {/* Specifications */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#111", marginBottom: 12 }}>Specifications</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <SpecCard icon="tag" label="Brand" value={vehicleData.brand} />
              <SpecCard icon="bike" label="Model" value={vehicleData.model} />
              <SpecCard icon="calendar-range" label="Year" value={vehicleData.year?.toString()} />
              <SpecCard icon="road-variant" label="Bike Type" value={vehicleData.bike_type} />
              <SpecCard icon="texture-box" label="Material" value={vehicleData.material} />
              <SpecCard icon="car-brake-hold" label="Brake Type" value={vehicleData.brake_type} />
              <SpecCard icon="tire" label="Wheel Size" value={vehicleData.wheel_size ? `${vehicleData.wheel_size}"` : null} />
              <SpecCard icon="arrow-expand-vertical" label="Frame Size" value={vehicleData.frame_size} />
              <SpecCard icon="cog" label="Groupset" value={vehicleData.groupset} />
              <SpecCard icon="gauge" label="Usage Level" value={vehicleData.usage_level} />
              <SpecCard icon="map-marker-distance" label="Mileage" value={vehicleData.mileage_km != null ? `${vehicleData.mileage_km} km` : null} />
              <SpecCard icon="barcode" label="Frame Serial" value={vehicleData.frame_serial} />
            </View>
          </View>

          {/* Tags */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <BadgeTag icon="check-decagram" label="Original Parts" active={vehicleData.is_original} />
              <BadgeTag icon="receipt" label="Has Receipt" active={vehicleData.has_receipt} />
            </View>
          </View>

          {/* Description */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#111", marginBottom: 10 }}>Description</Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "#f0f0f0",
              }}
            >
              <Text
                style={{ fontSize: 14, lineHeight: 22, color: "#555" }}
                numberOfLines={showFullDescription ? undefined : 4}
              >
                {vehicleData.description || "No description provided."}
              </Text>
              {vehicleData.description && vehicleData.description.length > 100 && (
                <Pressable onPress={() => setShowFullDescription(!showFullDescription)} style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#359EFF" }}>
                    {showFullDescription ? "Show less" : "Read more"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Verification */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View
              style={{
                backgroundColor: "#eff6ff",
                borderWidth: 1,
                borderColor: "#bfdbfe",
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#dbeafe",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="shield-check" size={22} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e40af", marginBottom: 3 }}>
                  Marketplace Verified
                </Text>
                <Text style={{ fontSize: 12, color: "#3b82f6", lineHeight: 18 }}>
                  Seller identity verified. Frame serial #{vehicleData.frame_serial || "N/A"} checked against theft databases.
                </Text>
              </View>
            </View>
          </View>

          {/* Listing Info */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#111", marginBottom: 10 }}>Listing Info</Text>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f0f0f0",
                overflow: "hidden",
              }}
            >
              {[
                { label: "Listed", value: product.created_at ? new Date(product.created_at).toLocaleDateString("vi-VN") : "N/A" },
                { label: "Status", value: statusInfo.label, color: statusInfo.color },
                product.approved_at && { label: "Approved", value: new Date(product.approved_at).toLocaleDateString("vi-VN") },
                product.expires_at && { label: "Expires", value: new Date(product.expires_at).toLocaleDateString("vi-VN") },
              ]
                .filter(Boolean)
                .map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f5f5f5",
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#999" }}>{item.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: item.color || "#333" }}>{item.value}</Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        {isSold ? (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="tag-check" size={20} color="#dc2626" />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#dc2626" }}>This item has been sold</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", gap: 8 }}>
            <Pressable
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: "#e0e0e0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="chat-outline" size={22} color="#333" />
            </Pressable>

            <Pressable
              onPress={handleAddToCart}
              disabled={isAddingToCart || isInCart}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 14,
                backgroundColor: isInCart ? "#dcfce7" : "#f0f9ff",
                borderWidth: 1.5,
                borderColor: isInCart ? "#16a34a" : "#359EFF",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#359EFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={isInCart ? "check" : "cart-plus"}
                    size={18}
                    color={isInCart ? "#16a34a" : "#359EFF"}
                  />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: isInCart ? "#16a34a" : "#359EFF" }}>
                    {isInCart ? "In Cart" : "Add to Cart"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate("Checkout", {
                  listing: {
                    id: listingId,
                    title: `${vehicleData.brand} ${vehicleData.model}`,
                    price,
                    ...product,
                  },
                })
              }
              style={{
                flex: 1.3,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#359EFF",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 6,
                shadowColor: "#359EFF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Buy Now</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Detail;
