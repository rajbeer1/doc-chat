"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatService, ChatState, Message } from "./chatService";

export function useChat(doctorType: "pregnancy_coach" | "health_coach") {
  const [chatState, setChatState] = useState<ChatState>({
    isAuthenticated: false,
    isOtpSent: false,
    isOtpVerified: false,
    phoneNumber: "",
    otp: "",
    messages: [],
    isLoading: false,
    isStreaming: false,
    streamingMessage: "",
    doctorType,
    chatCount: 0,
    maxChats: 5,
    requiresPhone: false,
  });

  const [isFetchingChats, setIsFetchingChats] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = useRef(new ChatService());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = chatService.current.getToken();
      if (token) {
        setChatState((prev) => ({ ...prev, isAuthenticated: true }));
        setTimeout(() => loadExistingChatsForType(doctorType), 100);
      }
    }
  }, [doctorType]);

  const loadExistingChatsForType = async (doctorType: string) => {
    setIsFetchingChats(true);
    try {
      console.log("doctorType", doctorType);
      const chats = await chatService.current.getChats(doctorType);
      console.log("chats", chats);

      if (chats && chats.length > 0) {
        const latestChat = chats[0];

        const convertedMessages: Message[] = latestChat.messages.map(
          (
            msg: {
              _id?: string;
              content: string;
              isAIResponse: boolean;
              createdAt: string;
            },
            index: number
          ) => ({
            id:
              msg._id ||
              `${msg.isAIResponse ? "doctor" : "user"}-${Date.now()}-${index}`,
            text: msg.content,
            sender: msg.isAIResponse ? "doctor" : "user",
            timestamp: new Date(msg.createdAt),
            isAIResponse: msg.isAIResponse,
          })
        );

        setChatState((prev) => ({
          ...prev,
          messages: convertedMessages,
          chatCount: chats.length,
        }));
      } else {
        setChatState((prev) => ({
          ...prev,
          messages: [],
          chatCount: 0,
        }));
      }
    } catch (error) {
      console.error("Error in loadExistingChatsForType:", error);
      setChatState((prev) => ({
        ...prev,
        messages: [],
        chatCount: 0,
      }));
    } finally {
      setIsFetchingChats(false);
    }
  };

  const loadExistingChats = async () => {
    await loadExistingChatsForType(chatState.doctorType);
  };

  const handleSendOtp = async () => {
    if (!chatState.phoneNumber || chatState.phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    setChatState((prev) => ({ ...prev, isLoading: true }));

    try {
      await chatService.current.sendOTP(chatState.phoneNumber);

      setChatState((prev) => ({
        ...prev,
        isOtpSent: true,
        isLoading: false,
      }));
    } catch (error: unknown) {
      setChatState((prev) => ({ ...prev, isLoading: false }));
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again.";
      alert(errorMessage);
    }
  };

  const handleVerifyOtp = async () => {
    if (!chatState.otp || chatState.otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setChatState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await chatService.current.verifyOTP(
        chatState.phoneNumber,
        chatState.otp
      );

      setChatState((prev) => ({
        ...prev,
        isOtpVerified: true,
        isLoading: false,
        chatCount: result.user.chatCount,
        maxChats: result.user.maxChats,
        requiresPhone: false,
        isOtpSent: false,
      }));
    } catch (error: unknown) {
      setChatState((prev) => ({ ...prev, isLoading: false }));
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Invalid OTP. Please try again.";
      alert(errorMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isStreaming: true,
      streamingMessage: "",
    }));

    setNewMessage("");

    try {
      const { aiResponse } = await chatService.current.sendMessage(
        userMessage.text,
        chatState.doctorType
      );

      const doctorResponse: Message = {
        id: `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: aiResponse,
        sender: "doctor",
        timestamp: new Date(),
        isAIResponse: true,
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, doctorResponse],
        isLoading: false,
        isStreaming: false,
        streamingMessage: "",
        chatCount: prev.chatCount + 1,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      if (errorMessage.includes("Phone verification required")) {
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.slice(0, -1),
          requiresPhone: true,
          isLoading: false,
          isStreaming: false,
        }));
      } else {
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.slice(0, -1),
          isLoading: false,
          isStreaming: false,
        }));
        alert(errorMessage);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setChatState((prev) => ({
      ...prev,
      isAuthenticated: false,
      isOtpSent: false,
      isOtpVerified: false,
      phoneNumber: "",
      otp: "",
      messages: [],
      isLoading: false,
      isStreaming: false,
      streamingMessage: "",
      requiresPhone: false,
    }));
  };

  const handleDoctorTypeChange = (
    type: "pregnancy_coach" | "health_coach"
  ) => {
    setChatState((prev) => {
      const newState = { ...prev, doctorType: type };

      if (chatService.current.getToken()) {
        setTimeout(() => loadExistingChatsForType(type), 100);
      }

      return newState;
    });
  };

  const handleLoadInitialChat = useCallback(() => {
    if (!chatService.current.getToken()) {
      loadExistingChatsForType(chatState.doctorType);
    }
  }, [chatState.doctorType]);

  return {
    chatState,
    newMessage,
    isFetchingChats,
    messagesEndRef,
    chatService: chatService.current,
    setNewMessage,
    handleSendOtp,
    handleVerifyOtp,
    handleSendMessage,
    handleKeyPress,
    resetChat,
    handleDoctorTypeChange,
    loadExistingChats,
    handleLoadInitialChat,
    setChatState,
  };
}
