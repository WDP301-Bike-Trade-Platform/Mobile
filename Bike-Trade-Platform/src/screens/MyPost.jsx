import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchSellerListings,
} from "../services/api.sellerListings";
import { formatPrice } from "../utils/formatters";
import { checkProfileComplete } from "../utils/profileCheck";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "SHOW", label: "Visible" },
  { key: "HIDE", label: "Hidden" },
  { key: "SOLD", label: "Sold" },
];

const STATUS_LABEL = {
  SHOW: "Visible",
  HIDE: "Hidden", 
  SOLD: "Sold",
};

const STATUS_COLORS = {
  SHOW: "#d1fae5",
  HIDE: "#e5e7eb",
  SOLD: "#fef3c7",
};

const STATUS_TEXT_COLORS = {
  SHOW: "#059669",
  HIDE: "#4b5563",
  SOLD: "#d97706",
};

const MyPost = () => {
  const navigation = useNavigation();

  // States
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [skip, setSkip] = useState(0);
  const take = 15;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getErrorMessage = (error) => {
    const raw =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "Operation failed";
    if (typeof raw !== "string") return JSON.stringify(raw);
    return raw;
  };

  const getPublishErrorMessage = (error) => {
    const raw = getErrorMessage(error);
    if (raw.includes("Images did not pass quality checks")) {
      return "Images did not pass quality checks";
    }
    if (raw.includes("Price must be greater than 0")) {
      return "Price must be greater than 0";
    }
    return raw;
  };

  const fetchListings = useCallback(
    async (status, currentSkip = 0) => {
      try {
        if (currentSkip === 0) {
          setLoading(true);
        }
        const response = await fetchSellerListings(status, currentSkip, take);
        const data = response.data || response;
        
        // Transform API data to match component expectations
        const transformedData = data.map(item => ({
          id: item.listing_id,
          listingId: item.listing_id,
          title: item.title || (item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : 'Untitled'),
          name: item.title || (item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : 'Untitled'),
          price: item.vehicle?.price?.d?.[0] || 0,
          status: item.status,
          createdAt: item.created_at,
          images: item.media?.map(m => ({
            url: m.file_url,
            is_cover: m.is_cover
          })) || [],
          vehicle: item.vehicle,
          media: item.media
        }));
        
        if (currentSkip === 0) {
          setListings(transformedData);
          setTotal(response.pagination?.total || transformedData.length);
        } else {
          setListings(prev => [...prev, ...transformedData]);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        Alert.alert("Error", "Unable to load listings");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [take]
  );

  useFocusEffect(
    useCallback(() => {
      setListings([]);
      setSkip(0);
      fetchListings(activeTab, 0);
    }, [activeTab, fetchListings])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    fetchListings(activeTab, 0);
  };

  const handleLoadMore = () => {
    if (listings.length < total && !loading) {
      const newSkip = skip + take;
      setSkip(newSkip);
      fetchListings(activeTab, newSkip);
    }
  };

  const renderStatusBadge = (status) => {
    const backgroundColor = STATUS_COLORS[status] || "#e5e7eb";
    const textColor = STATUS_TEXT_COLORS[status] || "#4b5563";
    const label = STATUS_LABEL[status] || status;

    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>
          {label}
        </Text>
      </View>
    );
  };

  const renderListingCard = ({ item }) => {
    const primaryImage = item.images?.[0];
    const coverImage = item.images?.find(img => img.is_cover) || primaryImage;

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("SellerListingDetail", { 
          listingId: item.id 
        })}
      >
        <View style={styles.imageContainer}>
          {coverImage ? (
            <Image 
              source={{ uri: coverImage.url || coverImage }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <MaterialCommunityIcons name="image" size={24} color="#9ca3af" />
            </View>
          )}
          <View style={styles.badgeContainer}>
            {renderStatusBadge(item.status)}
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || item.name}
          </Text>
          <Text style={styles.price}>đ{formatPrice(item.price)}</Text>
          <View style={styles.metaContainer}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#6b7280" />
            <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading && listings.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="magnify" size={24} color="#6b7280" />
          </Pressable>
          <Pressable style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#6b7280" />
          </Pressable>
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.segmentedContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.segmentedControl}
        >
          {STATUS_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.segmentedTab,
                activeTab === tab.key && styles.segmentedTabActive,
              ]}
              onPress={() => {
                setActiveTab(tab.key);
                setListings([]);
                setSkip(0);
              }}
            >
              <Text
                style={[
                  styles.segmentedTabText,
                  activeTab === tab.key && styles.segmentedTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {listings.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="store-outline" size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptyDescription}>
            Start selling by creating your first listing
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={async () => {
              const user = await checkProfileComplete(navigation);
              if (user) navigation.navigate("CreateProduct");
            }}
          >
            <Text style={styles.emptyButtonText}>Create Listing</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3b82f6"]}
            />
          }
        >
          <View style={styles.listContainer}>
            {listings.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                {renderListingCard({ item })}
              </View>
            ))}
          </View>

          {loading && listings.length > 0 && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          )}

          {listings.length < total && !loading && (
            <Pressable
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreBtnText}>Load More</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBackBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
  },
  segmentedContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentedTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedTabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    whiteSpace: "nowrap",
  },
  segmentedTabTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  listContainer: {
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    gap: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 6,
    left: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
    lineHeight: 20,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meta: {
    fontSize: 11,
    color: "#6b7280",
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreBtn: {
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadMoreBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default MyPost;