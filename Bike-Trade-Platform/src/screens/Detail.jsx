import { useRoute, useNavigation } from "@react-navigation/native";
import {
  Text,
  Image,
  ScrollView,
  View,
  Pressable,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStorageContext } from "../provider/StorageProvider";
import { useState } from "react";

const Detail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params;
  const bike = params?.book;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const {
    addStorageData: addToFavorites,
    removeStorageData: removeFromFavorites,
    storageData: favorites,
  } = useStorageContext();

  if (!bike) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666" }}>No bike data available</Text>
      </View>
    );
  }

  const isFavorite = favorites?.some((fav) => fav.id === bike.id);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(bike.id);
    } else {
      addToFavorites(bike);
    }
  };

  // Images carousel - use bike.image or fallback
  const images = Array.isArray(bike.image) 
    ? bike.image 
    : [bike.image || "https://random-image-pepebigotes.vercel.app/api/random-image"];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Fixed Top Navigation */}
      <SafeAreaView
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
          paddingVertical: 12,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
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

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={toggleFavorite}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
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
              size={24}
              color={isFavorite ? "#FF4444" : "#222"}
            />
          </Pressable>
          <Pressable
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons name="share-outline" size={24} color="#222" />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* Hero Carousel */}
        <View
          style={{
            width: "100%",
            height: Dimensions.get("window").height * 0.45,
            backgroundColor: "#e0e0e0",
            overflow: "hidden",
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const slide = Math.round(
                event.nativeEvent.contentOffset.x /
                  event.nativeEvent.layoutMeasurement.width
              );
              setCurrentSlide(slide);
            }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{
                  width: Dimensions.get("window").width,
                  height: Dimensions.get("window").height * 0.45,
                  resizeMode: "cover",
                }}
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {images.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentSlide
                      ? "#359EFF"
                      : "rgba(255, 255, 255, 0.8)",
                  width: index === currentSlide ? 24 : 8,
                }}
              />
            ))}
          </View>
        </View>

        {/* Content Container */}
        <View
          style={{
            marginTop: -24,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: "#f5f7f8",
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 120,
          }}
        >
          {/* Category Badge & Title & Price */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#e8e8e8",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="bike"
                    size={14}
                    color="#666"
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#666",
                    }}
                  >
                    {bike.category}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#111",
                    lineHeight: 32,
                  }}
                >
                  {bike.year} {bike.brand} {bike.model}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#359EFF",
                  }}
                >
                  ${bike.price}
                </Text>
              </View>
            </View>

            {/* Posted Time */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#999"
              />
              <Text style={{ fontSize: 12, color: "#999" }}>
                Posted 2 days ago • 145 views
              </Text>
            </View>
          </View>

          {/* Seller Card */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 16,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
              borderWidth: 1,
              borderColor: "#f0f0f0",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-b9u-W_zh-zRNoZOdiM91AFkt1s5jVzg1Iymv1VdCzXL2Iqj787Nv4S07RpjkkGCu5HGYPYjZwSp-AgOzz519FtYLHLoXc1zPB3iYbdTpz1XAbIWdY-aDneiK-CQJqCIMnNgLKxWAqoQLyh-RqB8e09AYIs76_87IimroaUEmepiDz2WYFs6MsA0F23psnv1fFZZBouFSbCp4Wjzmddr-trxFWbtmvPvoKO80cM3sXSTUiSjYWRyAk5FRrhAqZgrn_nTbJohIdYg",
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#359EFF",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#111",
                  }}
                >
                  Alex M.
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color="#FFA500"
                  />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#111" }}>
                    4.8
                  </Text>
                  <Text style={{ fontSize: 10, color: "#999" }}>
                    (24 reviews)
                  </Text>
                </View>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#999"
            />
          </View>

          {/* Specifications */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#111",
                marginBottom: 12,
              }}
            >
              Specifications
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {/* Brand */}
              <View
                style={{
                  flex: 1,
                  minWidth: "45%",
                  backgroundColor: "#fff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: "#999",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Brand
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#111",
                  }}
                >
                  {bike.brand}
                </Text>
              </View>

              {/* Frame Size */}
              <View
                style={{
                  flex: 1,
                  minWidth: "45%",
                  backgroundColor: "#fff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: "#999",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Frame Size
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#111",
                  }}
                >
                  {bike.frame_size}cm (M)
                </Text>
              </View>

              {/* Year */}
              <View
                style={{
                  flex: 1,
                  minWidth: "45%",
                  backgroundColor: "#fff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: "#999",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Year
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#111",
                  }}
                >
                  {bike.year}
                </Text>
              </View>

              {/* Condition */}
              <View
                style={{
                  flex: 1,
                  minWidth: "45%",
                  backgroundColor: "#fff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: "#999",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Condition
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#111",
                    }}
                  >
                    {bike.condition}
                  </Text>
                  <MaterialCommunityIcons
                    name="information"
                    size={14}
                    color="#FFA500"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#111",
                marginBottom: 12,
              }}
            >
              Description
            </Text>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 22,
                  color: "#666",
                  marginBottom: 8,
                }}
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {bike.description}
              </Text>
              <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#359EFF",
                  }}
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Safety Verification */}
          <View
            style={{
              backgroundColor: "rgba(51, 158, 255, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(51, 158, 255, 0.2)",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(51, 158, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color="#359EFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#0066CC",
                  marginBottom: 4,
                }}
              >
                Marketplace Verified
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#0066CC",
                  lineHeight: 16,
                }}
              >
                This seller has verified their identity and the serial number has
                been checked against theft databases.
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#111",
                }}
              >
                Location
              </Text>
              <Text style={{ fontSize: 12, color: "#999" }}>
                San Francisco, CA
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                height: 160,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#e0e0e0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgUyzTog6slhiebc_zIEQ3De-iOlItrU24_RS-vJR2wk1ufNg-FAO2Od_KaDcHlgEYfI4TsnngpyoSfYQI5d_m7GbSbKt7gT0GPiUMXKRbVM7uz_yTZvlx2a8jd9Q5Ni2yppz57sZSEjg3gyn8GqdL9CEqMNuw9KEr6dbDH4w1_j86y_8bInFYpUspmqnKERt8mJHsVedUkfiylLbmGkDZ5UfbWD-k3VSYEF-DWgP64o4clTkCec0suakomgxlICvW0M8GeNetMNw",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: 0.8,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(51, 158, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#359EFF",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              </View>
            </View>
            <Text
              style={{
                fontSize: 10,
                color: "#999",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Location is approximate to protect seller privacy.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 20,
          flexDirection: "row",
          gap: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Pressable
          style={{
            flex: 1,
            height: 56,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#e0e0e0",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <MaterialCommunityIcons
            name="chat-outline"
            size={20}
            color="#111"
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#111",
            }}
          >
            Chat
          </Text>
        </Pressable>
        <Pressable
          style={{
            flex: 2,
            height: 56,
            borderRadius: 12,
            backgroundColor: "#359EFF",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
            shadowColor: "#359EFF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#111",
            }}
          >
            Book Now
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="#111"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default Detail;
