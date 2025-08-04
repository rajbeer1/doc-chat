"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import FrontPage from "./components/FrontPage";
import ChatPage from "./components/ChatPage";

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: Date;
  isAIResponse?: boolean;
}

interface ChatState {
  isAuthenticated: boolean;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  phoneNumber: string;
  otp: string;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  doctorType: "gynecologist" | "general_practitioner";
  chatCount: number;
  maxChats: number;
  requiresPhone: boolean;
}
class ChatService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://docchat.scorebadhao.com/api/chat";
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("jwt_token");
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(errorData.message || "API request failed");
    }

    return response;
  }

  async sendMessage(message: string, doctorType: string) {
    const response = await this.request("/send", {
      method: "POST",
      body: JSON.stringify({ message, doctorType }),
    });

    const data = await response.text();

    let token = null;
    let aiResponse = data;

    if (data.startsWith("TOKEN:")) {
      const lines = data.split("\n");
      token = lines[0].replace("TOKEN:", "");
      aiResponse = lines.slice(1).join("\n");

      this.token = token;
      if (typeof window !== "undefined") {
        localStorage.setItem("jwt_token", token);
      }
    }

    return { token, aiResponse };
  }

  async sendOTP(phoneNumber: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/send-otp`, {
      method: "POST",
      headers,
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(errorData.message || "API request failed");
    }

    return await response.json();
  }

  async verifyOTP(phoneNumber: string, otp: string) {
    const response = await this.request("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otp }),
    });

    const data = await response.json();

    this.token = data.token;
    if (typeof window !== "undefined") {
      localStorage.setItem("jwt_token", data.token);
    }

    return data;
  }

  async getChats(doctorType: string) {
    const response = await this.request(`/${doctorType}`);
    return await response.json();
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
    }
  }
}

export default function Home() {
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
    doctorType: "general_practitioner",
    chatCount: 0,
    maxChats: 5,
    requiresPhone: false,
  });

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
    const token = chatService.current.getToken();
    if (token) {
      setChatState((prev) => ({ ...prev, isAuthenticated: true }));
      setTimeout(() => loadExistingChatsForType("general_practitioner"), 100);
    }
  }, []);

  const loadExistingChatsForType = async (doctorType: string) => {
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
    type: "gynecologist" | "general_practitioner"
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

  if (chatState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50">
        <ChatPage
          messages={chatState.messages}
          newMessage={newMessage}
          doctorType={chatState.doctorType}
          isLoading={chatState.isLoading}
          isStreaming={chatState.isStreaming}
          streamingMessage={chatState.streamingMessage}
          hasToken={!!chatService.current.getToken()}
          requiresPhone={chatState.requiresPhone}
          phoneNumber={chatState.phoneNumber}
          otp={chatState.otp}
          isOtpSent={chatState.isOtpSent}
          isOtpLoading={chatState.isLoading}
          onPhoneNumberChange={(value: string) =>
            setChatState((prev) => ({ ...prev, phoneNumber: value }))
          }
          onOtpChange={(value: string) =>
            setChatState((prev) => ({ ...prev, otp: value }))
          }
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
          onClosePhoneModal={() =>
            setChatState((prev) => ({ ...prev, requiresPhone: false }))
          }
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onDoctorTypeChange={handleDoctorTypeChange}
          onResetChat={resetChat}
          onReloadChats={loadExistingChats}
          onKeyPress={handleKeyPress}
          messagesEndRef={messagesEndRef}
          onLoadInitialChat={handleLoadInitialChat}
        />
      </div>
    );
  }

  if (!chatState.isAuthenticated) {
    return (
      <FrontPage
        doctorType={chatState.doctorType}
        onDoctorTypeChange={handleDoctorTypeChange}
        onStartChat={() =>
          setChatState((prev) => ({ ...prev, isAuthenticated: true }))
        }
      />
    );
  }

  return null;
}
