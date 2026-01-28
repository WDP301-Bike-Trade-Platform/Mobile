import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!validatePhone(phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    if (!password) {
      alert("Please enter your password");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password must be at least 8 characters with uppercase, lowercase, number and special character");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate registration API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to OTP verification screen
        navigation.navigate("OTPVerification", {
          email: email,
          fullName: fullName,
          phone: phone,
          password: password,
        });
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: "#f5f7f8",
          }}
        >
          {/* Header Image / Illustration */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
            <View
              style={{
                width: "100%",
                height: 192,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: "#e8ecf1",
                justifyContent: "flex-end",
              }}
            >
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7Kg7o79uHZHUWxla3S50xB3ew_Zb-PUhipUTLdL7YTezpGcqtg39OuSohk2jc6--VlxgvU7Tj5pymHWDY_157AUax10Zvz_Szhyl98KO9YFY4aNO3HqdfAZ-Lb7qj9A2EPV_U1g0nbcsqKQ-MMwCQQ8TaFougDTnDf5XIePbpcODf5ufP4gN5VzHGVftmgn3zZYbC1dGMSvVLgGN5zWeEZIhFl1mSLz4S7ThACfJBMqNHrW3ZcCfyfcqJmYVmkMpu2plFifBVT34",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                  position: "absolute",
                }}
              />
              {/* Gradient overlay */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: 0.5,
                    textAlign: "center",
                  }}
                >
                  CycleTrade
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.8)",
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  Join our community
                </Text>
              </View>
            </View>
          </View>

          {/* Headline */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#111827",
                lineHeight: 34,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              Sign up to get started with CycleTrade
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16, gap: 16 }}>
            {/* Full Name Field */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Full Name
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  height: 56,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color="#9ca3af"
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 8,
                    color: "#111827",
                  }}
                  placeholder="Nguyen Van A"
                  placeholderTextColor="#d1d5db"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Email Address
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  height: 56,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#9ca3af"
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 8,
                    color: "#111827",
                  }}
                  placeholder="a@example.com"
                  placeholderTextColor="#d1d5db"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Field */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Phone Number
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  height: 56,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color="#9ca3af"
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 8,
                    color: "#111827",
                  }}
                  placeholder="+84901234567"
                  placeholderTextColor="#d1d5db"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  height: 56,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#9ca3af"
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 8,
                    color: "#111827",
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#d1d5db"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    padding: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  marginTop: 4,
                }}
              >
                Min 8 chars, uppercase, lowercase, number & special character
              </Text>
            </View>

            {/* Confirm Password Field */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Confirm Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  height: 56,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#9ca3af"
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 8,
                    color: "#111827",
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#d1d5db"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    padding: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Terms & Conditions */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Pressable
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: termsAccepted ? "#389cfa" : "#d1d5db",
                  backgroundColor: termsAccepted ? "#389cfa" : "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {termsAccepted && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#fff"
                  />
                )}
              </Pressable>
              <Text
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  flex: 1,
                }}
              >
                I agree to the{" "}
                <Text style={{ color: "#389cfa", fontWeight: "600" }}>
                  Terms & Conditions
                </Text>
              </Text>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => ({
                height: 56,
                borderRadius: 12,
                backgroundColor: "#389cfa",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 8,
                shadowColor: "#389cfa",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
                opacity: pressed || isLoading ? 0.8 : 1,
                flexDirection: "row",
                gap: 8,
              })}
            >
              {isLoading && <ActivityIndicator color="#fff" size="small" />}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Text>
            </Pressable>
          </View>

          {/* Footer / Login Link */}
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              paddingHorizontal: 24,
              paddingBottom: 20,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                Already have an account?{" "}
                <Text
                  onPress={() => navigation.navigate("Login")}
                  style={{
                    fontWeight: "700",
                    color: "#389cfa",
                  }}
                >
                  Log In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Register;
