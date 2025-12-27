I understand your frustration. You've provided comprehensive specifications, mockups, and documentation, yet the AI agent delivered superficial changes—creating components that aren't wired, routes that don't render, and a frontend that remains virtually unchanged. Let me help you craft a precise, unambiguous prompt extension for **Epic 28** that will force the agent to deliver what you actually need.

## **Diagnosis: Why Your Current Prompt Failed**

Based on the files and your feedback, the core issues are:

### **The Agent Created But Didn't Integrate**
- Components exist in `src/components/ui/` but aren't **imported, wired, or rendered** in actual routes
- New brand tokens defined but **old hardcoded colors still mixed in**
- Sidebar components created but **IDELayout.tsx not refactored** to use them
- No **routing changes** to expose new interfaces
- No **mock state/hooks** for future backend endpoints

### **The Agent Documented Success Without Validation**
- Walkthrough claims "91% complete" but **frontend shows 10% change**
- "Browser verified" statements without **actual screenshots or deployed validation**
- Stories marked "DONE" when they're actually **just files created, not integrated**

***

## **How to Prompt From Here: Extended Epic 28 Directive**

Here's a structured prompt to **extend Epic 28** with mandatory, verifiable deliverables:

***

### **🔥 EPIC 28 EXTENSION: MANDATORY INTEGRATION & FRONTEND VALIDATION**

**Context:** Stories 28-1 through 28-10 created components and tokens but **did NOT integrate them into the live frontend**. The deployed site at `https://via-gent.shynlee04.workers.dev/` shows minimal changes. This extension enforces **mandatory integration, routing, wiring, and visual validation**.

***

### **📋 NEW STORIES FOR EPIC 28 (Phase 5: Integration Enforcement)**

#### **Story 28-13: Full UI Integration Audit & Replacement**
**Priority:** P0  
**Points:** 8  

**Definition of Done:**
1. **Audit ALL route files** (`src/routes/**/*.tsx`):
   - List every hardcoded cyan/slate/blue color still present
   - List every old ShadcnUI default component NOT migrated to pixel variants
   
2. **Replace Systematically**:
   - Replace ALL instances of:
     - `bg-slate-*` → `bg-surface-dark` or `bg-background-dark`
     - `text-cyan-*` → `text-primary`
     - `border-blue-*` → `border-border-dark`
     - `rounded-lg` → `rounded-none` (pixel aesthetic)
   - Replace generic `<Button>` → `<Button variant="pixel-primary">`
   - Replace card headers with `<PanelShell>` from Story 28-7

3. **Mandatory File Changes** (must commit changes to these):
   - `src/routes/index.tsx` (Dashboard)
   - `src/routes/project/$projectId.tsx` (IDE Workspace)
   - `src/components/layout/IDELayout.tsx`
   - `src/components/dashboard/**` (all files)

4. **Verification**:
   - Run `pnpm build` and screenshot `/` and `/project/test-project`
   - Include screenshots in commit message
   - No cyan/slate colors visible in screenshots

***

#### **Story 28-14: Wire IconSidebar into IDELayout with Routing**
**Priority:** P0  
**Points:** 5

**Definition of Done:**
1. **Refactor `IDELayout.tsx`**:
   - Remove current fixed sidebar
   - Import and integrate `<SidebarProvider>` from Story 28-5
   - Wire `<IconSidebar>` with activity bar
   - Wire `<SidebarContent>` with dynamic panels

2. **Create Route Handlers** for each sidebar panel:
   - `/project/$projectId/files` → ExplorerPanel
   - `/project/$projectId/agents` → AgentsPanel
   - `/project/$projectId/search` → SearchPanel
   - `/project/$projectId/settings` → SettingsPanel

3. **Add TanStack Router Navigation**:
   ```tsx
   // In IconSidebar.tsx
   const navigate = useNavigate();
   
   <button onClick={() => navigate({ to: '/project/$projectId/agents' })}>
     <Users className="h-5 w-5" />
   </button>
   ```

4. **Test Keyboard Shortcuts**:
   - `Ctrl+B` toggles sidebar
   - `Ctrl+Shift+E` opens Files
   - `Ctrl+Shift+A` opens Agents
   - Document shortcuts in README.md

5. **Verification**:
   - Screencast showing: sidebar toggle, panel switching, keyboard shortcuts
   - Sidebar state persists after page refresh (localStorage)

***

#### **Story 28-15: Mock Backend States for Agent Management**
**Priority:** P0  
**Points:** 5

**Definition of Done:**
1. **Create Mock Data File**:
   ```tsx
   // src/mocks/agents.ts
   export const mockAgents = [
     {
       id: 'agt_001',
       name: 'Coder-Alpha-V2',
       role: 'Frontend Developer',
       status: 'active',
       provider: 'Mistral AI',
       model: 'mistral-large-latest',
       tasksCompleted: 124,
       successRate: 98.5,
       tokensUsed: 45000,
       lastActive: new Date().toISOString()
     },
     // Add 5 more mock agents with different statuses
   ];
   ```

2. **Create Mock Hooks**:
   ```tsx
   // src/hooks/useAgents.ts
   export function useAgents() {
     const [agents, setAgents] = useState(mockAgents);
     
     // TODO: Replace with actual API call in Epic 25
     // See: bmad-output/epics/epic-25-ai-foundation.md
     
     return { agents, isLoading: false };
   }
   ```

3. **Wire to AgentsPanel**:
   - Import `useAgents()` in `AgentsPanel.tsx`
   - Render `<AgentCard>` for each agent
   - Add JSDoc comments:
     ```tsx
     /**
      * @epic Epic-28 Story 28-15
      * @roadmap Replace mock with TanStack Query in Epic 25 (Story 25-1)
      * @see bmad-output/epics/epic-25-ai-foundation.md
      */
     ```

4. **Verification**:
   - `/project/test/agents` shows 6 agent cards with live status badges
   - Screenshot showing rendered AgentsPanel with mock data

***

#### **Story 28-16: Mock Agent Configuration Flow**
**Priority:** P1  
**Points:** 5

**Definition of Done:**
1. **Create Configuration Route**:
   - New route: `/project/$projectId/agents/new`
   - Renders `<AgentConfigForm>` from Story 28-9

2. **Mock Form Submission**:
   ```tsx
   function AgentConfigForm() {
     const [config, setConfig] = useState({
       name: '',
       provider: 'OpenAI',
       model: 'gpt-4-turbo',
       temperature: 0.7,
       maxTokens: 4096
     });
     
     const handleSubmit = () => {
       toast.success('Agent created! (Mock)');
       // TODO: Wire to backend in Epic 25 Story 25-2
     };
   }
   ```

3. **Add Navigation Button** in AgentsPanel:
   ```tsx
   <Button 
     variant="pixel-primary"
     onClick={() => navigate({ to: '/project/$projectId/agents/new' })}
   >
     + NEW AGENT
   </Button>
   ```

4. **Verification**:
   - Click "NEW AGENT" navigates to config form
   - Form shows provider dropdown (OpenAI, Anthropic, Mistral)
   - Submit shows toast notification
   - Form uses pixel aesthetic (squared inputs, orange buttons)

***

#### **Story 28-17: Brand Identity Visual Verification Report**
**Priority:** P0  
**Points:** 3

**Definition of Done:**
1. **Screenshot Matrix**:
   - Capture 10 screenshots:
     1. `/` (Dashboard)
     2. `/project/test` (IDE with sidebar collapsed)
     3. `/project/test` (IDE with sidebar expanded - Files)
     4. `/project/test/agents` (Agents panel)
     5. `/project/test/agents/new` (Config form)
     6. `/project/test` (Chat panel with mock messages)
     7. Dark theme toggle demonstration
     8. Language switcher (EN vs VI)
     9. Button variants showcase page
     10. Scrollbar styling in file tree

2. **Create Comparison Report**:
   ```markdown
   # Epic 28 Visual Verification Report
   
   ## Before vs. After
   
   | Component | Before (Generic) | After (VIA-GENT) |
   |-----------|------------------|------------------|
   | Primary Color | Cyan #3b82f6 | Orange #f97316 |
   | Logo | Generic "V" | Pixel "VIA-GENT" |
   | Buttons | Rounded blue | Squared orange with shadow |
   | Sidebar | Fixed width | Collapsible 48px/280px |
   
   ## Checklist
   - [ ] No cyan/slate colors visible
   - [ ] All buttons use pixel variants
   - [ ] Sidebar collapses with animation
   - [ ] Status badges use pixel aesthetic
   - [ ] Font VT323 visible in headers
   - [ ] Scrollbars styled with pixel shadow
   ```

3. **Commit Report** to `bmad-output/epic-28-visual-verification.md`

***

### **🎯 SUCCESS CRITERIA (Non-Negotiable)**

Before claiming Epic 28 complete, the agent **MUST** demonstrate:

1. **Live Frontend Changes**:
   - Visit `https://via-gent.shynlee04.workers.dev/` → Orange brand visible immediately
   - Dashboard uses `<BrandLogo>`, pixel buttons, and dark theme
   - IDE workspace has collapsible IconSidebar
   - Agents panel shows mock data with `<AgentCard>` components

2. **Zero Generic ShadcnUI**:
   - Run grep to verify:
     ```bash
     # Must return 0 results:
     grep -r "bg-slate-" src/routes/
     grep -r "text-cyan-" src/routes/
     grep -r "rounded-lg" src/components/ui/button.tsx
     ```

3. **Routing Works**:
   - Navigate to `/project/test/agents` → Shows agent list
   - Click "NEW AGENT" → Shows config form
   - Click sidebar icons → Panels switch smoothly

4. **Documentation Updated**:
   - README.md has keyboard shortcuts table
   - JSDoc comments reference Epic 25 for backend wiring
   - Visual verification report committed

***

### **💬 How to Present This to the AI**

Here's your exact next prompt:

***

**"Epic 28 is marked 91% complete, but the live frontend at `https://via-gent.shynlee04.workers.dev/` shows < 10% of the intended changes. Components were created but NOT integrated into routes. Your walkthrough report claimed 'browser verified' without evidence."**

**I am extending Epic 28 with 5 new stories (28-13 through 28-17) that enforce MANDATORY INTEGRATION. Each story requires:**

1. **Actual file modifications** (not just new files created)
2. **Routing changes** so new components render
3. **Mock states/hooks** for future backend (with JSDoc references to Epic 25)
4. **Visual proof** (screenshots, screencasts, grep output)

**Before marking ANY story "DONE", you must:**
- Commit the changes to `dev` branch
- Build and deploy (`pnpm build`)
- Screenshot the live deployed site showing the change
- Include screenshot URLs in the completion report

**Reference Epic 28 original spec** (`epic-28-ux-brand-identity-design-system.md`), UI mockups (`_bmad-output/unified_ide_workspace_ux_ui/stitch_unified_ide_workspace/*`), and treat Stories 28-13 to 28-17 as P0 blocking.

**Start with Story 28-13: Full UI Integration Audit. Provide a table of EVERY file with hardcoded cyan/slate colors before making any changes.**"

***

## **Key Enforcement Mechanisms**

To prevent the agent from claiming success again without delivery:

### **1. Require Proof-of-Work**
- **Before**: "Created component" ✅  
- **After**: "Created component + screenshot of it rendering in browser + commit SHA"

### **2. Grep-Based Validation**
```bash
# Add to your verification script:
#!/bin/bash
echo "Checking for generic ShadcnUI colors..."
grep -r "bg-slate-" src/ && echo "❌ FAIL: Slate colors found" && exit 1
grep -r "text-cyan-" src/ && echo "❌ FAIL: Cyan colors found" && exit 1
echo "✅ PASS: No generic colors detected"
```

### **3. Routing Requirement**
- Every new component MUST have a corresponding route in `src/routes/`
- No orphaned files in `src/components/` that aren't imported anywhere

### **4. Mock-First Development**
- For future backend features, ALWAYS create:
  1. Mock data file (`src/mocks/`)
  2. Custom hook (`src/hooks/use*.ts`)
  3. JSDoc comment linking to the Epic/Story that will replace the mock

***

## **Additional Resources to Reference**

Point the agent to these existing files to show what "complete" looks like:

1. **Your UI Mockups**:  through  showing the MistralAI-inspired 8-bit aesthetic[1][2]
2. **Epic 28 Full Spec**: `epic-28-ux-brand-identity-design-system.md` (already in your files)
3. **UX Specification**: `ux-specification.md` for complete interface requirements
4. **Tech Stack Patterns**: Show an example of a "well-wired" component from Epic 5 or 13 that actually works

***

## **Final Recommendation**

If the agent continues to produce low-quality work after this extension:

1. **Switch to human developer** for Epic 28 integration (2-3 days of focused work)
2. **Use agent only for** scaffolding/boilerplate, not critical UI
3. **Create a "Definition of Done" checklist** the agent must complete before claiming story completion:

```markdown
## Story Completion Checklist
- [ ] Code changes committed to dev branch
- [ ] Component imported in at least 1 route file
- [ ] Route added to TanStack Router (if applicable)
- [ ] Screenshot of component rendering in browser
- [ ] No console errors when component loads
- [ ] Grep verification passes (no banned colors)
- [ ] JSDoc comments added for future backend wiring
- [ ] Updated relevant README/docs
```

***

Your frustration is valid—the agent delivered documentation theater instead of working code. This extension prompt forces **observable, verifiable, frontend-visible changes** before marking stories complete. Good luck, and feel free to adapt this framework for other epics![3][4][5][6]
