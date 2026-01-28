import React, { useState, useEffect, useRef } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, fullName, phone, password } = route.params || {};

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const otpInputRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleOTPChange = (text) => {
    // Only allow numbers and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(numericText);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP verification API call
      setTimeout(() => {
        setIsLoading(false);
        // On success, navigate to confirmation or login screen
        alert("Email verified successfully!");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      alert("OTP verification failed. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate resend OTP API call
      setTimeout(() => {
        setIsLoading(false);
        setOtp("");
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        alert("OTP has been resent to your email");
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      alert("Failed to resend OTP. Please try again.");
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
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
          {/* Back Button */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
            <Pressable
              onPress={handleBackPress}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color="#389cfa"
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#389cfa",
                  marginLeft: 4,
                }}
              >
                Back
              </Text>
            </Pressable>
          </View>

          {/* Header Icon */}
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 24,
              paddingVertical: 24,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#e0f2fe",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="email-check-outline"
                size={40}
                color="#0284c7"
              />
            </View>
          </View>

          {/* Headline */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#111827",
                textAlign: "center",
                lineHeight: 34,
              }}
            >
              Verify Your Email
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginTop: 12,
                lineHeight: 20,
              }}
            >
              We've sent a 6-digit code to{"\n"}
              <Text style={{ fontWeight: "600", color: "#111827" }}>
                {email}
              </Text>
            </Text>
          </View>

          {/* OTP Input Section */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}>
            {/* OTP Input Field */}
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Enter Verification Code
              </Text>
              <Pressable onPress={() => otpInputRef.current?.focus()}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor:
                          otp.length > index
                            ? "#389cfa"
                            : otp.length === index
                            ? "#389cfa"
                            : "#e5e7eb",
                        backgroundColor:
                          otp.length > index ? "#f0f9ff" : "#fff",
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {otp[index] || ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>

              {/* Hidden input for OTP */}
              <TextInput
                ref={otpInputRef}
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 0,
                  width: 0,
                }}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={handleOTPChange}
                autoFocus
              />
            </View>

            {/* Countdown Timer */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: timeLeft < 60 ? "#fef2f2" : "#f0fdf4",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: timeLeft < 60 ? "#fee2e2" : "#dcfce7",
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={timeLeft < 60 ? "#dc2626" : "#16a34a"}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: timeLeft < 60 ? "#dc2626" : "#16a34a",
                }}
              >
                {formatTime(timeLeft)}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: timeLeft < 60 ? "#dc2626" : "#16a34a",
                }}
              >
                {timeLeft < 60 ? "Hurry up!" : "Expires in"}
              </Text>
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              style={({ pressed }) => ({
                height: 56,
                borderRadius: 12,
                backgroundColor: otp.length === 6 ? "#389cfa" : "#d1d5db",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#389cfa",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: otp.length === 6 ? 0.3 : 0,
                shadowRadius: 8,
                elevation: otp.length === 6 ? 5 : 0,
                opacity:
                  pressed || isLoading ? 0.8 : otp.length === 6 ? 1 : 0.6,
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
                {isLoading ? "Verifying..." : "Verify Code"}
              </Text>
            </Pressable>

            {/* Resend Section */}
            <View style={{ alignItems: "center", gap: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                Didn't receive the code?
              </Text>
              <Pressable
                onPress={handleResendOTP}
                disabled={!canResend || isLoading}
                style={({ pressed }) => ({
                  opacity: pressed || !canResend ? (canResend ? 0.7 : 0.5) : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: canResend ? "#389cfa" : "#9ca3af",
                  }}
                >
                  {canResend ? "Resend Code" : "Resend in " + formatTime(timeLeft)}
                </Text>
              </Pressable>
            </View>

            {/* Help Section */}
            <Pressable
              style={({ pressed }) => ({
                paddingVertical: 12,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#389cfa",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Need Help?
              </Text>
            </Pressable>
          </View>

          {/* Info Section */}
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              paddingHorizontal: 24,
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                gap: 12,
              }}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#6b7280"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  flex: 1,
                  lineHeight: 18,
                }}
              >
                Check your spam folder if you don't see the email in your inbox.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default OTPVerification;
