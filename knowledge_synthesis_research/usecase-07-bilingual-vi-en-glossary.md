---
id: KS-UC-07
name: "Bilingual synthesis: VI/EN notes + translation memory"
version: 1.0
status: draft
workspaces: [Knowledge, Notes, Study]
personas: [Student]
primary_goal: "Support Vietnamese-first learning with English-heavy source materials and consistent terminology."
---

## Scenario
A Vietnamese student imports English PDFs and writes Vietnamese notes. They want synthesis outputs that keep original quotes in English but produce Vietnamese summaries, with consistent technical term mapping across the whole vault.

## Preconditions
- Language detection per chunk is available.
- The system can store a per-project glossary (term ↔ translation ↔ examples).

## Trigger
User runs **Synthesize** with target language set to Vietnamese.

## Main flow
1. **Ingestion:**
   - Detect language per chunk; store.
2. **Synthesis:**
   - Produce Vietnamese summaries.
   - Keep evidence quotes in original language.
   - Generate glossary candidates (terms appearing frequently).
3. **Glossary workflow:**
   - User reviews glossary candidates and approves preferred translations.
   - Approved glossary influences future synthesis and agent answers.
4. **Study output:**
   - Flashcards show Vietnamese prompt and English term (or vice versa, user-selectable).

## UX requirements
- One-click toggle: “summary language” per node.
- Term highlighting: when a term appears, show mapped translation on hover.

## Failure modes & tough edges
- Ambiguous translations (e.g., “state”) → glossary requires context examples.
- Mixed language in same sentence → handle at span level.

## Acceptance criteria
- After glossary approval, future synthesis uses consistent terminology >95% of the time for glossary terms.
