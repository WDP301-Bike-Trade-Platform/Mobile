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
  markAsSold,
  deleteListing,
} from "../services/api.sellerListings";
import { createInspectionRequest } from "../services/api.inspector";
import { formatPrice } from "../utils/formatters";

const { width } = Dimensions.get("window");

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

const STATUS_MAP = {
  DRAFT: { label: "Draft", color: "#6b7280", bgColor: "#f3f4f6" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "#d97706", bgColor: "#fef3c7" },
  APPROVED: { label: "Approved", color: "#16a34a", bgColor: "#dcfce7" },
  SHOW: { label: "Visible", color: "#059669", bgColor: "#d1fae5" },
  HIDE: { label: "Hidden", color: "#4b5563", bgColor: "#e5e7eb" },
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
  const [isRequestingInspection, setIsRequestingInspection] = useState(false);

  const fetchListingDetail = async () => {
    if (!listingId) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetchSellerListingDetail(listingId);
      setListing(response.data || response);
      console.log("Fetched listing detail:", response.data || response);
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
    if (!listingId) return;
    
    setActionLoading(true);
    try {
      await publishListing(listingId);
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
    if (!listingId) return;
    
    setActionLoading(true);
    try {
      await archiveListing(listingId);
      Alert.alert("Success", "Listing hidden");
      fetchListingDetail();
    } catch (error) {
      console.error("Error archiving listing:", error);
      Alert.alert("Error", "Unable to hide listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!listingId) return;

    Alert.alert("Confirm", "Mark this listing as sold?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Sold",
        onPress: async () => {
          setActionLoading(true);
          try {
            await markAsSold(listingId);
            Alert.alert("Success", "Marked as sold");
            fetchListingDetail();
          } catch (error) {
            console.error("Error marking as sold:", error);
            Alert.alert("Error", "Unable to mark as sold");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleRequestInspection = () => {
    if (!listingId) return;

    Alert.alert(
      "Request Inspection",
      "Do you want to request an inspection for this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit Request",
          onPress: async () => {
            try {
              setIsRequestingInspection(true);
              await createInspectionRequest(listingId);
              Alert.alert("Success", "Inspection request submitted successfully");
              fetchListingDetail();
            } catch (error) {
              const msg = error?.response?.data?.message || "Unable to submit inspection request";
              Alert.alert("Error", msg);
            } finally {
              setIsRequestingInspection(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!listingId) return;
    
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
              await deleteListing(listingId);
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

  const vehicleData = listing.vehicle || {};
  const mediaData = listing.media || [];
  const sellerData = listing.seller || {};
  const inspections = listing.inspections || [];
  const price = parsePrice(vehicleData.price);

  const statusInfo = STATUS_MAP[listing.status] || { 
    label: listing.status, 
    color: "#4b5563", 
    bgColor: "#e5e7eb" 
  };

  const images = mediaData.length > 0
    ? mediaData.map((m) => ({ url: m.file_url, is_cover: m.is_cover }))
    : [];

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
            <Text style={styles.listingIdText} numberOfLines={1}>
              #{listing.listing_id || listing.id}
            </Text>
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
            Created: {formatDate(listing.created_at)}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {listing.status !== "SHOW" && listing.status !== "SOLD" && (
              <Pressable
                style={[styles.btn, styles.btnSuccess]}
                onPress={handlePublish}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="eye" size={16} color="#059669" />
                <Text style={styles.btnSuccessText}>Show</Text>
              </Pressable>
            )}

            {listing.status !== "HIDE" && listing.status !== "SOLD" && (
              <Pressable
                style={[styles.btn, styles.btnOutline]}
                onPress={handleArchive}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="eye-off" size={16} color="#359EFF" />
                <Text style={styles.btnOutlineText}>Hide</Text>
              </Pressable>
            )}

            {listing.status !== "SOLD" && (
              <Pressable
                style={[styles.btn, styles.btnWarning]}
                onPress={handleMarkAsSold}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="check-circle" size={16} color="#d97706" />
                <Text style={styles.btnWarningText}>Sold</Text>
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

          {/* Inspection Request */}
          <View style={styles.inspectionSection}>
            {inspections.length > 0 && (() => {
              const latestInspection = inspections[inspections.length - 1];
              const resultStatus = latestInspection.result_status;
              const requestStatus = latestInspection.request_status;
              const isPassed = resultStatus === "PASSED";
              const isFailed = resultStatus === "FAILED";
              const statusColor = isPassed ? "#16a34a" : isFailed ? "#dc2626" : "#d97706";
              const statusBg = isPassed ? "#dcfce7" : isFailed ? "#fee2e2" : "#fef3c7";
              const statusIcon = isPassed ? "shield-check" : isFailed ? "shield-alert" : "shield-half-full";
              const statusLabel = isPassed
                ? "Inspected - Passed"
                : isFailed
                ? "Inspected - Failed"
                : requestStatus === "CONFIRMED"
                ? "Inspection In Progress"
                : requestStatus === "CANCELLED"
                ? "Inspection Cancelled"
                : "Pending Inspection";

              return (
                <View style={styles.inspectionResult}>
                  <View style={[styles.inspectionHeader, { backgroundColor: statusBg }]}>
                    <MaterialCommunityIcons name={statusIcon} size={20} color={statusColor} />
                    <Text style={{ fontSize: 14, fontWeight: "700", color: statusColor }}>
                      {statusLabel}
                    </Text>
                  </View>
                  {latestInspection.notes && (
                    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                      <Text style={{ fontSize: 13, color: "#555", lineHeight: 20 }}>
                        {latestInspection.notes}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
            {(() => {
              const hasPending = inspections.some(
                (i) => i.request_status === "PENDING" || i.request_status === "CONFIRMED"
              );
              if (listing.status === "SOLD") return null;
              if (hasPending) return (
                <View style={[styles.inspectionBtn, { borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
                  <Text style={[styles.inspectionBtnText, { color: "#6b7280" }]}>
                    Inspection Request Pending
                  </Text>
                </View>
              );
              return (
                <Pressable
                  onPress={handleRequestInspection}
                  disabled={isRequestingInspection}
                  style={({ pressed }) => ([
                    styles.inspectionBtn,
                    pressed && { backgroundColor: "#e0f2fe" },
                  ])}
                >
                  {isRequestingInspection ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="shield-search" size={20} color="#2563eb" />
                      <Text style={styles.inspectionBtnText}>Request Inspection</Text>
                    </>
                  )}
                </Pressable>
              );
            })()}
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
          <Text style={styles.title}>
            {vehicleData.brand} {vehicleData.model}
          </Text>
          <Text style={styles.price}>
            {price ? `₫${price.toLocaleString("vi-VN")}` : "Contact for price"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {vehicleData.description || "No description"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.attributesGrid}>
            {vehicleData.brand && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Brand:</Text>
                <Text style={styles.attrValue}>{vehicleData.brand}</Text>
              </View>
            )}
            {vehicleData.model && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Model:</Text>
                <Text style={styles.attrValue}>{vehicleData.model}</Text>
              </View>
            )}
            {vehicleData.year && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Year:</Text>
                <Text style={styles.attrValue}>{vehicleData.year}</Text>
              </View>
            )}
            {vehicleData.condition && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Condition:</Text>
                <Text style={styles.attrValue}>{vehicleData.condition}</Text>
              </View>
            )}
            {vehicleData.bike_type && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Bike Type:</Text>
                <Text style={styles.attrValue}>{vehicleData.bike_type}</Text>
              </View>
            )}
            {vehicleData.material && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Material:</Text>
                <Text style={styles.attrValue}>{vehicleData.material}</Text>
              </View>
            )}
            {vehicleData.brake_type && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Brake Type:</Text>
                <Text style={styles.attrValue}>{vehicleData.brake_type}</Text>
              </View>
            )}
            {vehicleData.wheel_size && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Wheel Size:</Text>
                <Text style={styles.attrValue}>{vehicleData.wheel_size}"</Text>
              </View>
            )}
            {vehicleData.frame_size && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Frame Size:</Text>
                <Text style={styles.attrValue}>{vehicleData.frame_size}</Text>
              </View>
            )}
            {vehicleData.groupset && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Groupset:</Text>
                <Text style={styles.attrValue}>{vehicleData.groupset}</Text>
              </View>
            )}
            {vehicleData.usage_level && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Usage Level:</Text>
                <Text style={styles.attrValue}>{vehicleData.usage_level}</Text>
              </View>
            )}
            {vehicleData.mileage_km != null && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Mileage:</Text>
                <Text style={styles.attrValue}>{vehicleData.mileage_km} km</Text>
              </View>
            )}
            {vehicleData.frame_serial && (
              <View style={styles.attrRow}>
                <Text style={styles.attrLabel}>Frame Serial:</Text>
                <Text style={styles.attrValue}>{vehicleData.frame_serial}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Additional Info</Text>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: vehicleData.is_original ? "#dcfce7" : "#fee2e2" }]}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={vehicleData.is_original ? "#16a34a" : "#dc2626"}
              />
              <Text style={{ fontSize: 12, fontWeight: "600", color: vehicleData.is_original ? "#16a34a" : "#dc2626" }}>
                Original Parts
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: vehicleData.has_receipt ? "#dcfce7" : "#fee2e2" }]}>
              <MaterialCommunityIcons
                name="receipt"
                size={14}
                color={vehicleData.has_receipt ? "#16a34a" : "#dc2626"}
              />
              <Text style={{ fontSize: 12, fontWeight: "600", color: vehicleData.has_receipt ? "#16a34a" : "#dc2626" }}>
                Has Receipt
              </Text>
            </View>
          </View>

          {/* Seller Info */}
          {sellerData.full_name && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Seller</Text>
              <View style={styles.sellerRow}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>
                    {sellerData.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sellerName}>{sellerData.full_name}</Text>
                  <Text style={styles.sellerMeta}>{sellerData.email}</Text>
                </View>
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
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    flex: 1,
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
  btnSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  btnSuccessText: { color: "#059669", fontSize: 14, fontWeight: "600" },
  btnWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  btnWarningText: { color: "#d97706", fontSize: 14, fontWeight: "600" },
  inspectionSection: {
    marginTop: 16,
    gap: 10,
  },
  inspectionResult: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  inspectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inspectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#93c5fd",
    borderRadius: 14,
    paddingVertical: 14,
  },
  inspectionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  sellerAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#359EFF",
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  sellerMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});

export default SellerListingDetail;