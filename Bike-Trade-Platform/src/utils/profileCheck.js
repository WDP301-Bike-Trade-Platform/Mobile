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
    if (!user?.full_name) missingFields.push("Full name");
    if (!user?.phone) missingFields.push("Phone");
    if (!user?.profile?.national_id) missingFields.push("National ID");
    if (!user?.profile?.bank_account) missingFields.push("Bank Account");
    if (!user?.profile?.bank_name) missingFields.push("Bank Name");

    if (missingFields.length > 0) {
      Alert.alert(
        "Update Profile",
        `You need to update your personal information before posting:\n\n- ${missingFields.join("\n- ")}`,
        [
          { text: "Later", style: "cancel" },
          {
            text: "Update Now",
            onPress: () => navigation.navigate("EditProfile"),
          },
        ]
      );
      return null;
    }

    return user;
  } catch (error) {
    Alert.alert("Error", "Unable to check profile. Please try again.");
    return null;
  }
};
