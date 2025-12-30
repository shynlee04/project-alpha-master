# Component Inventory

## Inventory Stats
- **Total Components:** 100+ identified via static analysis.
- **Design System:** ~30 atomic components.
- **Feature Components:** ~70 domain-specific components.

## 1. Atomic Design System (`src/components/ui`)
Base primitives built with Radix UI and TailwindCSS.

| Component | Props Interface | Description |
|-----------|-----------------|-------------|
| `ApprovalOverlay` | `ApprovalOverlayProps` | Modal for user approvals |
| `Button` | `ButtonProps` | Standard interactive button |
| `Card` | `CardProps` | Container surfacing content |
| `Checkbox` | `CheckboxProps` | Boolean input |
| `CollapsibleSection` | `CollapsibleSectionProps` | Expandable content area |
| `ContextTooltip` | `ContextTooltipProps` | Helper text on hover |
| `Dialog` | `DialogContentProps` | Modal window |
| `DropdownMenu` | - | Context menus |
| `EmptyState` | `EmptyStateProps` | Placeholder for no data |
| `ErrorState` | `ErrorStateProps` | Error feedback display |
| `Input` | `InputProps` | Text input field |
| `KeyboardShortcutsOverlay` | `KeyboardShortcutsOverlayProps` | Hotkey reference |
| `Label` | `LabelProps` | Form label |
| `LoadingState` | `LoadingStateProps` | Spinner/Loading feedback |
| `ProgressIndicator` | `ProgressIndicatorProps` | Visual progress tracker |
| `Select` | `SelectTriggerProps` | Dropdown selection |
| `SkeletonLoader` | `SkeletonLoaderProps` | Loading placeholder |
| `Switch` | `SwitchProps` | Toggle switch |
| `Textarea` | `TextareaProps` | Multiline text input |
| `Toast` | - | Notification notifications |
| `Tooltip` | - | Info on hover |

## 2. IDE Core (`src/components/ide`)
The primary coding environment interface.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `AgentChatPanel` | - | Main agent interaction area |
| `AppearanceSettings` | - | Theme/font config |
| `BentoCardPreview` | `BentoCardPreviewProps` | Card layout for dashboards |
| `BentoGrid` | `BentoGridProps` | Grid layout system |
| `CommandPalette` | `CommandPaletteProps` | Global command menu |
| `EnhancedChatInterface` | - | Rich chat features |
| `FeatureSearch` | `FeatureSearchProps` | Capability discovery |
| `FileTree` | `FileTreeProps` | File system navigation |
| `MonacoEditor` | `MonacoEditorProps` | Code editor instance |
| `PreviewPanel` | `PreviewPanelProps` | WebContainer outputs |
| `QuickActionsMenu` | `QuickActionsMenuProps` | Contextual actions |
| `StatusBar` | - | Application status footer |
| `StreamingMessage` | `StreamingMessageProps` | AI response renderer |
| `SyncEditWarning` | `SyncEditWarningProps` | Conflict alert |
| `SyncStatusIndicator` | `SyncStatusIndicatorProps` | Connectivity status |
| `XTerminal` | - | Terminal emulator |

## 3. Chat System (`src/components/chat`)
AI communication and control layers.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `AgentSelector` | - | Model/Agent picker |
| `ApprovalOverlay` | `ApprovalOverlayProps` | Tool execution gate |
| `AutoApproveSettings` | `AutoApproveSettingsProps` | Permission config |
| `BatchApprovalBar` | `BatchApprovalBarProps` | Bulk action toolbar |
| `ChatConversation` | - | Thread view container |
| `ChatPanel` | - | Messaging interface |
| `CodeBlock` | `CodeBlockProps` | Syntax highlighted code |
| `DiffPreview` | `DiffPreviewProps` | Code change approval |
| `StreamdownRenderer` | - | Markdown streaming |
| `ThreadCard` | - | History item |
| `ThreadsList` | - | Sidebar history |
| `ToolCallBadge` | `ToolCallBadgeGroupProps` | Tool execution status |

## 4. Knowledge & Study (`src/components/knowledge`, `src/components/study`)
RAG and learning features.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `CollectionManager` | `CollectionManagerProps` | Document set management |
| `CollectionSelector` | `CollectionSelectorProps` | RAG context picker |
| `FlashcardView` | `FlashcardViewProps` | Study card display |
| `MetadataDisplay` | `MetadataDisplayProps` | Source info view |
| `MetadataEditor` | `MetadataEditorProps` | Metadata editing |
| `StudyPage` | `StudyPageProps` | Learning dashboard |
| `StudySession` | `StudySessionProps` | Active study flow |
| `StudyStatsDisplay` | `StudyStatsDisplayProps` | Progress metrics |
| `SourceContextMenu` | `SourceContextMenuProps` | Document actions |

## 5. Agent Configuration (`src/components/agent`)
Settings for AI behavior.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `AgentConfigDialog` | - | Main config modal |
| `ProviderSettings` | - | API key management |
| `ToolPermissionsConfig`| `ToolPermissionsConfigProps` | Security policies |

## 6. Visualization (`src/components/canvas`)
Node-based relationship views.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `Canvas` | - | Infinite canvas area |
| `ConceptNode` | - | Knowledge node |
| `RelationshipEdge` | - | Connection line |

## 7. Layouts (`src/components/layout`)
Application scaffolding.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `ChatPanelWrapper` | `ChatPanelWrapperProps` | Layout container |
| `IDEHeaderBar` | `IDEHeaderBarProps` | Main navigation |
| `IDELayout` | - | Workspace structure |
| `MainLayout` | `MainLayoutProps` | Root layout |
| `MainSidebar` | `MainSidebarProps` | Primary navigation |
| `TerminalPanel` | `TerminalPanelProps` | Console container |

## 8. Hub & Dashboard (`src/components/hub`, `src/components/dashboard`)
Project management and overview.

| Component | Props Interface | Usage |
|-----------|-----------------|-------|
| `HubHomePage` | - | Main landing |
| `NavigationBreadcrumbs`| `NavigationBreadcrumbsProps` | Path tracking |
| `Onboarding` | - | User welcome flow |
| `PitchDeck` | `PitchDeckProps` | Presentation view |
