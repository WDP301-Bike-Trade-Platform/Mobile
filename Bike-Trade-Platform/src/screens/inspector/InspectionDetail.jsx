import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
  Modal,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import HeaderBar from "../../component/HeaderBar";
import { uploadImageToSupabase } from "../../services/api.supabase";
import {
  getInspectionDetail,
  updateInspection,
  updateInspectionReport,
  cancelInspectionRequest,
  assignInspection,
} from "../../services/api.inspector";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: "clock-outline" },
  CONFIRMED: { label: "Confirmed", color: "#2563eb", bg: "#dbeafe", icon: "check-circle-outline" },
  COMPLETED: { label: "Completed", color: "#16a34a", bg: "#dcfce7", icon: "check-decagram" },
  CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", icon: "close-circle-outline" },
};

const RESULT_OPTIONS = [
  { key: "PASSED", label: "Passed", color: "#16a34a", icon: "shield-check" },
  { key: "FAILED", label: "Failed", color: "#dc2626", icon: "shield-alert" },
];

const InspectionDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { inspectionId } = route.params || {};

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Report form
  const [resultStatus, setResultStatus] = useState("");
  const [reportImage, setReportImage] = useState(null);
  const [notes, setNotes] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);

  // Schedule form
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInspectionDetail(inspectionId);
      setInspection(data);
    } catch (error) {
      Alert.alert("Error", "Unable to load inspection details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
      requestMediaPermissions();
    }, [fetchDetail])
  );

  const requestMediaPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera roll permissions to select images.");
    }
  };

  const pickReportImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultiple: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setReportImage({
          uri: result.assets[0].uri,
          type: "image/jpeg",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const removeReportImage = () => {
    setReportImage(null);
  };

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

  const handleConfirm = () => {
    Alert.alert(
      "Confirm Request",
      "Are you sure you want to accept this inspection request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setActionLoading(true);
              // Nếu chưa có inspector → dùng assign (tự nhận)
              // Nếu đã có inspector → dùng update
              if (!inspection.inspector_id) {
                await assignInspection(inspectionId);
              } else {
                await updateInspection(inspectionId, {
                  requestStatus: "CONFIRMED",
                });
              }
              Alert.alert("Success", "Inspection request confirmed");
              fetchDetail();
            } catch (error) {
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Unable to confirm"
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const openScheduleModal = () => {
    // Pre-fill with existing schedule or default to tomorrow 9:00
    if (inspection.scheduled_at) {
      const d = new Date(inspection.scheduled_at);
      setSelectedDate(d.toISOString().split("T")[0]);
      setSelectedHour(d.getHours());
      setSelectedMinute(d.getMinutes());
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split("T")[0]);
      setSelectedHour(9);
      setSelectedMinute(0);
    }
    setShowScheduleModal(true);
  };

  const handleSchedule = async () => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }
    const scheduledAt = new Date(
      `${selectedDate}T${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}:00`
    );
    if (scheduledAt <= new Date()) {
      Alert.alert("Error", "Schedule must be after current time");
      return;
    }
    try {
      setActionLoading(true);
      await updateInspection(inspectionId, {
        scheduledAt: scheduledAt.toISOString(),
      });
      Alert.alert("Success", "Inspection schedule set");
      setShowScheduleModal(false);
      fetchDetail();
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to set schedule"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Cancel Request", "Are you sure you want to cancel this inspection request?", [
      { text: "No", style: "cancel" },
      {
        text: "Cancel Request",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true);
            await cancelInspectionRequest(inspectionId, "Inspector cancelled request");
            Alert.alert("Success", "Request cancelled");
            fetchDetail();
          } catch (error) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Unable to cancel"
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleSubmitReport = async () => {
    if (!resultStatus) {
      Alert.alert("Error", "Please select an inspection result");
      return;
    }

    if (!reportImage) {
      Alert.alert("Error", "Please select an inspection report image");
      return;
    }

    try {
      setActionLoading(true);

      // Upload image to Supabase
      let reportUrl = "";
      if (reportImage && !reportImage.isExisting) {
        console.log("Uploading report image to Supabase...");
        reportUrl = await uploadImageToSupabase(reportImage.uri);
        console.log("Uploaded report image URL:", reportUrl);
      } else if (reportImage?.uri) {
        reportUrl = reportImage.uri;
      }

      await updateInspectionReport(inspectionId, {
        resultStatus,
        ...(reportUrl && { reportUrl }),
        ...(notes.trim() && { notes: notes.trim() }),
      });
      Alert.alert("Success", "Inspection report submitted");
      setShowReportForm(false);
      setReportImage(null);
      setResultStatus("");
      setNotes("");
      fetchDetail();
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to submit report"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f7f8",
        }}
      >
        <ActivityIndicator size="large" color="#359EFF" />
      </View>
    );
  }

  if (!inspection) return null;

  const statusInfo = STATUS_CONFIG[inspection.request_status] || STATUS_CONFIG.PENDING;
  const vehicle = inspection.listing?.vehicle || {};
  const requester = inspection.requester || {};
  const seller = inspection.listing?.seller || {};
  const isPending = inspection.request_status === "PENDING";
  const isConfirmed = inspection.request_status === "CONFIRMED";
  const isCompleted = inspection.request_status === "COMPLETED";
  const isCancelled = inspection.request_status === "CANCELLED";

  const InfoRow = ({ icon, label, value, valueColor }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f5f5f5",
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color="#999"
        style={{ marginRight: 10 }}
      />
      <Text style={{ fontSize: 13, color: "#999", width: 110 }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: valueColor || "#333",
          flex: 1,
        }}
        numberOfLines={2}
      >
        {value || "N/A"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      <SafeAreaView
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <HeaderBar
          title="Inspection Details"
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        {/* Status Banner */}
        <View
          style={{
            backgroundColor: statusInfo.bg,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <MaterialCommunityIcons
            name={statusInfo.icon}
            size={28}
            color={statusInfo.color}
          />
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </Text>
            <Text style={{ fontSize: 12, color: statusInfo.color, marginTop: 2 }}>
              Created: {formatDate(inspection.created_at)}
            </Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#f0f0f0",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f5f5f5",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
              Vehicle Information
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <InfoRow icon="bike" label="Bike" value={`${vehicle.brand} ${vehicle.model}`} />
            <InfoRow icon="calendar" label="Year" value={vehicle.year?.toString()} />
            <InfoRow
              icon="tag"
              label="Condition"
              value={vehicle.condition}
            />
          </View>
        </View>

        {/* Requester Info */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#f0f0f0",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f5f5f5",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
              Requester
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <InfoRow icon="account" label="Name" value={requester.full_name} />
            <InfoRow icon="email" label="Email" value={requester.email} />
            {requester.phone && (
              <InfoRow icon="phone" label="Phone" value={requester.phone} />
            )}
          </View>
        </View>

        {/* Schedule & Result */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#f0f0f0",
            marginBottom: 16,
          }}
        >
          {/* <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f5f5f5",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
              Inspection Info
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <InfoRow
              icon="calendar-clock"
              label="Schedule"
              value={formatDate(inspection.scheduled_at)}
            />
            {inspection.result_status && (
              <InfoRow
                icon="shield-check"
                label="Result"
                value={
                  inspection.result_status === "PASSED"
                    ? "Passed"
                    : inspection.result_status === "FAILED"
                    ? "Failed"
                    : inspection.result_status
                }
                valueColor={
                  inspection.result_status === "PASSED" ? "#16a34a" : "#dc2626"
                }
              />
            )}
            {inspection.notes && (
              <InfoRow icon="note-text" label="Notes" value={inspection.notes} />
            )}
            {inspection.report_url && (
              <Pressable onPress={() => Linking.openURL(inspection.report_url)}>
                <InfoRow
                  icon="file-document"
                  label="Report"
                  value="View report"
                  valueColor="#359EFF"
                />
              </Pressable>
            )}
            {inspection.valid_until && (
              <InfoRow
                icon="timer-sand"
                label="Valid until"
                value={formatDate(inspection.valid_until)}
              />
            )}
          </View> */}
        </View>

        {/* Schedule Info (for CONFIRMED - show current schedule or prompt) */}
        {/* {isConfirmed && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#f0f0f0",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#f5f5f5",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>
                Inspection Schedule
              </Text>
              <Pressable
                onPress={openScheduleModal}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#f0f7ff",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <MaterialCommunityIcons
                  name={inspection.scheduled_at ? "calendar-edit" : "calendar-plus"}
                  size={16}
                  color="#359EFF"
                />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#359EFF" }}>
                  {inspection.scheduled_at ? "Reschedule" : "Schedule"}
                </Text>
              </Pressable>
            </View>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              {inspection.scheduled_at ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: "#dbeafe",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons name="calendar-clock" size={22} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111" }}>
                      {new Date(inspection.scheduled_at).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                      {new Date(inspection.scheduled_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: "#fef3c7",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons name="calendar-alert" size={22} color="#d97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#d97706" }}>
                      No schedule set
                    </Text>
                    <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                      Set a schedule so the requester knows the inspection time
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )} */}

        {/* Report Form (for CONFIRMED status) */}
        {isConfirmed && showReportForm && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#f0f0f0",
              marginBottom: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#111",
                marginBottom: 16,
              }}
            >
              Inspection Report
            </Text>

            {/* Result Status */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Result *
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {RESULT_OPTIONS.map((opt) => {
                const isSelected = resultStatus === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setResultStatus(opt.key)}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 12,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isSelected ? opt.color : "#e5e7eb",
                      backgroundColor: isSelected
                        ? opt.color + "15"
                        : "#fff",
                    }}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={18}
                      color={isSelected ? opt.color : "#999"}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isSelected ? opt.color : "#666",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Report Image */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Inspection Report Image *
            </Text>

            {/* Pick Image Button */}
            {!reportImage && (
              <Pressable
                onPress={pickReportImage}
                disabled={actionLoading}
                style={{
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: "#359EFF",
                  borderRadius: 8,
                  paddingVertical: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                <MaterialCommunityIcons name="image-plus" size={32} color="#359EFF" />
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#359EFF", marginTop: 8 }}>
                  Select Report Image
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Tap to select image
                </Text>
              </Pressable>
            )}

            {/* Selected Image Preview */}
            {reportImage && (
              <View
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  marginBottom: 12,
                  position: "relative",
                }}
              >
                <Image
                  source={{ uri: reportImage.uri }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={removeReportImage}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={pickReportImage}
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    backgroundColor: "rgba(53, 158, 255, 0.9)",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                </Pressable>
              </View>
            )}

            {/* Notes */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 6,
              }}
            >
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes about the inspection result..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: "#333",
                minHeight: 80,
                marginBottom: 16,
              }}
            />

            {/* Submit Report */}
            <Pressable
              onPress={handleSubmitReport}
              disabled={actionLoading}
              style={{
                backgroundColor: "#16a34a",
                borderRadius: 8,
                paddingVertical: 14,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="send"
                    size={18}
                    color="#fff"
                  />
                  <Text
                    style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}
                  >
                    Submit Report
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      {!isCompleted && !isCancelled && (
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
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              gap: 10,
            }}
          >
            {/* Cancel button */}
            <Pressable
              onPress={handleCancel}
              disabled={actionLoading}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: "#dc2626",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={18}
                color="#dc2626"
              />
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#dc2626" }}>
                Cancel
              </Text>
            </Pressable>

            {isPending && (
              <Pressable
                onPress={handleConfirm}
                disabled={actionLoading}
                style={{
                  flex: 1.5,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: "#359EFF",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#fff"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#fff",
                      }}
                    >
                      Confirm
                    </Text>
                  </>
                )}
              </Pressable>
            )}

            {isConfirmed && (
              <>
                {/* <Pressable
                  onPress={openScheduleModal}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: "#2563eb",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 6,
                  }}
                >
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={18}
                    color="#fff"
                  />
                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}
                  >
                    Schedule
                  </Text>
                </Pressable> */}
                <Pressable
                  onPress={() => setShowReportForm(!showReportForm)}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: "#16a34a",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 6,
                  }}
                >
                  <MaterialCommunityIcons
                    name="file-document-edit"
                    size={18}
                    color="#fff"
                  />
                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}
                  >
                    {showReportForm ? "Hide" : "Report"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </SafeAreaView>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onChangeHour={setSelectedHour}
        onChangeMinute={setSelectedMinute}
        onSubmit={handleSchedule}
        loading={actionLoading}
      />
    </View>
  );
};

// Schedule Modal
const ScheduleModal = ({ visible, onClose, selectedDate, onSelectDate, selectedHour, selectedMinute, onChangeHour, onChangeMinute, onSubmit, loading }) => {
  const today = new Date().toISOString().split("T")[0];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 - 21:00
  const minutes = [0, 15, 30, 45];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "85%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f0f0f0",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#111" }}>
              Schedule Inspection
            </Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#999" />
            </Pressable>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }}>
            {/* Calendar */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#333",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Select Date
            </Text>
            <Calendar
              minDate={today}
              onDayPress={(day) => onSelectDate(day.dateString)}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#359EFF",
                },
              }}
              theme={{
                todayTextColor: "#359EFF",
                arrowColor: "#359EFF",
                textDayFontWeight: "500",
                textMonthFontWeight: "700",
              }}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f0f0f0",
              }}
            />

            {/* Time Picker */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#333",
                marginTop: 20,
                marginBottom: 8,
              }}
            >
              Select Time
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
              {/* Hours */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>Hour</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {hours.map((h) => (
                    <Pressable
                      key={h}
                      onPress={() => onChangeHour(h)}
                      style={{
                        width: 42,
                        height: 36,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: selectedHour === h ? "#359EFF" : "#e5e7eb",
                        backgroundColor: selectedHour === h ? "#dbeafe" : "#fff",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: selectedHour === h ? "700" : "500",
                          color: selectedHour === h ? "#2563eb" : "#333",
                        }}
                      >
                        {String(h).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Minutes */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>Minute</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {minutes.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => onChangeMinute(m)}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: selectedMinute === m ? "#359EFF" : "#e5e7eb",
                      backgroundColor: selectedMinute === m ? "#dbeafe" : "#fff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: selectedMinute === m ? "700" : "500",
                        color: selectedMinute === m ? "#2563eb" : "#333",
                      }}
                    >
                      {String(m).padStart(2, "0")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Selected Preview */}
            {selectedDate && (
              <View
                style={{
                  backgroundColor: "#f0f7ff",
                  borderRadius: 10,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <MaterialCommunityIcons name="calendar-check" size={22} color="#2563eb" />
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#2563eb" }}>
                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#2563eb", marginTop: 2 }}>
                    At {String(selectedHour).padStart(2, "0")}:{String(selectedMinute).padStart(2, "0")}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: "#f0f0f0",
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: "#e5e7eb",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#666" }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSubmit}
              disabled={loading || !selectedDate}
              style={{
                flex: 1.5,
                height: 48,
                borderRadius: 10,
                backgroundColor: !selectedDate ? "#ccc" : "#359EFF",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="calendar-check" size={18} color="#fff" />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
                    Confirm Schedule
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InspectionDetail;
