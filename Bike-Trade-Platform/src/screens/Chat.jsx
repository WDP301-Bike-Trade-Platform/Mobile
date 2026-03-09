import React, { useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getChat } from "../services/api.chat";
import { formatTimeAgo } from "../utils/dateUtils";
import { useChatSocket } from "../hooks/useChatSocket";

const Chat = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Keep conversations in a ref so the socket callback can access latest state
  const conversationsRef = useRef([]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await getChat();
      const threads = res.data || [];
      setConversations(threads);
      conversationsRef.current = threads;
    } catch (error) {
      console.log("Error fetching chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // When a new message arrives on any chat room, update the lastMessage in the list
  const handleNewMessage = useCallback((message) => {
    setConversations((prev) => {
      const updated = prev.map((conv) => {
        if (conv.chatId === message.chatId) {
          return {
            ...conv,
            lastMessage: message.content || message.imageUrl || conv.lastMessage,
            lastMessageAt: message.sentAt,
          };
        }
        return conv;
      });
      // Sort by latest message
      return [...updated].sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );
    });
  }, []);

  useChatSocket({ onNewMessage: handleNewMessage });

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchText.trim().length >= 3) {
      const query = searchText.toLowerCase();
      const otherUser = conv.otherUser;
      const name = otherUser?.fullName || otherUser?.email || "";
      return (
        name.toLowerCase().includes(query) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const ConversationItem = ({ item }) => {
    const otherUser = item.otherUser || {};
    const name =
      otherUser.fullName || otherUser.email || `User #${item.otherUserId}`;
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("Conversation", {
            chatId: item.chatId,
            otherUser: otherUser,
          })
        }
        style={({ pressed }) => ({
          flexDirection: "row",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: pressed ? "#f9fafb" : "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        })}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: otherUser.avatarUrl || avatarFallback }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#e5e7eb",
            }}
          />
        </View>

        <View style={{ flex: 1, gap: 4, justifyContent: "center" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: "#9ca3af",
                marginLeft: 8,
              }}
            >
              {formatTimeAgo(item.lastMessageAt)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#6b7280",
            }}
            numberOfLines={1}
          >
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#111827",
            letterSpacing: 0.5,
          }}
        >
          Messages
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
            borderRadius: 12,
            height: 48,
            paddingHorizontal: 12,
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
          <TextInput
            style={{
              flex: 1,
              fontSize: 14,
              color: "#111827",
            }}
            placeholder="Search conversations..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Conversation List */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#389cfa" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.chatId.toString()}
          renderItem={({ item }) => <ConversationItem item={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingBottom: 80,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
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
                  backgroundColor: "#f3f4f6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialCommunityIcons
                  name="chat-outline"
                  size={40}
                  color="#d1d5db"
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                No conversations yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                Start chatting with sellers or other buyers
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Chat;
