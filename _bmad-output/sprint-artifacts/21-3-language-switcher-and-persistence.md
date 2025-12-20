# Story 21-3: Language Switcher & Persistence

**Epic:** 21 - Client-Side Localization (EN/VI)  
**Sprint:** 13 (parallel track)  
**Status:** drafted  
**Priority:** P2  

---

## User Story
As a **user**,  
I want **to switch languages via a UI toggle and have my preference saved**,  
So that **the interface immediately updates and remembers my choice on next visit**.

---

## Acceptance Criteria
- **AC-21-3-1**: Header contains a language toggle (EN/VI) that immediately switches the UI language.
- **AC-21-3-2**: Selection is persisted to `localStorage` key `i18nextLng` (or configured key).
- **AC-21-3-3**: App initializes with the persisted language or browser default if none.
- **AC-21-3-4**: Switching language DOES NOT reload the page or change the URL.

---

## Tasks
- [ ] **T0 Research**: Check existing Header component structure.
- [ ] **T1 Components**: Create `LanguageSwitcher` component (dropdown/toggle).
- [ ] **T2 Integration**: Add switcher to `Header.tsx`.
- [ ] **T3 State Connection**: Wire switcher to `react-i18next`'s `changeLanguage`.
- [ ] **T4 Validation**: specific tests for switching and persistence.

---

## Research Requirements
- Verify `react-i18next` `useTranslation` hook re-renders triggered by language change.

---

## Dev Notes
- Keep it simple.
- Ensure accessible UI (aria-labels).

---

## References
- Story 21-1 (Foundation)
