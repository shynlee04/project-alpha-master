# End-to-End Validation Checklist

> **Phase 1 Definition of Done**
> This checklist validates the complete user journey from onboarding to production usage. All checks must pass before "Public Beta" launch on Jan 18.

## 📱 Mobile Experience (Day 0-3)

- [ ] **Mobile Demo Mode**: Open app on iPhone/Android. Verify "Demo Mode" banner appears.
- [ ] **Viewport Adaptation**: Rotate device. Verify layout adapts from bottom tabs (portrait) to sidebar (landscape >768px).
- [ ] **Chat Only Access**: Verify "Edit" capabilities are disabled/hidden.
- [ ] **Sample Content**: Open Chat. Verify "Chemistry" and "Literature" demo conversations load.

## 🖥️ Desktop Foundation (Day 4-7)

- [ ] **FSA Permission**: Open fresh incognito window. Click "Open Project". Select folder. Sync time <3s.
- [ ] **Theme Persistence**: Toggle Dark Mode. Reload page. Verify Dark Mode persists.
- [ ] **Credential Security**: Enter dummy API key. Check IndexedDB in DevTools. Verify value is encrypted string (not plaintext).

## 🧠 AI Agent Capabilities (Day 8-14)

- [ ] **Stream Reliability**: Send "Explain this code". Verify text streams (TTFT <2s). No jagged rendering.
- [ ] **Tool Approval**: Ask "Create file test.js". Verify Approval Overlay appears.
- [ ] **Deny Flow**: Click "Deny". Verify agent acknowledges refusal.
- [ ] **Allow Flow**: Ask "Create file test.js" again. Click "Allow". Verify file created in VS Code.

## 🔄 The Magic Loop (WebContainer + Sync)

- [ ] **Boot Performance**: Reload page. Verify "Booting..." → "Ready" in <5s.
- [ ] **Terminal**: Run `npm install`. Verify dependencies install (browser-side).
- [ ] **Dual-Write**: Edit file in browser. Save. Verify change in local VS Code (<500ms).
- [ ] **Reverse Sync**: Edit file in VS Code. Focus browser. Verify change appears (via FSA polling/event).

## 🛡️ Resilience & Polish (Day 15-17)

- [ ] **Crash Recovery**: Run `window.WebContainer.teardown()`. Verify app detects and reboots.
- [ ] **Session Restore**: Open 3 files. Reload. Verify same 3 files open.
- [ ] **Offline Mode**: Disconnect Wifi. Verify app allows read-only access to cached files.
