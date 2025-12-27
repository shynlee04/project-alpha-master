# DDD + Event-Driven Patterns (Client-Side) — 2025-12-09

Sources:
- DeepWiki `primus/eventemitter3` — typed events via generics, context typing to reduce coupling.
- DeepWiki `tanstack/router` — search params as canonical state (helps domain boundaries at route edges).
- Tavily — client-side EDA/DDD articles (typed event bus, domain events pattern).

## Event Bus Patterns (eventemitter3)
- Define `EventTypes` interface mapping event names → tuple args or handler signatures; pass as generic to `EventEmitter<EventTypes>` for compile-time payload validation.
- Use explicit context generic to avoid `bind` and make domain context explicit.
- Benefits: clear contracts, cross-domain decoupling, compile-time safety for emit/on/once.

## DDD Boundaries (client-side)
- Domains: IDE, Agent, Project, LLM, Memory, Git(future).
- Each domain exposes API via `index.ts`/contracts; no cross-domain imports into `core/` of another domain.
- Events are versioned (`v1.0.0`) and typed; domains communicate only via event bus + contracts.

## Route Boundary Guidance
- Validate search params with Zod at route edges (TanStack Router `validateSearch`); treat search params as canonical workspace state.
- Components/routes should consume domain APIs/hooks, not infra directly.

## State & Persistence
- Single source of truth per domain store (TanStack Store/Zustand as needed); avoid duplicate `lib/*-store` copies.
- Persist via dedicated middleware (e.g., `PersistMiddleware`) rather than ad-hoc localStorage usage.

## Action Items for via-gent
- Define `EventTypes` map in `src/core/events/eventSchemas.ts` with tuple payloads; enforce versioning.
- Ensure domains emit/handle only typed events; prohibit raw `emit('some-string')` without schema.
- Route boundary validation: add/strengthen `validateSearch` for workspace routes.
- Document event contract ownership per domain and change protocol (version bump on payload change).
