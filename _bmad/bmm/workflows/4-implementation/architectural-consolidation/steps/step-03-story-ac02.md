# Step 3: Story AC-02 - Agent Selector Unification

**Story Goal:** Create unified AgentSelector component with variants across all workspaces.

---

## 3.1 PRE-IMPLEMENTATION RESEARCH

### Required Research

#### Research R1: Current AgentSelector Implementation
```
Tool: Codebase search
Query: Find "AgentSelector" component and its current usage
Files to examine:
  - src/components/agent/AgentSelector.tsx
  - Usage in src/components/ide/
  - Usage in src/components/chat/
```

#### Research R2: Workspace Layout Patterns
```
Tool: Codebase search
Query: Find workspace page components
Files to examine:
  - src/components/knowledge/KnowledgePage.tsx
  - src/components/study/StudyPage.tsx
  - src/components/notes/NotePage.tsx
```

**CHECKPOINT: Research Complete**
- [ ] AgentSelector current implementation understood
- [ ] Workspace layouts documented
- [ ] Integration points identified

---

## 3.2 IMPLEMENTATION TASKS

### Task T1: Enhance AgentSelector with Variants

**File:** `src/components/agent/AgentSelector.tsx` (MODIFY)

**Add variant prop:**
```typescript
interface AgentSelectorProps {
  variant?: 'full' | 'compact' | 'minimal';
  workspaceType?: 'ide' | 'knowledge' | 'study' | 'notes';
  className?: string;
  onAgentChange?: (agentId: string) => void;
}

export function AgentSelector({
  variant = 'full',
  workspaceType = 'ide',
  className,
  onAgentChange,
}: AgentSelectorProps) {
  const { agents, activeAgentId, setActiveAgent } = useAgentsStore();
  
  const handleAgentChange = (agentId: string) => {
    setActiveAgent(agentId);
    
    // Emit event for cross-workspace sync
    emitStoreEvent<AgentSelectedPayload>(EVENTS.AGENT_SELECTED, {
      agentId,
      workspaceType,
    });
    
    onAgentChange?.(agentId);
  };
  
  // Render based on variant
  if (variant === 'minimal') {
    return <MinimalAgentSelector {...} />;
  }
  
  if (variant === 'compact') {
    return <CompactAgentSelector {...} />;
  }
  
  return <FullAgentSelector {...} />;
}
```

**CHECKPOINT: Task T1 Complete**
- [ ] Variant prop added
- [ ] Event emission added
- [ ] TypeScript compiles

---

### Task T2: Wire AgentSelector to Knowledge Workspace

**File:** `src/components/knowledge/KnowledgePage.tsx` (MODIFY)

**Add agent selector to header:**
```typescript
import { AgentSelector } from '@/components/agent/AgentSelector';

export function KnowledgePage() {
  return (
    <div className="knowledge-page flex flex-col h-full">
      {/* Workspace Header with Agent Selector */}
      <header className="flex items-center justify-between gap-4 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Knowledge Synthesis</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <AgentSelector 
            variant="compact" 
            workspaceType="knowledge" 
          />
        </div>
      </header>
      
      {/* Existing page content */}
      <main className="flex-1 overflow-hidden">
        {/* ... existing content ... */}
      </main>
    </div>
  );
}
```

**CHECKPOINT: Task T2 Complete**
- [ ] AgentSelector visible in Knowledge workspace
- [ ] Compact variant displays correctly

---

### Task T3: Wire AgentSelector to Study Workspace

**File:** `src/components/study/StudyPage.tsx` (MODIFY)

**Add agent selector similar to Knowledge:**
```typescript
import { AgentSelector } from '@/components/agent/AgentSelector';

// Add to header section:
<AgentSelector 
  variant="compact" 
  workspaceType="study" 
/>
```

**CHECKPOINT: Task T3 Complete**
- [ ] AgentSelector visible in Study workspace

---

### Task T4: Wire AgentSelector to Notes Workspace

**File:** `src/components/notes/NotePage.tsx` (MODIFY)

**Add agent selector:**
```typescript
import { AgentSelector } from '@/components/agent/AgentSelector';

// Add to header section:
<AgentSelector 
  variant="compact" 
  workspaceType="notes" 
/>
```

**CHECKPOINT: Task T4 Complete**
- [ ] AgentSelector visible in Notes workspace

---

### Task T5: Create Compact Variant Styling

If compact variant doesn't exist, create it:

```typescript
function CompactAgentSelector({ 
  agents, 
  activeAgentId, 
  onSelect 
}: CompactProps) {
  const activeAgent = agents.find(a => a.id === activeAgentId);
  
  return (
    <Select value={activeAgentId} onValueChange={onSelect}>
      <SelectTrigger className="w-[180px] h-8">
        <div className="flex items-center gap-2">
          <span className="text-sm">{activeAgent?.name || 'Select Agent'}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            <div className="flex items-center gap-2">
              <span>{agent.name}</span>
              {agent.providerId && (
                <span className="text-xs text-muted-foreground">
                  {agent.providerId}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**CHECKPOINT: Task T5 Complete**
- [ ] Compact variant styled
- [ ] Matches design system

---

## 3.3 ACCEPTANCE CRITERIA VALIDATION

| AC | Criteria | Test Method | Status |
|----|----------|-------------|--------|
| AC-02.1 | AgentSelector visible in Knowledge | Navigate to /knowledge | [ ] |
| AC-02.2 | AgentSelector visible in Study | Navigate to /study | [ ] |
| AC-02.3 | AgentSelector visible in Notes | Navigate to /notes | [ ] |
| AC-02.4 | Variant prop working | Verify compact display | [ ] |

---

## 3.4 SWEEPING VALIDATION

Run these Level 3 (Naming Consistency) checks:

- [ ] **Prop Naming:** `agentId` everywhere (not `id`, `agentUUID`)
- [ ] **Event Handler Convention:** `handleAgentChange` internal, `onAgentChange` prop
- [ ] **Component Naming:** PascalCase consistently

Run Level 6 (Architecture Compliance) checks:

- [ ] **No direct db access:** Components use store actions only
- [ ] **Event emission:** Cross-workspace sync via event bus

---

## NEXT STEP

When all acceptance criteria pass:
1. Update story status to DONE
2. Generate handoff artifact
3. Load `step-04-story-ac03.md` for Chat Panel Standardization

**HALT and WAIT for user to confirm story completion.**
