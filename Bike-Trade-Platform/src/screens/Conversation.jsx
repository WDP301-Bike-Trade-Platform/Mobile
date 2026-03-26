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
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getChatMessages, sendMessage } from "../services/api.chat";
import { createOffer, acceptOffer, rejectOffer, cancelOffer } from "../services/api.offers";
import { useAppContext } from "../provider/AppProvider";
import { useChatSocket } from "../hooks/useChatSocket";

const Conversation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, otherUser, listing } = route.params || {};

  const parsePrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    if (price.s !== undefined && price.e !== undefined && price.d) {
      const sign = price.s === 1 ? 1 : -1;
      const digits = price.d.join("");
      const exponent = price.e;
      const numStr = digits.substring(0, exponent + 1) + (digits.length > exponent + 1 ? "." + digits.substring(exponent + 1) : "");
      return sign * parseFloat(numStr);
    }
    return parseFloat(price) || 0;
  };

  const parsedListingPrice = parsePrice(listing?.price);

  const { user } = useAppContext();
  const currentUserId = user?.user_id || user?.userId || user?.id;

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // other user is typing

  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [processingOfferId, setProcessingOfferId] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set()); // deduplicate messages from socket + HTTP

  /* ── Fetch initial messages (HTTP) ────────────────────────── */
  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    try {
      const res = await getChatMessages(chatId);
      // Backend: { success, data: { total, items: MessageResponse[] } }
      const items = res.data?.items || res.data || [];
      if (Array.isArray(items)) {
        // Messages are desc order from backend. Keep it newest-first.
        const ordered = [...items];
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
      setMessages((prev) => [message, ...prev]);
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

  // Handle Offer Status Changes Real-time
  useEffect(() => {
    if (!socketRef.current) return;
    const handleOfferStatusChanged = (data) => {
      if (!data || !data.offerId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.offerId === data.offerId ? { ...m, offerStatus: data.status || data.offerStatus } : m
        )
      );
    };
    socketRef.current.on('offer_status_changed', handleOfferStatusChanged);
    return () => {
      socketRef.current?.off('offer_status_changed', handleOfferStatusChanged);
    };
  }, [socketRef]);

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
  const sendTextMessage = async (text) => {
    if (!text || !chatId) return;

    try {
      const socketConnected = socketRef.current?.connected;
      if (socketConnected) {
        socketRef.current.emit(
          "sendMessage",
          { chatId, content: text },
          (ack) => {
            if (ack?.success && ack?.data) {
              const msg = ack.data;
              if (!messageIdsRef.current.has(msg.messageId)) {
                messageIdsRef.current.add(msg.messageId);
                setMessages((prev) => [msg, ...prev]);
              }
            }
          }
        );
      } else {
        const res = await sendMessage(chatId, text);
        const newMsg = res.data || res;
        if (newMsg?.messageId && !messageIdsRef.current.has(newMsg.messageId)) {
          messageIdsRef.current.add(newMsg.messageId);
          setMessages((prev) => [newMsg, ...prev]);
        }
      }
    } catch (error) {
      console.log("Error sending text msg:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || !chatId || sending) return;

    setMessageText("");
    setSending(true);
    emitStopTyping(chatId);

    try {
      await sendTextMessage(text);
    } catch (error) {
      setMessageText(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  /* ── Offer logic ───────────────────────────────────────────── */
  const handleSubmitOffer = async () => {
    const numericPrice = Number(offerAmount.replace(/[^0-9]/g, ""));
    if (!numericPrice || numericPrice <= 0) return;
    if (!listing?.id) {
      Alert.alert("Error", "No listing found to place an offer on.");
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await createOffer(listing.id, numericPrice);
      // Backend now returns { success: true, data: fullOffer }
      const fullOfferData = res.data || res;
      const offerId = fullOfferData.offer_id;

      // Optimistic update
      const optimisticMessageId = `temp-${Date.now()}`;
      const optimisticMessage = {
        messageId: optimisticMessageId,
        chatId: chatId,
        senderId: currentUserId,
        type: "OFFER",
        offerId,
        offerStatus: "PENDING",
        offeredPrice: parsePrice(fullOfferData.offered_price) || numericPrice,
        listing: fullOfferData.listing || listing,
        content: "I want this price",
        imageUrl: null,
        sentAt: new Date().toISOString(),
      };

      setMessages((prev) => [optimisticMessage, ...prev]);

      if (socketRef.current?.connected) {
        socketRef.current.emit(
          "sendMessage",
          { chatId, type: "OFFER", offerId, content: "I want this price" },
          (ack) => {
            if (ack?.success && ack?.data) {
              const msg = ack.data;
              if (msg.messageId && !messageIdsRef.current.has(msg.messageId)) {
                messageIdsRef.current.add(msg.messageId);
                setMessages((prev) => 
                  prev.map(m => m.messageId === optimisticMessageId ? msg : m)
                );
              }
            }
          }
        );
      } else {
        // Fallback to REST API when socket is not connected
        const resMsg = await sendMessage(chatId, "I want this price", null, "OFFER", offerId);
        const newMsg = resMsg.data || resMsg;
        if (newMsg?.messageId && !messageIdsRef.current.has(newMsg.messageId)) {
          messageIdsRef.current.add(newMsg.messageId);
          // Replace optimistic message
          setMessages((prev) => 
            prev.map(m => m.messageId === optimisticMessageId ? newMsg : m)
          );
        }
      }
      setOfferModalVisible(false);
      setOfferAmount("");
    } catch (err) {
      console.log("Error sending offer:", err);
      Alert.alert("Error", "Could not send offer.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (processingOfferId) return;
    setProcessingOfferId(offerId);
    try {
      await acceptOffer(offerId);
      setMessages((prev) =>
        prev.map((m) => (m.offerId === offerId ? { ...m, offerStatus: "ACCEPTED" } : m))
      );
      await sendTextMessage("I have accepted your offer. Please proceed to checkout.");
    } catch (error) {
      console.log("Accept error", error);
      Alert.alert("Error", "Could not accept offer.");
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (processingOfferId) return;
    setProcessingOfferId(offerId);
    try {
      await rejectOffer(offerId);
      setMessages((prev) =>
        prev.map((m) => (m.offerId === offerId ? { ...m, offerStatus: "REJECTED" } : m))
      );
      await sendTextMessage("Sorry, I have rejected your offer.");
    } catch (error) {
      console.log("Reject error", error);
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleCancelOffer = async (offerId) => {
    if (processingOfferId) return;
    setProcessingOfferId(offerId);
    try {
      await cancelOffer(offerId);
      setMessages((prev) =>
        prev.map((m) => (m.offerId === offerId ? { ...m, offerStatus: "CANCELLED" } : m))
      );
    } catch (error) {
      console.log("Cancel error", error);
      Alert.alert("Error", "Could not cancel offer.");
    } finally {
      setProcessingOfferId(null);
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

    if (message.type === "OFFER") {
      const priceStr = (message.offeredPrice || 0).toLocaleString("vi-VN") + " ₫";
      return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12, marginHorizontal: 16, justifyContent: isMe ? "flex-end" : "flex-start" }}>
          {!isMe && (
             <View>
               {otherAvatar ? (
                 <Image source={{ uri: otherAvatar }} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#e5e7eb" }} />
               ) : (
                 <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#389cfa", justifyContent: "center", alignItems: "center" }}>
                   <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{getInitials(otherName)}</Text>
                 </View>
               )}
             </View>
          )}
          <View style={{ maxWidth: "75%", backgroundColor: isMe ? "#e8f4ff" : "#fff", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderBottomLeftRadius: isMe ? 16 : 4, borderBottomRightRadius: isMe ? 4 : 16, borderWidth: 1, borderColor: isMe ? "#bae6fd" : "#e5e7eb", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 }}>
             <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
               {isMe ? "You offered:" : "Offered price:"} {priceStr} 
             </Text>
             
             {/* Product Mini Info inside Bubble */}
             {(() => {
               const offerListing = message.listing || listing;
               if (!offerListing) return null;
                const title = message.listing?.title || offerListing.title || (message.listing?.vehicle 
                  ? `${message.listing.vehicle.brand} ${message.listing.vehicle.model}` 
                  : `${offerListing.brand} ${offerListing.model}`);
               const mediaList = message.listing?.media || [];
               const imageUrl = mediaList.length > 0 ? mediaList[0].file_url : (offerListing.images?.[0] || offerListing.image || 'https://placehold.co/100x100');
               return (
                 <View style={{ flexDirection: 'column', alignItems: 'center', backgroundColor: isMe ? '#ffffff80' : '#f3f4f6', padding: 8, borderRadius: 8, marginBottom: 4, gap: 8 }}>
                   <Image 
                     source={{ uri: imageUrl }} 
                     style={{ width: 100, height: 100, borderRadius: 6 }} 
                   />
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827', lineHeight: 16 }} numberOfLines={2}>
                       {title}
                     </Text>
                   </View>
                 </View>
               );
             })()}
             {isMe ? (
                <View style={{ marginTop: 8 }}>
                  {message.offerStatus === "PENDING" && (
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: "#d97706", fontSize: 13, marginBottom: 4 }}>Pending seller approval</Text>
                      <Pressable
                        style={{ backgroundColor: "#fee2e2", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, opacity: processingOfferId === message.offerId ? 0.6 : 1 }}
                        disabled={processingOfferId === message.offerId}
                        onPress={() => handleCancelOffer(message.offerId)}
                      >
                        {processingOfferId === message.offerId ? (
                          <ActivityIndicator size="small" color="#dc2626" />
                        ) : (
                          <Text style={{ color: "#dc2626", fontWeight: "600", fontSize: 12 }}>Cancel</Text>
                        )}
                      </Pressable>
                    </View>
                  )}
                 {message.offerStatus === "ACCEPTED" && (
                   <Pressable
                     style={{ backgroundColor: "#16a34a", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 6 }}
                     onPress={() => {
                       const offerListingId = message.listing?.listing_id || listing?.id || listing?.listing_id;
                       navigation.navigate("Checkout", {
                         listing: {
                           ...(listing || {}),
                           listing_id: offerListingId,
                           id: offerListingId,
                           title: listing?.title || (message.listing?.vehicle ? `${message.listing.vehicle.brand} ${message.listing.vehicle.model}` : ''),
                           price: message.offeredPrice || listing?.price || 0,
                         },
                         offerId: message.offerId,
                         totalAmount: message.offeredPrice || 0,
                       });
                     }}
                   >
                     <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 14 }}>
                        Checkout {priceStr}
                     </Text>
                   </Pressable>
                 )}
                 {(message.offerStatus === "REJECTED") && (
                   <Text style={{ color: "#ff0000ff", fontSize: 13, textAlign: "center" }}>Rejected</Text>
                 )}
                 {(message.offerStatus === "CANCELLED") && (
                   <Text style={{ color: "#ffdd00d7", fontSize: 13, textAlign: "center" }}>Cancelled</Text>
                 )}
                 {message.offerStatus === "DONE" && (
                   <Text style={{ color: "#16a34a", fontWeight: "bold", textAlign: "center", fontSize: 13 }}>Transaction successful</Text>
                 )}
               </View>
             ) : (
               <View style={{ marginTop: 8 }}>
                  {(!message.offerStatus || message.offerStatus === "PENDING") && (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable style={{ backgroundColor: "#389cfa", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flex: 1, opacity: processingOfferId === message.offerId ? 0.6 : 1 }} disabled={processingOfferId === message.offerId} onPress={() => handleAcceptOffer(message.offerId)}>
                        {processingOfferId === message.offerId ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 13 }}>Accept</Text>}
                      </Pressable>
                      <Pressable style={{ backgroundColor: "#f3f4f6", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flex: 1, opacity: processingOfferId === message.offerId ? 0.6 : 1 }} disabled={processingOfferId === message.offerId} onPress={() => handleRejectOffer(message.offerId)}>
                        {processingOfferId === message.offerId ? <ActivityIndicator size="small" color="#dc2626" /> : <Text style={{ color: "#dc2626", textAlign: "center", fontWeight: "600", fontSize: 13 }}>Reject</Text>}
                      </Pressable>
                    </View>
                  )}
                 {message.offerStatus === "ACCEPTED" && <Text style={{ color: "#16a34a", fontWeight: "bold", textAlign: "center", fontSize: 13 }}>Accepted</Text>}
                 {(message.offerStatus === "REJECTED" || message.offerStatus === "CANCELLED") && <Text style={{ color: "#ff0000ff", textAlign: "center", fontSize: 13 }}>Rejected</Text>}
                 {message.offerStatus === "DONE" && <Text style={{ color: "#16a34a", fontWeight: "bold", textAlign: "center", fontSize: 13 }}>Transaction successful</Text>}
               </View>
             )}
             <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 6, textAlign: isMe ? 'right' : 'left' }}>
               {formatTime(message.sentAt || message.created_at)}
             </Text>
          </View>
        </View>
      );
    }

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
                Typing...
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Product Mini Card */}
      {listing && (
        <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 10 }}>
          <Image source={{ uri: listing.images?.[0] || listing.image || 'https://placehold.co/100x100' }} style={{ width: 44, height: 44, borderRadius: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{listing.title || (listing.vehicle ? `${listing.vehicle.brand} ${listing.vehicle.model}` : `${listing.brand} ${listing.model}`)}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#389cfa', marginTop: 2 }}>
              {parsedListingPrice ? `${parsedListingPrice.toLocaleString("vi-VN")} ₫` : "Contact for price"}
            </Text>
          </View>
          <Pressable 
            onPress={() => setOfferModalVisible(true)}
            style={{ backgroundColor: '#e8f4ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#389cfa' }}
          >
            <Text style={{ color: '#389cfa', fontWeight: 'bold', fontSize: 13 }}>Offer</Text>
          </Pressable>
        </View>
      )}

      {/* Offer Modal */}
      <Modal visible={offerModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#111827" }}>Enter your desired price (₫)</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, fontSize: 18, marginBottom: 16 }}
                keyboardType="numeric"
                placeholder="Ex: 5000000"
                value={offerAmount}
                onChangeText={setOfferAmount}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable style={{ flex: 1, padding: 14, backgroundColor: "#f3f4f6", borderRadius: 12 }} onPress={() => setOfferModalVisible(false)}>
                  <Text style={{ textAlign: "center", fontWeight: "600", color: "#4b5563" }}>Cancel</Text>
                </Pressable>
                <Pressable style={{ flex: 1, padding: 14, backgroundColor: "#389cfa", borderRadius: 12 }} onPress={handleSubmitOffer} disabled={submittingOffer}>
                  {submittingOffer ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ textAlign: "center", fontWeight: "600", color: "#fff" }}>Send Offer</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
          inverted={true}
          ListHeaderComponent={isTyping ? <TypingIndicator /> : null}
          ListEmptyComponent={
            <View
              style={{ flex: 1, justifyContent: "center", alignItems: "center", transform: [{ scaleY: -1 }] }}
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
