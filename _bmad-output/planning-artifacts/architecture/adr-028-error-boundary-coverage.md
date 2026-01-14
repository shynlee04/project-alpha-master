# ADR-028: Error Boundary Coverage

**Date:** 2026-01-07  
**Status:** PROPOSED  
**Author:** @bmad-bmm-dev

## Context

The codebase currently has **22.2% error boundary coverage** (113/510 components), leaving 75% of workspace routes unprotected. This creates critical White Screen of Death (WSOD) risks across major user flows, as identified in the Phase 1 diagnostic report.

### Current State Analysis

Based on Phase 1 findings from Comprehensive Diagnostic Report:

#### Coverage Metrics

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Component Coverage** | 22.2% (113/510) | 80% | 57.8% |
| **Route Coverage** | 22.7% (5/22) | 100% | 77.3% |
| **Workspace Routes** | 25% (1/4) | 100% | 75% |
| **Critical Paths** | 25% protected | 100% | 75% |

#### Critical Gaps Identified

| Route | Error Boundary | Risk Level | Impact |
|-------|----------------|------------|--------|
| `/notes` | ❌ Missing | **CRIT-005** | WSOD in Notes workspace |
| `/knowledge` | ❌ Missing | **CRIT-005** | WSOD in Knowledge workspace |
| `/study` | ❌ Missing | **CRIT-005** | WSOD in Study workspace |
| `/settings` | ⚠️ Partial | **CRIT-001** | Missing `useProjectStats` export |

### Evidence from Phase 1

1. **Diagnostic Report** (comprehensive-diagnostic-report.md):
   - CRIT-005: Missing Error Boundaries in workspace routes
   - CRIT-011: Low Error Boundary Coverage (77.8% components exposed)
   - CRIT-012: 75% of workspace routes unprotected

2. **Component Inventory**: 474 components, only 113 wrapped in ErrorBoundary

3. **State Reactivity Gaps**: Race conditions in workspace switches can trigger uncaught errors

### Problem Statement

- **White Screen of Death**: Users see blank screens instead of error recovery
- **Poor UX**: No graceful degradation when errors occur
- **Debugging Difficulty**: Errors propagate without context
- **Data Loss Risk**: Unhandled errors may corrupt state
- **Security Exposure**: Error details may leak sensitive information

## Decision

Implement comprehensive error boundary strategy with three-tier error handling:

### Error Handling Tiers

#### Tier 1: Recovery (Local)

**description**: Automatic retry and fallback for transient errors

**Pattern**: Component-level error boundaries with retry capability

```typescript
// src/presentation/components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Log to monitoring service
    errorReportingService.captureException(error, {
      componentStack: errorInfo.componentStack,
      level: 'error',
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorState
          error={this.state.error}
          onRetry={this.handleRetry}
          onReport={() => errorReportingService.captureException(this.state.error)}
        />
      );
    }
    return this.props.children;
  }
}
```

#### Tier 2: Degradation (Feature-Level)

**description**: Graceful feature reduction when errors occur

**Pattern**: Feature-level error boundaries with degraded UI

```typescript
// src/presentation/components/chat/DegradableChatPanel.tsx
export function DegradableChatPanel() {
  return (
    <ErrorBoundary
      fallback={<ChatPanelFallback />}
    >
      <ChatPanelContent />
    </ErrorBoundary>
  );
}

function ChatPanelFallback() {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-2">Chat Unavailable</h3>
      <p className="text-muted-foreground mb-4">
        The chat feature encountered an error. You can:
      </p>
      <div className="space-y-2">
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
        <Button variant="outline" onClick={() => navigate('/settings')}>
          Check Settings
        </Button>
      </div>
    </div>
  );
}
```

#### Tier 3: Notification (Application-Level)

**description**: User notification and support ticket creation

**Pattern**: Global error handler with user communication

```typescript
// src/presentation/hooks/use-global-error-handler.ts
export function useGlobalErrorHandler() {
  const { t } = useTranslation();
  
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      event.preventDefault();
      
      // Show user notification
      toast.error(t('errors.unexpected.title'), {
        description: t('errors.unexpected.message'),
        duration: 0, // Persist until dismissed
        action: {
          label: t('errors.unexpected.report'),
          onClick: () => createSupportTicket(event.error),
        },
      });
      
      // Log to monitoring
      errorReportingService.captureException(event.error, {
        level: 'fatal',
        tags: { location: 'unhandled-error' },
      });
    };

    window.addEventListener('error', handleUnhandledError);
    return () => window.removeEventListener('error', handleUnhandledError);
  }, [t]);
}
```

### ErrorState Component Specifications

```typescript
// src/presentation/components/ui/ErrorState.tsx
interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
  onReport?: () => void;
  variant?: 'full' | 'compact' | 'inline';
  title?: string;
  message?: string;
}

export function ErrorState({
  error,
  onRetry,
  onReport,
  variant = 'full',
  title,
  message,
}: ErrorStateProps) {
  const { t } = useTranslation();
  
  const errorCode = error?.name || 'UNKNOWN';
  const errorMessage = error?.message || message || t('errors.unknown.message');
  
  if (variant === 'inline') {
    return (
      <span className="text-destructive text-sm">
        {errorMessage}
      </span>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className="p-3 border border-destructive rounded bg-destructive/10">
        <p className="text-destructive font-medium">{errorMessage}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t('errors.retry')}
          </Button>
        )}
      </div>
    );
  }
  
  // Full variant
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {title || t('errors.something-wrong')}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {errorMessage}
      </p>
      {errorCode && (
        <code className="text-xs bg-muted px-2 py-1 rounded mb-4">
          {errorCode}
        </code>
      )}
      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('errors.retry')}
          </Button>
        )}
        {onReport && (
          <Button variant="outline" onClick={onReport}>
            <Bug className="mr-2 h-4 w-4" />
            {t('errors.report')}
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Route Protection Strategy

#### Critical Routes (P0 - Immediate)

```typescript
// src/routes/notes.lazy.tsx
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary
      fallback={<ErrorStateUI workspace="notes" />}
    >
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

// src/routes/knowledge.lazy.tsx
export const Route = createLazyFileRoute('/knowledge')({
  component: () => (
    <ErrorBoundary
      fallback={<ErrorStateUI workspace="knowledge" />}
    >
      <KnowledgeWorkspace />
    </ErrorBoundary>
  ),
});

// src/routes/study.lazy.tsx
export const Route = createLazyFileRoute('/study')({
  component: () => (
    <ErrorBoundary
      fallback={<ErrorStateUI workspace="study" />}
    >
      <StudyWorkspace />
    </ErrorBoundary>
  ),
});
```

#### High Priority Routes (P1 - This Week)

| Route | Current | Target | Action |
|-------|---------|--------|--------|
| `/settings` | Partial | Full | Add missing ErrorBoundary |
| `/hub` | Partial | Full | Add ErrorBoundary |
| `/project/:id` | Partial | Full | Add ErrorBoundary |

#### Standard Routes (P2 - This Month)

All other routes must have ErrorBoundary coverage

### Component Protection Strategy

#### Protected Component Categories

| Category | Coverage Target | Examples |
|----------|-----------------|----------|
| **Workspace Components** | 100% | NotesWorkspace, KnowledgeWorkspace |
| **Agent Components** | 100% | AgentChatPanel, AgentConfigDialog |
| **Chat Components** | 100% | ChatConversation, ChatHistory |
| **Editor Components** | 100% | MonacoEditor, CodeEditor |
| **Settings Components** | 100% | ProviderConfig, AgentSettings |
| **Utility Components** | 80% | ErrorState, LoadingState |
| **UI Components** | 60% | Button, Input, Modal |

#### God Component Decomposition

| Component | Lines | Protection | Action |
|-----------|-------|------------|--------|
| `MonacoEditor.tsx` | 768 | ❌ | Wrap + decompose |
| `EnhancedChatInterface.tsx` | 592 | ❌ | Wrap + decompose |
| `AgentChatPanel.tsx` | 527 | ⚠️ | Add ErrorBoundary |
| `KnowledgePage.tsx` | 712 | ❌ | Wrap + decompose |
| `NotesPage.tsx` | 712 | ❌ | Wrap + decompose |

## Consequences

### Positive

1. **No WSOD**: Graceful error handling prevents blank screens
2. **Better UX**: Users understand what went wrong
3. **Faster Debugging**: Error context captured
4. **Recovery Options**: Retry and report functionality
5. **Monitoring Integration**: Error tracking for improvements

### Negative

1. **Boilerplate**: Error boundaries add code
2. **Overhead**: Error boundary components add to bundle size
3. **Complexity**: Multiple error handling tiers
4. **Testing**: Error scenarios must be tested

## Implementation

### Immediate Actions (P0 - Today)

**File**: `src/routes/notes.lazy.tsx`
```typescript
import { ErrorBoundary } from '@/presentation/components/common/ErrorBoundary';
import { ErrorState } from '@/presentation/components/ui/ErrorState';

export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary
      fallback={(error) => (
        <ErrorState
          error={error}
          onRetry={() => window.location.reload()}
          title="Notes Workspace Error"
          message="The notes workspace encountered an error. Please refresh the page."
        />
      )}
    >
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});
```

**Files to Update**:
- `src/routes/notes.lazy.tsx` - Add ErrorBoundary
- `src/routes/knowledge.lazy.tsx` - Add ErrorBoundary
- `src/routes/study.lazy.tsx` - Add ErrorBoundary
- `src/routes/settings.lazy.tsx` - Fix missing export (CRIT-001)

### Weekly Actions (P1)

**Files to Create**:
- `src/presentation/components/common/ErrorBoundary.tsx` - Core ErrorBoundary
- `src/presentation/components/ui/ErrorState.tsx` - ErrorState component
- `src/presentation/hooks/use-global-error-handler.ts` - Global error handler

**Files to Update**:
- All workspace route files - Add ErrorBoundary
- All agent component files - Add ErrorBoundary
- All chat component files - Add ErrorBoundary

### Monthly Actions (P2)

- Decompose god components with error handling
- Add error boundary tests
- Integrate error monitoring service
- Add error boundary lint rules

### File References from Phase 1

| File | Line | Issue |
|------|------|-------|
| `src/routes/notes.lazy.tsx` | - | Missing ErrorBoundary (CRIT-005) |
| `src/routes/knowledge.lazy.tsx` | - | Missing ErrorBoundary (CRIT-005) |
| `src/routes/study.lazy.tsx` | - | Missing ErrorBoundary (CRIT-005) |
| `src/routes/settings.lazy.tsx` | - | Missing useProjectStats export (CRIT-001) |
| `src/presentation/components/ide/AgentChatPanel.tsx` | 527 | God component needs ErrorBoundary |
| `src/presentation/components/knowledge/KnowledgePage.tsx` | 712 | God component needs ErrorBoundary |

### Success Criteria

| Metric | Target | Current | Timeline |
|--------|--------|---------|----------|
| Route Coverage | 100% | 22.7% | Day 1 |
| Workspace Routes | 100% | 25% | Day 1 |
| Component Coverage | 80% | 22.2% | Week 1 |
| God Components Protected | 100% | 0% | Week 2 |
| Error Recovery Rate | 90% | 0% | Week 4 |

## Dependencies

- **ADR-029**: Clean Architecture layer compliance (error boundaries in Presentation layer)
- **ADR-027**: State management consolidation (error recovery from store failures)

## Related ADRs

- **ADR-026**: AI Service Unification (error handling for AI operations)
- **ADR-027**: State Management Consolidation (error boundaries for store failures)
- **ADR-029**: Clean Architecture Layer Compliance (error boundary layer placement)

## References

- Diagnostic Report: `_bmad-output/scans/comprehensive-diagnostic-report.md`
- State Reactivity Analysis: `_bmad-output/research/state-reactivity-gaps-2026-01-07.md`
- Component Inventory: `_bmad-output/planning-artifacts/architecture/codebase-analysis/component-inventory.yaml`
