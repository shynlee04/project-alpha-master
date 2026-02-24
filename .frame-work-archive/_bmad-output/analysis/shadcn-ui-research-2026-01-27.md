# ShadcnUI Research Report: BaseUI + TanStack Integration

**Research Task ID**: UX-RESEARCH-01A/B
**Date**: 2026-01-27
**Agent**: analyst-ext
**Status**: COMPLETE

---

## Executive Summary

ShadcnUI has undergone significant evolution in late 2025/early 2026, introducing:
1. **Dual Component Library Support**: Now supports both **Radix UI** (original) AND **Base UI** as primitive foundations
2. **Interactive Project Creation**: `npx shadcn create` for customizable project scaffolding
3. **5 New Visual Styles**: Vega, Nova, Maia, Lyra, Mira
4. **MCP Server Integration**: AI-assisted component browsing and installation
5. **Full TanStack Support**: Native integration with TanStack Start and TanStack Router
6. **7 New Components** (October 2025): Spinner, Kbd, Button Group, Input Group, Field, Item, Empty

**Key Finding for Project Alpha**: The **Lyra style** is optimal for 8-bit retro aesthetic due to its "boxy and sharp" design paired with monospace fonts.

---

## 1. BaseUI Status: Migration Analysis

### Has ShadcnUI Moved from RadixUI to BaseUI?

**NO - Both are now supported equally.** As of January 2026:

| Aspect | Status |
|--------|--------|
| **Current State** | Dual support - choose during project setup |
| **Migration Required?** | NO - Radix remains fully supported |
| **API Compatibility** | Same abstraction regardless of primitive library |
| **Documentation** | Full docs for BOTH libraries (shipped January 2026) |

### How It Works

```typescript
// Works the same whether you're using Radix or Base UI
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
```

### Component Library URLs

| Library | Component Path Pattern |
|---------|----------------------|
| **Radix UI** | `/docs/components/radix/[component]` |
| **Base UI** | `/docs/components/base/[component]` |

### Base UI Integration (January 2026)

From the changelog:
- **Full Base UI docs** - Every component now has dedicated documentation for Base UI
- **Rebuilt examples** - All component examples rebuilt for both Radix and Base UI
- **Side-by-side comparison** - Easy to compare implementations across libraries

### Migration Path

For new projects:
```bash
npx shadcn create
# Select "Base UI" when prompted for component library
```

For existing projects:
- No migration path documented yet
- Components are written to match your library choice during `init`
- CLI auto-detects your library and applies correct transformations

---

## 2. TanStack Integration

### Installation Process for TanStack Router/Start Projects

#### Option A: New TanStack Start Project (Recommended)

```bash
pnpm create @tanstack/start@latest --tailwind --add-ons shadcn
```

This creates a complete TanStack Start project with:
- Tailwind CSS configured
- shadcn/ui pre-installed
- Ready-to-use component structure

#### Option B: Existing TanStack Router Project

Use the interactive setup with custom themes:
```bash
npx shadcn create
```

#### Adding Components

```bash
# Single component
pnpm dlx shadcn@latest add button

# All components
pnpm dlx shadcn@latest add --all
```

### Import Pattern

```typescript
// app/routes/index.tsx
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

### TanStack Form Support

ShadcnUI includes specific form integration for TanStack Form:
- Documentation: `/docs/forms/tanstack-form`
- Compatible with the `Field` component for complex forms

---

## 3. Complete Component Inventory

### Total Components: 56+ (as of January 2026)

#### Form Controls (11)
| Component | Description |
|-----------|-------------|
| Button | Clickable button with variants |
| Checkbox | Boolean selection control |
| Input | Text input field |
| Input Group | Input with icons, buttons, labels |
| Input OTP | One-time password input |
| Native Select | Native HTML select |
| Radio Group | Single selection from options |
| Select | Custom select dropdown |
| Slider | Range selection |
| Switch | Toggle control |
| Textarea | Multi-line text input |

#### Layout & Structure (10)
| Component | Description |
|-----------|-------------|
| Accordion | Collapsible content sections |
| Aspect Ratio | Maintain element proportions |
| Card | Container with header/content/footer |
| Collapsible | Expandable content area |
| Resizable | Resizable panels |
| Scroll Area | Custom scrollable container |
| Separator | Visual divider |
| Sidebar | Collapsible navigation sidebar |
| Skeleton | Loading placeholder |
| Table | Data table structure |

#### Navigation (8)
| Component | Description |
|-----------|-------------|
| Breadcrumb | Navigation breadcrumb trail |
| Menubar | Horizontal menu bar |
| Navigation Menu | Complex navigation system |
| Pagination | Page navigation controls |
| Tabs | Tabbed content navigation |
| Dropdown Menu | Contextual dropdown menu |
| Context Menu | Right-click context menu |
| Command | Command palette (cmdk) |

#### Overlays & Dialogs (7)
| Component | Description |
|-----------|-------------|
| Alert Dialog | Confirmation dialogs |
| Dialog | Modal dialog window |
| Drawer | Slide-in panel |
| Hover Card | Hover-triggered card |
| Popover | Positioned popup |
| Sheet | Side sheet overlay |
| Tooltip | Hover tooltip |

#### Feedback & Status (7)
| Component | Description |
|-----------|-------------|
| Alert | Alert message display |
| Badge | Status indicator badge |
| Empty | Empty state display |
| Progress | Progress indicator |
| Sonner | Toast notifications (sonner) |
| Spinner | Loading spinner |
| Toast | Toast notifications |

#### Data Display (6)
| Component | Description |
|-----------|-------------|
| Avatar | User avatar display |
| Calendar | Date picker calendar |
| Carousel | Image/content carousel |
| Chart | Data visualization |
| Data Table | Advanced data table |
| Date Picker | Date selection |

#### Utility & Misc (7)
| Component | Description |
|-----------|-------------|
| Button Group | Grouped action buttons |
| Combobox | Autocomplete select |
| Field | Form field wrapper |
| Item | List item display |
| Kbd | Keyboard key display |
| Label | Form label |
| Toggle | Toggle button |
| Toggle Group | Grouped toggles |
| Typography | Text styling utilities |

---

## 4. Block Patterns Inventory

### Available Block Categories

| Category | Examples | Use Case |
|----------|----------|----------|
| **Sidebar** | sidebar-01 through sidebar-07 | Navigation layouts |
| **Login** | login-01 through login-04 | Authentication forms |
| **Signup** | signup-01+ | Registration forms |
| **OTP** | otp-01+ | Verification flows |
| **Calendar** | calendar-01+ | Date scheduling |
| **Dashboard** | dashboard-01 | Admin interfaces |

### Featured Blocks

#### Dashboard Block (dashboard-01)
- Complete dashboard with sidebar, charts, and data table
- Includes:
  - `AppSidebar` component
  - `ChartAreaInteractive` for data viz
  - `DataTable` for tabular data
  - `SectionCards` for metrics
  - `SiteHeader` navigation

```bash
npx shadcn add dashboard-01
```

#### Sidebar Variants
- **sidebar-03**: Sidebar with submenus
- **sidebar-07**: Collapsible to icons
- **sidebar-inset**: Inset layout variant
- **sidebar-floating**: Floating variant
- **sidebar-icon**: Icon-only mode

#### Login Variants
- **login-03**: Muted background color
- **login-04**: Form with side image

### Block File Structure
```
blocks/
└── dashboard-01/
    ├── page.tsx                    # Main page
    ├── data.json                   # Sample data
    └── components/
        ├── app-sidebar.tsx
        ├── chart-area-interactive.tsx
        ├── data-table.tsx
        ├── nav-documents.tsx
        ├── nav-main.tsx
        ├── nav-secondary.tsx
        ├── nav-user.tsx
        ├── section-cards.tsx
        └── site-header.tsx
```

---

## 5. MCP Server Capabilities

### What is the ShadcnUI MCP Server?

The MCP (Model Context Protocol) server enables AI assistants to:
- **Browse Components** - List all available components from any registry
- **Search Across Registries** - Find components by name or functionality
- **Install with Natural Language** - "Add a login form"
- **Access Multiple Registries** - Public, private, and third-party sources

### Configuration for Claude Code

Add to `.mcp.json`:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

### Quick Setup
```bash
pnpm dlx shadcn@latest mcp init --client claude
```

### Example Prompts
- "Show me all available components in the shadcn registry"
- "Add the button, dialog and card components to my project"
- "Create a contact form using components from the shadcn registry"
- "Build me a landing page using hero, features and testimonials sections"

### Multi-Registry Support

Configure in `components.json`:
```json
{
  "registries": {
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

### Authentication for Private Registries

Add to `.env.local`:
```bash
REGISTRY_TOKEN=your_token_here
```

---

## 6. Theme Customization for 8-bit Aesthetic

### Visual Styles Available

| Style | Description | 8-bit Compatibility |
|-------|-------------|-------------------|
| **Vega** | Classic shadcn/ui look | Medium |
| **Nova** | Compact layouts | Low |
| **Maia** | Soft and rounded | Low |
| **Lyra** | **Boxy and sharp** | **HIGH** |
| **Mira** | Dense interfaces | Medium |

### Recommended for Project Alpha: Lyra Style

**Why Lyra?**
- "Boxy and sharp" design philosophy
- Pairs well with monospace fonts (JetBrains Mono)
- Minimal border-radius
- Angular, pixel-perfect appearance

### Theme Configuration Options

From the `/create` page:

| Option | Values | 8-bit Recommendation |
|--------|--------|---------------------|
| **Style** | Vega, Nova, Maia, Lyra, Mira | **Lyra** |
| **Base Color** | Neutral, Stone, Zinc, Gray, Slate | **Stone** or **Neutral** |
| **Theme** | Various color themes | **Orange** (retro feel) |
| **Icon Library** | Lucide, Tabler, etc. | Lucide (pixelated option available) |
| **Font** | Inter, JetBrains Mono, etc. | **JetBrains Mono** |
| **Radius** | 0 to 1rem | **0 or minimal** |
| **Menu Accent** | Default, Bold, Subtle | **Bold** |

### CSS Variable Theming

ShadcnUI uses OKLCH color space:

```css
:root {
  --radius: 0;  /* Sharp corners for 8-bit */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.646 0.222 41.116);  /* Orange for retro */
  /* ... */
}
```

### Creating Custom 8-bit Theme

1. Start with Lyra style
2. Set `--radius: 0` or `--radius: 0.125rem`
3. Use solid colors (avoid transparency)
4. Use pixel-art compatible color palette
5. Apply JetBrains Mono or similar monospace font

### Example Preset URL
```
https://ui.shadcn.com/create?base=base&theme=orange&baseColor=stone&style=lyra&font=jetbrains-mono&menuAccent=bold
```

---

## 7. Recommendations for Project Alpha Integration

### Immediate Actions

1. **Add MCP Server Configuration**
   ```json
   // .mcp.json
   {
     "mcpServers": {
       "shadcn": {
         "command": "npx",
         "args": ["shadcn@latest", "mcp"]
       }
     }
   }
   ```

2. **Update components.json for 8-bit Style**
   ```json
   {
     "style": "lyra",
     "base": "radix",  // or "base" for Base UI
     "tailwind": {
       "cssVariables": true
     }
   }
   ```

3. **Install Key New Components**
   ```bash
   pnpm dlx shadcn@latest add spinner kbd button-group input-group field item empty
   ```

### Component Migration Priority

| Priority | Component | Reason |
|----------|-----------|--------|
| P1 | Sidebar | IDE workspace navigation |
| P1 | Resizable | Panel layouts |
| P2 | Button Group | Action toolbars |
| P2 | Input Group | Enhanced inputs |
| P2 | Field | Form improvements |
| P3 | Empty | Empty state UX |
| P3 | Kbd | Keyboard shortcuts display |

### 8-bit CSS Overrides

Add to `globals.css`:
```css
/* 8-bit Design System Overrides */
:root {
  --radius: 0;  /* Sharp corners */
}

/* Pixel shadows */
.shadow-pixel {
  box-shadow: 4px 4px 0 0 hsl(var(--foreground));
}

/* No transparency */
.bg-card {
  @apply bg-background;  /* Solid, not muted/transparent */
}
```

### Form Integration with TanStack Form

Leverage the new `Field` component with TanStack Form for consistent form UX:

```typescript
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"

<Field>
  <FieldLabel>Username</FieldLabel>
  <Input {...form.register("username")} />
  <FieldDescription>Choose a unique username</FieldDescription>
  <FieldError>{errors.username?.message}</FieldError>
</Field>
```

---

## 8. Key Links

| Resource | URL |
|----------|-----|
| TanStack Installation | https://ui.shadcn.com/docs/installation/tanstack |
| Changelog | https://ui.shadcn.com/docs/changelog |
| All Components | https://ui.shadcn.com/docs/components |
| Blocks Library | https://ui.shadcn.com/blocks |
| MCP Server Docs | https://ui.shadcn.com/docs/mcp |
| Create Project | https://ui.shadcn.com/create |
| Theming | https://ui.shadcn.com/docs/theming |
| Base UI Accordion (Example) | https://ui.shadcn.com/docs/components/base/accordion |
| Registry Directory | https://ui.shadcn.com/docs/directory |
| TanStack Form Integration | https://ui.shadcn.com/docs/forms/tanstack-form |

---

## Research Metadata

| Field | Value |
|-------|-------|
| Research Duration | 15 minutes |
| URLs Analyzed | 9 |
| Components Cataloged | 56+ |
| Blocks Cataloged | 15+ |
| Date | 2026-01-27 |
| Agent | analyst-ext |

---

**END OF REPORT**
