# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-042
**Title: Project Templates - Quick Start with Pre-configured Setups**
**Date**: 2026-01-06T14:00:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add project templates for quick starts with pre-configured setups (React, Vue, Node.js, Python, etc.).

## Context
No project templates exist. Users must manually configure each new project. Need pre-configured templates.

## Root Cause
```typescript
// No project templates system
// No template registry
// Missing template application logic
// No template customization
```

## Files to Create/Modify
- **Create**: `src/lib/templates/template-registry.ts` - Template definitions and registry
- **Create**: `src/lib/templates/template-engine.ts` - Template application engine
- **Create**: `src/presentation/components/templates/TemplateGallery.tsx` - Template browser UI
- **Create**: `src/presentation/components/templates/TemplateCustomization.tsx` - Template configuration UI
- **Create**: `src/hooks/useProjectTemplates.ts` - Template hook
- **Modify**: `src/presentation/components/hub/ProjectWizard.tsx` - Integrate template selection

## Project Templates Features

### Built-in Templates

#### Frontend Templates
- **React Vite**: Modern React with Vite, TypeScript, Tailwind CSS
- **Vue 3**: Vue 3 with Vite, Composition API, Pinia
- **Next.js**: React SSR framework with App Router
- **SvelteKit**: Svelte full-stack framework

#### Backend Templates
- **Node.js Express**: REST API with Express.js
- **Node.js Fastify**: High-performance Node.js server
- **Python Flask**: Lightweight Python web framework
- **Python Django**: Full-featured Python web framework
- **Go**: High-performance Go server

#### Full-Stack Templates
- **MERN**: MongoDB, Express, React, Node.js
- **MEAN**: MongoDB, Express, Angular, Node.js
- **PERN**: PostgreSQL, Express, React, Node.js
- **JAMstack**: Static site with serverless functions

#### Specialized Templates
- **Electron**: Desktop application template
- **React Native**: Mobile app template
- **Monorepo**: Multi-package workspace
- **Microservices**: Dockerized microservices setup

### Template Structure
```typescript
interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'specialized';
  tags: string[];
  icon: string; // Lucide icon name

  // Template configuration
  config: {
    dependencies: Record<string, string>; // npm packages
    devDependencies: Record<string, string>;
    files: TemplateFile[]; // Template files

    // Scripts
    scripts: {
      dev: string;
      build: string;
      test?: string;
      lint?: string;
    };

    // Configuration files
    configs: {
      tsconfig?: object;
      vite?: object;
      eslint?: object;
      prettier?: object;
      tailwind?: object;
    };
  };

  // Customization options
  customization: TemplateCustomization[];
}
```

### Template Customization
- **Package Manager**: npm, yarn, pnpm, bun
- **TypeScript**: Enable/disable TypeScript
- **Styling**: CSS, SCSS, Tailwind CSS, CSS-in-JS
- **State Management**: Zustand, Redux, Pinia, etc.
- **Testing**: Vitest, Jest, Playwright, Cypress
- **Linting**: ESLint, Prettier configuration
- **Build Tool**: Vite, Webpack, Rollup

### Template Application
- **File Generation**: Create project files from template
- **Dependency Installation**: Auto-install npm packages
- **Configuration**: Apply selected customizations
- **Git Init**: Initialize git repository
- **First Commit**: Initial commit with template files

### UI Components

#### Template Gallery
- **Category Filter**: Filter by template category
- **Search**: Search templates by name/tags
- **Template Cards**: Show template name, description, icon, tags
- **Template Preview**: Show file structure and dependencies
- **Popular Templates**: Highlight frequently used templates

#### Template Customization
- **Option Groups**: Group customization options logically
- **Default Values**: Pre-select recommended options
- **Live Preview**: Show configuration preview
- **Validation**: Validate option combinations

## Constraints
- Template registry with 12+ built-in templates
- Package manager selection (npm, yarn, pnpm, bun)
- TypeScript on/off option
- Styling framework selection
- State management options
- Testing framework selection
- Mobile: Responsive template gallery
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Template registry with 12+ built-in templates
- [ ] Template gallery UI (filter, search, cards)
- [ ] Template customization UI (package manager, TypeScript, styling, state, testing)
- [ ] Template application engine (file generation, dependency installation)
- [ ] Project wizard integration
- [ ] Git initialization with first commit
- [ ] Mobile: Responsive template gallery
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build template gallery UI
- `brainstorming` - Design template system
- `global-coding-style` - Template patterns
- `global-validation` - Template validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify template components
ls -la src/presentation/components/templates/

# Verify template engine
ls -la src/lib/templates/template-registry.ts
```

## Related Issues
- Project onboarding
- Developer experience
- Quick project creation

## Next Action
Create project templates system with registry, gallery, customization, and application engine.

---
**Handoff ID**: S-042-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
