# API Endpoints Documentation

This document describes all API endpoints provided by the Via-gent application.

## Overview

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/chat` | GET | Health check | Active |
| `/api/chat` | POST | AI chat with streaming | Active |
| `/api/quizzes/generate` | POST | Generate quiz from sources | Active |
| `/api/flashcards/generate` | POST | Generate flashcards from sources | Active |

---

## Chat API

### GET /api/chat

**Purpose:** Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "endpoint": "/api/chat"
}
```

**Status Code:** 200 OK

---

### POST /api/chat

**Purpose:** Streaming AI chat endpoint with tool support

**Content-Type:** application/json

#### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| Content-Type | Yes | Must be application/json |

#### Request Body

```typescript
{
  messages: Array<{
    role: "user" | "assistant" | "system" | "tool",
    content: string,
    tool_calls?: Array<{
      id: string,
      type: "function",
      function: {
        name: string,
        arguments: string
      }
    }>,
    tool_call_id?: string
  }>,
  apiKey: string,
  providerId?: string,
  modelId?: string,
  customBaseURL?: string,
  customHeaders?: Record<string, string>,
  disableTools?: boolean
}
```

#### Request Body Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| messages | Array | Yes | - | Chat message history |
| apiKey | string | Yes | - | LLM provider API key |
| providerId | string | No | "openrouter" | LLM provider identifier |
| modelId | string | No | "mistralai/devstral-2512:free" | Model to use |
| customBaseURL | string | No | - | Custom provider endpoint (OpenAI-compatible) |
| customHeaders | object | No | - | Custom HTTP headers for provider |
| disableTools | boolean | No | false | Disable tool calling |

#### Supported Providers

| Provider ID | Base URL | Default Headers |
|-------------|----------|-----------------|
| openrouter | https://openrouter.ai/api/v1 | HTTP-Referer, X-Title |
| openai | https://api.openai.com/v1 | - |
| anthropic | https://api.anthropic.com/v1 | - |

#### Tools Available

| Tool Name | Description |
|-----------|-------------|
| read_file | Read file contents from project |
| write_file | Create or update files |
| list_files | List directory contents |
| execute_command | Run shell commands |

#### Example Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "List files in the project"}],
    "apiKey": "sk-...",
    "providerId": "openrouter",
    "modelId": "anthropic/claude-sonnet-4-20250514"
  }'
```

#### Streaming Response

The endpoint returns Server-Sent Events (SSE) stream:

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1234567890,"model":"claude-sonnet-4-20250514","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1234567890,"model":"claude-sonnet-4-20250514","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}

data: [DONE]
```

#### Response Headers

| Header | Value |
|--------|-------|
| Content-Type | text/event-stream |
| Cache-Control | no-cache |
| Connection | keep-alive |

#### Error Responses

**401 Unauthorized:**
```json
{
  "error": "API key required. Configure API key in Agent Settings and ensure it is passed in request.",
  "code": "MISSING_API_KEY"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation error message",
  "details": { /* Zod validation errors */ }
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error message"
}
```

#### Models Without Tool Support

Some models don't support function calling. The API automatically detects and handles:

```typescript
const MODELS_WITHOUT_TOOL_SUPPORT = [
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'deepseek/deepseek-chat:free',
  'deepseek-chat',
];
```

When detected, the API sanitizes messages (removes tool roles and tool_calls).

---

## Quiz Generation API

### POST /api/quizzes/generate

**Purpose:** Generate quiz questions from knowledge sources

#### Request Body

```typescript
{
  sourceIds: string[],
  options?: {
    questionCount?: number,      // min: 3, max: 20, default: 5
    includeExplanation?: boolean, // default: true
    difficulty?: "mixed" | "easy" | "medium" | "hard" // default: "mixed"
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/quizzes/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sourceIds": ["source-1", "source-2"],
    "options": {
      "questionCount": 10,
      "difficulty": "medium"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "quiz-123",
      "title": "Generated Quiz",
      "questions": [
        {
          "id": "q1",
          "text": "What is React?",
          "options": [
            { "id": "a", "text": "A library", "isCorrect": true },
            { "id": "b", "text": "A framework", "isCorrect": false }
          ],
          "explanation": "React is a JavaScript library..."
        }
      ],
      "metadata": {
        "sourceCount": 2,
        "difficulty": "medium",
        "createdAt": "2026-01-05T00:00:00Z"
      }
    }
  }
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid request",
  "details": { /* Zod validation errors */ }
}
```

**501 Not Implemented:**
```json
{
  "success": false,
  "error": "Source content loading not yet implemented",
  "message": "Epic 6 (Source Ingestion) must be completed first"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to generate quiz",
  "message": "Original error message"
}
```

---

## Flashcard Generation API

### POST /api/flashcards/generate

**Purpose:** Generate flashcards from source content

#### Request Body

```typescript
{
  projectId: string,
  sourceId: string,
  sourceContent: string,
  sourceTitle?: string,
  options?: {
    minCards?: number,
    maxCards?: number,
    topics?: string[]
  },
  apiKey?: string,
  useMock?: boolean
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | Yes | Project identifier |
| sourceId | string | Yes | Source document ID |
| sourceContent | string | Yes | Text content to generate flashcards from |
| sourceTitle | string | No | Optional source title |
| options.minCards | number | No | Minimum cards to generate |
| options.maxCards | number | No | Maximum cards to generate (default: 5) |
| options.topics | string[] | No | Specific topics to focus on |
| apiKey | string | No | Gemini API key for real generation |
| useMock | boolean | No | Use mock generator for testing |

#### Example Request

```bash
curl -X POST http://localhost:3000/api/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-123",
    "sourceId": "src-456",
    "sourceContent": "React components are building blocks...",
    "sourceTitle": "React Guide",
    "options": {
      "maxCards": 10,
      "topics": ["React", "Components"]
    }
  }'
```

#### Response

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "card-1",
        "question": "What are React components?",
        "answer": "Building blocks of React applications",
        "difficulty": "easy",
        "topic": "React",
        "sourceIds": ["src-456"]
      },
      {
        "id": "card-2",
        "question": "How do components communicate?",
        "answer": "Through props and state",
        "difficulty": "medium",
        "topic": "React",
        "sourceIds": ["src-456"]
      }
    ],
    "totalCards": 2,
    "topics": ["React"],
    "sourcesUsed": ["src-456"]
  }
}
```

#### Mock Generation

When `useMock: true` or no API key is provided, the API returns mock flashcards:

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "mock-card-1",
        "question": "What is the primary purpose of this source?",
        "answer": "To demonstrate key concepts",
        "difficulty": "easy",
        "topic": "General",
        "sourceIds": ["src-456"]
      }
    ],
    "totalCards": 1,
    "topics": ["General"],
    "sourcesUsed": ["src-456"]
  }
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid request body. Required: projectId (string), sourceId (string), sourceContent (string)"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication failed. Please check your API key."
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate flashcards. Please try again."
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| MISSING_API_KEY | 401 | API key not provided |
| INVALID_JSON | 400 | Invalid JSON in request body |
| VALIDATION_ERROR | 400 | Request validation failed |
| RATE_LIMIT | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server-side error |
| NOT_IMPLEMENTED | 501 | Feature not yet implemented |

---

## Rate Limiting

The flashcards API includes rate limit detection:

```typescript
if (error.message.includes('rate limit') || error.message.includes('429')) {
  return errorResponse('Rate limit exceeded. Please try again later.', 429);
}
```

---

## Testing Endpoints

### Using the Test FS Adapter

The `/test-fs-adapter` route provides a UI for testing the File System Access API, which is used by the chat tools.

### Using curl

```bash
# Health check
curl http://localhost:3000/api/chat

# Chat with tools
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "List files"}],
    "apiKey": "your-api-key"
  }'

# Generate flashcards
curl -X POST http://localhost:3000/api/flashcards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test",
    "sourceId": "test",
    "sourceContent": "Test content",
    "useMock": true
  }'
```
