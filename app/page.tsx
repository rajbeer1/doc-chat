"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Phone, MessageCircle, ArrowLeft, User } from "lucide-react";

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
  private baseURL = "http://localhost:3001/api/chat";
  private token: string | null = null;

  constructor() {
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
    if (!this.token) {
      throw new Error("Token required");
    }

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
      const chats = await chatService.current.getChats(doctorType);

      if (chats && chats.length > 0) {
        const latestChat = chats[0];

        const convertedMessages: Message[] = latestChat.messages.map(
          (msg: any) => ({
            id: msg._id,
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
    } catch (error: any) {
      setChatState((prev) => ({ ...prev, isLoading: false }));
      alert(error.message || "Failed to send OTP. Please try again.");
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
    } catch (error: any) {
      setChatState((prev) => ({ ...prev, isLoading: false }));
      alert(error.message || "Invalid OTP. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
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
        id: (Date.now() + 1).toString(),
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
    } catch (error: any) {
      if (error.message.includes("Phone verification required")) {
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
        alert(error.message || "Failed to send message. Please try again.");
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

  if (chatState.requiresPhone) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-md mx-auto">
          <div className="text-center mb-8 pt-4 sm:pt-8">
            <div className="w-16 h-16 bg-stone-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Phone className="w-8 h-8 text-stone-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              Phone Verification Required
            </h1>
            <p className="text-sm sm:text-base text-stone-600">
              You've reached the chat limit. Please verify your phone number to
              continue.
            </p>
          </div>

          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {!chatState.isOtpSent ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          value={chatState.phoneNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setChatState((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendOtp}
                          disabled={chatState.isLoading}
                          className="bg-stone-600 hover:bg-stone-700"
                        >
                          {chatState.isLoading ? "Sending..." : "Send OTP"}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500">
                      You've reached the chat limit. Please verify your phone
                      number to continue chatting.
                    </p>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        OTP Code
                      </label>
                      <p className="text-xs text-stone-500 mb-3">
                        Enter the 6-digit code sent to {chatState.phoneNumber}
                      </p>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={chatState.otp}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setChatState((prev) => ({
                              ...prev,
                              otp: e.target.value,
                            }))
                          }
                          maxLength={6}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleVerifyOtp}
                          disabled={chatState.isLoading}
                          className="bg-stone-600 hover:bg-stone-700"
                        >
                          {chatState.isLoading ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!chatState.isOtpSent && !chatState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-md mx-auto">
          <div className="text-center mb-8 pt-4 sm:pt-8">
            <div className="w-16 h-16 bg-stone-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-stone-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              Doctor Chat
            </h1>
            <p className="text-sm sm:text-base text-stone-600">
              Start a conversation with our AI doctors
            </p>
          </div>

          <Card className="border-stone-200 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Select Doctor Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={
                        chatState.doctorType === "gynecologist"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleDoctorTypeChange("gynecologist")}
                      className={
                        chatState.doctorType === "gynecologist"
                          ? "bg-stone-600 hover:bg-stone-700"
                          : "border-stone-300"
                      }
                    >
                      Gynecologist
                    </Button>
                    <Button
                      variant={
                        chatState.doctorType === "general_practitioner"
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleDoctorTypeChange("general_practitioner")
                      }
                      className={
                        chatState.doctorType === "general_practitioner"
                          ? "bg-stone-600 hover:bg-stone-700"
                          : "border-stone-300"
                      }
                    >
                      General Practitioner
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={() =>
                      setChatState((prev) => ({
                        ...prev,
                        isAuthenticated: true,
                      }))
                    }
                    className="bg-stone-600 hover:bg-stone-700 w-full"
                  >
                    Start Chatting (Anonymous)
                  </Button>
                </div>
                <p className="text-xs text-stone-500 text-center">
                  You can chat anonymously for up to 5 messages. Phone
                  verification will be required after that.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="text-stone-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={chatState.doctorType}
                  onChange={(e) =>
                    handleDoctorTypeChange(
                      e.target.value as "gynecologist" | "general_practitioner"
                    )
                  }
                  className="text-sm border border-stone-300 rounded px-2 py-1 bg-white"
                >
                  <option value="general_practitioner">
                    General Practitioner
                  </option>
                  <option value="gynecologist">Gynecologist</option>
                </select>
              </div>
              {chatService.current.getToken() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadExistingChats}
                  className="text-stone-600"
                  title="Reload chats"
                >
                  ↻
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto space-y-4">
          {chatState.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-stone-600 text-white"
                    : "bg-white border border-stone-200 text-stone-900"
                }`}
              >
                <p className="text-sm sm:text-base">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-stone-200"
                      : "text-stone-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {chatState.isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-900">
                <p className="text-sm sm:text-base">
                  {chatState.streamingMessage || "Typing..."}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-stone-200 px-4 py-3">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewMessage(e.target.value)
              }
              onKeyPress={handleKeyPress}
              disabled={chatState.isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || chatState.isLoading}
              className="bg-stone-600 hover:bg-stone-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
