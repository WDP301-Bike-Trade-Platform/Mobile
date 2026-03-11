import { Alert } from "react-native";
import { getUser } from "../services/api.user";

/**
 * Checks if the user's profile has all required fields filled in.
 * Required: full_name, phone, national_id, bank_account, bank_name
 * Returns the user data if complete, or null if incomplete (shows alert).
 */
export const checkProfileComplete = async (navigation) => {
  try {
    const res = await getUser();
    const user = res?.data || res;

    const missingFields = [];
    if (!user?.full_name) missingFields.push("Họ tên");
    if (!user?.phone) missingFields.push("Số điện thoại");
    if (!user?.profile?.national_id) missingFields.push("CMND/CCCD");
    if (!user?.profile?.bank_account) missingFields.push("Số tài khoản ngân hàng");
    if (!user?.profile?.bank_name) missingFields.push("Tên ngân hàng");

    if (missingFields.length > 0) {
      Alert.alert(
        "Cập nhật hồ sơ",
        `Bạn cần cập nhật đầy đủ thông tin cá nhân trước khi đăng bài:\n\n- ${missingFields.join("\n- ")}`,
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Cập nhật ngay",
            onPress: () => navigation.navigate("EditProfile"),
          },
        ]
      );
      return null;
    }

    return user;
  } catch (error) {
    Alert.alert("Lỗi", "Không thể kiểm tra hồ sơ. Vui lòng thử lại.");
    return null;
  }
};
