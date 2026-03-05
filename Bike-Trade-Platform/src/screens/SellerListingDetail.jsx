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
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchSellerListingDetail,
  publishListing,
  archiveListing,
  deleteListing,
} from "../services/api.sellerListings";
import { formatPrice } from "../utils/formatters";

const { width } = Dimensions.get("window");

const STATUS_MAP = {
  DRAFT: { label: "Draft", color: "#6b7280", bgColor: "#f3f4f6" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "#d97706", bgColor: "#fef3c7" },
  APPROVED: { label: "Approved", color: "#16a34a", bgColor: "#dcfce7" },
  RESERVED: { label: "Reserved", color: "#ea580c", bgColor: "#ffedd5" },
  SOLD: { label: "Sold", color: "#0891b2", bgColor: "#cffafe" },
  REJECTED: { label: "Rejected", color: "#dc2626", bgColor: "#fee2e2" },
  ARCHIVED: { label: "Archived", color: "#4b5563", bgColor: "#e5e7eb" },
  FLAGGED: { label: "Flagged", color: "#dc2626", bgColor: "#fee2e2" },
  DELETED: { label: "Deleted", color: "#dc2626", bgColor: "#fee2e2" },
};

const SellerListingDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listingId } = route.params || {};

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchListingDetail = async () => {
    if (!listingId) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetchSellerListingDetail(listingId);
      setListing(response.data || response);
    } catch (error) {
      console.error("Error fetching listing detail:", error);
      Alert.alert("Error", "Unable to load product details");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchListingDetail();
    }, [listingId])
  );

  const handlePublish = async () => {
    if (!listing?.id) return;
    
    setActionLoading(true);
    try {
      await publishListing(listing.id);
      Alert.alert("Success", "Listing submitted for approval");
      fetchListingDetail();
    } catch (error) {
      console.error("Error publishing listing:", error);
      Alert.alert("Error", "Unable to publish listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!listing?.id) return;
    
    setActionLoading(true);
    try {
      await archiveListing(listing.id);
      Alert.alert("Success", "Listing archived");
      fetchListingDetail();
    } catch (error) {
      console.error("Error archiving listing:", error);
      Alert.alert("Error", "Unable to archive listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    if (!listing?.id) return;
    
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteListing(listing.id);
              Alert.alert("Success", "Listing deleted", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Error deleting listing:", error);
              Alert.alert("Error", "Unable to delete listing");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#359EFF" />
        <Text style={{ marginTop: 16, color: "#6b7280" }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#dc2626" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#374151" }}>
          Product not found
        </Text>
        <Pressable
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#359EFF",
            borderRadius: 8,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_MAP[listing.status] || { 
    label: listing.status, 
    color: "#4b5563", 
    bgColor: "#e5e7eb" 
  };

  const images = listing.images || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusRow}>
            <Text style={styles.listingIdText}>#{listing.id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bgColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            Created: {formatDate(listing.createdAt)}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {listing.status === "DRAFT" && (
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={handlePublish}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="send" size={16} color="#fff" />
                <Text style={styles.btnPrimaryText}>Publish</Text>
              </Pressable>
            )}
            
            {listing.status === "APPROVED" && (
              <Pressable
                style={[styles.btn, styles.btnOutline]}
                onPress={handleArchive}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="archive" size={16} color="#359EFF" />
                <Text style={styles.btnOutlineText}>Archive</Text>
              </Pressable>
            )}
            
            {listing.status === "ARCHIVED" && (
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={handlePublish}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="send" size={16} color="#fff" />
                <Text style={styles.btnPrimaryText}>Republish</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.btn, styles.btnOutline]}
              onPress={() => navigation.navigate("CreateProduct", { 
                isEdit: true, 
                productData: listing 
              })}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#359EFF" />
              <Text style={styles.btnOutlineText}>Edit</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.btnDanger]}
              onPress={handleDelete}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons name="delete" size={16} color="#dc2626" />
              <Text style={styles.btnDangerText}>Delete</Text>
            </Pressable>
          </View>
        </View>

        {/* Images */}
        {images.length > 0 && (
          <View style={styles.mediaContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const x = event.nativeEvent.contentOffset.x;
                const index = Math.round(x / width);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.url || image }} style={styles.image} />
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentImageIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{listing.title || listing.name}</Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {listing.description || "No description"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.attributesGrid}>
            {listing.brand && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Brand:</Text>
                <Text style={styles.attrValue}>{listing.brand}</Text>
              </View>
            )}
            {listing.model && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Model:</Text>
                <Text style={styles.attrValue}>{listing.model}</Text>
              </View>
            )}
            {listing.year && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Year:</Text>
                <Text style={styles.attrValue}>{listing.year}</Text>
              </View>
            )}
            {listing.condition && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Condition:</Text>
                <Text style={styles.attrValue}>{listing.condition}</Text>
              </View>
            )}
            {listing.category && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Category:</Text>
                <Text style={styles.attrValue}>{listing.category}</Text>
              </View>
            )}
          </View>

          {listing.location && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#6b7280" />
                <Text style={styles.locationText}>{listing.location}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f3f4f6" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#111827", 
    flex: 1, 
    textAlign: "center" 
  },
  statusBar: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  listingIdText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnOutline: {
    borderColor: "#359EFF",
    backgroundColor: "#eff6ff",
  },
  btnOutlineText: { color: "#359EFF", fontSize: 14, fontWeight: "600" },
  btnPrimary: {
    backgroundColor: "#359EFF",
    borderColor: "#359EFF",
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  btnDanger: {
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
  },
  btnDangerText: { color: "#dc2626", fontSize: 14, fontWeight: "600" },
  mediaContainer: {
    backgroundColor: "#fff",
    marginBottom: 8,
    position: "relative",
  },
  imageWrapper: {
    width,
    height: width,
    position: "relative",
    backgroundColor: "#f9fafb",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  primaryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#359EFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  pagination: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeDot: {
    backgroundColor: "#359EFF",
    width: 16,
  },
  infoSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 28,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#dc2626",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
  },
  attributesGrid: {
    gap: 12,
  },
  attrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  attrLabel: {
    fontSize: 14,
    color: "#6b7280",
    width: "35%",
  },
  attrValue: {
    fontSize: 14,
    color: "#111827",
    width: "65%",
    fontWeight: "500",
    textAlign: "right",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    color: "#4b5563",
    flex: 1,
  },
});

export default SellerListingDetail;