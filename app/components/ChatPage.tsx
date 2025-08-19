"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Stethoscope, Heart, User } from "lucide-react";
import PhoneVerificationModal from "./PhoneVerificationModal";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  isFetchingChats?: boolean;
}

// Type for VisualViewport API
interface VisualViewport extends EventTarget {
  height: number;
  width: number;
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
  onClosePhoneModal,
  onNewMessageChange,
  onSendMessage,
  onDoctorTypeChange,
  onReloadChats,
  onKeyPress,
  messagesEndRef,
  onLoadInitialChat,
  isFetchingChats = false,
}: ChatPageProps) {
  const router = useRouter();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Color scheme based on doctor type
  const isGyno = doctorType === "gynecologist";
  const primaryColor = isGyno ? "bg-emerald-600" : "bg-blue-600";
  const primaryHoverColor = isGyno ? "hover:bg-emerald-700" : "hover:bg-blue-700";
  const primaryTextColor = isGyno ? "text-emerald-600" : "text-blue-600";
  const primaryBorderColor = isGyno ? "border-emerald-200" : "border-blue-200";
  const primaryBgColor = isGyno ? "bg-emerald-50" : "bg-blue-50";
  const doctorIcon = isGyno ? Heart : Stethoscope;
  const doctorTitle = isGyno ? "Gynecologist" : "General Practitioner";
  const doctorImage = isGyno ? "/gyno.png" : "/general.png";

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length === 0 && !hasToken && onLoadInitialChat) {
      console.log("onLoadInitialChat");
      onLoadInitialChat();
    }
  }, [messages.length, hasToken, onLoadInitialChat]);

  // Detect keyboard open/close on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const visualViewport = (window as { visualViewport?: VisualViewport }).visualViewport;
      if (visualViewport) {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        setIsKeyboardOpen(keyboardHeight > 150); // Consider keyboard open if height difference > 150px
      } else {
        // Fallback for browsers without visualViewport
        const heightDiff = window.innerHeight - window.outerHeight;
        setIsKeyboardOpen(heightDiff > 150);
      }
    };

    const handleFocus = () => {
      // Add a small delay to let the keyboard animation complete
      setTimeout(() => {
        handleResize();
      }, 300);
    };

    const handleBlur = () => {
      setIsKeyboardOpen(false);
    };

    // Listen for viewport changes
    const visualViewport = (window as { visualViewport?: VisualViewport }).visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Listen for input focus/blur
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach((input: Element) => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      
      inputs.forEach((input: Element) => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);

  useEffect(() => {
    if (isKeyboardOpen || messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isKeyboardOpen, messages.length, scrollToBottom]);

  const DoctorIcon = doctorIcon;

  return (
    <div className={`chat-container h-screen ${primaryBgColor} flex flex-col relative ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
      {/* Chat Header - Fixed at top */}
      <div className={`bg-white border-b ${primaryBorderColor} px-4 py-3 flex-shrink-0 shadow-sm`}>
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <DoctorIcon className={`w-4 h-4 ${primaryTextColor}`} />
                  <select
                    value={doctorType}
                    onChange={(e) => {
                      const newType = e.target.value as "gynecologist" | "general_practitioner";
                      onDoctorTypeChange(newType);
                      if (newType === "gynecologist") {
                        router.push("/chat/gyno");
                      } else {
                        router.push("/chat/general");
                      }
                    }}
                    disabled={isFetchingChats}
                    className={`text-sm font-medium ${primaryTextColor} bg-transparent border-none focus:ring-0 focus:outline-none ${
                      isFetchingChats ? "opacity-50" : ""
                    }`}
                  >
                    <option value="general_practitioner">
                      General Practitioner
                    </option>
                    <option value="gynecologist">Gynecologist</option>
                  </select>
                </div>
              </div>
              {hasToken && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReloadChats}
                  disabled={isFetchingChats}
                  className={`${primaryTextColor} hover:bg-gray-100`}
                  title="Reload chats"
                >
                  {isFetchingChats ? (
                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${primaryTextColor}`}></div>
                  ) : (
                    "↻"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {messages.length === 0 && !isFetchingChats && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className={`w-16 h-16 ${primaryColor} rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden`}>
              <Image
                src={doctorImage}
                alt={doctorTitle}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Chat with {doctorTitle}
            </h2>
            <p className="text-gray-600 text-sm">
              Start a conversation with our AI {doctorTitle.toLowerCase()}. You can chat anonymously for up to 5 messages.
            </p>
          </div>
        </div>
      )}

      {/* Messages - Scrollable area that takes remaining space */}
      <div className="chat-messages flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto space-y-4">
          {isFetchingChats && messages.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${primaryTextColor}`}></div>
                <span className="text-sm">Loading chat history...</span>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "doctor" && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border-2 border-white shadow-sm">
                  <Image
                    src={doctorImage}
                    alt={doctorTitle}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-[75%] sm:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === "user"
                    ? `${primaryColor} text-white`
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm sm:text-base break-words leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === "user"
                      ? "text-white/70"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming Message */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border-2 border-white shadow-sm">
                <Image
                  src={doctorImage}
                  alt={doctorTitle}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="max-w-[75%] sm:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 shadow-sm">
                <p className="text-sm sm:text-base break-words leading-relaxed">
                  {streamingMessage || "Typing..."}
                </p>
                <div className="flex space-x-1 mt-2">
                  <div className={`w-2 h-2 ${primaryColor} rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${primaryColor} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                  <div className={`w-2 h-2 ${primaryColor} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="chat-input bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0 shadow-lg">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder={isFetchingChats ? "Loading chat history..." : "Type your message..."}
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onNewMessageChange(e.target.value)
              }
              onKeyPress={onKeyPress}
              disabled={isLoading || isFetchingChats}
              className="flex-1 rounded-full border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
            <Button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isLoading || isFetchingChats}
              className={`${primaryColor} ${primaryHoverColor} rounded-full p-3 flex-shrink-0 shadow-sm`}
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
        onClose={onClosePhoneModal}
      />
    </div>
  );
}
