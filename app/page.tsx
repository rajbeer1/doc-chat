"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Stethoscope, Heart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [doctorType, setDoctorType] = useState<
    "gynecologist" | "general_practitioner"
  >("general_practitioner");

  const handleStartChat = () => {
    if (doctorType === "gynecologist") {
      router.push("/chat/gyno");
    } else {
      router.push("/chat/general");
    }
  };

  const isGyno = doctorType === "gynecologist";
  const primaryColor = isGyno ? "bg-emerald-600" : "bg-blue-600";
  const primaryHoverColor = isGyno
    ? "hover:bg-emerald-700"
    : "hover:bg-blue-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 overflow-y-auto">
      <div className="max-w-sm sm:max-w-md mx-auto pb-8">
        <div className="text-center mb-6 sm:mb-8 pt-2 sm:pt-4 lg:pt-8">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Doctor Chat
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-1 sm:mb-2">
            AI-Powered Medical Consultation
          </p>
          <p className="text-sm text-gray-500">
            Get instant medical advice from our AI doctors
          </p>
        </div>

        <Card className="border-0 shadow-lg mb-4 sm:mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
                Choose Your Doctor
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div
                  className={`relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[80px] sm:min-h-[100px] flex items-center ${
                    doctorType === "general_practitioner"
                      ? "border-blue-300 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                  onClick={() => setDoctorType("general_practitioner")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDoctorType("general_practitioner");
                    }
                  }}
                  aria-label="Select General Practitioner"
                  aria-pressed={doctorType === "general_practitioner"}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        doctorType === "general_practitioner"
                          ? "bg-blue-600"
                          : "bg-gray-100"
                      }`}
                    >
                      <Stethoscope
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          doctorType === "general_practitioner"
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm sm:text-base ${
                          doctorType === "general_practitioner"
                            ? "text-blue-800"
                            : "text-gray-800"
                        }`}
                      >
                        General Practitioner
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        General health, symptoms, and medical advice
                      </p>
                    </div>
                    {doctorType === "general_practitioner" && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[80px] sm:min-h-[100px] flex items-center ${
                    doctorType === "gynecologist"
                      ? "border-emerald-300 bg-emerald-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                  onClick={() => setDoctorType("gynecologist")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDoctorType("gynecologist");
                    }
                  }}
                  aria-label="Select Gynecologist"
                  aria-pressed={doctorType === "gynecologist"}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        doctorType === "gynecologist"
                          ? "bg-emerald-600"
                          : "bg-gray-100"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          doctorType === "gynecologist"
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm sm:text-base ${
                          doctorType === "gynecologist"
                            ? "text-emerald-800"
                            : "text-gray-800"
                        }`}
                      >
                        Gynecologist
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Women's health, reproductive, and gynecological care
                      </p>
                    </div>
                    {doctorType === "gynecologist" && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={handleStartChat}
                  className={`${primaryColor} ${primaryHoverColor} w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[48px] sm:min-h-[56px]`}
                  aria-label={`Start chatting with ${
                    doctorType === "gynecologist"
                      ? "gynecologist"
                      : "general practitioner"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Chatting (Anonymous)
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4 leading-relaxed">
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
