---
story_key: "P1-04-fix-gemini-hardcoding"
epic: "EPIC-P1"
story: 4
status: "pending"
created_at: "2026-01-09T19:00:00+07:00"
points: 2
priority: "P0"
depends_on: []
---

# P1-04: Fix Gemini API Hardcoding

## User Story

**As a** User wanting to use AI features
**I want** the Gemini API configuration to be dynamic
**So that** my saved API key is actually used for AI calls

## Context

**CRITICAL BLOCKER**: Google Gemini API configuration is currently **hardcoded and not configurable**. This severely impacts:
- Vertical agent configuration
- 2nd and 3rd architecture levels
- Multimodality capabilities for Notes space

## Acceptance Criteria

### AC-1: API Key from Vault
**Given** A user has saved a Gemini API key in settings
**When** An AI feature is triggered
**Then** The saved key is used (not a hardcoded value)

### AC-2: No Hardcoded Credentials
**Given** The codebase is searched
**When** Looking for hardcoded API keys
**Then** No Gemini API keys are found in source code

### AC-3: Configurable Endpoint
**Given** A user configures their AI provider
**When** They select Gemini
**Then** The correct endpoint is used based on their configuration

### AC-4: Error on Missing Key
**Given** A user hasn't configured an API key
**When** They try to use AI features
**Then** A helpful error message is shown (not a cryptic failure)

## Tasks

- [ ] T1: Find all hardcoded Gemini references
- [ ] T2: Update to read from credential vault
- [ ] T3: Test with actual API key flow
- [ ] T4: Add error handling for missing keys
- [ ] T5: Verify P1-08 vault chain works

## Dev Notes

### Known Locations (From Investigation)

Search for:
- `gemini` in source files
- Hardcoded API keys
- Direct Google AI imports without config

### Related Stories

- P1-08: Trace Vault → AI Chain (validates this fix)
- P1-05: Agent Config per Workspace (uses dynamic config)

## Files to Check

| File | Potential Issue |
|------|----------------|
| `note-ai-service.ts` | May have hardcoded provider |
| `VoiceRecordButton.tsx` | Known hardcoded Gemini reference |
| `ai-service.ts` | Check provider resolution |
