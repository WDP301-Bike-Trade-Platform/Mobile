import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../provider/AppProvider";
import { getUser } from "../../services/api.user";

const InspectorProfile = () => {
  const navigation = useNavigation();
  const { logout } = useAppContext();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await getUser();
      setUserProfile(data?.data || data);
    } catch (error) {
      console.log("Error loading profile:", error);
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, isLogout = false }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        justifyContent: "space-between",
        backgroundColor: pressed ? "#f3f4f6" : "#fff",
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isLogout ? "#fee2e2" : "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isLogout ? "#ef4444" : "#6b7280"}
          />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isLogout ? "#ef4444" : "#111827",
          }}
        >
          {label}
        </Text>
      </View>
      {!isLogout && (
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f6f7f8",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#389cfa" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Profile Header */}
        <View
          style={{
            alignItems: "center",
            gap: 16,
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            style={{ position: "relative" }}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                overflow: "hidden",
                borderWidth: 4,
                borderColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Image
                source={{
                  uri:
                    userProfile?.profile?.avatar_url ||
                    "https://via.placeholder.com/112",
                }}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#389cfa",
                borderWidth: 2,
                borderColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
            </View>
          </Pressable>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}
            >
              {userProfile?.full_name || "Inspector"}
            </Text>
            <Text
              style={{ fontSize: 14, fontWeight: "500", color: "#6b7280" }}
            >
              {userProfile?.email}
            </Text>
            <View
              style={{
                marginTop: 6,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: "#dbeafe",
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: "#2563eb" }}
              >
                INSPECTOR
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => ({
              paddingVertical: 8,
              paddingHorizontal: 24,
              borderRadius: 20,
              backgroundColor: "rgba(56, 156, 250, 0.1)",
              opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: "#389cfa" }}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* Menu */}
        <View
          style={{
            marginHorizontal: 16,
            marginVertical: 16,
            backgroundColor: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            marginHorizontal: 16,
            marginVertical: 8,
            marginBottom: 16,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: pressed ? "#fee2e2" : "#fff",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          })}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#ef4444" }}>
            Log Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InspectorProfile;
