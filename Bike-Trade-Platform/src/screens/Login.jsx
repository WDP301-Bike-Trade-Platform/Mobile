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
import { login } from "../services/api.auth";
import { authStorage } from "../services/authStorage";
import { useAppContext } from "../provider/AppProvider";

const Login = () => {
  const navigation = useNavigation();
  const { setIsAuthenticated, setUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await login({
        email: email,
        password: password,
      });

      console.log("Login response:", response);

      // Response structure: { ok: true, access_token: "...", refresh_token: "...", user: {...} }
      if (response && response.ok && response.access_token) {
        // Save all login data using the helper method
        await authStorage.saveLoginResponse(response);

        // Update app context
        setIsAuthenticated(true);
        setUser(response.user);

        setEmail("");
        setPassword("");
        
        // Navigate to home after successful login
        navigation.reset({
          index: 0,
          routes: [{ name: "MainApp" }],
        });
      } else {
        setErrorMessage("Invalid login response. Please try again.");
      }
    } catch (error) {
      console.log("Login error object:", error);
      console.log("Login error response:", error.response);
      console.log("Login error message:", error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        if (status === 401) {
          setErrorMessage("Invalid email or password");
        } else if (status === 403) {
          setErrorMessage("Access forbidden. Your account may be disabled.");
        } else if (status === 400) {
          setErrorMessage(message || "Invalid request. Please check your input.");
        } else {
          setErrorMessage(message || "Login failed. Please try again.");
        }
      } else if (error.request) {
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
                  Find your next ride.
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
              Welcome to CycleTrade!
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View
              style={{
                marginHorizontal: 24,
                marginTop: 12,
                marginBottom: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: "#fee2e2",
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#dc2626",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#dc2626"
                  style={{ marginTop: 2 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: "#991b1b",
                    fontWeight: "500",
                    flex: 1,
                  }}
                >
                  {errorMessage}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Form Section */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16, gap: 20 }}>
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
                  placeholder="rider@example.com"
                  placeholderTextColor="#d1d5db"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
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

              {/* Forgot Password Link */}
              <View style={{ alignItems: "flex-end", marginTop: 4 }}>
                <Pressable>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
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
                {isLoading ? "Logging in..." : "Log In"}
              </Text>
            </Pressable>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#e5e7eb",
                }}
              />
              <Text
                style={{
                  marginHorizontal: 12,
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Or continue with
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#e5e7eb",
                }}
              />
            </View>

            {/* Social Login Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 16,
              }}
            >
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 8,
                  opacity: pressed ? 0.7 : 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  G
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Google
                </Text>
              </Pressable>

            </View>
          </View>

          {/* Footer / Sign Up Link */}
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
                Don't have an account?{" "}
                <Pressable onPress={() => navigation.navigate("Register")}>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: "#389cfa",
                    }}
                  >
                    Register
                  </Text>
                </Pressable>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Login;
