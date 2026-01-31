# Plugin Governance: Combination Rules, Limits, and Conflicts

**Researched:** 2026-01-31
**Confidence:** HIGH (domain-specific patterns verified)
**Purpose:** Define runtime governance for plugin loading, combination validation, and conflict prevention

---

## Executive Summary

Without governance, the "drag-and-drop layout to load plugins" will continue to fail. This document defines:

1. **Compatibility Matrix** - Which plugins can load together
2. **Platform Limits** - Maximum plugins per device type
3. **Conflict Rules** - Forbidden combinations and why
4. **Runtime Validation** - How to enforce at load time

---

## Core Principles

```
1. CORE plugins (FileTree, Chat) are ALWAYS loaded - non-negotiable
2. Platform determines AVAILABLE plugins, user chooses from that subset
3. Some combinations are FORBIDDEN due to resource conflicts
4. Maximum plugin count is ENFORCED to prevent performance collapse
```

---

## Plugin Compatibility Matrix

### Platform Availability

| Plugin | Desktop | Tablet | Mobile | Requires |
|--------|---------|--------|--------|----------|
| FileTree | ✅ Always | ✅ Always | ✅ Always | - |
| Chat | ✅ Always | ✅ Always | ✅ Always | - |
| Monaco | ✅ Optional | ❌ | ❌ | Desktop only |
| Notes | ✅ Optional | ✅ Optional | ✅ Optional | - |
| Terminal | ✅ Optional | ❌ | ❌ | WebContainer |
| Preview | ✅ Optional | ❌ | ❌ | Terminal (dev server) |

### Combination Compatibility

```typescript
type PluginCombination = {
  allowed: boolean;
  reason?: string;
};

const PLUGIN_COMPATIBILITY: Record<string, PluginCombination> = {
  // ✅ ALLOWED combinations
  'monaco+notes': { allowed: true },  // Common use: code + docs
  'monaco+terminal': { allowed: true },  // Common use: dev workflow
  'monaco+terminal+preview': { allowed: true },  // Full IDE mode
  'notes+terminal': { allowed: true },  // Rare but valid
  
  // ⚠️ CONDITIONAL combinations
  'monaco+notes+terminal': { 
    allowed: true, 
    reason: 'Heavy - 3 editor plugins, ensure desktop only'
  },
  'monaco+notes+terminal+preview': { 
    allowed: true,
    reason: 'Maximum load - desktop only, may lag on older hardware'
  },
  
  // ❌ FORBIDDEN combinations (reason: resource conflicts)
  // None currently - all are platform-gated instead
};
```

### Dependency Chain

Some plugins REQUIRE others to function:

```typescript
const PLUGIN_DEPENDENCIES: Record<PluginType, PluginType[]> = {
  'file-tree': [],      // Core - no deps
  'chat': [],           // Core - no deps
  'monaco': ['file-tree'],  // Needs file selection
  'notes': ['file-tree'],   // Needs file selection
  'terminal': [],           // Standalone
  'preview': ['terminal'],  // Needs dev server from terminal
};

// Auto-load dependencies when plugin is requested
function resolvePluginDependencies(requested: PluginType[]): PluginType[] {
  const resolved = new Set<PluginType>(requested);
  
  for (const plugin of requested) {
    for (const dep of PLUGIN_DEPENDENCIES[plugin]) {
      resolved.add(dep);
    }
  }
  
  // Always include core plugins
  resolved.add('file-tree');
  resolved.add('chat');
  
  return Array.from(resolved);
}
```

---

## Platform Limits

### Maximum Plugin Counts

| Platform | Max Optional Plugins | Max Total (including core) | Rationale |
|----------|---------------------|---------------------------|-----------|
| Desktop | 4 | 6 | Full power, Monaco + Notes + Terminal + Preview |
| Tablet | 2 | 4 | Reduced for touch UI, no Monaco/Terminal |
| Mobile | 1 | 3 | Single focus mode, Notes OR simple view |

### Enforcement Logic

```typescript
interface PlatformLimits {
  maxOptionalPlugins: number;
  maxTotalPlugins: number;
  allowedPlugins: PluginType[];
}

const PLATFORM_LIMITS: Record<Platform, PlatformLimits> = {
  desktop: {
    maxOptionalPlugins: 4,
    maxTotalPlugins: 6,
    allowedPlugins: ['file-tree', 'chat', 'monaco', 'notes', 'terminal', 'preview'],
  },
  tablet: {
    maxOptionalPlugins: 2,
    maxTotalPlugins: 4,
    allowedPlugins: ['file-tree', 'chat', 'notes'],
  },
  mobile: {
    maxOptionalPlugins: 1,
    maxTotalPlugins: 3,
    allowedPlugins: ['file-tree', 'chat', 'notes'],
  },
};

function validatePluginCount(
  platform: Platform,
  requestedPlugins: PluginType[]
): ValidationResult {
  const limits = PLATFORM_LIMITS[platform];
  const corePlugins = ['file-tree', 'chat'];
  const optionalPlugins = requestedPlugins.filter(p => !corePlugins.includes(p));
  
  if (optionalPlugins.length > limits.maxOptionalPlugins) {
    return {
      valid: false,
      error: `Maximum ${limits.maxOptionalPlugins} optional plugins on ${platform}`,
      suggestion: `Remove ${optionalPlugins.length - limits.maxOptionalPlugins} plugin(s)`,
    };
  }
  
  return { valid: true };
}
```

---

## Conflict Prevention

### Resource Conflicts

Some plugins compete for the same resources:

```typescript
const RESOURCE_CONFLICTS: Record<string, PluginType[]> = {
  // Currently no hard conflicts - platform gating handles this
  // Future: If we add multiple editors, they might conflict
  // 'primary-editor': ['monaco', 'ace', 'codemirror'],
};

function checkResourceConflicts(plugins: PluginType[]): ConflictResult {
  for (const [resource, conflicting] of Object.entries(RESOURCE_CONFLICTS)) {
    const loaded = plugins.filter(p => conflicting.includes(p));
    if (loaded.length > 1) {
      return {
        hasConflict: true,
        resource,
        conflictingPlugins: loaded,
        resolution: `Only one ${resource} plugin can be loaded at a time`,
      };
    }
  }
  return { hasConflict: false };
}
```

### UI Slot Conflicts

Each plugin occupies UI slots. Some slots can only hold one plugin:

```typescript
type UISlot = 
  | 'primary-panel'    // Main content area
  | 'secondary-panel'  // Side panel
  | 'bottom-panel'     // Terminal/output
  | 'sidebar'          // Activity bar
  | 'statusbar';       // Bottom status

const PLUGIN_SLOTS: Record<PluginType, UISlot[]> = {
  'file-tree': ['sidebar'],
  'chat': ['secondary-panel'],  // Can expand to primary
  'monaco': ['primary-panel'],
  'notes': ['primary-panel', 'secondary-panel'],  // Flexible
  'terminal': ['bottom-panel'],
  'preview': ['primary-panel', 'secondary-panel'],  // Flexible
};

const EXCLUSIVE_SLOTS: UISlot[] = ['bottom-panel'];  // Only one plugin

function checkSlotConflicts(plugins: PluginType[]): SlotConflictResult {
  for (const slot of EXCLUSIVE_SLOTS) {
    const occupants = plugins.filter(p => PLUGIN_SLOTS[p]?.includes(slot));
    if (occupants.length > 1) {
      return {
        hasConflict: true,
        slot,
        occupants,
        resolution: `Only one plugin can occupy ${slot}`,
      };
    }
  }
  return { hasConflict: false };
}
```

---

## Runtime Validation

### The PluginGovernor

Central runtime enforcement:

```typescript
class PluginGovernor {
  private platform: Platform;
  private loadedPlugins: Set<PluginType> = new Set();
  
  constructor(platform: Platform) {
    this.platform = platform;
    // Core plugins always loaded
    this.loadedPlugins.add('file-tree');
    this.loadedPlugins.add('chat');
  }
  
  canLoadPlugin(plugin: PluginType): GovernanceResult {
    // 1. Platform availability check
    const limits = PLATFORM_LIMITS[this.platform];
    if (!limits.allowedPlugins.includes(plugin)) {
      return {
        allowed: false,
        reason: `${plugin} is not available on ${this.platform}`,
        code: 'PLATFORM_UNAVAILABLE',
      };
    }
    
    // 2. Already loaded check
    if (this.loadedPlugins.has(plugin)) {
      return {
        allowed: false,
        reason: `${plugin} is already loaded`,
        code: 'ALREADY_LOADED',
      };
    }
    
    // 3. Count limit check
    const currentOptional = Array.from(this.loadedPlugins)
      .filter(p => p !== 'file-tree' && p !== 'chat');
    if (currentOptional.length >= limits.maxOptionalPlugins) {
      return {
        allowed: false,
        reason: `Maximum ${limits.maxOptionalPlugins} optional plugins reached`,
        code: 'LIMIT_EXCEEDED',
        suggestion: 'Unload a plugin first',
      };
    }
    
    // 4. Dependency check
    const deps = PLUGIN_DEPENDENCIES[plugin];
    const missingDeps = deps.filter(d => !this.loadedPlugins.has(d));
    if (missingDeps.length > 0) {
      return {
        allowed: true,  // Will auto-load deps
        autoLoadDeps: missingDeps,
        reason: `Will also load: ${missingDeps.join(', ')}`,
        code: 'DEPS_REQUIRED',
      };
    }
    
    // 5. Resource conflict check
    const allPlugins = [...this.loadedPlugins, plugin];
    const resourceConflict = checkResourceConflicts(allPlugins);
    if (resourceConflict.hasConflict) {
      return {
        allowed: false,
        reason: resourceConflict.resolution,
        code: 'RESOURCE_CONFLICT',
      };
    }
    
    // 6. Slot conflict check
    const slotConflict = checkSlotConflicts(allPlugins);
    if (slotConflict.hasConflict) {
      return {
        allowed: false,
        reason: slotConflict.resolution,
        code: 'SLOT_CONFLICT',
      };
    }
    
    return { allowed: true };
  }
  
  loadPlugin(plugin: PluginType): LoadResult {
    const governance = this.canLoadPlugin(plugin);
    if (!governance.allowed) {
      return { success: false, error: governance.reason };
    }
    
    // Auto-load dependencies
    if (governance.autoLoadDeps) {
      for (const dep of governance.autoLoadDeps) {
        this.loadedPlugins.add(dep);
      }
    }
    
    this.loadedPlugins.add(plugin);
    return { success: true, loadedPlugins: Array.from(this.loadedPlugins) };
  }
  
  unloadPlugin(plugin: PluginType): UnloadResult {
    // Cannot unload core plugins
    if (plugin === 'file-tree' || plugin === 'chat') {
      return { success: false, error: 'Cannot unload core plugins' };
    }
    
    // Check if other plugins depend on this one
    const dependents = this.getDependents(plugin);
    if (dependents.length > 0) {
      return {
        success: false,
        error: `Cannot unload: ${dependents.join(', ')} depend on ${plugin}`,
        suggestion: `Unload ${dependents.join(', ')} first`,
      };
    }
    
    this.loadedPlugins.delete(plugin);
    return { success: true };
  }
  
  private getDependents(plugin: PluginType): PluginType[] {
    return Array.from(this.loadedPlugins).filter(p => 
      PLUGIN_DEPENDENCIES[p]?.includes(plugin)
    );
  }
}
```

---

## UI Integration

### Activity Bar Toggle

The activity bar shows available plugins with governance-aware states:

```typescript
interface PluginToggleState {
  plugin: PluginType;
  state: 'active' | 'available' | 'unavailable' | 'limit-reached';
  tooltip: string;
}

function getPluginToggleStates(
  governor: PluginGovernor,
  platform: Platform
): PluginToggleState[] {
  const limits = PLATFORM_LIMITS[platform];
  
  return limits.allowedPlugins.map(plugin => {
    if (governor.isLoaded(plugin)) {
      return {
        plugin,
        state: 'active',
        tooltip: plugin === 'file-tree' || plugin === 'chat' 
          ? 'Core plugin (always active)'
          : 'Click to unload',
      };
    }
    
    const canLoad = governor.canLoadPlugin(plugin);
    if (!canLoad.allowed) {
      return {
        plugin,
        state: canLoad.code === 'LIMIT_EXCEEDED' ? 'limit-reached' : 'unavailable',
        tooltip: canLoad.reason,
      };
    }
    
    return {
      plugin,
      state: 'available',
      tooltip: 'Click to load',
    };
  });
}
```

### Drag-and-Drop Validation

When user drags a plugin to the layout:

```typescript
function onPluginDragStart(plugin: PluginType, governor: PluginGovernor) {
  const canLoad = governor.canLoadPlugin(plugin);
  
  if (!canLoad.allowed) {
    // Show red indicator, prevent drop
    return { canDrop: false, message: canLoad.reason };
  }
  
  if (canLoad.autoLoadDeps) {
    // Show warning that deps will also load
    return { 
      canDrop: true, 
      warning: `Will also load: ${canLoad.autoLoadDeps.join(', ')}`,
    };
  }
  
  return { canDrop: true };
}
```

---

## Preset Configurations

For user convenience, offer preset plugin configurations:

```typescript
const PLUGIN_PRESETS: Record<string, PluginPreset> = {
  'ide-full': {
    name: 'Full IDE',
    description: 'Code editor, terminal, preview',
    plugins: ['monaco', 'terminal', 'preview'],
    platforms: ['desktop'],
  },
  'ide-minimal': {
    name: 'Minimal IDE',
    description: 'Code editor only',
    plugins: ['monaco'],
    platforms: ['desktop'],
  },
  'notes-only': {
    name: 'Notes Focus',
    description: 'Rich text notes with AI',
    plugins: ['notes'],
    platforms: ['desktop', 'tablet', 'mobile'],
  },
  'dev-workflow': {
    name: 'Dev Workflow',
    description: 'Editor + terminal',
    plugins: ['monaco', 'terminal'],
    platforms: ['desktop'],
  },
};

function applyPreset(presetId: string, governor: PluginGovernor): PresetResult {
  const preset = PLUGIN_PRESETS[presetId];
  if (!preset) {
    return { success: false, error: 'Unknown preset' };
  }
  
  if (!preset.platforms.includes(governor.platform)) {
    return { success: false, error: `Preset not available on ${governor.platform}` };
  }
  
  // Unload all optional plugins first
  governor.unloadAllOptional();
  
  // Load preset plugins
  for (const plugin of preset.plugins) {
    const result = governor.loadPlugin(plugin);
    if (!result.success) {
      return { success: false, error: result.error };
    }
  }
  
  return { success: true };
}
```

---

## What This Enables

| Problem | Solution |
|---------|----------|
| "Load 5 plugins on mobile" crashes | Platform limits enforced |
| "Same plugin loaded twice" confusion | Already-loaded check |
| Preview without terminal fails | Dependency auto-loading |
| Monaco on tablet doesn't work | Platform availability gate |
| Drag-and-drop fails silently | Governance result with reason |

---

## Integration Points

This governance integrates with:

1. **PLUGIN-CONTRACTS** - Uses PluginDefinition, extends with governance fields
2. **DOMAIN-MODEL** - ProjectSettings stores `enabledPlugins` (user choice)
3. **SCHEMA-ARCHITECTURE** - Governance result types defined there

---

## Sources

- Exa: Plugin registry patterns (Kibana, Backstage, React Pluggable)
- Exa: PluginProvider context patterns
- Exa: Slot-based plugin architecture
- Context7: Zustand slices for modular state
- WebSearch: React plugin compatibility patterns 2025

**Confidence:** HIGH - Patterns verified across multiple production systems

