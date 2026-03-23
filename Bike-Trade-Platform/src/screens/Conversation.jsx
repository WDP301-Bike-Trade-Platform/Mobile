import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
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
import { getChatMessages, sendMessage } from "../services/api.chat";
import { useAppContext } from "../provider/AppProvider";
import { useChatSocket } from "../hooks/useChatSocket";

const Conversation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, otherUser } = route.params || {};

  const { user } = useAppContext();
  const currentUserId = user?.user_id || user?.userId || user?.id;

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // other user is typing
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set()); // deduplicate messages from socket + HTTP

  /* ── Fetch initial messages (HTTP) ────────────────────────── */
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const res = await getChatMessages(chatId);
      // Backend: { success, data: { total, items: MessageResponse[] } }
      const items = res.data?.items || res.data || [];
      if (Array.isArray(items)) {
        // Messages are desc order from backend, reverse to oldest-first
        const ordered = [...items].reverse();
        ordered.forEach((m) => messageIdsRef.current.add(m.messageId));
        setMessages(ordered);
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /* ── Socket.IO real-time ───────────────────────────────────── */
  const handleNewMessage = useCallback(
    (message) => {
      // Only handle messages for this conversation
      if (message.chatId !== chatId) return;
      // Deduplicate: ignore if we already have this messageId (sent via REST)
      if (messageIdsRef.current.has(message.messageId)) return;

      messageIdsRef.current.add(message.messageId);
      setMessages((prev) => [...prev, message]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [chatId]
  );

  const handleUserTyping = useCallback(
    ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(true);
    },
    [currentUserId]
  );

  const handleUserStopTyping = useCallback(
    ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(false);
    },
    [currentUserId]
  );

  const { joinChat, leaveChat, emitTyping, emitStopTyping, socketRef } =
    useChatSocket({
      onNewMessage: handleNewMessage,
      onUserTyping: handleUserTyping,
      onUserStopTyping: handleUserStopTyping,
    });

  // Join this specific chat room when screen mounts
  useEffect(() => {
    if (!chatId) return;
    // Small delay to ensure socket is connected
    const timer = setTimeout(() => {
      joinChat(chatId);
    }, 500);
    return () => {
      clearTimeout(timer);
      leaveChat(chatId);
    };
  }, [chatId, joinChat, leaveChat]);

  /* ── Typing indicator ──────────────────────────────────────── */
  const handleTextChange = (text) => {
    setMessageText(text);

    if (text.trim()) {
      emitTyping(chatId);
      // Reset stop-typing timer on each keystroke
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(chatId);
      }, 1500);
    } else {
      emitStopTyping(chatId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  /* ── Send message ──────────────────────────────────────────── */
  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || !chatId || sending) return;

    setMessageText("");
    setSending(true);
    emitStopTyping(chatId);

    try {
      const socketConnected = socketRef.current?.connected;

      if (socketConnected) {
        // Send via Socket.IO — backend will broadcast 'newMessage' back to room
        // The message will arrive via handleNewMessage, but we also get an ack
        socketRef.current.emit(
          "sendMessage",
          { chatId, content: text },
          (ack) => {
            if (ack?.success && ack?.data) {
              const msg = ack.data;
              if (!messageIdsRef.current.has(msg.messageId)) {
                messageIdsRef.current.add(msg.messageId);
                setMessages((prev) => [...prev, msg]);
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            }
            setSending(false);
          }
        );
      } else {
        // Fallback to REST API when socket is not connected
        const res = await sendMessage(chatId, text);
        // Backend: { success, message, data: MessageResponse }
        const newMsg = res.data || res;
        if (newMsg?.messageId && !messageIdsRef.current.has(newMsg.messageId)) {
          messageIdsRef.current.add(newMsg.messageId);
          setMessages((prev) => [...prev, newMsg]);
        }
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        setSending(false);
      }
    } catch (error) {
      console.log("Error sending message:", error);
      setMessageText(text); // restore on failure
      setSending(false);
    }
  };

  /* ── Helpers ───────────────────────────────────────────────── */
  const formatTime = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const otherName = otherUser?.fullName || otherUser?.email || "Chat";
  const otherAvatar = otherUser?.avatarUrl;

  /* ── Message Bubble ────────────────────────────────────────── */
  const MessageBubble = ({ message }) => {
    const isMe =
      message.senderId === currentUserId ||
      message.sender === currentUserId;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
          marginBottom: 12,
          marginHorizontal: 16,
          justifyContent: isMe ? "flex-end" : "flex-start",
        }}
      >
        {!isMe && (
          <View>
            {otherAvatar ? (
              <Image
                source={{ uri: otherAvatar }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "#e5e7eb",
                }}
              />
            ) : (
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "#389cfa",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
                  {getInitials(otherName)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ maxWidth: "75%", gap: 4 }}>
          {/* Image message */}
          {message.imageUrl && (
            <View
              style={{
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: isMe ? "#389cfa" : "#e5e7eb",
              }}
            >
              <Image
                source={{ uri: message.imageUrl }}
                style={{
                  width: 200,
                  height: 150,
                  resizeMode: "cover",
                }}
              />
            </View>
          )}
          {/* Text message */}
          {message.content ? (
            <View
              style={{
                backgroundColor: isMe ? "#389cfa" : "#fff",
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
                borderBottomRightRadius: isMe ? 4 : 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isMe ? "#fff" : "#111827",
                  lineHeight: 20,
                }}
              >
                {message.content}
              </Text>
            </View>
          ) : null}
          <Text
            style={{
              fontSize: 10,
              color: "#9ca3af",
              paddingHorizontal: 4,
              textAlign: isMe ? "right" : "left",
            }}
          >
            {formatTime(message.sentAt || message.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  /* ── Typing Indicator Bubble ───────────────────────────────── */
  const TypingIndicator = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 12,
        marginHorizontal: 16,
      }}
    >
      {otherAvatar ? (
        <Image
          source={{ uri: otherAvatar }}
          style={{ width: 30, height: 30, borderRadius: 15 }}
        />
      ) : (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "#389cfa",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
            {getInitials(otherName)}
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          flexDirection: "row",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#9ca3af",
            }}
          />
        ))}
      </View>
    </View>
  );

  /* ── Render ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f5f7f8",
          justifyContent: "center",
          alignItems: "center",
        }}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#389cfa" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7f8" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            gap: 12,
          }}
        >
          <Pressable onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
          </Pressable>

          {/* Avatar */}
          {otherAvatar ? (
            <Image
              source={{ uri: otherAvatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#e5e7eb",
              }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#389cfa",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
                {getInitials(otherName)}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}
              numberOfLines={1}
            >
              {otherName}
            </Text>
            {isTyping && (
              <Text style={{ fontSize: 12, color: "#389cfa" }}>
                Đang nhập...
              </Text>
            )}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            item.messageId || item.id?.toString() || index.toString()
          }
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          scrollEnabled={true}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          ListEmptyComponent={
            <View
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
              <MaterialCommunityIcons
                name="chat-outline"
                size={48}
                color="#d1d5db"
              />
              <Text
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  marginTop: 8,
                }}
              >
                Start a conversation
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
        />

        {/* Input area */}
        <View
          style={{
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              borderRadius: 22,
              paddingHorizontal: 16,
              minHeight: 44,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 15,
                color: "#111827",
                paddingVertical: 10,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={messageText}
              onChangeText={handleTextChange}
              multiline
              maxLength={1000}
            />
          </View>

          {/* Send Button */}
          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor:
                !messageText.trim() || sending ? "#d1d5db" : "#389cfa",
              justifyContent: "center",
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Conversation;
