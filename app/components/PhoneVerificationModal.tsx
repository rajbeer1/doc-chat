"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, X } from "lucide-react";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  otp: string;
  isOtpSent: boolean;
  isLoading: boolean;
  onPhoneNumberChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onBackToPhone: () => void;
  onClose: () => void;
}

export default function PhoneVerificationModal({
  isOpen,
  phoneNumber,
  otp,
  isOtpSent,
  isLoading,
  onPhoneNumberChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onBackToPhone,
  onClose,
}: PhoneVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 transition-all duration-3000 ease-in-out ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`fixed inset-0 bg-opacity-30 backdrop-blur-[1px] transition-all duration-3000 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}></div>
      <div className={`bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto transform transition-all duration-3000 ease-in-out ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-stone-600" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Phone Verification Required
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <p className="text-sm text-stone-600 mb-4">
            You've reached the chat limit. Please verify your phone number to
            continue.
          </p>

          {!isOtpSent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onPhoneNumberChange(e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    onClick={onSendOtp}
                    disabled={isLoading}
                    className="bg-stone-600 hover:bg-stone-700"
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                You've reached the chat limit. Please verify your phone
                number to continue chatting.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  OTP Code
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onOtpChange(e.target.value)
                    }
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button
                    onClick={onVerifyOtp}
                    disabled={isLoading}
                    className="bg-stone-600 hover:bg-stone-700"
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 