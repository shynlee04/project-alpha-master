# Database Operation Profiling

## Operation Inventory
| Operation | Trigger | Frequency | Data Size |
|-----------|---------|-----------|-----------|
| `projects.update(lastOpened)` | Open Project | Low | Tiny |
| `syncStatus.put` | File Sync | 🔥 High | Small |
| `fileMetadata.put` | File Sync | 🔥 High | Small |
| `toolExecutionLogs.put` | Agent Action | Medium | Medium |
| `notes.update` | Typing | High (Debounced?) | Medium |

## Hot Path Operations
| Operation | File | Impact | Fix |
|-----------|------|--------|-----|
| `fileMetadata` writes | `file-metadata-helpers.ts` | Slow sync | Use `bulkPut` |
| `syncStatus` writes | `sync-status-helpers-basic.ts` | UI jitter | Batch updates |

## Frequent Operations
- **File Sync**: When a project opens, thousands of file metadata records might be checked/updated. `getAllFileMetadata` + individual `put` is a bottleneck.
- **Agent Logs**: Every tool execution logs to DB. In a long loop, this adds up.

## Missing Indexes
- `fileMetadata`: `[projectId+path]` compound index exists. Good.
- `syncStatus`: Indexed by `id`. Might need index on `status` for filtering.

## Optimization Recommendations
1. **Batch File Sync**: Ensure `FileMetadataCache` uses `bulkUpsert` for initial scan.
2. **Debounce Note Saves**: Verify `NoteEditor` debounces saves to `db.notes`.
3. **Background Log Cleanup**: `toolExecutionLogs` can grow indefinitely. Implement auto-pruning.
