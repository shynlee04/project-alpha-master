# Story 43-03: 2-Step Prompt Refinement Workflow

## Summary

**Status:** ✅ COMPLETED  
**Date:** 2026-01-13  
**Epic:** EPIC-43 - Prompt Engineering Hub  
**Story ID:** 43-03  
**Team:** Team B  

## Description

Implemented a 2-step prompt refinement workflow for Vietnamese users, allowing them to:
1. Fill in variable values ({{variable}} placeholders)
2. Preview and edit the final prompt before AI generation

This is a key feature for Vietnamese users who want to refine prompts before calling the AI, ensuring better control over the output.

## Implementation

### 1. Data Model Changes (`src/lib/notes/slash-command-store.ts`)

#### New Types
```typescript
export interface PromptVariable {
    name: string;        // Variable name (used in {{name}} placeholder)
    label: string;       // Display label (EN)
    labelVi?: string;    // Display label (VI)
    type: 'text' | 'textarea' | 'select';  // Input type
    options?: string[];  // For select type
    placeholder?: string;  // Input placeholder
    defaultValue?: string; // Default value
    required?: boolean;  // Whether the variable is required
}

export interface CustomSlashCommand {
    // ... existing fields
    variables?: PromptVariable[];  // 43-03: Prompt variables for refinement
    enableRefinement?: boolean;    // 43-03: Enable 2-step refinement UI
}
```

#### Helper Functions
- `extractVariablesFromPrompt(prompt): string[]` - Extract {{variable}} patterns from prompt
- `substituteVariables(prompt, values): string` - Replace variables with values
- `promptNeedsRefinement(command): boolean` - Check if command needs refinement
- `getLocalizedVariableLabel(variable, locale)` - Get localized variable label

### 2. Refinement Dialog Component (`src/presentation/components/notes/PromptRefinementDialog.tsx`)

#### Features
- **Zustand Store** - State management for refinement workflow
- **2-Step UI**:
  - Step 1: Fill in variable values (text/textarea/select inputs)
  - Step 2: Preview and edit the final prompt
- **Vietnamese Support** - All labels have EN/VI versions
- **Note Context** - Shows preview of note context being included
- **Validation** - Checks required fields before proceeding
- **Editability** - Users can edit the final prompt before generation

#### Store Actions
```typescript
interface RefinementActions {
    openRefinement(command, editor, noteContext, onExecute)
    closeRefinement()
    setVariableValue(name, value)
    setRefinedPrompt(prompt)
    goToStep(step)
    nextStep()
    prevStep()
    executePrompt()
}
```

### 3. Integration with Slash Commands (`src/presentation/components/notes/AISlashCommand.tsx`)

#### Changes
- Added `promptNeedsRefinement` import from slash-command-store
- Modified `createCustomCommandItem` to check if refinement is needed
- If refinement needed, opens `PromptRefinementDialog` instead of executing directly
- If no refinement, executes immediately (original behavior)

```typescript
const needsRefinement = promptNeedsRefinement(command);

if (needsRefinement) {
    usePromptRefinementStore.getState().openRefinement(
        command,
        editor,
        content,
        async (finalPrompt: string) => {
            await executeAICommand(editor, finalPrompt, localized.title);
        }
    );
} else {
    // Original behavior
}
```

### 4. Command Management UI Updates (`src/presentation/components/notes/SlashCommandManager.tsx`)

#### New Features
- Toggle switch for "Enable 2-Step Refinement" in command form
- Visual badge "2-step" on commands that have variables or refinement enabled
- Vietnamese labels for toggle (via i18n fallback pattern)

### 5. Notes Page Integration (`src/presentation/components/notes/NotesPage.tsx`)

- Added `<PromptRefinementDialog />` component to render in NotesPage

### 6. Example Default Commands

Updated default commands in `slash-command-store.ts`:

1. **Brainstorm Ideas** (Modified)
   - Variables: `{{topic}}`, `{{tone}}`
   - Uses select dropdown for tone options

2. **Write Email** (New)
   - Variables: `{{recipient}}`, `{{subject}}`, `{{tone}}`, `{{length}}`
   - Multiple input types (text, textarea, select)

## Files Modified

### Modified
- `src/lib/notes/slash-command-store.ts` - Added PromptVariable type and helper functions
- `src/presentation/components/notes/AISlashCommand.tsx` - Integrated refinement dialog
- `src/presentation/components/notes/SlashCommandManager.tsx` - Added toggle UI
- `src/presentation/components/notes/NotesPage.tsx` - Added PromptRefinementDialog component

### Created
- `src/presentation/components/notes/PromptRefinementDialog.tsx` - New dialog component

## Vietnamese Support

All UI elements have Vietnamese translations:
- Variable labels (labelVi field)
- Step descriptions (via i18n t() with fallback)
- Button labels (Enahnced/Explain/Preview/Generate)

## Testing

✅ TypeScript compilation - No errors
✅ All new types properly exported
✅ Store integration verified
✅ Component renders without errors

## User Flow

1. User types `/` in BlockNote editor
2. Selects a custom command (e.g., "Write Email")
3. If command has variables, **Refinement Dialog opens**
4. **Step 1**: Fill in recipient, subject, tone, length
5. **Step 2**: Preview final prompt with substituted values
   - Can edit the prompt before generating
6. Click "Generate" to execute with refined prompt
7. AI generates content with the refined prompt

## Benefits for Vietnamese Users

- No need to memoize complex prompt patterns
- Clear UI for customizing prompts before execution
- Immediate feedback on what the final prompt will look like
- Ability to fine-tune prompts in the final step
- Support for Vietnamese labels throughout the workflow

## Next Story

**43-04: AI Prompt Suggestion Based on Context**  
Priority: P1  
Description: Suggest relevant prompts based on note content

---

**Developed by:** Team B  
**Validation Status:** ✅ Ready for Manual Testing