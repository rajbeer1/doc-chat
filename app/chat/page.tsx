"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/chat/general");
  }, [router]);

  return null;
}
