import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import { getUser, updateUser } from "../services/api.user";
import { uploadImageToSupabase } from "../services/api.supabase";

const EditProfile = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");

  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await getUser();
      console.log("Full API response:", JSON.stringify(data, null, 2));
      
      const userData = data?.data || data;
      console.log("User data:", JSON.stringify(userData, null, 2));
      setUserProfile(userData);

      // Populate form fields
      setFullName(userData?.full_name || "");
      setPhone(userData?.phone || "");
      setEmail(userData?.email || "");
      
      // Format date properly - convert to YYYY-MM-DD if exists
      const dobValue = userData?.profile?.dob;
      console.log("DOB value from API:", dobValue);
      
      if (dobValue) {
        try {
          const date = new Date(dobValue);
          console.log("Parsed date object:", date);
          
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            console.log("Formatted date (YYYY-MM-DD):", formattedDate);
            setDob(formattedDate);
          } else {
            console.log("Invalid date");
            setDob("");
          }
        } catch (e) {
          console.log("Error parsing date:", e);
          setDob("");
        }
      } else {
        console.log("No DOB value found");
        setDob("");
      }
      
      setGender(userData?.profile?.gender || "");
      setNationalId(userData?.profile?.national_id || "");
      setBankAccount(userData?.profile?.bank_account || "");
      setBankName(userData?.profile?.bank_name || "");
      setAvatarUri(userData?.profile?.avatar_url || null);
    } catch (error) {
      console.log("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation", "Full name is required");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Validation", "Phone number is required");
      return;
    }

    try {
      setSubmitting(true);

      let avatarUrl = userProfile?.profile?.avatar_url;

      // If avatar is a local file (newly selected), upload it to Supabase
      if (avatarUri && avatarUri.startsWith("file://")) {
        try {
          console.log("Uploading avatar to Supabase...");
          avatarUrl = await uploadImageToSupabase(avatarUri, "images");
          console.log("Avatar uploaded successfully:", avatarUrl);
        } catch (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          Alert.alert("Warning", "Avatar upload failed, but profile will be updated without avatar");
        }
      }

      const updateData = {
        full_name: fullName,
        phone: phone,
        ...(dob && dob.trim() && { dob: dob.trim() }),
        ...(gender && gender.trim() && { gender: gender.trim() }),
        ...(nationalId && nationalId.trim() && { national_id: nationalId.trim() }),
        ...(bankAccount && bankAccount.trim() && { bank_account: bankAccount.trim() }),
        ...(bankName && bankName.trim() && { bank_name: bankName.trim() }),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      };

      console.log("Sending update data:", JSON.stringify(updateData, null, 2));

      const result = await updateUser(updateData);
      console.log("Profile update result:", result);

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating profile:", error);
      console.log("Error response:", error.response?.data);
      Alert.alert("Error", "Failed to update profile. " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const SelectField = ({ label, value, options, onSelect }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
        {label}
      </Text>
      <Pressable
        onPress={() => setGenderDropdownOpen(!genderDropdownOpen)}
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: value ? "#111827" : "#9ca3af" }}>
          {value || `Select ${label}`}
        </Text>
        <MaterialCommunityIcons
          name={genderDropdownOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </Pressable>

      {genderDropdownOpen && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderTopWidth: 0,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onSelect(option);
                setGenderDropdownOpen(false);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 14, color: "#111827" }}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f8", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#389cfa" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f8" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
          Edit Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 120,
        }}
      >
        {/* Avatar Section */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Pressable onPress={pickImage}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "#389cfa",
                backgroundColor: "#f3f4f6",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                  }}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={40} color="#9ca3af" />
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={pickImage}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: "rgba(56, 156, 250, 0.1)",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#389cfa" }}>
              Change Avatar
            </Text>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View>
          {/* Full Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              Full Name *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#111827",
              }}
              placeholder="Enter full name"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
              }}
              editable={!submitting}
            />
          </View>

          {/* Email (Read-only) */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              Email
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#9ca3af",
                backgroundColor: "#f9fafb",
              }}
              value={email}
              editable={false}
            />
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              Phone *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#111827",
              }}
              placeholder="Enter phone number"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="numeric"
              editable={!submitting}
            />
          </View>

          {/* Date of Birth */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              Date of Birth
            </Text>
            <Pressable
              onPress={() => setCalendarVisible(true)}
              disabled={submitting}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: dob ? "#111827" : "#9ca3af" }}>
                {dob || "Select Date of Birth"}
              </Text>
              <MaterialCommunityIcons name="calendar" size={20} color="#6b7280" />
            </Pressable>
          </View>

          {/* Gender */}
          <SelectField
            label="Gender"
            value={gender}
            options={["Male", "Female", "Other"]}
            onSelect={setGender}
          />

          {/* National ID */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              National ID
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#111827",
              }}
              placeholder="Enter national ID"
              placeholderTextColor="#9ca3af"
              value={nationalId}
              onChangeText={setNationalId}
              editable={!submitting}
            />
          </View>

          {/* Bank Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              Bank Name
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#111827",
              }}
              placeholder="Enter bank name"
              placeholderTextColor="#9ca3af"
              value={bankName}
              onChangeText={setBankName}
              editable={!submitting}
            />
          </View>

          {/* Bank Account */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
              Bank Account
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: "#111827",
              }}
              placeholder="Enter bank account number"
              placeholderTextColor="#9ca3af"
              value={bankAccount}
              onChangeText={setBankAccount}
              editable={!submitting}
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => ({
              backgroundColor: "#389cfa",
              paddingVertical: 14,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              opacity: pressed || submitting ? 0.7 : 1,
            })}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setCalendarVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              width: "90%",
              maxWidth: 400,
              maxHeight: "80%",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
                Select Date of Birth
              </Text>
              <Pressable onPress={() => setCalendarVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#111827" />
              </Pressable>
            </View>

            {/* Year and Month Selectors */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {/* Year Selector */}
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => {
                    setYearDropdownOpen(!yearDropdownOpen);
                    setMonthDropdownOpen(false);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>
                    {selectedYear}
                  </Text>
                  <MaterialCommunityIcons
                    name={yearDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>

                {yearDropdownOpen && (
                  <ScrollView
                    style={{
                      position: "absolute",
                      top: 45,
                      left: 0,
                      right: 0,
                      maxHeight: 200,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 8,
                      backgroundColor: "#fff",
                      zIndex: 1000,
                    }}
                    nestedScrollEnabled={true}
                  >
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <Pressable
                        key={year}
                        onPress={() => {
                          setSelectedYear(year);
                          setYearDropdownOpen(false);
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#f3f4f6",
                          backgroundColor: selectedYear === year ? "#f3f9ff" : "#fff",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#111827" }}>{year}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Month Selector */}
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => {
                    setMonthDropdownOpen(!monthDropdownOpen);
                    setYearDropdownOpen(false);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>
                    {monthNames[selectedMonth - 1]}
                  </Text>
                  <MaterialCommunityIcons
                    name={monthDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>

                {monthDropdownOpen && (
                  <ScrollView
                    style={{
                      position: "absolute",
                      top: 45,
                      left: 0,
                      right: 0,
                      maxHeight: 200,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 8,
                      backgroundColor: "#fff",
                      zIndex: 1000,
                    }}
                    nestedScrollEnabled={true}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <Pressable
                        key={month}
                        onPress={() => {
                          setSelectedMonth(month);
                          setMonthDropdownOpen(false);
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#f3f4f6",
                          backgroundColor: selectedMonth === month ? "#f3f9ff" : "#fff",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#111827" }}>{monthNames[month - 1]}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            <Calendar
              key={`${selectedYear}-${selectedMonth}`}
              current={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                setDob(day.dateString);
                setCalendarVisible(false);
              }}
              onMonthChange={(date) => {
                setSelectedYear(date.year);
                setSelectedMonth(date.month);
              }}
              markedDates={
                dob
                  ? {
                      [dob]: {
                        selected: true,
                        selectedColor: "#389cfa",
                      },
                    }
                  : {}
              }
              theme={{
                selectedDayBackgroundColor: "#389cfa",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#389cfa",
                arrowColor: "#389cfa",
                monthTextColor: "#111827",
                textMonthFontWeight: "700",
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default EditProfile;
