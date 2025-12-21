# Epic 18: Static Deployment & PWA

**Goal:** Enable deployment to static hosting with PWA capabilities and proper COOP/COEP headers.

**Priority:** P2  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 16  
**Prerequisites:** Epic 8 (Production-ready build)

### Story 18-1: Configure Production Build

As a **developer deploying the IDE**,  
I want **an optimized production bundle**,  
So that **the hosted version loads fast**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-18-1-1:** `vite build` produces optimized static files
- **AC-18-1-2:** Bundle size <2MB gzipped (excluding Monaco)
- **AC-18-1-3:** Source maps generated but not served publicly
- **AC-18-1-4:** Environment variables embedded at build time
- **AC-18-1-5:** Build completes in <60s

---

### Story 18-2: Add GitHub Actions for Deployment

As a **maintainer**,  
I want **automated deployment on merge to main**,  
So that **the live site stays current**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-18-2-1:** GitHub Actions workflow for Vercel/Netlify deploy
- **AC-18-2-2:** Preview deployments on PRs
- **AC-18-2-3:** Production deployment on main merge
- **AC-18-2-4:** Deploy URL posted to PR comment
- **AC-18-2-5:** Rollback to previous deploy on failure

---

### Story 18-3: Implement PWA Manifest

As a **user**,  
I want **to install the IDE as a desktop app**,  
So that **I can access it from my dock**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-18-3-1:** `manifest.json` with app name, icons, theme color
- **AC-18-3-2:** "Install" prompt appears in supported browsers
- **AC-18-3-3:** App icon shows in taskbar/dock when installed
- **AC-18-3-4:** Standalone display mode (no browser chrome)
- **AC-18-3-5:** Service worker handles offline gracefully

---

### Story 18-4: Add Client-Side Error Logging

As a **maintainer**,  
I want **to receive crash reports from users**,  
So that **I can fix bugs proactively**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-18-4-1:** Sentry or LogRocket integration (opt-in by user)
- **AC-18-4-2:** Errors captured with stack trace and context
- **AC-18-4-3:** PII excluded from reports (no API keys)
- **AC-18-4-4:** Error grouping by root cause
- **AC-18-4-5:** Settings toggle to disable reporting

---

### Story 18-5: Create COOP/COEP Header Guide

As a **deployer**,  
I want **clear documentation on required headers**,  
So that **WebContainers work on my hosting**.

**Story Points:** 1

**Acceptance Criteria:**

- **AC-18-5-1:** `docs/deployment-headers.md` explains COOP/COEP
- **AC-18-5-2:** Example configs for Vercel, Netlify, Cloudflare
- **AC-18-5-3:** Troubleshooting section for common errors
- **AC-18-5-4:** Link from README.md
- **AC-18-5-5:** Test endpoint to verify headers are correct

---
