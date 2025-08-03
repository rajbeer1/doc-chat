# Doctor Chat Frontend Integration Guide

## Overview
This document provides comprehensive integration guidelines for the Doctor Chat application frontend. The system uses OTP-based authentication and real-time chat functionality with streaming responses.

## Table of Contents
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Response Formats](#response-formats)
- [Token Management](#token-management)
- [Chat Management](#chat-management)
- [Error Handling](#error-handling)
- [State Management](#state-management)

## Authentication Flow

### 1. Phone Number Input
**Purpose**: User enters phone number to initiate OTP verification

**UI State**: `isOtpSent: false`
```typescript
interface AuthState {
  phoneNumber: string;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  isLoading: boolean;
}
```

### 2. Send OTP
**API Endpoint**: `POST /api/auth/send-otp`

**Request Format**:
```typescript
{
  phoneNumber: string; // Format: +91XXXXXXXXXX
}
```

**Response Format**:
```typescript
{
  success: boolean;
  message: string;
  data?: {
    sessionId: string; // Temporary session for OTP verification
    expiresAt: string; // ISO timestamp
  };
  error?: string;
}
```

**UI State Transition**: `isOtpSent: true`

### 3. OTP Verification
**API Endpoint**: `POST /api/auth/verify-otp`

**Request Format**:
```typescript
{
  phoneNumber: string;
  otp: string; // 6-digit code
  sessionId: string; // From send-otp response
}
```

**Response Format**:
```typescript
{
  success: boolean;
  message: string;
  data?: {
    accessToken: string; // JWT token for API calls
    refreshToken: string; // For token refresh
    user: {
      id: string;
      phoneNumber: string;
      name?: string;
      isNewUser: boolean;
    };
    expiresAt: string; // Token expiration
  };
  error?: string;
}
```

**UI State Transition**: `isOtpVerified: true`

## Token Management

### Token Storage
Store tokens securely in localStorage or secure storage:

```typescript
// Store tokens
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
localStorage.setItem('user', JSON.stringify(response.data.user));

// Get tokens
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');
```

### Token Refresh
**API Endpoint**: `POST /api/auth/refresh`

**Request Format**:
```typescript
{
  refreshToken: string;
}
```

**Response Format**:
```typescript
{
  success: boolean;
  data?: {
    accessToken: string;
    expiresAt: string;
  };
  error?: string;
}
```

### Token Validation
```typescript
const isTokenValid = (token: string) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

## Chat Management

### 1. Get Chat History
**API Endpoint**: `GET /api/chats`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response Format**:
```typescript
{
  success: boolean;
  data: {
    chats: Array<{
      id: string;
      doctorId: string;
      doctorName: string;
      doctorSpecialty: string;
      lastMessage: string;
      lastMessageTime: string;
      unreadCount: number;
      isActive: boolean;
    }>;
    totalCount: number;
  };
  error?: string;
}
```

### 2. Get Chat Messages
**API Endpoint**: `GET /api/chats/{chatId}/messages`

**Query Parameters**:
```
?page=1&limit=50&before=timestamp
```

**Response Format**:
```typescript
{
  success: boolean;
  data: {
    messages: Array<{
      id: string;
      text: string;
      sender: 'user' | 'doctor';
      timestamp: string;
      isRead: boolean;
      attachments?: Array<{
        type: 'image' | 'document';
        url: string;
        name: string;
      }>;
    }>;
    hasMore: boolean;
    totalCount: number;
  };
  error?: string;
}
```

### 3. Send Message
**API Endpoint**: `POST /api/chats/{chatId}/messages`

**Request Format**:
```typescript
{
  text: string;
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
}
```

**Response Format**:
```typescript
{
  success: boolean;
  data: {
    message: {
      id: string;
      text: string;
      sender: 'user';
      timestamp: string;
      isRead: boolean;
    };
  };
  error?: string;
}
```

### 4. Streaming Chat Response
**API Endpoint**: `POST /api/chats/{chatId}/stream`

**Request Format**:
```typescript
{
  message: string;
  context?: {
    previousMessages: Array<{
      text: string;
      sender: 'user' | 'doctor';
    }>;
  };
}
```

**Streaming Response Format**:
```typescript
// Server-Sent Events (SSE) format
data: {
  "type": "chunk",
  "content": "हम आपकी कैसे मदद कर सकते हैं?",
  "isComplete": false
}

data: {
  "type": "chunk", 
  "content": " आप बेहतर महसूस करेंगे।",
  "isComplete": false
}

data: {
  "type": "complete",
  "messageId": "msg_123",
  "fullText": "हम आपकी कैसे मदद कर सकते हैं? आप बेहतर महसूस करेंगे।",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## State Management

### Chat State Interface
```typescript
interface ChatState {
  // Authentication
  isAuthenticated: boolean;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  phoneNumber: string;
  otp: string;
  isLoading: boolean;
  
  // User
  user: {
    id: string;
    phoneNumber: string;
    name?: string;
  } | null;
  
  // Chat
  currentChatId: string | null;
  messages: Message[];
  chats: Chat[];
  
  // Streaming
  isStreaming: boolean;
  streamingMessage: string;
}
```

### Message Interface
```typescript
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
  isRead: boolean;
  attachments?: Attachment[];
}
```

## Error Handling

### Error Response Format
```typescript
{
  success: false;
  error: {
    code: string; // e.g., 'INVALID_OTP', 'TOKEN_EXPIRED'
    message: string;
    details?: any;
  };
}
```

### Common Error Codes
- `INVALID_PHONE`: Invalid phone number format
- `OTP_EXPIRED`: OTP has expired
- `INVALID_OTP`: Wrong OTP entered
- `TOKEN_EXPIRED`: Access token expired
- `UNAUTHORIZED`: Invalid or missing token
- `RATE_LIMITED`: Too many requests
- `CHAT_NOT_FOUND`: Chat doesn't exist
- `DOCTOR_OFFLINE`: Doctor is currently offline

### Error Handling Implementation
```typescript
const handleApiError = (error: any) => {
  if (error.code === 'TOKEN_EXPIRED') {
    // Attempt token refresh
    refreshToken();
  } else if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
    resetAuthState();
  } else {
    // Show user-friendly error message
    showError(error.message);
  }
};
```

## API Integration Example

### Complete Flow Implementation
```typescript
class ChatAPI {
  private baseURL = '/api';
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  }

  async sendOtp(phoneNumber: string) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOtp(phoneNumber: string, otp: string, sessionId: string) {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp, sessionId }),
    });

    // Store tokens
    if (response.data?.accessToken) {
      this.accessToken = response.data.accessToken;
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async sendMessage(chatId: string, text: string) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async streamChat(chatId: string, message: string, onChunk: (chunk: string) => void) {
    const response = await fetch(`${this.baseURL}/chats/${chatId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              onChunk(data.content);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  }
}
```

## Security Considerations

### Token Security
- Store tokens in secure storage (localStorage for web, secure storage for mobile)
- Implement automatic token refresh
- Clear tokens on logout
- Validate token expiration

### Data Validation
- Validate phone number format
- Sanitize user input
- Implement rate limiting on client side
- Handle sensitive data appropriately

### Error Handling
- Don't expose sensitive information in error messages
- Implement proper logging
- Handle network errors gracefully
- Provide user-friendly error messages

## Testing Guidelines

### Unit Tests
- Test authentication flow
- Test token management
- Test message sending/receiving
- Test error handling

### Integration Tests
- Test complete chat flow
- Test streaming functionality
- Test offline/online scenarios
- Test token refresh flow

### E2E Tests
- Test complete user journey
- Test cross-device compatibility
- Test performance under load
- Test accessibility

## Performance Optimization

### Message Loading
- Implement pagination for chat history
- Use virtual scrolling for large message lists
- Cache frequently accessed data
- Optimize image loading

### Streaming
- Implement proper cleanup for streaming connections
- Handle connection interruptions
- Provide fallback for non-streaming scenarios
- Optimize chunk processing

This integration guide provides all necessary information for implementing the Doctor Chat frontend with proper authentication, chat management, and streaming functionality.
