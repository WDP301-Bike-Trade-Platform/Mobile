import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../provider/AppProvider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useStorageContext } from "../provider/StorageProvider";
import { useState, useEffect, use, useCallback } from "react";
import { TextInput } from "react-native-gesture-handler";
import { getProducts, getCategories } from "../services/api.products";
import { addToCart as addToCartApi } from "../services/api.cart";

const Home = () => {
  const navigation = useNavigation();
  const {
    addStorageData: addToFavorites,
    removeStorageData: removeFromFavorites,
    storageData: favorites,
  } = useStorageContext();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Fetch categories and products whenever tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchProducts();
    }, [])
  );
  

  const fetchCategories = async () => {
    try {
      const response = await getCategories(1);
      console.log("Categories response:", response);
      
      // Handle different response structures
      let categoriesData = [{ category_id: "all", name: "All" }];
      
      if (response?.data && Array.isArray(response.data)) {
        categoriesData = [...categoriesData, ...response.data];
      } else if (Array.isArray(response)) {
        categoriesData = [...categoriesData, ...response];
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.log("Error fetching categories:", error.message);
      // Set default categories if API fails
      setCategories([{ category_id: "all", name: "All" }]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      console.log("Products response:", response);
      
      // Handle different response structures
      let productsData = [];
      
      if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      }
      
      // Filter to only show APPROVED products
      const approvedProducts = productsData.filter((product) => product.status === "APPROVED");
      
      setAllProducts(approvedProducts);
      setFilteredBikes(approvedProducts);
    } catch (error) {
      console.log("Error fetching products:", error.message);
      console.log("API Base URL:", process.env.EXPO_PUBLIC_API);
      
      // Set empty array instead of failing completely
      setAllProducts([]);
      setFilteredBikes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredBikes(allProducts);
    } else {
      // Filter by brand/category name
      const filtered = allProducts?.filter(
        (product) => product.vehicle?.brand === selectedCategory
      );
      setFilteredBikes(filtered || []);
    }
  }, [selectedCategory, allProducts]);

  const navigateToDetail = (product) => {
    navigation.navigate("Detail", { product: product });
  };

  const handleAddToCart = async (bike, event) => {
    event.stopPropagation();
    try {
      const listingId = bike.listing_id || bike.id;
      await addToCartApi(listingId, 1);
      Alert.alert('Success', 'Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const BikeCard = ({ bike }) => {
    // Handle both old and new data formats
    const listingId = bike.listing_id || bike.id;
    const vehicleData = bike.vehicle || bike;
    const mediaData = bike.media || [];
    const firstImage = mediaData.length > 0 
      ? mediaData[0].file_url 
      : (bike.image || "https://random-image-pepebigotes.vercel.app/api/random-image");
    
    const sellerInfo = bike.seller || {};
    const price = vehicleData.price?.d ? vehicleData.price.d[0] : vehicleData.price;

    const isFavorite = favorites?.some((fav) => fav.listing_id === listingId || fav.id === bike.id);

    return (
      <Pressable
        onPress={() => navigateToDetail(bike)}
        style={{
          flex: 1,
          maxWidth: '48%',
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
        {/* Favorite Button */}
        <Pressable
          onPress={() => {
            if (isFavorite) {
              removeFromFavorites(listingId);
            } else {
              addToFavorites(bike);
            }
          }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 20,
            padding: 8,
            backdropFilter: "blur(4px)",
          }}
        >
          <MaterialCommunityIcons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#FF4444" : "#999"}
          />
        </Pressable>

        {/* Image */}
        <View
          style={{
            width: "100%",
            aspectRatio: 4 / 5,
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

          {/* Price Badge */}
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {price ? `₫${price.toLocaleString('vi-VN')}` : "N/A"}
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#222",
              marginBottom: 8,
            }}
            numberOfLines={1}
          >
            {vehicleData.brand} {vehicleData.model}
          </Text>

          {/* Size and Type */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <View
              style={{
                backgroundColor: "#f0f0f0",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#666" }}>
                {vehicleData.frame_size || "M"}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: "#999" }}>•</Text>
            <Text style={{ fontSize: 10, color: "#999" }}>{vehicleData.bike_type || "Bike"}</Text>
          </View>

          {/* Seller Info */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 8 }}>
            <MaterialCommunityIcons name="account" size={12} color="#999" />
            <Text style={{ fontSize: 10, color: "#999" }} numberOfLines={1}>
              {sellerInfo.full_name || "Unknown"}
            </Text>
          </View>

          {/* Add to Cart Button */}
          <Pressable
            onPress={(e) => handleAddToCart(bike, e)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#2d8de8" : "#389cfa",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            })}
          >
            <MaterialCommunityIcons name="cart-plus" size={14} color="#fff" />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
              Add to Cart
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        {/* Header Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E3F2FD",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="bike" size={24} color="#359EFF" />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111" }}>
                CycleTrade
              </Text>
              <Text style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                Thu Duc, HCM City
              </Text>
            </View>
          </View>
          
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 40,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
            <Pressable
              style={{
                flex: 1,
                paddingHorizontal: 8,
                height: 40,
                justifyContent: "center",
              }}
            >
              <TextInput style={{ fontSize: 14, color: "#999" }} placeholder="Search for Trek, Specialized, etc." />
            </Pressable>
            <MaterialCommunityIcons name="tune" size={20} color="#999" />
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.category_id || cat.key}
              onPress={() => setSelectedCategory(cat.name)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedCategory === cat.name ? "#359EFF" : "#fff",
                borderWidth: selectedCategory === cat.name ? 0 : 1,
                borderColor: "#ddd",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color:
                    selectedCategory === cat.name ? "#000" : "#666",
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {/* Hot Picks Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>
            Hot Picks for You
          </Text>
          <Pressable>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#359EFF" }}>
              View all
            </Text>
          </Pressable>
        </View>

        {/* Product Grid */}
        <FlatList
          data={filteredBikes}
          keyExtractor={(item) => item.listing_id || item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => <BikeCard bike={item} />}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="large" color="#359EFF" />
                  <Text style={{ marginTop: 12, color: "#999" }}>
                    Loading bikes...
                  </Text>
                </>
              ) : (
                <Text style={{ marginTop: 12, color: "#999" }}>
                  No bikes found
                </Text>
              )}
            </View>
          }
        />
      </View>
    </View>
  );
};

export default Home;
