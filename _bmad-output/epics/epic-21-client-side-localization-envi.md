# Epic 21: Client-Side Localization (EN/VI)

**Goal:** Add client-side localization with English as default and Vietnamese as secondary, using automation for string extraction and client-side state for persistence (no URL routing).

**Priority:** P2 (can run in parallel to ongoing P0 work)

### Story 21-1: Client-Side Localization Foundation & Automation Setup

As a **developer/user**,
I want **a robust client-side localization infrastructure with automated key extraction**,
So that **I can easily translate the app without manual JSON management or URL routing changes**.

**Acceptance Criteria:**
- `react-i18next` configured with client-side detector (localStorage/navigator).
- `i18next-scanner` pipeline set up for automated key extraction.
- `<html lang>` updates dynamically.
- No URL path modifications.

### Story 21-2: I18n Infrastructure & Bundles

*(Merged into 21-1 for simplicity)*

### Story 21-3: Language Switcher & Persistence

As a **user**,
I want **to switch languages via a UI toggle and have my preference saved**,
So that **the interface immediately updates and remembers my choice on next visit**.

**Acceptance Criteria:**
- UI Toggle in Header switches language immediately.
- Preference persisted in `localStorage`.
- No page reload or URL change on switch.

### Story 21-4: UI Migration Wave 1 (Navigation & Shell)

*(Merged into 21-5 for broad IDE automation approach)*

### Story 21-5: UI Migration & Bulk Automation

As a **developer**,
I want **to bulk-migrate hardcoded strings to i18n keys using automation**,
So that **I can rapidly localize the IDE surfaces with minimal manual error**.

**Acceptance Criteria:**
- All core IDE strings (Header, Sidebar, Editor, Terminal) extracted to `en.json`.
- `vi.json` generated with baseline translations.
- UI verified in both languages.

### Story 21-6: Formatting & RTL Readiness

As a **user**,
I want **dates/numbers formatted per locale**,
So that **content looks correct in my language**.

**Acceptance Criteria:**
- Intl-based helpers for date/number.
- RTL-safe styles verified.

### Story 21-7: Tests & Lint Guardrails

As a **developer**,
I want **tests and lint rules preventing new hardcoded strings**,
So that **localization quality stays high**.

**Acceptance Criteria:**
- Tests for locale switching.
- CI check for unextracted strings (using scanner or strict lint rule).

**Rationale:** Client-side only approach avoids complex routing changes and allows for rapid iteration using automation tools.


---
