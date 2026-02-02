---
status: resolved
trigger: "React hydration mismatch caused by i18n locale difference between server (EN) and client (VI)"
created: 2026-02-02T12:00:00+07:00
updated: 2026-02-02T12:25:00+07:00
---

## Current Focus

hypothesis: i18next-browser-languagedetector runs DURING initial render, reads localStorage (client only), causing server/client mismatch
test: Trace when i18n.init() runs and how LanguageDetector behaves in SSR context
expecting: Server has no localStorage → uses 'en' fallback. Client has localStorage → uses 'vi'. This creates hydration mismatch.
next_action: Implement deferred language detection - initialize with fallback, detect after hydration

## Symptoms

expected: Server and client render same locale text. No hydration errors.
actual: Server renders English ("Toggle menu", "Home"), client expects Vietnamese ("Mở/Đóng menu", "Trang chủ"). React throws hydration mismatch warning.
errors:
- "[GlobalErrorHandlers] Hydration failed because the server rendered text didn't match the client"
- Diff shows: +aria-label="Mở/Đóng menu" / -aria-label="Toggle menu"
- Also: "Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version()"
- Also: "[SW] Service worker registration failed: ServiceWorker script evaluation failed"
reproduction:
1. Set browser localStorage i18nextLng to 'vi'
2. Navigate to localhost:3000
3. Open dev console - see hydration mismatch error
started: Ongoing issue since i18n implementation

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-02-02T12:01:00+07:00
  checked: src/routes/__root.tsx
  found: suppressHydrationWarning on html (L77) and body (L83), but NOT on children
  implication: Child elements (GlobalHeader) will still trigger hydration mismatch if their text differs

- timestamp: 2026-02-02T12:02:00+07:00
  checked: src/i18n/config.ts
  found: i18next uses LanguageDetector with order: ['localStorage', 'navigator'], fallbackLng: 'en'
  implication: During initial render (SSR-like via TanStack Router), localStorage may not be available, so fallbackLng is used. On client hydration, localStorage IS available, so 'vi' is detected.

- timestamp: 2026-02-02T12:03:00+07:00
  checked: src/i18n/LocaleProvider.tsx
  found: Provider is thin wrapper, runs useEffect to update document.lang after mount
  implication: By the time useEffect runs, initial render already happened with wrong locale

- timestamp: 2026-02-02T12:04:00+07:00
  checked: src/presentation/components/layout/GlobalHeader.tsx
  found: Multiple t() calls (L71, L117, L141, L157, L169, L177, L201, L236, L237, L241, L279, L280, L305, L306)
  implication: All these strings rendered with EN on first render, but client expects VI

## Resolution

root_cause: i18next-browser-languagedetector reads localStorage during synchronous init(), causing server/client locale mismatch

The problem chain:
1. `LocaleProvider.tsx` line 3: `import './config';` - side-effect import triggers i18n.init() synchronously
2. `config.ts` line 20: `.use(LanguageDetector)` - registers browser language detector
3. `config.ts` line 32: `detection: { order: ['localStorage', 'navigator'] }` - checks localStorage FIRST
4. During TanStack Start SSR: localStorage unavailable → fallbackLng 'en' used
5. During client hydration: localStorage available with 'vi' → 'vi' used
6. React hydration sees server='en', client='vi' → ERROR

fix: Two-phase initialization:
1. Initialize i18n with FIXED language (fallbackLng 'en') - NO detection during init
2. After React hydration completes, detect and switch to user's preferred language
3. This causes a brief flash (EN→VI) but eliminates hydration error

**Implementation:**
- `src/i18n/config.ts`: Removed LanguageDetector from init(), added manual detectLanguage() function
- `src/i18n/LocaleProvider.tsx`: Added useEffect to detect and apply language post-hydration

verification: 
- TypeScript check: PASSED (no new errors from i18n changes)
- i18n tests: ALL 4 PASSED (after fixing pre-existing test bug)
- Governance: Files within size limits (90 LOC, 58 LOC)

files_changed:
- src/i18n/config.ts (removed LanguageDetector, added manual detection)
- src/i18n/LocaleProvider.tsx (added post-hydration detection)
- src/i18n/__tests__/config.test.ts (fixed pre-existing test bug)
