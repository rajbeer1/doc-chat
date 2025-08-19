"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [doctorType, setDoctorType] = useState<"gynecologist" | "general_practitioner">("general_practitioner");

  const handleStartChat = () => {
    if (doctorType === "gynecologist") {
      router.push("/chat/gyno");
    } else {
      router.push("/chat/general");
    }
  };

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
                      doctorType === "gynecologist" ? "default" : "outline"
                    }
                    onClick={() => setDoctorType("gynecologist")}
                    className={
                      doctorType === "gynecologist"
                        ? "bg-stone-600 hover:bg-stone-700"
                        : "border-stone-300"
                    }
                  >
                    Gynecologist
                  </Button>
                  <Button
                    variant={
                      doctorType === "general_practitioner"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setDoctorType("general_practitioner")}
                    className={
                      doctorType === "general_practitioner"
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
                  onClick={handleStartChat}
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
