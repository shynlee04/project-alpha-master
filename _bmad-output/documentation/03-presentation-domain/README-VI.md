# Tài liệu Domain Presentation

## Tổng quan

Tài liệu này bao gồm thư mục `src/presentation`, chứa 479 tệp TypeScript với tổng cộng 72,334 dòng code. Layer presentation xử lý tất cả các thành phần UI, bố cục, trang và hooks cho ứng dụng.

## Cấu trúc thư mục

```
src/presentation/
├── components/
│   ├── about/          # Thành phần trang giới thiệu
│   ├── agent/          # Thành phần cấu hình AI agent
│   ├── audio/          # Thành phần trình phát âm thanh
│   ├── canvas/         # Trực quan hóa knowledge canvas
│   ├── chat/           # Thành phần giao diện chat
│   ├── common/         # Thành phần tiện ích chung
│   ├── dashboard/      # Thành phần dashboard
│   ├── dev/            # Công cụ phát triển
│   ├── hub/            # Quản lý hub và project
│   ├── ide/            # Thành phần workspace IDE
│   ├── knowledge/      # Thành phần quản lý kiến thức
│   ├── layout/         # Thành phần bố cục
│   ├── notes/          # Thành phần trình soạn thảo notes
│   ├── rag/            # Thành phần tìm kiếm RAG
│   ├── study/          # Thành phần học tập và quiz
│   ├── ui/             # Thành phần UI cơ bản
│   └── workspace/      # Thành phần workspace
├── Header.tsx
└── LanguageSwitcher.tsx
```

## Các tệp tài liệu

| Tệp | Mô tả |
|-----|-------|
| `scan-inventory.json` | Dữ liệu scan có cấu trúc với metadata |
| `file-structure.txt` | Cấu trúc dạng cây của thư mục |
| `components.md` | Tài liệu thành phần |
| `layouts.md` | Tài liệu thành phần bố cục |
| `pages.md` | Tài liệu thành phần trang |
| `hooks.md` | Tài liệu custom hooks |
| `i18n.md` | Phạm vi quốc tế hóa |
| `accessibility.md` | Mẫu tiếp cận |
| `README.md` | Tệp này (Tiếng Anh) |
| `README-VI.md` | Phiên bản tiếng Việt |

## Tham khảo nhanh

### Danh mục thành phần

| Danh mục | Tệp | Mô tả |
|----------|-----|-------|
| UI | 49 | Thành phần cơ bản (Button, Dialog, v.v.) |
| Agent | 43 | Cấu hình AI agent |
| Chat | 25 | Giao diện chat |
| IDE | 31 | Workspace IDE |
| Knowledge | 25 | Quản lý kiến thức |
| Layout | 16 | Bố cục trang |
| Study | 14 | Học tập và quiz |
| Hub | 38 | Project hub |

### Thống kê chính

- **Tổng số tệp:** 479
- **Dòng code:** 72,334
- **Hooks:** 89
- **Sử dụng i18n:** 387 thành phần
- **Interfaces:** 100+

## Hệ thống thiết kế

### Phong cách 8-bit

Ứng dụng sử dụng chủ đề tối theo phong cách 8-bit với:
- Không có hiệu ứng glassmorphism hoặc blur
- Phong cách retro đặc trưng
- Design tokens cho tính nhất quán
- Thành phần pixel-perfect

### Thiết kế responsive

- **Di động:** < 768px
- **Máy tính bảng:** 768px - 1024px
- **Desktop:** >= 1024px

Sử dụng hook `useResponsive` để phát hiện breakpoint.

## Quản lý trạng thái

### Zustand Stores

| Store | Mục đích |
|-------|----------|
| `useIDEStore` | Trạng thái IDE (panels, tabs, v.v.) |
| `useConversationStore` | Trạng thái cuộc hội thoại/thread |
| `useAgentsStore` | Cấu hình agent |
| `useProviderStore` | Cấu hình LLM provider |

### Persistence

Trạng thái được lưu trữ qua:
- IndexedDB (Dexie.js) cho dữ liệu phức tạp
- localStorage cho tùy chọn đơn giản

## Quốc tế hóa

### Ngôn ngữ được hỗ trợ

- **Tiếng Anh (en)** - Mặc định
- **Tiếng Việt (vi)**

### Mẫu sử dụng

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <button>{t('actions.save')}</button>;
}
```

### Các domain chính

- `agents.*` - Cấu hình agent
- `memory.*` - Bộ nhớ cuộc hội thoại
- `deepThink.*` - Phân tích sâu
- `citation.*` - Trích dẫn RAG
- `actions.*` - Nhãn nút

## Tiếp cận

### WCAG 2.1 Level AA

- Điều hướng bàn phím
- Hỗ trợ screen reader (ARIA)
- Quản lý focus
- Skip links
- Thông báo trạng thái

### Thành phần chính

- `SkipLinks` - Liên kết bỏ qua điều hướng
- `StatusAnnouncer` - Thông báo cho screen reader
- ErrorBoundary - Xử lý lỗi

## Hướng dẫn phát triển

### Mẫu thành phần

```typescript
// Interface props
interface ComponentNameProps {
  required: Type;
  optional?: Type;
  onAction?: (data: Data) => void;
}

// Component với hooks
export function ComponentName({ required }: ComponentNameProps) {
  const { data } = useHook();
  return <div>{data}</div>;
}
```

### Mẫu Hook

```typescript
export function useHookName(params: Params): ReturnType {
  const [state, setState] = useState(initial);
  // Implementation
  return { state, actions };
}
```

### Quy ước import

```typescript
// Barrel exports
import { Button, Card } from '@/presentation/components/ui';

// Import cụ thể
import { AgentConfigDialog } from '@/presentation/components/agent';
```

## Testing

### Tests thành phần

Tests được đặt cùng thư mục với `__tests__/`:

```
Component/
├── Component.tsx
└── __tests__/
    └── Component.test.tsx
```

### Thư viện testing

- **Vitest** - Test runner
- **React Testing Library** - Testing thành phần
- **jest-axe** - Testing tiếp cận

## Build và Run

### Phát triển

```bash
pnpm dev
```

### Kiểm tra type

```bash
pnpm typecheck
```

### Quốc tế hóa

```bash
# Trích xuất keys translation
pnpm i18n:extract
```

## Tài liệu liên quan

- **Kiến trúc:** `_bmad-output/architecture/`
- **Quản lý trạng thái:** `ADR-024` trong `_bmad-output/project-planning-artifacts/`
- **Thành phần:** `src/presentation/components/ui/index.ts`
