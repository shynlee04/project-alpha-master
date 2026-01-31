# Story: Migrate slash-command-store to infrastructure

> **Story ID**: CC-09-01
> **Epic**: EPIC-CC-09 (Slash Command Store Migration)
> **Priority**: P1
> **Status**: pending
> **Time Box**: 1 hour

## Description
Move `src/lib/notes/slash-command-store.ts` to `src/infrastructure/persistence/stores/notes/slash-commands/` and switch it to use `createDexieStorage` instead of localStorage. This is to prevent data loss (5MB limit) and fix architectural violations.

## Acceptance Criteria
- [ ] `slash-command-store.ts` moved to `src/infrastructure/persistence/stores/notes/slash-commands/`
- [ ] Store updated to use `createDexieStorage`
- [ ] `slash-command-store.ts` removed from `src/lib/notes/`
- [ ] No TypeScript errors

## Tasks
- [ ] Create new directory `src/infrastructure/persistence/stores/notes/slash-commands/`
- [ ] Move and refactor `slash-command-store.ts` to use `createDexieStorage`
- [ ] Update all imports referencing the old location
- [ ] Verify functionality and types
- [ ] Delete old file

## Dependencies
- None

## Handoff Artifacts
- Updated `slash-command-store.ts`
- TypeScript validation report
