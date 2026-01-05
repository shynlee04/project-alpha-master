# E2E Validation Suite: Definition of Done Checklist

**Created:** 2026-01-06T02:20:23+07:00  
**Phase:** Course Correction Phase 0  
**Story:** V-001 through V-004  
**Status:** CHECKLIST FOR MANUAL VERIFICATION

---

## V-001: E2E Validation Suite Framework

### Infrastructure Requirements

| # | Item | Verification Command | Expected Result | ✅ Done |
|---|------|---------------------|-----------------|---------|
| 1 | Playwright installed | `pnpm list @playwright/test` | Shows version installed | [ ] |
| 2 | Config file exists | `ls playwright.config.ts` | File exists in root | [ ] |
| 3 | E2E directory exists | `ls -la e2e/` | Directory with structure | [ ] |
| 4 | Browsers installed | `npx playwright install --with-deps chromium` | Browsers available | [ ] |

### Directory Structure Expected

```
e2e/
├── playwright.config.ts          # Playwright configuration
├── fixtures/
│   ├── test-project.fixture.ts   # Project setup helpers
│   ├── test-user.fixture.ts      # User interaction helpers  
│   └── mock-fsa.fixture.ts       # File System Access API mocks
├── journeys/
│   ├── file-sync.journey.spec.ts         # V-002 tests
│   ├── api-key-management.journey.spec.ts # V-003 tests
│   └── cross-workspace-agent.journey.spec.ts # V-004 tests
├── utils/
│   ├── test-assertions.ts        # Custom assertions
│   ├── error-capture.ts          # Error logging
│   └── mobile-viewport.ts        # Mobile testing helpers
└── results/
    └── .gitkeep                  # Test output directory
```

### Test Execution Verification

| # | Item | Command | Expected Result | ✅ Done |
|---|------|---------|-----------------|---------|
| 1 | Tests discoverable | `pnpm exec playwright test --list` | Lists all test cases | [ ] |
| 2 | Sample test runs | `pnpm exec playwright test --grep "sanity"` | At least 1 test passes | [ ] |
| 3 | Results stored | `ls e2e/results/` | Test report files | [ ] |

---

## V-002: File Sync E2E Validation Suite

### Test Cases Required

| ID | Test Case | Description | ✅ Exists | ✅ Passes |
|----|-----------|-------------|-----------|-----------|
| FSA-001 | Mount local folder | User clicks "Open Folder" → folder picker opens | [ ] | [ ] |
| FSA-002 | Open and edit files | Click file → editor loads → make edit | [ ] | [ ] |
| FSA-003 | Persist to filesystem | Edit + save → verify in mock FSA | [ ] | [ ] |
| FSA-004 | External sync in | Modify file externally → Notes updates | [ ] | [ ] |
| FSA-005 | New file appears | Create file externally → sidebar shows it | [ ] | [ ] |
| FSA-006 | Delete file removes | Delete externally → Note removed | [ ] | [ ] |
| FSA-007 | Large folder progress | 100+ files → progress indicator shown | [ ] | [ ] |
| FSA-008 | Cancel sync | Click cancel during sync → stops cleanly | [ ] | [ ] |
| FSA-009 | Error shows message | Force error → actionable toast appears | [ ] | [ ] |
| FSA-010 | Mobile works | Mobile viewport → sync functions | [ ] | [ ] |

### Acceptance: Minimum 8/10 tests pass for S-007, S-008 verification

---

## V-003: API Key Management E2E Validation Suite

### Test Cases Required

| ID | Test Case | Description | ✅ Exists | ✅ Passes |
|----|-----------|-------------|-----------|-----------|
| KEY-001 | Configure key | Settings → enter key → save → success toast | [ ] | [ ] |
| KEY-002 | Persist after refresh | Refresh page → key still configured | [ ] | [ ] |
| KEY-003 | Models load | After key → model selector shows models | [ ] | [ ] |
| KEY-004 | Cross-workspace | Configure in IDE → Notes also has access | [ ] | [ ] |
| KEY-005 | Chat works | Select model → send message → get response | [ ] | [ ] |
| KEY-006 | Invalid key error | Bad key → clear error message | [ ] | [ ] |
| KEY-007 | SSR compatibility | Navigate (trigger SSR) → key still works | [ ] | [ ] |

### Acceptance: All 7 tests pass for S-001, S-002, S-003 verification

---

## V-004: Cross-Workspace Agent E2E Validation

### Test Cases Required

| ID | Test Case | Description | ✅ Exists | ✅ Passes |
|----|-----------|-------------|-----------|-----------|
| AGENT-001 | Persist after refresh | Select agent → refresh → same agent | [ ] | [ ] |
| AGENT-002 | Per-workspace memory | IDE: Agent A, Notes: Agent B → both persist | [ ] | [ ] |
| AGENT-003 | Permissions persist | Set tool permissions → refresh → unchanged | [ ] | [ ] |
| AGENT-004 | Config sync | Change config → other tabs update | [ ] | [ ] |

### Acceptance: All 4 tests pass for S-009 verification

---

## Multi-Format File Type Support (FT-001 to FT-008)

### File Type Handler Registry

| File Type | Extensions | Renderer | Agent Read | Agent Write | RAG Indexable | ✅ Implemented |
|-----------|------------|----------|------------|-------------|---------------|----------------|
| Markdown | .md | Tiptap/ProseMirror | ✅ Text | ✅ Text | ✅ Text chunks | [ ] |
| YAML | .yaml, .yml | Monaco | ✅ Text | ✅ Text | ✅ Structured | [ ] |
| XML | .xml | Monaco | ✅ Text | ⚠️ Limited | ✅ Structured | [ ] |
| JSON | .json | Monaco + Tree | ✅ Text | ✅ Text | ✅ Structured | [ ] |
| PDF | .pdf | PDF.js | ✅ Extracted text | ❌ N/A | ✅ Extracted chunks | [ ] |
| Images | .png, .jpg, .svg, .gif | Gallery | ✅ Vision API | ❌ Generate new | ✅ Vision embedding | [ ] |
| Audio | .mp3, .wav, .m4a | Audio player | ✅ Whisper | ❌ Generate new | ✅ Transcribed | [ ] |
| Video | .mp4, .webm | Video player | ✅ Frame extract | ❌ N/A | ✅ Transcribed | [ ] |
| Code | .ts, .tsx, .py, .go, .rs | Monaco | ✅ Text | ✅ Text | ✅ Code chunks | [ ] |
| Plain Text | .txt, .log | Monaco | ✅ Text | ✅ Text | ✅ Text chunks | [ ] |

### File Type E2E Tests

| ID | Test Case | ✅ Exists | ✅ Passes |
|----|-----------|-----------|-----------|
| FT-E2E-001 | PDF renders in Notes | [ ] | [ ] |
| FT-E2E-002 | Image displays in gallery | [ ] | [ ] |
| FT-E2E-003 | Code file with syntax highlighting | [ ] | [ ] |
| FT-E2E-004 | Agent can read PDF content | [ ] | [ ] |
| FT-E2E-005 | Agent can analyze image (Vision) | [ ] | [ ] |
| FT-E2E-006 | Audio file can be transcribed | [ ] | [ ] |
| FT-E2E-007 | YAML/JSON editable + validated | [ ] | [ ] |
| FT-E2E-008 | Mixed folder with all types syncs | [ ] | [ ] |

---

## Error Recovery Architecture (ER-001 to ER-003)

### Error Handling Requirements

| Scenario | Current Behavior | Required Behavior | ✅ Fixed |
|----------|-----------------|-------------------|----------|
| Sync mount fails | console.error, mount "succeeds" | Toast with retry button | [ ] |
| Sync file read fails | Silently skipped | List of failed files + retry | [ ] |
| API key invalid | May fail silently | Clear error with reconfigure link | [ ] |
| IndexedDB quota exceeded | Data loss | Warning before full + cleanup options | [ ] |
| FSA permission revoked | Errors on next operation | Prompt to re-grant permission | [ ] |
| Network timeout | Operation stuck | Timeout with retry/cancel options | [ ] |

### Error UI Components

| Component | Purpose | ✅ Exists |
|-----------|---------|-----------|
| `RecoverableErrorBoundary` | Catches errors with recovery UI | [ ] |
| `ActionableToast` | Toast with buttons (retry, dismiss) | [ ] |
| `SyncErrorPanel` | Shows list of sync failures | [ ] |
| `PermissionRequestDialog` | Re-request FSA permissions | [ ] |

---

## User Feedback Infrastructure (UF-001 to UF-003)

### Progress Indicator Requirements

| Feature | Description | ✅ Implemented |
|---------|-------------|----------------|
| Operation tracking | All long operations tracked in store | [ ] |
| Progress percentage | Shows current/total with percentage | [ ] |
| Current item name | Shows "Syncing: my-document.md" | [ ] |
| Cancel button | User can cancel any cancellable operation | [ ] |
| Pause/Resume | User can pause and resume sync | [ ] |
| Time estimate | Shows ETA for long operations | [ ] |
| Queue visibility | Shows pending operations | [ ] |

### UI Components

| Component | Purpose | ✅ Exists |
|-----------|---------|-----------|
| `UniversalProgressPanel` | Shows all active operations | [ ] |
| `OperationProgressBar` | Single operation progress | [ ] |
| `CancelButton` | Cancel with confirmation | [ ] |
| `PauseResumeButton` | Toggle pause state | [ ] |

---

## i18n and Responsive (I18N-001, I18N-002, RESP-001)

### i18n Requirements

| Area | Requirement | Verification | ✅ Done |
|------|-------------|--------------|---------|
| Notes workspace | All strings use t() | `grep -r "\".*\"" --include="*.tsx" src/presentation/components/notes/` returns 0 hardcoded | [ ] |
| Error messages | All errors use i18n keys | Error components use t() | [ ] |
| Toasts | All toasts use i18n | Toast calls use t() | [ ] |
| Vietnamese complete | All en.json keys in vi.json | `diff` both files shows 0 missing keys | [ ] |

### Responsive Requirements

| Viewport | Component | Behavior | ✅ Verified |
|----------|-----------|----------|-------------|
| Mobile (375px) | Notes sidebar | Collapsible/drawer | [ ] |
| Mobile (375px) | File sync panel | Touch-friendly buttons | [ ] |
| Mobile (375px) | Progress panel | Readable on small screen | [ ] |
| Mobile (375px) | Agent selector | Dropdown works with touch | [ ] |
| Tablet (768px) | Notes layout | Appropriate panel sizes | [ ] |
| Desktop (1280px) | Full layout | All panels visible | [ ] |

---

## Summary: Course Correction Completion Gates

### Phase 0 Complete When:
- [ ] V-001: Playwright framework setup with 4 verification points
- [ ] V-002: 10 file sync test cases exist and 8+ pass
- [ ] V-003: 7 API key test cases exist and all pass
- [ ] V-004: 4 agent test cases exist and all pass

### Phase 1-2 Complete When:
- [ ] All 6 error scenarios have recovery UI
- [ ] Progress panel shows all long operations
- [ ] Cancel/Pause buttons work for sync

### Phase 3 Complete When:
- [ ] 0 hardcoded strings in Notes workspace
- [ ] Vietnamese translations complete
- [ ] Mobile layouts work on 375px viewport

### Phase 7 (File Types) Complete When:
- [ ] 10 file types have registered handlers
- [ ] 8 file type E2E tests pass
- [ ] Agent can read content from 6+ file types

---

## How to Use This Checklist

1. **As you implement**, mark items as done with `[x]`
2. **Run verification commands** to confirm
3. **Update LOOP_STATE.yaml** when phases complete
4. **Report blockers** if any E2E test consistently fails

---

**Artifacts Reference:**
- Root Cause Analysis: `_bmad-output/root-cause-analysis/critical-root-cause-analysis-2026-01-06.md`
- Course Correction Plan: `_bmad-output/course-corrections/strategic-course-correction-2026-01-06.md`
- Loop State: `_bmad/modules/asgl/LOOP_STATE.yaml`
