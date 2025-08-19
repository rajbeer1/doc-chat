export interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: Date;
  isAIResponse?: boolean;
}

export interface ChatState {
  isAuthenticated: boolean;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  phoneNumber: string;
  otp: string;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  doctorType: "pregnancy_coach" | "health_coach";
  chatCount: number;
  maxChats: number;
  requiresPhone: boolean;
}

export class ChatService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://docchat.scorebadhao.com/api/chat";
    this.token = null;
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
    const response = await this.request(`/${doctorType}`);
    return await response.json();
  }

  getToken() {
    if (typeof window !== "undefined" && !this.token) {
      this.token = localStorage.getItem("jwt_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
    }
  }
}
