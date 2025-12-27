# Custom Assets Audit - Icon Usage Analysis
**Date**: 2025-12-26  
**Author**: UX Designer Agent (@bmad-bmm-ux-designer)  
**Status**: Analysis Complete

## 1. Current Icon Usage Analysis

### 1.1 Lucide-react Icon Inventory
Based on codebase search, the following Lucide-react icons are currently used:

#### Navigation & UI Icons
- `ArrowLeft`, `ArrowRight`, `ChevronDown`, `ChevronRight`, `ChevronLeft`, `ChevronUp`
- `X` (Close), `Home`, `Settings`, `Settings2`, `MoreVertical`, `MoreHorizontal`
- `Maximize2`, `Minimize2`, `Minus`, `ExternalLink`, `Monitor`, `Tablet`, `Smartphone`
- `Keyboard`, `Search`, `Save`, `FileText`, `Terminal`, `Layout`, `HelpCircle`, `Zap`
- `MessageSquare`, `MessageSquarePlus`, `RefreshCw`, `Loader2`, `Check`, `Clock`, `AlertCircle`, `AlertTriangle`
- `CheckCircle`, `CheckCircle2`, `XCircle`, `Info`, `TriangleAlertIcon`

#### File & Folder Icons
- `File`, `FileCode`, `FileJson`, `FileText`, `FileImage`, `FilePlus`
- `Folder`, `FolderOpen`
- `FileX`, `FolderOpen` (for empty states)

#### AI & Agent Icons
- `Bot`, `Cpu`, `Circle`, `Sparkles`, `Play`, `Pause`, `Settings`, `Trash2`
- `Key`, `Plus`, `RefreshCw`, `MoreVertical`

#### Status & Action Icons
- `Cloud`, `CloudOff`, `Check`, `Loader2`, `AlertTriangle`, `RefreshCw`
- `Send`, `User`, `Code`, `GitBranch`, `Languages`, `Moon`, `Sun`
- `Plus`, `Trash2`, `Pencil`, `FolderPlus`, `FilePlus`

#### Component-Specific Icons
- **FileTree**: `ChevronRight`, `ChevronDown`, `Loader2`, `Check`, `Clock`, `AlertTriangle`
- **StatusBar**: `Cloud`, `CloudOff`, `Loader2`, `Check`, `AlertTriangle`, `RefreshCw`, `Bot`, `Zap`, `AlertCircle`
- **Chat**: `Bot`, `User`, `Send`, `ArrowLeft`, `Clock`, `CheckCircle`, `XCircle`, `AlertTriangle`
- **Agent Config**: `Bot`, `Loader2`, `Key`, `CheckCircle2`, `XCircle`, `RefreshCw`, `Plus`, `Settings2`, `Trash2`
- **Command Palette**: `Search`, `Terminal`, `Settings`, `FileText`, `Zap`, `HelpCircle`, `Keyboard`

### 1.2 Icon Categories for Customization

#### Priority 1: Core Navigation Icons (High Impact)
- File/folder icons (File, Folder, FolderOpen)
- AI/Agent icons (Bot, Cpu, Sparkles)
- Status icons (Cloud, Check, AlertTriangle, Loader2)
- Action icons (Plus, Trash2, Settings, RefreshCw)

#### Priority 2: UI Control Icons (Medium Impact)
- Chevron arrows (ChevronRight, ChevronDown, ChevronLeft, ChevronUp)
- Close/Expand (X, Maximize2, Minimize2, Minus)
- Navigation (ArrowLeft, Home, ExternalLink)

#### Priority 3: Feature-Specific Icons (Low Impact)
- Device icons (Monitor, Tablet, Smartphone)
- Chat icons (MessageSquare, Send, User)
- Tool-specific (GitBranch, Code, Keyboard)

### 1.3 Design System Alignment

**Current Design Tokens** (from `src/styles/design-tokens.css`):
- Primary color: Orange (#f97316) - MistralAI inspired
- Background: Deep black (#0f0f11)
- Surface: Dark zinc (#18181b)
- 8-bit aesthetic: Squared corners (--radius: 0px), pixel shadows
- Color palette includes 8-bit retro colors: black, dark-gray, medium-gray, light-gray, white, red, orange, yellow, green, blue, purple, pink

**Icon Requirements**:
- 8-bit pixel art style (squared corners, limited color palette)
- Consistent 24x24px base size (scalable)
- Dark theme optimized (high contrast)
- Pixel-perfect alignment (no anti-aliasing)
- Retro gaming aesthetic without kitsch

## 2. Custom SVG Icon Design Specifications

### 2.1 Design Principles
1. **Pixel-Perfect**: All icons designed on 24x24 grid
2. **8-bit Aesthetic**: Limited color palette, squared corners, no gradients
3. **Consistency**: Uniform stroke width (2px), consistent visual weight
4. **Clarity**: Clear recognition at small sizes
5. **Accessibility**: High contrast, WCAG AA compliant

### 2.2 Color Palette for Icons
- **Primary**: `#f97316` (Orange) - for active/selected states
- **Foreground**: `#f4f4f5` (White) - default icon color
- **Secondary**: `#a3a3a7` (Neutral-400) - disabled/inactive
- **Success**: `#22c55e` (Green)
- **Warning**: `#eab308` (Yellow)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

### 2.3 Icon Grid System
- **Base Size**: 24x24px viewBox
- **Grid**: 8x8 pixel grid (3px per grid unit)
- **Stroke Width**: 2px (consistent across all icons)
- **Corner Radius**: 0px (sharp corners for 8-bit aesthetic)
- **Padding**: 2px safe area (20x20px drawing area)

## 3. Proposed Custom Icon Set

### 3.1 Core Navigation Icons (Replace Lucide equivalents)

#### File Operations
1. **File** - Simple document with corner fold
2. **Folder** - Classic folder with tab
3. **FolderOpen** - Open folder with contents
4. **FileCode** - Document with `</>` symbol
5. **FileJson** - Document with `{}` brackets
6. **FileText** - Document with lines of text
7. **FileImage** - Document with mountain/landscape

#### AI & Agent Icons
8. **Bot** - Robot head with antenna (8-bit style)
9. **Cpu** - Microchip/processor grid
10. **Sparkles** - Three stars in diagonal arrangement
11. **Brain** - Brain with circuit pattern (for AI)
12. **Agent** - Person with gear/mechanical elements

#### Status Indicators
13. **Cloud** - Simple cloud outline
14. **CloudOff** - Cloud with slash through it
15. **Check** - Checkmark in square
16. **AlertTriangle** - Triangle with exclamation
17. **Loader** - Circular progress indicator (animated)
18. **Sync** - Two arrows in circular motion

#### UI Controls
19. **ChevronRight** - Right-pointing arrow (angled)
20. **ChevronDown** - Down-pointing arrow (angled)
21. **X** - Cross/close (thick lines)
22. **Settings** - Gear with 8 teeth
23. **Plus** - Plus sign in square
24. **Trash** - Trash can with lid

### 3.2 Animation Specifications
- **Micro-interactions**: Hover effects, active states
- **Loading**: Rotating spinner (2s linear infinite)
- **Success**: Checkmark scale animation
- **Error**: X shake animation
- **Transition**: All animations ≤200ms duration

## 4. Implementation Plan

### 4.1 File Structure
```
src/components/ui/icons/
├── index.ts                    # Barrel exports
├── types.ts                    # Icon types and props
├── Icon.tsx                    # Base icon component
├── FileIcons.tsx              # File-related icons
├── NavigationIcons.tsx        # Navigation icons
├── StatusIcons.tsx            # Status indicators
├── AgentIcons.tsx             # AI/Agent icons
├── UIcons.tsx                 # UI control icons
└── animations.css             # CSS animations
```

### 4.2 Component Design
Each icon will be:
- React component with TypeScript
- Accepts `size`, `color`, `className` props
- Uses design token colors
- Supports both filled and outlined variants
- Accessible with `aria-label`

### 4.3 Migration Strategy
1. Create custom icon components
2. Update `FileTree/icons.tsx` to use custom icons
3. Gradually replace Lucide imports in components
4. Add animation classes for interactive elements
5. Test visual consistency across themes

## 5. Next Steps

1. **Design SVG icons** (24x24px, 8-bit style)
2. **Create React components** with TypeScript
3. **Implement animations** for micro-interactions
4. **Update components** to use custom icons
5. **Test** across light/dark themes
6. **Document** usage guidelines

## 6. Success Metrics
- ✓ All Lucide icons replaced with custom 8-bit equivalents
- ✓ Consistent visual language across application
- ✓ Pixel-perfect rendering at all sizes
- ✓ Smooth animations (≤200ms)
- ✓ WCAG AA contrast compliance
- ✓ No regression in functionality

---
**Next Action**: Design SVG icons for Priority 1 categories (File, Folder, Bot, Cloud, Check, AlertTriangle)