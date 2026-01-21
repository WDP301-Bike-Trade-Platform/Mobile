import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../provider/AppProvider";
import { useNavigation } from "@react-navigation/native";
import { useStorageContext } from "../provider/StorageProvider";
import { useState, useEffect } from "react";

const Home = () => {
  const { books } = useAppContext();
  const navigation = useNavigation();
  const {
    addStorageData: addToFavorites,
    removeStorageData: removeFromFavorites,
    storageData: favorites,
  } = useStorageContext();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredBikes, setFilteredBikes] = useState(books || []);

  const categories = [
    { name: "All", key: "all" },
    { name: "Road", key: "road" },
    { name: "MTB", key: "mtb" },
    { name: "Vintage", key: "vintage" },
    { name: "Gravel", key: "gravel" },
    { name: "E-Bike", key: "ebike" },
  ];

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredBikes(books || []);
    } else {
      const filtered = books?.filter(
        (bike) => bike.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      setFilteredBikes(filtered || []);
    }
  }, [selectedCategory, books]);

  const navigateToDetail = (bike) => {
    navigation.navigate("Detail", { book: bike });
  };

  const BikeCard = ({ bike }) => {
    const isFavorite = favorites?.some((fav) => fav.id === bike.id);

    return (
      <Pressable
        onPress={() => navigateToDetail(bike)}
        style={{
          flex: 1,
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
              removeFromFavorites(bike.id);
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
              uri: bike.image,
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
              ${bike.price}
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
            {bike.brand} {bike.model}
          </Text>

          {/* Size and Category */}
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
                {bike.frame_size || "M"}cm
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: "#999" }}>•</Text>
            <Text style={{ fontSize: 10, color: "#999" }}>{bike.category}</Text>
          </View>

          {/* Location */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <MaterialCommunityIcons name="map-marker" size={12} color="#999" />
            <Text style={{ fontSize: 10, color: "#999" }} numberOfLines={1}>
              San Francisco, CA
            </Text>
          </View>
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
                BikeMarket
              </Text>
              <Text style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                San Francisco, CA
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="bell" size={24} color="#666" />
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#FF4444",
                }}
              />
            </Pressable>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbF7NEakkmgZmTKwU6375IfbCiFEWAP4vN5FINjCZLQ8fbD1fT47Q8OVw37HIu8KBouH5_0FITBY88fRwVuGF9eialsflGnq2EoV_nZrhSdHx4o9U_q42utpdGGeu2TuE3Fx7dwGo5DM-U_xEOwh4MsHr4rsLQAApdgWzSdIQvs1lPDGf-3nE8Cksjzv_YdW42Yy6jcBNnOoh4llkdNHVOxcPjMoPI6J1KwXge-wISUFGJHKpyTCymc1656IEDSYlog2HwStud-eo",
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
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
              <Text style={{ fontSize: 14, color: "#999" }}>
                Search for Trek, Specialized, etc.
              </Text>
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
              key={cat.key}
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
        {/* Fresh Finds Header */}
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
            Fresh Finds
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
          keyExtractor={(item) => item.id.toString()}
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
              <ActivityIndicator size="large" color="#359EFF" />
              <Text style={{ marginTop: 12, color: "#999" }}>
                Loading bikes...
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default Home;
