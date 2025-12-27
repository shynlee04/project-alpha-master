# **5. Component Library & Design System**

### **5.1 Color System (i18n-aware)**

```typescript
// Semantic tokens (EN/VI labels in tooltips)
const colors = {
  background: {
    DEFAULT: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(217.2, 32.6%, 17.5%)',
    tooltip: { en: 'Main background', vi: 'Nền chính' }
  },
  primary: {
    DEFAULT: 'hsl(217.2, 91.2%, 59.8%)',
    foreground: 'hsl(222.2, 47.4%, 11.2%)',
    tooltip: { en: 'Primary actions', vi: 'Hành động chính' }
  },
  agent: {
    active: 'hsl(142, 76%, 36%)',    // Green
    paused: 'hsl(38, 92%, 50%)',      // Yellow
    error: 'hsl(0, 84%, 60%)',        // Red
    idle: 'hsl(215, 20%, 65%)',       // Gray
  },
};
```

***

### **5.2 Typography (Multilingual)**

```css
/* Primary font stack (supports Vietnamese diacritics) */
body {
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

/* Code font */
code, pre {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Vietnamese-specific adjustments */
html[lang="vi"] {
  letter-spacing: -0.01em; /* Tighter for diacritics */
}
```

***

### **5.3 Key UI Components**

#### **5.3.1 Agent Status Badge**

```typescript
<AgentStatusBadge 
  status="active" // active | paused | error | idle
  size="sm" // sm | md | lg
  showLabel={true}
/>

// Renders:
// ● Active (EN) | ● Đang hoạt động (VI)
```

***

#### **5.3.2 Tool Execution Badge**

```typescript
<ToolBadge
  name="write_file"
  status="success" // running | success | error
  duration={245} // ms
/>

// Renders:
// ✓ write_file (0.2s)
```

***

#### **5.3.3 Approval Dialog**

```typescript
<ApprovalDialog
  title={{ en: 'Agent Proposal', vi: 'Đề xuất của Agent' }}
  description="Coder wants to modify 3 files"
  changes={[
    { type: 'create', file: 'LoginForm.tsx' },
    { type: 'modify', file: 'auth.ts', lines: '+15/-3' },
  ]}
  onApprove={() => {}}
  onReject={() => {}}
  onModify={() => {}}
/>
```

***
