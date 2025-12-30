# API Contracts

## Overview
The application uses **TanStack Start** for server-side routing.
**Base URL:** `/api`

## Core Endpoints

### 1. AI Chat (`/api/chat`)
**File:** `src/routes/api/chat.ts`
**Method:** `POST`
**Type:** Server-Sent Events (SSE) Streaming
**Description:** Main endpoint for AI agent interaction. Supports streaming responses and tool execution contexts.
**Auth:** Requires API Key in request body.

**Request Schema:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant' | 'tool', content: string }>;
  providerId?: string; // e.g., 'openrouter'
  modelId?: string;
  apiKey?: string;
  disableTools?: boolean;
}
```

### 2. Flashcard Generation (`/api/flashcards/generate`)
**File:** `src/routes/api/flashcards/generate.ts`
**Method:** `POST`
**Description:** Generates study flashcards using AI.

### 3. Quiz Generation (`/api/quizzes/generate`)
**File:** `src/routes/api/quizzes/generate.ts`
**Method:** `POST`
**Description:** Generates interactive quizzes based on provided content.

## Error Handling
- **400 Bad Request:** specific validation errors (Zod).
- **401 Unauthorized:** Missing API key.
- **500 Internal Error:** AI provider failures or server errors.
