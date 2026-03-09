import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { authStorage } from '../services/authStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API || 'http://192.168.2.6:3443';

// ---- SINGLETON SOCKET INSTANCE ----
// Giữ một instance socket duy nhất cho toàn bộ App
// Giúp tránh việc tự động tạo trùng lặp nhiều kết nối từ các screen khác nhau
let globalSocket = null;
let connectionPromise = null;

const getSocket = async () => {
    if (globalSocket) return globalSocket;
    if (connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        const token = await authStorage.getToken();
        if (!token) {
            connectionPromise = null;
            return null;
        }

        globalSocket = io(`${BASE_URL}/chat`, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
        });

        globalSocket.on('connected', (data) => {
            console.log('[Socket] Connected:', data.userId);
        });

        globalSocket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
        });

        globalSocket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            // Nếu server ngắt kết nối có chủ đích (vd: token không hợp lệ / nodemon server reset)
            // client sẽ không tự reconnect trừ khi gọi thủ công lại
            if (reason === 'io server disconnect') {
                globalSocket.connect();
            }
        });

        return globalSocket;
    })();

    return connectionPromise;
};

export const useChatSocket = ({
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
    onConnected,
} = {}) => {
    const socketRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const initSocket = async () => {
            const socket = await getSocket();
            if (!socket || !isMounted) return;

            socketRef.current = socket;

            // Đăng ký các listeners
            if (onConnected) socket.on('connected', onConnected);
            if (onNewMessage) socket.on('newMessage', onNewMessage);
            if (onUserTyping) socket.on('userTyping', onUserTyping);
            if (onUserStopTyping) socket.on('userStopTyping', onUserStopTyping);
        };

        initSocket();

        return () => {
            isMounted = false;
            const socket = socketRef.current;
            if (socket) {
                // Hủy đăng ký các listeners khi hook bị unmount
                if (onConnected) socket.off('connected', onConnected);
                if (onNewMessage) socket.off('newMessage', onNewMessage);
                if (onUserTyping) socket.off('userTyping', onUserTyping);
                if (onUserStopTyping) socket.off('userStopTyping', onUserStopTyping);
            }
        };
    }, [onConnected, onNewMessage, onUserTyping, onUserStopTyping]);

    const joinChat = useCallback((chatId) => {
        socketRef.current?.emit('joinChat', { chatId });
    }, []);

    const leaveChat = useCallback((chatId) => {
        socketRef.current?.emit('leaveChat', { chatId });
    }, []);

    const sendSocketMessage = useCallback((chatId, content, imageUrl) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current?.connected) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketRef.current.emit(
                'sendMessage',
                { chatId, content, imageUrl },
                (ack) => {
                    if (ack?.success) resolve(ack.data);
                    else reject(new Error('Send failed'));
                },
            );
        });
    }, []);

    const emitTyping = useCallback((chatId) => {
        socketRef.current?.emit('typing', { chatId });
    }, []);

    const emitStopTyping = useCallback((chatId) => {
        socketRef.current?.emit('stopTyping', { chatId });
    }, []);

    const isConnected = useCallback(() => {
        return socketRef.current?.connected ?? false;
    }, []);

    return {
        joinChat,
        leaveChat,
        sendSocketMessage,
        emitTyping,
        emitStopTyping,
        isConnected,
        socketRef,
    };
};
