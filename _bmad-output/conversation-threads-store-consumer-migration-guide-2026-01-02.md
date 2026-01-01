# Conversation-Threads-Store Consumer Migration Guide

**Date**: 2026-01-02
**Team**: Team A (UI/Foundation)
**Audience**: Developers working with conversation components
**Purpose**: Step-by-step migration guide for store consumers

---

## Quick Start

The conversation-threads-store is being split into 5 focused slices to improve maintainability. This guide shows you how to migrate your component imports with minimal disruption.

**Timeline**:
- 🟢 **Phase 1**: Zero breaking changes (immediate)
- 🟡 **Phase 2**: Gradual migration (2-3 weeks)
- 🔴 **Phase 3**: Final cleanup (end of migration)

---

## 1. Impact Assessment

### 1.1 Consumer Categories

| Category | Files | Impact | Migration Effort |
|----------|-------|--------|------------------|
| **Full Store Import** | 3 files | High | 30 minutes each |
| **Hook-Only Import** | 1 file | Medium | 15 minutes |
| **Type-Only Import** | 8 files | Low | 5 minutes each |
| **Total** | **12 files** | | ~2-3 hours total |

### 1.2 Risk Assessment

- 🟢 **Low Risk**: Type imports, simple queries
- 🟡 **Medium Risk**: Hook usage, component state
- 🔴 **High Risk**: Direct store actions, complex logic

---

## 2. Migration Steps

### Phase 1: Zero Breaking Changes (Immediate)

**No changes required yet!** The store maintains full backward compatibility.

#### What This Means
```typescript
// ✅ This continues to work exactly as before
import { useThreadsStore, useActiveThread } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

const { createThread, addMessage } = useThreadsStore();
const activeThread = useActiveThread();
```

#### Timeline
- **Start**: Immediately
- **Duration**: Until Phase 2 is ready
- **Risk**: None

---

### Phase 2: Gradual Migration (When Ready)

Follow these steps to migrate each consumer type:

#### 2.1 Full Store Import Consumers (High Priority)

**Files to migrate**:
- `ChatPanelWrapper.tsx`
- `AgentChatPanel.tsx`
- `AgentChatConversationManager.tsx`

**Migration Pattern**:

**Before**:
```typescript
import { useThreadsStore, useActiveThread } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

export function ChatPanelWrapper() {
    const { createThread, addMessage, updateMessage, getThreadsForProject } = useThreadsStore();
    const activeThread = useActiveThread();

    // Usage...
}
```

**After**:
```typescript
import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/slices/project-scope-slice';
import { useCreateThread, useAddMessage, useUpdateMessage } from '@/infrastructure/persistence/stores/conversation/slices/message-management-slice';

export function ChatPanelWrapper() {
    // Use composed store for complex operations
    const store = useThreadsStore();
    const { createThread, addMessage, updateMessage } = store;
    const { getThreadsForProject } = store;

    // Use specific slice hooks for reactive updates
    const activeThread = useActiveThread();

    // Usage...
}
```

**Migration Commands**:
```bash
# 1. Update import for active thread
sed -i '' 's/useActiveThread from.*conversation-threads-store/useActiveThread from '\''@\/infrastructure\/persistence\/stores\/conversation\/slices\/project-scope-slice'\''/g' ChatPanelWrapper.tsx

# 2. No changes needed for store actions (continue using useThreadsStore)
```

#### 2.2 Hook-Only Import Consumers (Medium Priority)

**Files to migrate**:
- `ThreadFolderTree.tsx`

**Migration Pattern**:

**Before**:
```typescript
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';
import type { ThreadHierarchyNode } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

export function ThreadFolderTree() {
    const activeThread = useActiveThread();
    // Usage...
}
```

**After**:
```typescript
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/slices/project-scope-slice';
import type { ThreadHierarchyNode } from '@/infrastructure/persistence/stores/conversation/conversation-types';

export function ThreadFolderTree() {
    const activeThread = useActiveThread();
    // Usage...
}
```

#### 2.3 Type-Only Import Consumers (Low Priority)

**Files to migrate**:
- `ChatPanel.tsx`
- `ChatConversation.tsx`
- `ThreadCard.tsx`
- `ThreadsList.tsx`
- `conversation-helpers.ts`
- `context-window-manager.ts`

**Migration Pattern**:

**Before**:
```typescript
import type { ConversationThread, ThreadMessage } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

export function ThreadCard({ thread }: { thread: ConversationThread }) {
    // Usage...
}
```

**After**:
```typescript
import type { ConversationThread, ThreadMessage } from '@/infrastructure/persistence/stores/conversation/conversation-types';

export function ThreadCard({ thread }: { thread: ConversationThread }) {
    // Usage...
}
```

**Migration Command**:
```bash
# Update all type imports in one command
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''@\/infrastructure\/persistence\/stores\/conversation\/conversation-threads-store'\''|from '\''@\/infrastructure\/persistence\/stores\/conversation\/conversation-types'\''|g'
```

---

## 3. Specific Component Migrations

### 3.1 ChatPanelWrapper.tsx

**Current Usage**:
```typescript
const { createThread, addMessage, updateMessage, getThreadsForProject } = useThreadsStore();
const activeThread = useActiveThread();
```

**Migrated Usage**:
```typescript
// Store actions remain the same (use composed store)
const store = useThreadsStore();
const { createThread, addMessage, updateMessage, getThreadsForProject } = store;

// Slice-specific hooks for reactive state
const activeThread = useActiveThread();
```

### 3.2 AgentChatPanel.tsx

**Current Usage**:
```typescript
const { threads, createThread, setActiveThread, pruneContextWindow } = useThreadsStore();
```

**Migrated Usage**:
```typescript
// Continue using main store for complex operations
const store = useThreadsStore();
const { threads, createThread, setActiveThread, pruneContextWindow } = store;
```

### 3.3 ThreadFolderTree.tsx

**Current Usage**:
```typescript
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';
import type { ThreadHierarchyNode } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

const activeThread = useActiveThread();
const { getThreadHierarchy } = useThreadsStore();
```

**Migrated Usage**:
```typescript
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/slices/project-scope-slice';
import type { ThreadHierarchyNode } from '@/infrastructure/persistence/stores/conversation/conversation-types';

const activeThread = useActiveThread();
const { getThreadHierarchy } = useThreadsStore(); // Still works from main store
```

### 3.4 Type-Only Imports (All Files)

**Simple Find & Replace**:
```bash
# Command to update all type imports
grep -r "from.*conversation-threads-store" --include="*.tsx" --include="*.ts" src/infrastructure/persistence/stores/conversation/ | grep "type" | cut -d: -f1 | sort | uniq
```

**Manual Update**:
Change:
```typescript
import type { ConversationThread } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';
```

To:
```typescript
import type { ConversationThread } from '@/infrastructure/persistence/stores/conversation/conversation-types';
```

---

## 4. Testing Your Migration

### 4.1 Smoke Tests

After migrating each component, run these tests:

```bash
# Start development server
pnpm dev

# Test these scenarios:
# 1. Create new conversation (thread)
# 2. Add message to conversation
# 3. Switch between threads
# 4. Create child thread
# 5. Delete thread
# 6. Check thread hierarchy in sidebar
```

### 4.2 Component-Specific Tests

| Component | Test Scenario | Expected Result |
|-----------|---------------|------------------|
| `ChatPanelWrapper` | Create thread | New thread appears in list |
| `AgentChatPanel` | Add message | Message appears with streaming |
| `ThreadFolderTree` | Create child thread | Tree structure updates |
| `ThreadCard` | Delete thread | Card disappears from list |

---

## 5. Troubleshooting

### 5.1 Common Issues

#### Issue: Import Not Found
```typescript
// Error: Module not found
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/slices/project-scope-slice';
```

**Solution**: Make sure you're importing from the correct path:
```typescript
// Correct path
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/slices/project-scope-slice';
```

#### Issue: Type Not Found
```typescript
// Error: Type 'ConversationThread' not found
```

**Solution**: Update import to use conversation-types:
```typescript
// Before
import type { ConversationThread } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

// After
import type { ConversationThread } from '@/infrastructure/persistence/stores/conversation/conversation-types';
```

#### Issue: Hook Not Working
```typescript
// Error: Custom hook "useActiveThread" is called conditionally
```

**Solution**: Ensure hook is called at the top level of component:
```typescript
// ✅ Correct
function MyComponent() {
    const activeThread = useActiveThread();
    // ...
}

// ❌ Incorrect
function MyComponent() {
    const activeThread = someCondition ? useActiveThread() : null;
}
```

### 5.2 Rollback Strategy

If issues occur, rollback to previous state:

```bash
# Revert import changes
git checkout -- src/presentation/components/chat/ChatPanelWrapper.tsx
git checkout -- src/presentation/components/ide/AgentChatPanel.tsx
# ... other files
```

---

## 6. Performance Considerations

### 6.1 After Migration

**Expected Improvements**:
- ✅ **Smaller Re-renders**: Slice-based selectors prevent unnecessary updates
- ✅ **Better Tree Shaking**: Unused code not included in bundle
- ✅ **Easier Debugging**: Each slice is independently testable

**No Regressions**:
- ✅ **Same Performance**: Critical paths (message updates) remain identical
- ✅ **Same Persistence**: Dexie sync and localStorage unchanged

### 6.2 Monitoring

After migration, monitor:
- Thread creation/update performance
- Memory usage (should be same or better)
- Bundle size (should be smaller)

---

## 7. Timeline & Checklist

### 7.1 Migration Checklist

- [ ] Phase 1: No breaking changes ✅
- [ ] Update `ThreadFolderTree.tsx` hook import
- [ ] Update `AgentChatPanel.tsx` (if needed)
- [ ] Update `AgentChatConversationManager.tsx` (if needed)
- [ ] Update all type-only imports
- [ ] Test all conversation functionality
- [ ] Update documentation
- [ ] Phase 3: Remove deprecated exports

### 7.2 Phase Dates

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Phase 1 | 2026-01-02 | TBA | Ongoing |
| Phase 2 | TBA | TBA | 1-2 weeks |
| Phase 3 | TBA | TBA | 1 week |

---

## 8. Help & Support

### 8.1 Resources

1. **Architecture Analysis**: `_bmad-output/conversation-threads-store-analysis-2026-01-02.md`
2. **Implementation Plan**: `_bmad-output/conversation-threads-store-slice-plan-2026-01-02.md`
3. **Type Definitions**: `src/infrastructure/persistence/stores/conversation/conversation-types.ts`

### 8.2 Contact

- **Architecture Questions**: Reference the analysis documents
- **Implementation Help**: Follow the step-by-step migration guide
- **Issues Found**: Create GitHub issue with "conversation-threads-migration" label

---

## 9. FAQ

### Q: Do I need to migrate immediately?
**A**: No. Phase 1 provides zero breaking changes. You can migrate when convenient.

### Q: Will this affect my component's performance?
**A**: No. Performance will be the same or better due to optimized re-renders.

### Q: How do I access store actions after migration?
**A**: Continue using `useThreadsStore()` for actions. Only specific hooks moved to slices.

### Q: What about tests?
**A**: Existing tests continue to work. New slice-specific tests will be added.

---

**Remember**: This is a gradual migration with zero breaking changes. Take your time and test each change thoroughly.