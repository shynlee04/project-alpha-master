# React Component Refactoring Research - January 2026

**Research Date:** 2026-01-02
**Tool Turns:** 8 MCP research operations
**Purpose:** Guide refactoring of 313-line Dialog component to <200 lines

---

## Executive Summary

This research synthesizes best practices from React official documentation, Radix UI patterns, and 2026 community standards for component refactoring. Key findings emphasize **composition over extraction**, **type-safe forwardRef patterns**, and **co-located type organization**.

---

## 1. Component Composition Patterns (React Official)

### 1.1 Custom Hook Extraction Principles

**Source:** react.dev official documentation (January 2026)

**Key Principle:** Extract when you have repetitive logic, not just large components.

```javascript
// ❌ ANTI-PATTERN: Premature extraction
// Don't extract simply because component is "large"

// ✅ CORRECT: Extract repetitive patterns
function ShippingForm({ country }) {
  const cities = useData(`/api/cities?country=${country}`);
  const [city, setCity] = useState(null);
  const areas = useData(city ? `/api/areas?city=${city}` : null);
  // Component stays focused on rendering
}
```

**Best Practices:**
1. **Name hooks after their purpose** (e.g., `useChatRoom`, `useImpressionLog`)
2. **Extract repetitive useEffect patterns** into reusable hooks
3. **Keep components declarative** - logic in hooks, rendering in components
4. **Follow "5 lines before return" guideline** - if >5 lines of logic before return, consider hook extraction

### 1.2 Component Splitting Guidelines

**Community Consensus (2026):**
- **200 lines** is the practical upper limit for components
- **40 lines** is ideal for individual functions within components
- **Extract when actual need arises**, not proactively

```javascript
// ✅ CORRECT: Extract when logic repeats or complexity emerges
function ReportList({ items }) {
  return (
    <article>
      {items.map(item => (
        <Report key={item.id} item={item} /> // Extracted for memoization
      ))}
    </article>
  );
}

function Report({ item }) {
  const data = useMemo(() => calculateReport(item), [item]);
  return <figure><Chart data={data} /></figure>;
}
```

---

## 2. Radix UI Dialog Composition Patterns

### 2.1 Type-Safe Custom Components

**Source:** Radix UI DeepWiki documentation (January 2026)

**Core Pattern:** Use `React.forwardRef` with proper type extraction

```typescript
// ✅ RECOMMENDED: Type-safe custom Dialog component
import * as Dialog from '@radix-ui/react-dialog';

type DialogContentElement = React.ComponentRef<typeof Dialog.Content>;
type DialogContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  // Add your custom props here
  className?: string;
};

const CustomDialogContent = React.forwardRef<DialogContentElement, DialogContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Dialog.Content {...props} ref={forwardedRef} className={className}>
      {children}
    </Dialog.Content>
  )
);

CustomDialogContent.displayName = 'CustomDialogContent';
```

**Key Benefits:**
- Full type compatibility with base primitives
- Ref forwarding works correctly
- Custom props are type-safe
- IntelliSense shows all available props

### 2.2 Composable Subcomponent Pattern

**Source:** Radix UI official documentation

**Pattern:** Extract compound components for better API design

```typescript
// ✅ RECOMMENDED: Compound component pattern
import * as Dialog from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';

// Abstract Overlay and Close button into simplified API
export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ children, ...props }, forwardedRef) => (
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content {...props} ref={forwardedRef}>
      {children}
      <Dialog.Close aria-label="Close">
        <Cross1Icon />
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
));

export const Dialog = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;

// Usage
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>
```

### 2.3 Extending Base Props with Omit

**Use Case:** Restrict specific props when wrapping

```typescript
// ✅ Use Omit to prevent consumers from overriding critical handlers
type AlertDialogContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof Dialog.Content>,
  'onPointerDownOutside' | 'onInteractOutside'
> & {
  // Add custom props
};

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  AlertDialogContentProps
>((props, ref) => (
  <Dialog.Content
    {...props}
    ref={ref}
    onPointerDownOutside={(e) => e.preventDefault()}
    onInteractOutside={(e) => e.preventDefault()}
  />
));
```

### 2.4 Scope Pattern for Context

**Pattern:** Pass through `__scopeDialog` for multiple dialogs

```typescript
const CustomDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ __scopeDialog, ...props }, ref) => (
  <Dialog.Content __scopeDialog={__scopeDialog} {...props} ref={ref} />
));
```

---

## 3. TypeScript Type Organization (2026 Standards)

### 3.1 Co-location Principle

**Source:** TotalTypeScript, Wisp.blog (March 2025)

**Golden Rule:** **Define types where they're used**

```typescript
// ✅ RECOMMENDED: Co-locate single-use types
// Component.tsx
interface UserFormProps {
  user: User;
  onSubmit: (data: UserData) => void;
}

export function UserForm({ user, onSubmit }: UserFormProps) {
  // Component logic
}

// ✅ ALSO GOOD: Inline for very simple types
export function UserForm({ user, onSubmit }: {
  user: User;
  onSubmit: (data: UserData) => void;
}) {
  // Component logic
}
```

**Type Organization Hierarchy:**
1. **Inline** - Types only used once in component
2. **Co-located file** - Types used by multiple components in same feature
3. **Shared location** - Types used across features
4. **Shared package** - Types used across monorepo

### 3.2 Folder Structure (2025-2026 Standards)

**Principle:** Organize by features, not file types

```
src/
  features/
    agent/
      components/
        AgentConfigDialog.tsx          # Main component
        AgentConfigDialog.types.ts     # Co-located types
        AgentConfigDialog.hooks.ts     # Extracted hooks
        AgentPermissions/
          PermissionGrid.tsx           # Subcomponent
          PermissionGrid.types.ts      # Subcomponent types
```

**Key Principles:**
- **Co-location keeps related files together**
- **Feature-based structure scales better**
- **Test files adjacent to source** (`__tests__/`)

---

## 4. React Hooks Extraction Patterns (2026)

### 4.1 When to Extract Custom Hooks

**Source:** React official docs + Community consensus (2025-2026)

**Extract When:**
1. **Logic repeats across components** (e.g., data fetching, form state)
2. **>5 lines of logic before return statement**
3. **Complex useEffect patterns** (multiple related effects)
4. **Stateful logic that could be reused**

```javascript
// ❌ BEFORE: Repeated data fetching pattern
function ComponentA() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(url).then(res => res.json()).then(json => {
      if (!ignore) setData(json);
    });
    return () => { ignore = true; };
  }, [url]);
}

function ComponentB() {
  // Same pattern repeated...
}

// ✅ AFTER: Extract to custom hook
function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(url).then(res => res.json()).then(json => {
      if (!ignore) setData(json);
    });
    return () => { ignore = true; };
  }, [url]);
  return data;
}

function ComponentA() {
  const data = useData(url); // Clean!
}
```

### 4.2 Hook Naming Conventions

**Pattern:** `use` prefix + descriptive name

```javascript
// ✅ GOOD: Names after purpose
useChatRoom({ serverUrl, roomId });
useImpressionLog('visit_chat', { roomId });
useOnlineStatus();

// ❌ BAD: Generic names
useData();
useFetch();
useEffect();
```

### 4.3 Hook Organization (2026 Best Practices)

**Co-locate hooks with components:**

```
components/
  AgentConfigDialog.tsx          # Main component
  AgentConfigDialog.hooks.ts     # Extracted hooks
  useAgentFormState.ts           # Reusable hook
  useAgentPermissions.ts         # Reusable hook
```

---

## 5. Component Size Guidelines (2026 Community Standards)

### 5.1 Practical Limits

**Community Consensus (Reddit, StackOverflow 2025-2026):**

| Metric | Recommendation | Source |
|--------|---------------|--------|
| **Component max lines** | 200 lines | Reddit r/reactjs |
| **Function max lines** | 40 lines | Quora senior devs |
| **Logic before return** | 5 lines | Blog.rstankov.com |
| **Nesting depth** | 3 levels | Clean code standards |

### 5.2 God Component Anti-Pattern

**Characteristics:**
- >200 lines of code
- Multiple unrelated concerns
- Deeply nested logic
- Hard to test and maintain

**Refactoring Strategy:**
1. **Extract custom hooks** for stateful logic
2. **Split into subcomponents** for UI sections
3. **Use compound component pattern** for related components
4. **Co-locate types** in separate files if >5 types

---

## 6. Compound Component Pattern (2026)

### 6.1 When to Use Compound Components

**Best For:**
- Related components that share state
- Avoiding prop drilling
- Building flexible, composable APIs

```typescript
// ✅ Compound component pattern
interface CardComponents {
  Root: React.FC<CardRootProps>;
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
}

const Card: CardComponents = {
  Root: ({ children }) => <div className="card">{children}</div>,
  Header: ({ children }) => <div className="card-header">{children}</div>,
  Content: ({ children }) => <div className="card-content">{children}</div>,
  Footer: ({ children }) => <div className="card-footer">{children}</div>,
};

// Usage
<Card.Root>
  <Card.Header>Title</Card.Header>
  <Card.Content>Body</Card.Content>
  <Card.Footer>Actions</Card.Footer>
</Card.Root>
```

### 6.2 Type-Safe Compound Components

```typescript
// ✅ TypeScript best practices for compound components
import React from 'react';

interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
}

export const Card: CardComponent = (({ children }) => (
  <div className="card">{children}</div>
)) as CardComponent;

Card.Header = ({ children }) => <div className="card-header">{children}</div>;
Card.Content = ({ children }) => <div className="card-content">{children}</div>;
```

---

## 7. Performance Considerations (2026)

### 7.1 Memoization with Extracted Components

**Pattern:** Extract list items for proper memoization

```typescript
// ✅ CORRECT: Extract for useMemo
function ReportList({ items }) {
  return (
    <article>
      {items.map(item => (
        <Report key={item.id} item={item} />
      ))}
    </article>
  );
}

function Report({ item }) {
  // ✅ Call useMemo at top level of extracted component
  const data = useMemo(() => calculateReport(item), [item]);
  return <figure><Chart data={data} /></figure>;
}
```

### 7.2 Small Components Enable Better Optimization

**Benefits:**
- Easier to memoize specific parts
- Reduced re-render scope
- Better React.memo effectiveness
- Easier to test

---

## 8. Recommended Refactoring Approach for 313-Line Dialog

### 8.1 Step-by-Step Strategy

**Phase 1: Extract Hooks (Target: -50 lines)**
```typescript
// Extract form state logic
function useAgentFormState(initialAgent) {
  const [agent, setAgent] = useState(initialAgent);
  const [errors, setErrors] = useState({});

  const updateField = (field: string, value: any) => {
    setAgent(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    // Validation logic
  };

  return { agent, errors, updateField, validate };
}
```

**Phase 2: Split Subcomponents (Target: -80 lines)**
```typescript
// Extract Dialog sections
const DialogHeader = ({ title, subtitle }) => (
  <div className="dialog-header">
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

const DialogFooter = ({ actions }) => (
  <div className="dialog-footer">
    {actions.map(action => <button key={action.id}>{action.label}</button>)}
  </div>
);
```

**Phase 3: Co-locate Types (Target: -30 lines)**
```typescript
// AgentConfigDialog.types.ts
export interface AgentConfigDialogProps {
  agent: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

export interface AgentFormState {
  agent: Agent;
  errors: Record<string, string>;
}
```

**Phase 4: Use Compound Pattern (Target: -53 lines)**
```typescript
// Result: <200 lines main component
const AgentConfigDialog = ({ agent, onSave, onCancel }: AgentConfigDialogProps) => {
  const { agent: formData, updateField, validate } = useAgentFormState(agent);

  return (
    <Dialog.Root>
      <DialogHeader {...formData} />
      <DialogBody agent={formData} onChange={updateField} />
      <DialogFooter onSave={() => onSave(formData)} onCancel={onCancel} />
    </Dialog.Root>
  );
};
```

### 8.2 Expected Outcome

**Before:** 313 lines (god component)
**After:** ~180 lines split across 6 files
- `AgentConfigDialog.tsx` - 80 lines (main orchestration)
- `AgentConfigDialog.types.ts` - 30 lines
- `AgentConfigDialog.hooks.ts` - 40 lines
- `DialogHeader.tsx` - 15 lines
- `DialogBody.tsx` - 40 lines
- `DialogFooter.tsx` - 25 lines

**Benefits:**
- ✅ Type-safe with proper forwardRef patterns
- ✅ Testable (hooks and components in isolation)
- ✅ Maintainable (clear separation of concerns)
- ✅ Reusable (hooks and subcomponents can be shared)
- ✅ Performance (better memoization granularity)

---

## 9. Key Takeaways

1. **Composition > Extraction** - Use compound components, not arbitrary splitting
2. **Co-locate Types** - Define types where they're used, not in separate global files
3. **Extract When Needed** - Don't prematurely extract; wait for actual repetition
4. **Type-Safe forwardRef** - Always use proper type extraction with Radix UI
5. **200 Line Limit** - Practical upper bound for component size
6. **Custom Hooks for Logic** - Extract stateful logic, not UI rendering
7. **Feature-Based Structure** - Organize by domain, not file type

---

## 10. Sources

### React Official Documentation
- [React.dev - Reusing Logic with Custom Hooks](https://18.react.dev/learn/reusing-logic-with-custom-hooks)
- [React.dev - useMemo Reference](https://18.react.dev/reference/react/useMemo)

### Radix UI Documentation
- [Radix UI Primitives - Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Radix UI - Composition Guide](https://www.radix-ui.com/primitives/docs/guides/composition)
- [Radix UI DeepWiki - Dialog Composition](https://github.com/radix-ui/primitives)

### TypeScript Organization
- [TotalTypeScript - Type Organization](https://www.totaltypescript.com/where-to-put-your-types-in-application-code)
- [Wisp.blog - React Type Organization](https://www.wisp.blog/blog/how-should-i-organize-my-types-as-a-react-developer)

### Community Best Practices
- [MakersDen - React Component Composition](https://makersden.io/blog/guide-on-react-component-composition)
- [DeveloperWay - Component Composition](https://www.developerway.com/posts/components-composition-how-to-get-it-right)
- [Vercel Academy - Compound Components](https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition)
- [Patterns.dev - Compound Pattern](https://www.patterns.dev/react/compound-pattern/)

### Component Size & Refactoring
- [Reddit r/reactjs - Component Size Limits](https://www.reddit.com/r/reactjs/comments/sjgp9d/how_many_lines_of_code_in_a_component_is)
- [Alex Kondov - Refactoring Messy Components](https://alexkondov.com/refactoring-a-messy-react-component/)
- [Rado's Blog - Extract React Hook Refactoring](https://blog.rstankov.com/extract-react-hook-refactoring/)

---

**Document Status:** ✅ COMPLETE
**Next Action:** Apply refactoring patterns to AgentConfigDialog.tsx (313 → <200 lines)
**Estimated Effort:** 6-8 hours for complete refactoring with tests
