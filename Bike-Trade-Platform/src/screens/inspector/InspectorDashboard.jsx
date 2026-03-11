import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getInspections } from "../../services/api.inspector";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: "clock-outline" },
  CONFIRMED: { label: "Confirmed", color: "#2563eb", bg: "#dbeafe", icon: "check-circle-outline" },
  COMPLETED: { label: "Completed", color: "#16a34a", bg: "#dcfce7", icon: "check-decagram" },
  CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", icon: "close-circle-outline" },
};

const RESULT_CONFIG = {
  PASSED: { label: "Passed", color: "#16a34a", icon: "shield-check" },
  FAILED: { label: "Failed", color: "#dc2626", icon: "shield-alert" },
  EXPIRED: { label: "Expired", color: "#6b7280", icon: "shield-off" },
  PENDING: { label: "Pending", color: "#d97706", icon: "shield-outline" },
};

const InspectorDashboard = () => {
  const navigation = useNavigation();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filters = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  const fetchInspections = useCallback(async () => {
    try {
      const params = {};
      if (activeFilter !== "ALL") params.requestStatus = activeFilter;
      const response = await getInspections(params);
      // Backend returns { data: [...], meta: {...} }
      const items = response?.data || response || [];
      setInspections(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setInspections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchInspections();
    }, [fetchInspections])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInspections();
  };

  const getStatusInfo = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InspectionCard = ({ item }) => {
    const statusInfo = getStatusInfo(item.request_status);
    const vehicle = item.listing?.vehicle || {};
    const requester = item.requester || {};

    const parsePrice = (price) => {
      if (!price) return null;
      if (typeof price === "number") return price;
      if (price.d && price.e !== undefined && price.s !== undefined) {
        return price.s * price.d[0] * Math.pow(10, price.e - (price.d[0].toString().length - 1));
      }
      return Number(price) || null;
    };

    const priceNum = parsePrice(vehicle.price);

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("InspectionDetail", {
            inspectionId: item.inspection_id,
          })
        }
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#f0f0f0",
          overflow: "hidden",
        }}
      >
        {/* Status Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: statusInfo.bg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialCommunityIcons
              name={statusInfo.icon}
              size={16}
              color={statusInfo.color}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#999" }}>
            {formatDate(item.created_at)}
          </Text>
        </View>

        {/* Card Body */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#111",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}
          </Text>

          {priceNum && (
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#359EFF", marginBottom: 8 }}>
              {priceNum.toLocaleString("vi-VN")}đ
            </Text>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {vehicle.condition && (
              <View style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: "#666" }}>{vehicle.condition}</Text>
              </View>
            )}
            {vehicle.bike_type && (
              <View style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: "#666" }}>{vehicle.bike_type}</Text>
              </View>
            )}
            {vehicle.frame_size && (
              <View style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: "#666" }}>Size {vehicle.frame_size}</Text>
              </View>
            )}
          </View>

          <View style={{ gap: 4 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MaterialCommunityIcons name="account" size={14} color="#999" />
              <Text style={{ fontSize: 13, color: "#666" }}>
                Requester: {requester.full_name || "N/A"}
              </Text>
            </View>

            {item.scheduled_at && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={14}
                  color="#999"
                />
                <Text style={{ fontSize: 13, color: "#666" }}>
                  Schedule: {formatDate(item.scheduled_at)}
                </Text>
              </View>
            )}

            {item.result_status && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <MaterialCommunityIcons
                  name={
                    RESULT_CONFIG[item.result_status]?.icon || "shield-outline"
                  }
                  size={14}
                  color={
                    RESULT_CONFIG[item.result_status]?.color || "#999"
                  }
                />
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      RESULT_CONFIG[item.result_status]?.color || "#666",
                    fontWeight: "600",
                  }}
                >
                  Result: {RESULT_CONFIG[item.result_status]?.label || item.result_status}
                </Text>
              </View>
            )}

            {item.notes && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <MaterialCommunityIcons name="note-text" size={14} color="#999" />
                <Text style={{ fontSize: 13, color: "#666" }} numberOfLines={2}>
                  {item.notes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: "#f5f5f5",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 12, color: "#359EFF", fontWeight: "600" }}>
              View details
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#359EFF"
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      <SafeAreaView
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111" }}>
            Inspection Requests
          </Text>
          <Text style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
            Manage inspection requests assigned to you
          </Text>
        </View>

        {/* Filter Tabs */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12, gap: 6 }}
          renderItem={({ item: filter }) => {
            const isActive = activeFilter === filter;
            return (
              <Pressable
                onPress={() => setActiveFilter(filter)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? "#359EFF" : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isActive ? "#fff" : "#666",
                  }}
                >
                  {filter === "ALL"
                    ? "All"
                    : STATUS_CONFIG[filter]?.label || filter}
                </Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#359EFF" />
        </View>
      ) : (
        <FlatList
          data={inspections}
          keyExtractor={(item) => item.inspection_id}
          renderItem={({ item }) => <InspectionCard item={item} />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#359EFF"]}
            />
          }
          ListEmptyComponent={
            <View
              style={{
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
                  name="clipboard-text-outline"
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
                No requests yet
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#999",
                  textAlign: "center",
                  maxWidth: 220,
                }}
              >
                Inspection requests assigned to you will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default InspectorDashboard;
