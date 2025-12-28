# Story 1.3: Mobile Demo Mode with Capability Detection

**Epic:** 1 - Mobile-First Visual Foundation  
**Sprint:** 1  
**Status:** drafted  
**Priority:** P0  
**Team:** A (UI/Foundation)

---

## Part 1: User Story

**As a** mobile user,  
**I want** to understand which features are available on my device,  
**So that** I know what to expect and can access supported features.

---

## Part 2: Acceptance Criteria

### AC-1: Mobile Detection & Banner
**Given** a user on a mobile device (no SharedArrayBuffer support)  
**When** the page loads  
**Then** a friendly banner appears (Amber #F59E0B with WifiOff icon): "Welcome! Chat & review works here. Editing requires a desktop."  
**And** WebContainer boot is skipped  
**And** file system access buttons are disabled with tooltips

### AC-2: Chat Capability on Mobile
**Given** a mobile user WITH API key configured  
**When** they tap the chat panel  
**Then** they can chat with real AI (TanStack AI streaming works without WebContainer)  
**And** only code execution tools are disabled (chat works fully)

### AC-3: Demo Mode with Pre-loaded Content
**Given** a mobile user WITHOUT API key  
**When** they tap the chat panel  
**Then** they see pre-loaded sample conversations from `src/lib/demo/sample-conversations.json`  
**And** Vietnamese EdTech examples demonstrate AI capabilities

### AC-4: Education Modal
**Given** a mobile user wanting to try full features  
**When** they tap "Learn more" on the demo banner  
**Then** they see a modal explaining: "WebContainer requires desktop Chrome 86+ or Edge 86+ with COOP/COEP headers"  
**And** a "Continue in demo mode" button

---

## Part 3: Research Requirements (MANDATORY)

- [ ] **Context7**: Research `SharedArrayBuffer` detection best practices across browsers (Safari vs Chrome mobile)
- [ ] **Codebase**: Analyze `src/hooks/useResponsive.ts` to ensure consistent mobile detection
- [ ] **Codebase**: Review `src/lib/demo/sample-conversations.json` structure (created in Story 0.1)
- [ ] **UX Pattern**: Review warning banner component patterns in `src/components/ui` or Radix UI primitives

---

## Part 4: Implementation Tasks

- [ ] **Task 1: Create `useCapabilityDetection` Hook**
    - Implement `hasSharedArrayBuffer()` check
    - Implement `isMobile` check (using `useResponsive` or user agent fallback)
    - Return capabilities object `{ canBootWebContainer, isMobile, supportsFSA }`
- [ ] **Task 2: Implement Banner Component**
    - Create `MobileCapabilityBanner.tsx`
    - Style with Amber warning colors (Tailwind)
    - Add "Learn More" button triggering modal
- [ ] **Task 3: Implement Demo Chat Logic**
    - Modify `ChatPanel` to check capabilities
    - If `!apiKey` AND `isMobile`, load `sample-conversations.json`
    - Disable input if in read-only demo source mode (or allow "fake" interaction?) -> *Clarification: AC says "User sees pre-loaded conversations". Implies read-only or simulated chat.*
- [ ] **Task 4: WebContainer Boot Logic Update**
    - Modify `BootManager` (or the component triggering it) to skip boot if `!canBootWebContainer`
- [ ] **Task 5: File System Access Disabling**
    - Disable "Open Folder" buttons if `!supportsFSA`
    - Add tooltip explaining why

---

## Part 5: Dev Agent Record

*To be populated during development...*

---

## Part 6: References

- **Architecture Document**: Section 3.8 (Browser Support), Section 4.5 (WebContainer)
- **UX Design**: Section 3.1 (Mobile Layout), Section 4 (Accessibility)
- **Hooks**: `src/hooks/useResponsive.ts`
