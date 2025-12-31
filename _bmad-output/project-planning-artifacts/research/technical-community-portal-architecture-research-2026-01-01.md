---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'Technical Research'
research_topic: 'Hybrid Community Portal Architecture'
research_goals: 'Design a lightweight, discord-like + blog community portal with social login, integrated with a client-side main app.'
user_name: 'Admin'
date: '2026-01-01'
web_research_enabled: true
source_verification: true
---

# Research Report: Technical Research

**Date:** 2026-01-01
**Author:** Admin
**Research Type:** Technical Research

---

## Research Overview

[Research overview and methodology will be appended here]

## Technical Research Scope Confirmation

**Research Topic:** Hybrid Community Portal Architecture
**Research Goals:** Design a lightweight, discord-like + blog community portal with social login, integrated with a client-side main app.

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights


## Technology Stack Analysis

### Architecture: Hybrid Client/Server Model

The proposed architecture splits the application into two distinct zones to balance performance and functionality:
1.  **Client-Side "App" Zone**: A high-performance SPA (Single Page Application) for the core product.
    *   *Tech*: React (Vite/Next.js), Client-side routing.
2.  **Server-Side "Community" Zone**: A SEO-friendly, database-backed community portal.
    *   *Tech*: Specialized Community CMS (SSR/PHP/Node.js).
    *   *Deployment*: Typically hosted on a subdomain (e.g., `community.project-alpha.com`) to allow cookie sharing while maintaining codebase separation.

### Community Platform Options (Lightweight & Sleek)

For a "Discord-like + Blog" hybrid that remains lightweight, three primary contenders emerge:

1.  **Flarum** (Top Recommendation for "Sleek & Lightweight")
    *   *Tech*: PHP (Laravel components), Mithril.js frontend.
    *   *Pros*: Extremely lightweight, "Next.js-like" SPA feel, very fast. Native Extension API supports "Blog" view and "Real-time Chat".
    *   *Cons*: PHP backend (might differ from main stack), requires separate hosting environment (usually).
    *   *Vibe*: Modern, clean, "Apple-esque" design out of the box.

2.  **NodeBB** (Best Node.js Integration)
    *   *Tech*: Node.js, Redis/MongoDB.
    *   *Pros*: Real-time by default (WebSockets), high interaction. easy to extend if you know JS.
    *   *Cons*: Heavier memory footprint than Flarum. UI can feel "busy" without customization.

3.  **Discourse** (The Standard, but Heavy)
    *   *Tech*: Ruby on Rails, Ember.js, Postgres, Redis.
    *   *Pros*: Feature-complete, widely used.
    *   *Cons*: **NOT** lightweight. Resource hog.

**Selected Approach:** Flarum is the strongest candidate for "Lightweight + Sleek".

### Authentication & Integration

To bridge the "Client-Side App" and "Server-Side Portal":

*   **Shared Identity (SSO)**:
    *   **OAuth2 / OIDC**: Both the App and the Community Portal act as clients to the same Identity Provider (IdP).
    *   **Social Login**: Google, GitHub, Discord login.
    *   **Cookie Sharing**: If hosted on `app.domain.com` and `community.domain.com`, a wildcard cookie can maintain session state (Auth0 or Custom JWT implementation).

### Infrastructure
*   **Main App**: Vercel / Cloudflare Pages (Edge/Static).
*   **Community Portal**: VPS (DigitalOcean/Hetzner) or specialized managed hosting (Free Flarum hosts exist but are limited; Self-hosted VPS recommended for cost/control).


## Integration Patterns Analysis

### Identity & Authentication Bridging

The critical integration point is the **Single Sign-On (SSO)** experience. The user should log in once (likely on the Main App) and be authenticated on the Community Portal.

*   **OAuth2 / OpenID Connect (OIDC) Flow:**
    *   **Pattern:** Both applications (App & Portal) are registered as "Clients" in the OAuth provider (e.g., Google/GitHub).
    *   **Implementation:**
        1.  User clicks "Login" on Main App -> Redirects to Provider -> Redirects back to Main App (Session Created).
        2.  User navigates to Community Portal.
        3.  Portal detects no session -> Redirects to Provider (Silent Auth or minimal prompt) -> Redirects back to Portal (Session Created).
    *   *Pros:* Secure, standard.
    *   *Cons:* Can involve redirect "flicker".

*   **Cookie Sharing (Preferred for Seamlessness):**
    *   **Pattern:** Shared Root Domain Cookies.
    *   **Domain Structure:** `app.project.com` and `community.project.com`.
    *   **Mechanism:** Auth service sets a `HttpOnly` JWT cookie on `.project.com`. Both backends (Next.js API routes and Flarum PHP middleware) validate this same signature.
    *   **Flarum Specific:** Requires the `flarum-ext-auth-passport` or a custom Auth Middleware to trust the JWT.

### Data & Event Integration

*   **API Consumption (Main App Dashboard):**
    *   **REST/JSON-API:** Flarum adheres to the **JSON-API** spec. The Main App can fetch `GET /api/discussions?sort=-createdAt` to display a "Recent Community Activity" widget on the user's main dashboard.
    *   *Auth:* The same JWT used for user session can be sent as a Bearer token to read private discussions if necessary.

*   **Webhooks (Event Notification):**
    *   **Direction:** Community Portal -> Main App.
    *   **Use Case:** When a user replies to a thread, Flarum fires a webhook to the Main App's notification endpoint. The Main App then shows a red dot on the "Community" navbar icon.

### UI/UX Integration Patterns

*   **Shared Design Tokens:**
    *   **Approach:** Export CSS variables (`--primary-color`, `--font-main`) from the Main App's design system (Tailwind config) and inject them into Flarum's "Custom CSS" admin panel. This ensures exact visual parity without distinct codebases.

*   **Global Navigation Injection:**
    *   **Pattern:** The Main App exposes a micro-frontend or a simple JS bundle that renders the Top Navigation Bar. Flarum includes this script in its `head`. This ensures the top navigation is identical and active states (like "Log Out") work globally.


## Architectural Patterns and Design

### System Architecture: "Identity-Aware Proxy" Variant

For stability and scalability, the best architectural pattern for this hybrid system is the **Identity-Aware Proxy (IAP) Pattern** simulated via domain structure.

*   **Subdomain Isolation:**
    *   `app.example.com` (Main App)
    *   `community.example.com` (Portal)
    *   `.example.com` (Wildcard Cookie Scope)
*   **The "Auth Master" Architecture:**
    1.  **Auth Service:** A focused microservice (or NextAuth routes in Main App) issues the critical `session_token` cookie scoped to `.example.com`.
    2.  **Stateless Validation:**
        *   Main App validates via middleware (Edge).
        *   Community Portal (PHP) validates via a lightweight Middleware that inspects `$_COOKIE['session_token']`.
    3.  **Lazy Synchronization:** The Community Portal does *not* own the user record. On every request, if the cookie is valid but the user doesn't exist in local SQL, it "Just-in-Time" (JIT) provisions the user row using claims from the JWT (email, username, avatar).

### Design Principles

*   **Loose Coupling:** The Community Portal should have **zero** write access to the Main App's database. It should treat the Auth Cookie as the "Source of Truth" for identity.
*   **Eventual Consistency:** User profile updates (e.g., changing avatar) on the Main App might take a few minutes to reflect on the Portal (unless a webhook forces a refresh). This is an acceptable trade-off for performance.

### Scalability and Performance

*   **Cache Strategy (The "Hole-Punch" Pattern):**
    *   Cache the entire Flarum HTML output at the Edge (Cloudflare).
    *   Bypass Cache *only* for authenticated users (detected via Cookie presence) OR use "ESI" (Edge Side Includes) if using Varnish/Cloudflare Enterprise.
    *   *Simpler Alternative:* Cache aggressive static assets (JS/CSS/Images) but let the PHP application handle the HTML doc for correct "Logged In" state rendering.

### Security Architecture

*   **Cross-Site Request Forgery (CSRF):** Since we rely on a wildcard cookie, strictly configure `SameSite=Lax` (or `None` + `Secure` if cross-domain) and enforce CSRF tokens on all POST requests within the Community Portal's own session logic.
*   **Session Revocation:** "Log Out" on Main App must clear the wildcard cookie. The Community Portal must respect this clearing immediately on the next request.


## Implementation Approaches and Technology Adoption

### Implementation Roadmap

1.  **Phase 1: Proof of Concept (Local Docker)**
    *   Set up a `docker-compose.yml` that runs:
        *   `app` container (Next.js) on `localhost:3000`
        *   `community` container (Flarum/PHP-FPM) on `localhost:8080` (mapped to `community.localhost` via hosts file).
    *   Implement the "Cookie Bridge": Create a dummy login on Next.js that sets a root domain cookie and verify Flarum middleware sees it.

2.  **Phase 2: Infrastructure Setup**
    *   Provision VPS (e.g., Hetzner CPX11 - ~€4/mo).
    *   Install "LEMP Stack" (Linux, Nginx, MySQL, PHP 8.2+).
    *   Deploy Flarum skeleton.
    *   Configure Nginx for `community.domain.com`.

3.  **Phase 3: Integration & Theming**
    *   Install `flarum-ext-passport` or write the custom auth bridge plugin.
    *   Copy CSS Tokens from Next.js project to Flarum's "Custom CSS".
    *   Inject the "Shared Header" JS script into Flarum's `<head>`.

### Development Workflows

*   **Main App (Next.js):**
    *   Standard Git-based workflow (GitHub -> Vercel).
    *   Deploy: `git push`.
*   **Community Portal (Flarum):**
    *   **Composer Management:** Manage Flarum extensions via `composer.json` in a separate repo or folder.
    *   **Deployment:** Use GitHub Actions to SSH into the VPS and run `composer install && php flarum migrate`. Do *not* FTP files manually.

### Cost Optimization

*   **Estimated Monthly Cost:**
    *   **Main App:** $0 (Vercel Tier).
    *   **Community Portal:** $5 - $10 (Low-end VPS is sufficient for Flarum's efficiency).
    *   **Database:** Included in VPS (MySQL).
    *   **Backups:** $1 (S3 compatible storage for dump uploads).
    *   **Total:** ~$6-11/mo.
    *   *Comparison:* Managed Discourse starts at ~$100/mo. Managed Flarum (FreeFlarum) is free but has footer branding and no custom auth plugins support on free tier.

### Risk Assessment

*   **Risk:** PHP/Next.js Context Switch.
    *   *Mitigation:* Keep the Flarum side "low code". Use it as a product, not a codebase to hack on. Only touch CSS and config.
*   **Risk:** Shared Cookie Security.
    *   *Mitigation:* Ensure `HttpOnly` and `Secure` flags are ALWAYS set. Use short-lived sessions (e.g., 24h) with sliding expiration on the active app side.

## Technical Research Recommendations

**Stack Decision:** **Next.js (App) + Flarum (Community) + Shared JWT Cookie.**
*   **Why:** Best balance of "Sleek/Lightweight" (Flarum) and "Modern App" (Next.js).
*   **Integration:** Social Login handled by Next.js, session silently shared to Flarum.
*   **Vibe:** Unbeatable "Modern Forum" feel compared to old-school NodeBB or heavy Discourse.

_Research completed 2026-01-01_





---

<!-- Content will be appended sequentially through research workflow steps -->
