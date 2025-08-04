"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Phone } from "lucide-react";

interface PhoneVerificationProps {
  phoneNumber: string;
  otp: string;
  isOtpSent: boolean;
  isLoading: boolean;
  onPhoneNumberChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onBackToPhone: () => void;
}

export default function PhoneVerification({
  phoneNumber,
  otp,
  isOtpSent,
  isLoading,
  onPhoneNumberChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onBackToPhone,
}: PhoneVerificationProps) {
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
              {!isOtpSent ? (
                <>
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
                </>
              ) : (
                <>
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
                  <Button
                    variant="outline"
                    onClick={onBackToPhone}
                    className="w-full border-stone-300 text-stone-700"
                  >
                    Change Phone Number
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 