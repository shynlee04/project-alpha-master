# Tài liệu Domain Routes

Thư mục này chứa tài liệu toàn diện cho domain `src/routes` của ứng dụng Via-gent.

## Tổng quan

Ứng dụng Via-gent sử dụng **TanStack Router v1** cho routing dựa trên file. Thư mục routes chứa 24 file (1,650+ dòng code) được tổ chức thành:

- **Page Routes** - Trang người dùng (IDE, Knowledge, Notes, Study, v.v.)
- **API Routes** - Endpoint phía server (Chat, Quiz, Flashcard generation)
- **Utility Routes** - Công cụ phát triển (Test FSA Adapter)
- **Generated Files** - Route tree được tự động tạo

## Các file tài liệu

| File | Mô tả |
|------|-------|
| `scan-inventory.json` | Dữ liệu scan có cấu trúc với metadata file |
| `file-structure.txt` | Dạng cây của tất cả file route |
| `routes.md` | Tài liệu route toàn diện |
| `api-endpoints.md` | Thông số API endpoint |
| `navigation.md` | Patterns và quy ước điều hướng |
| `middleware.md` | Route guards và middleware |
| `error-handling.md` | Chiến lược xử lý lỗi |
| `README.md` | File này (Tiếng Anh) |
| `README-VI.md` | Phiên bản Tiếng Việt |

## Tham khảo nhanh

### Cấu trúc Route

```
__root__ (/)
├── index (/)
├── hub (/hub)
├── about (/about)
├── agents (/agents)
├── settings (/settings)
├── test-fs-adapter (/test-fs-adapter)
├── workspace (/workspace)
├── ide (/ide)
│   └── $projectId (/ide/$projectId)
├── knowledge (/knowledge)
│   └── $projectId (/knowledge/$projectId)
├── notes (/notes)
│   └── $projectId (/notes/$projectId)
├── study (/study)
│   └── $projectId (/study/$projectId)
├── webcontainer/$
└── api
    ├── chat (/api/chat)
    ├── quizzes/generate (/api/quizzes/generate)
    └── flashcards/generate (/api/flashcards/generate)
```

### Route chính

| Đường dẫn | Mục đích | SSR |
|-----------|----------|-----|
| `/` | Trang chủ | Yes |
| `/ide` | Workspace IDE | No |
| `/ide/$projectId` | IDE với project | No |
| `/knowledge` | Workspace Knowledge | Yes |
| `/notes` | Workspace Notes | Yes |
| `/study` | Workspace Study | Yes |
| `/settings` | Trang cài đặt | Yes |
| `/agents` | Quản lý Agent | Yes |
| `/api/chat` | API AI chat | - |
| `/api/flashcards/generate` | API Flashcard | - |
| `/api/quizzes/generate` | API Quiz | - |

## Framework & Công nghệ

- **Router**: TanStack Router v1.144.0
- **Routing Pattern**: File-based routing
- **State Management**: React Context + TanStack Router loaders
- **Lazy Loading**: TanStack Router lazy() function
- **Error Boundaries**: React ErrorBoundary pattern
- **Monitoring**: Tích hợp Sentry

## Patterns chính

### 1. Định nghĩa Route

```typescript
// Route trang chuẩn
export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});
```

### 2. Route với tham số

```typescript
// Route động với loader
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});
```

### 3. Lazy Loading

```typescript
// Route lazy-loaded
export const Route = createLazyFileRoute('/study')({
  component: StudyPage,
});
```

### 4. API Routes

```typescript
// Handler phía server
export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Xử lý yêu cầu chat
      },
    },
  },
});
```

## Providers & Context

Tất cả routes được bọc bởi providers từ `__root.tsx`:

```
ThemeProvider → Chủ đề 8-bit dark
LocaleProvider → Hỗ trợ i18n
TooltipProvider → Tooltip UI
AppInitializer → Thiết lập app
UnifiedWorkspaceProvider → Trạng thái workspace
AppErrorBoundary → Xử lý lỗi toàn cục
MigrationStatus → Di chuyển dữ liệu
```

## API Endpoints

### Chat API (`/api/chat`)
- **GET**: Kiểm tra sức khỏe
- **POST**: Chat AI streaming với hỗ trợ tools

### Flashcards API (`/api/flashcards/generate`)
- **POST**: Tạo flashcards từ nội dung nguồn

### Quiz API (`/api/quizzes/generate`)
- **POST**: Tạo câu hỏi quiz từ các nguồn

## Phát triển

### Thêm Route mới

1. Tạo file route trong `src/routes/`
2. Sử dụng `createFileRoute()` hoặc `createLazyFileRoute()`
3. Chạy dev server để tự động tạo `routeTree.gen.ts`

### Đặt tên file Route

| Pattern | Ví dụ |
|---------|-------|
| Tĩnh | `settings.tsx` → `/settings` |
| Động | `ide.$projectId.tsx` → `/ide/$projectId` |
| Lazy | `study.lazy.tsx` → `/study` |
| Splat | `webcontainer.$.tsx` → `/webcontainer/*` |
| API | `api/chat.ts` → `/api/chat` |

### Test Routes

Sử dụng Test FSA Adapter route để phát triển:
```
/test-fs-adapter
```

## Tài liệu liên quan

- TanStack Router Docs: https://tanstack.com/router
- AGENTS.md: Hướng dẫn phát triển toàn dự án
- `src/router.tsx`: Cấu hình Router
- `src/routeTree.gen.ts`: Route tree được tạo tự động

---

Được tạo: 2026-01-05
Framework: TanStack Router v1.144.0
Tổng số file: 24
Tổng số dòng: ~1,650
