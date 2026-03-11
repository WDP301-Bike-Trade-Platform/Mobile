import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBar from "../component/HeaderBar";
import { createReport } from "../services/api.report";

const REPORT_REASONS = [
  { key: "scam", label: "Lừa đảo / Scam", icon: "alert-circle" },
  { key: "fake", label: "Thông tin sai lệch", icon: "information-off" },
  { key: "stolen", label: "Hàng bị đánh cắp", icon: "lock-alert" },
  { key: "duplicate", label: "Tin đăng trùng lặp", icon: "content-copy" },
  { key: "inappropriate", label: "Nội dung không phù hợp", icon: "eye-off" },
  { key: "price", label: "Giá không hợp lý", icon: "currency-usd-off" },
  { key: "other", label: "Lý do khác", icon: "dots-horizontal-circle" },
];

const Report = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listingId, listingTitle } = route.params || {};

  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = selectedReason && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const reasonLabel = REPORT_REASONS.find((r) => r.key === selectedReason)?.label || selectedReason;

    try {
      setSubmitting(true);
      await createReport({
        listingId,
        reason: reasonLabel,
        description: description.trim() || undefined,
      });
      Alert.alert(
        "Báo cáo thành công",
        "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại.";
      Alert.alert("Lỗi", message);
    } finally {
      setSubmitting(false);
    }
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
        <HeaderBar title="Báo cáo tin đăng" onBack={() => navigation.goBack()} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Listing Info */}
          {listingTitle && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#f0f0f0",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#fee2e2",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="flag" size={20} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>
                  Báo cáo cho tin đăng
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111" }}
                  numberOfLines={1}
                >
                  {listingTitle}
                </Text>
              </View>
            </View>
          )}

          {/* Reason Selection */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111",
              marginBottom: 12,
            }}
          >
            Chọn lý do báo cáo
          </Text>

          <View style={{ gap: 8, marginBottom: 24 }}>
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.key;
              return (
                <Pressable
                  key={reason.key}
                  onPress={() => setSelectedReason(reason.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: isSelected ? "#eff6ff" : "#fff",
                    borderWidth: 1.5,
                    borderColor: isSelected ? "#359EFF" : "#f0f0f0",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <MaterialCommunityIcons
                    name={reason.icon}
                    size={20}
                    color={isSelected ? "#359EFF" : "#999"}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: isSelected ? "600" : "400",
                      color: isSelected ? "#359EFF" : "#333",
                    }}
                  >
                    {reason.label}
                  </Text>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? "#359EFF" : "#ddd",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#359EFF",
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111",
              marginBottom: 8,
            }}
          >
            Mô tả chi tiết (không bắt buộc)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập thông tin chi tiết về vấn đề bạn gặp phải..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#f0f0f0",
              borderRadius: 12,
              padding: 16,
              fontSize: 14,
              color: "#333",
              minHeight: 120,
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Submit Button */}
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
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: canSubmit ? "#dc2626" : "#e5e7eb",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="flag"
                  size={20}
                  color={canSubmit ? "#fff" : "#9ca3af"}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: canSubmit ? "#fff" : "#9ca3af",
                  }}
                >
                  Gửi báo cáo
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Report;
