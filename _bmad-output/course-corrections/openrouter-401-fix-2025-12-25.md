# Course Correction: OpenRouter Chat Integration Fix

**Date**: 2025-12-25T01:10:00+07:00  
**Severity**: P0 - Critical  
**Status**: FIXED  
**Epic**: MVP  
**Affects**: MVP-2 (Chat Interface with Streaming)

---

## Issue Summary

Two separate issues prevented the chat from working:

1. **401 "User not found"** - Initial error from swapped `modelId`/`apiKey` arguments (fixed by user)
2. **400 "Input required: messages"** - Client was sending `messageCount: 0` because body options overrode `useChat` messages

## Root Cause Analysis

### Issue 1: Incorrect Argument Order (401)
The `createOpenaiChat` signature is `(model, apiKey, config)`. Code was passing arguments incorrectly.

### Issue 2: Empty Messages Array (400)
The `fetchServerSentEvents` body options included `messages: []` which **overrode** the messages that `useChat.connect()` passes:

```typescript
// ❌ BUG: body.messages overrides useChat messages!
body: {
    messages: [], // This was the problem!
    providerId: current.providerId,
    ...
}
```

The TanStack AI connection adapter signature shows messages are passed separately:
```typescript
connect: (messages: Array<UIMessage>, data?: Record<string, any>, ...) => ...
```

## Fixes Applied

### 1. `use-agent-chat-with-tools.ts`
- **Removed** `messages: []` from body options
- Added detailed logging for debugging
- Added `args` property to `ToolCallInfo` interface

### 2. `chat.ts`
- Fixed `toStreamResponse` → `toServerSentEventsStream` (non-deprecated)
- Fixed `headers` → `defaultHeaders` per TanStack AI config
- Added `as any` cast for `modelId` to allow OpenRouter model strings

### 3. `provider-adapter.ts`
- Fixed `OpenAIChatConfig` → `OpenAITextConfig` (correct export name)
- Updated to use 3-argument signature: `createOpenaiChat(modelId, apiKey, config)`

### 4. `types.ts`
- Added `model?: string` to `AdapterConfig` interface

## Verification

- [x] Build passes (`pnpm build` - exit code 0)
- [ ] Manual browser E2E test (user needs to restart dev server)
- [ ] Chat message successfully sent to OpenRouter
- [ ] Streaming response received

## Next Steps

1. User to restart dev server with `pnpm dev`
2. Test chat functionality in browser
3. Verify `messageCount` is now non-zero in logs
