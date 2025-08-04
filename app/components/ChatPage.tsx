"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import PhoneVerificationModal from "./PhoneVerificationModal";
import { useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: Date;
  isAIResponse?: boolean;
}

interface ChatPageProps {
  messages: Message[];
  newMessage: string;
  doctorType: "gynecologist" | "general_practitioner";
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  hasToken: boolean;
  // Phone verification props
  requiresPhone: boolean;
  phoneNumber: string;
  otp: string;
  isOtpSent: boolean;
  isOtpLoading: boolean;
  onPhoneNumberChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onBackToPhone: () => void;
  onClosePhoneModal: () => void;
  // Chat props
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onDoctorTypeChange: (type: "gynecologist" | "general_practitioner") => void;
  onResetChat: () => void;
  onReloadChats: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onLoadInitialChat?: () => void;
}

export default function ChatPage({
  messages,
  newMessage,
  doctorType,
  isLoading,
  isStreaming,
  streamingMessage,
  hasToken,
  requiresPhone,
  phoneNumber,
  otp,
  isOtpSent,
  isOtpLoading,
  onPhoneNumberChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onBackToPhone,
  onClosePhoneModal,
  onNewMessageChange,
  onSendMessage,
  onDoctorTypeChange,
  onResetChat,
  onReloadChats,
  onKeyPress,
  messagesEndRef,
  onLoadInitialChat,
}: ChatPageProps) {
  useEffect(() => {
    if (messages.length === 0 && !hasToken && onLoadInitialChat) {
      console.log("onLoadInitialChat");
      onLoadInitialChat();
    }
  }, [messages.length, hasToken]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative">
      {/* Chat Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetChat}
              className="text-stone-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={doctorType}
                  onChange={(e) =>
                    onDoctorTypeChange(
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
              {hasToken && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReloadChats}
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
          {messages.map((message) => (
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
          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-900">
                <p className="text-sm sm:text-base">
                  {streamingMessage || "Typing..."}
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
                onNewMessageChange(e.target.value)
              }
              onKeyPress={onKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-stone-600 hover:bg-stone-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      <PhoneVerificationModal
        isOpen={requiresPhone}
        phoneNumber={phoneNumber}
        otp={otp}
        isOtpSent={isOtpSent}
        isLoading={isOtpLoading}
        onPhoneNumberChange={onPhoneNumberChange}
        onOtpChange={onOtpChange}
        onSendOtp={onSendOtp}
        onVerifyOtp={onVerifyOtp}
        onBackToPhone={onBackToPhone}
        onClose={onClosePhoneModal}
      />
    </div>
  );
}
