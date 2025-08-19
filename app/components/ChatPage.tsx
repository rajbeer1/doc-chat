"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import PhoneVerificationModal from "./PhoneVerificationModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  onResetChat,
  onReloadChats,
  onKeyPress,
  messagesEndRef,
  onLoadInitialChat,
  isFetchingChats = false,
}: ChatPageProps) {
  const router = useRouter();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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
      const visualViewport = (window as any).visualViewport;
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
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Listen for input focus/blur
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });

    return () => {
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when keyboard opens or new messages arrive
  useEffect(() => {
    if (isKeyboardOpen || messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isKeyboardOpen, messages.length]);

  return (
    <div className={`chat-container h-screen bg-stone-50 flex flex-col relative ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
      {/* Chat Header - Fixed at top */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-stone-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={doctorType}
                  onChange={(e) => {
                    const newType = e.target.value as "gynecologist" | "general_practitioner";
                    if (newType === "gynecologist") {
                      router.push("/chat/gyno");
                    } else {
                      router.push("/chat/general");
                    }
                  }}
                  disabled={isFetchingChats}
                  className={`text-sm border border-stone-300 rounded px-2 py-1 ${
                    isFetchingChats ? "bg-stone-100 text-stone-500" : "bg-white"
                  }`}
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
                  disabled={isFetchingChats}
                  className="text-stone-600"
                  title="Reload chats"
                >
                  {isFetchingChats ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div>
                  ) : (
                    "↻"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable area that takes remaining space */}
      <div className="chat-messages flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto space-y-4">
          {isFetchingChats && messages.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center space-x-2 text-stone-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div>
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
              <div
                className={`max-w-[75%] sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-stone-600 text-white"
                    : "bg-white border border-stone-200 text-stone-900"
                }`}
              >
                <p className="text-sm sm:text-base break-words">{message.text}</p>
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
              <div className="max-w-[75%] sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-900">
                <p className="text-sm sm:text-base break-words">
                  {streamingMessage || "Typing..."}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="chat-input bg-white border-t border-stone-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder={isFetchingChats ? "Loading chat history..." : "Type your message..."}
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onNewMessageChange(e.target.value)
              }
              onKeyPress={onKeyPress}
              disabled={isLoading || isFetchingChats}
              className="flex-1"
            />
            <Button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isLoading || isFetchingChats}
              className="bg-stone-600 hover:bg-stone-700 flex-shrink-0"
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
