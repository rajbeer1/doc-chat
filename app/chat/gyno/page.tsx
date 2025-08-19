"use client";

import { useChat } from "@/lib/useChat";
import ChatPage from "../../components/ChatPage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GynoChatPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const {
    chatState,
    newMessage,
    isFetchingChats,
    messagesEndRef,
    chatService,
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
  } = useChat("gynecologist");

  useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <ChatPage
        messages={chatState.messages}
        newMessage={newMessage}
        doctorType={chatState.doctorType}
        isLoading={chatState.isLoading}
        isStreaming={chatState.isStreaming}
        streamingMessage={chatState.streamingMessage}
        hasToken={!!chatService.getToken()}
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
        isFetchingChats={isFetchingChats}
      />
    </div>
  );
}
