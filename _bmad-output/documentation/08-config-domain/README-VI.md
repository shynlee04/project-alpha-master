# Tài liệu về Cấu hình

## Tổng quan

Tài liệu này bao gồm hệ thống cấu hình của nền tảng Via-gent, bao gồm hệ thống styling, custom hooks, quốc tế hóa (i18n), cấu hình build và biến môi trường.

## Cấu trúc Tài liệu

| Tài liệu | Mô tả |
|----------|-------|
| [scan-inventory.json](scan-inventory.json) | Dữ liệu scan có cấu trúc của tất cả file cấu hình |
| [file-structure.txt](file-structure.txt) | Cấu trúc cây thư mục cấu hình |
| [styling.md](styling.md) | Tài liệu hệ thống styling |
| [i18n.md](i18n.md) | Tài liệu quốc tế hóa (i18n) |
| [hooks.md](hooks.md) | Tài liệu custom React hooks |
| [build-config.md](build-config.md) | Tài liệu cấu hình build |
| [environment.md](environment.md) | Tài liệu biến môi trường |
| [README.md](README.md) | Phiên bản tiếng Anh |

## Tham khảo Nhanh

### Hệ thống Styling

- **Design Tokens:** CSS custom properties cho colors, typography, spacing, layout
- **Framework:** Tailwind CSS 4 với `@tailwindcss/vite`
- **Thẩm mỹ:** Chủ đề 8-bit theo cảm hứng MistralAI (tối mặc định, góc vuông, pixel shadows)
- **Animation:** Animation 8-bit tùy chỉnh (≤200ms cho micro-interactions)

### Quốc tế hóa

- **Thư viện:** i18next với react-i18next
- **Ngôn ngữ:** Tiếng Anh (en) và Tiếng Việt (vi)
- **Trích xuất:** Lệnh `pnpm i18n:extract`
- **Keys dịch:** 1,161 keys cho tất cả domains

### Custom Hooks

| Hook | Mục đích |
|------|----------|
| `useResponsive` | Responsive breakpoints ngữ nghĩa |
| `useCapabilityDetection` | Phát hiện khả năng trình duyệt |
| `useWorkspaceContext` | Quản lý workspace |
| `use-cross-workspace-events` | RAG event subscriptions |

### Cấu hình Build

- **Công cụ:** Vite 7 với TypeScript
- **Targets:** Cloudflare, Netlify, Vercel, Node.js
- **Type Checking:** `pnpm typecheck` (production) vs `pnpm typecheck:all` (bao gồm tests)
- **Linting:** ESLint với 0 warnings

### Biến Môi trường

- **Prefix:** `VITE_*` cho biến client-side
- **Sentry:** Tùy chọn error tracking
- **Deployment:** `DEPLOY_TARGET` cho platform selection

## Vị trí File

```
src/
├── styles/
│   ├── design-tokens.css      # CSS design tokens
│   ├── design-tokens.ts       # TypeScript types
│   ├── animations.css         # Custom animations
│   └── light-theme-tokens.css # Light theme overrides
│
├── hooks/
│   ├── index.ts               # Barrel exports
│   ├── useResponsive.ts       # Responsive breakpoints
│   ├── useCapabilityDetection.ts  # Browser capabilities
│   ├── useWorkspaceContext.ts     # Workspace management
│   └── use-cross-workspace-events.ts  # RAG events
│
└── i18n/
    ├── config.ts              # i18next initialization
    ├── en.json                # English translations
    ├── vi.json                # Vietnamese translations
    ├── LocaleProvider.tsx     # React context provider
    ├── en/rag.json            # RAG-specific English
    └── vi/rag.json            # RAG-specific Vietnamese
```

## File Cấu hình Chính

| File | Mục đích |
|------|---------|
| `package.json` | Build scripts, dependencies |
| `vite.config.ts` | Vite configuration, plugins |
| `tsconfig.json` | TypeScript options |
| `.env.example` | Environment variable template |

## Các tác vụ Phổ biến

### Thêm Dịch mới

1. Thêm key vào `en.json` và `vi.json`:
```json
{
  "myFeature.newAction": "New Action"
}
```

2. Chạy trích xuất:
```bash
pnpm i18n:extract
```

3. Sử dụng trong component:
```typescript
const { t } = useTranslation();
return <button>{t('myFeature.newAction')}</button>;
```

### Tạo Hook mới

1. Tạo file hook trong `src/hooks/`:
```typescript
// src/hooks/useMyHook.ts
import { useState } from 'react';

export function useMyHook() {
  const [value, setValue] = useState('');
  return { value, setValue };
}
```

2. Export từ `index.ts`:
```typescript
export { useMyHook } from './useMyHook';
```

### Cập nhật Design Tokens

1. Cập nhật `design-tokens.css`:
```css
:root {
  --my-new-token: #ff0000;
}
```

2. Cập nhật `design-tokens.ts` với TypeScript types:
```typescript
export type MyNewToken = 'my-new-token';
export type ColorToken = ... | MyNewToken;
```

### Cấu hình Build Target

```bash
# Build cho Cloudflare (mặc định)
DEPLOY_TARGET=cloudflare pnpm build:cloudflare

# Build cho Netlify
DEPLOY_TARGET=netlify pnpm build:netlify

# Build cho Vercel
DEPLOY_TARGET=vercel pnpm build:vercel
```

## Hệ thống Thiết kế

### Bảng màu

- **Primary:** Cam (#f97316) - Cảm hứng từ MistralAI
- **Background:** Đen sâu (#0f0f11)
- **Surface:** Kẽm tối (#18181b)
- **Semantic:** Success (xanh lá), Warning (vàng), Destructive (đỏ), Info (xanh dương)

### Typography

- **Fonts:** System sans-serif, Monospace (code), Pixel (8-bit)
- **Sizes:** xs đến 5xl scale
- **Weights:** Normal, Medium, Semibold, Bold

### Layout

- **Panels:** Editor (70%), Preview (40%), Terminal (30%), Chat (25%)
- **Sidebar:** Activity bar (48px), Content panel (280px)
- **Status Bar:** Chiều cao 24px

### Responsive Breakpoints

| Breakpoint | Chiều rộng |
|------------|------------|
| Mobile | < 768px |
| Tablet | 768px - 1023px |
| Desktop | ≥ 1024px |

## Domains Quốc tế hóa

| Domain | Mô tả |
|--------|-------|
| `common` | UI elements chung |
| `actions` | Nhãn hành động |
| `agents` | Cấu hình AI agent |
| `chat` | Giao diện chat |
| `knowledge` | Knowledge workspace |
| `study` | Công cụ học tập (flashcards, quizzes) |
| `notes` | Notes workspace |
| `canvas` | Knowledge canvas |
| `rag` | RAG pipeline |
| `hub` | Dashboard hub |
| `settings` | Cài đặt ứng dụng |

## Lệnh Phát triển

```bash
# Phát triển
pnpm dev                          # Bắt đầu dev server
pnpm dev:cloudflare              # Dev với Cloudflare target

# Build
pnpm build                       # Production build
pnpm build:cloudflare            # Build cho Cloudflare
pnpm build:analyze               # Build với bundle analysis

# Testing & Quality
pnpm test                        # Chạy tests
pnpm typecheck                   # TypeScript check (nhanh)
pnpm typecheck:all               # TypeScript check (tất cả files)
pnpm lint                        # ESLint
pnpm lint:fix                    # Auto-fix ESLint

# i18n
pnpm i18n:extract                # Trích xuất translation keys

# Governance
pnpm governance                  # Chạy tất cả checks
pnpm governance:size             # Kiểm tra kích thước files
pnpm governance:imports          # Kiểm tra import paths
```

## Dependencies

### Styling
- `tailwindcss@^4.1.18`
- `@tailwindcss/vite@^4.1.18`
- `clsx@^2.1.1`
- `class-variance-authority@^0.7.1`

### Internationalization
- `i18next@^25.7.3`
- `react-i18next@^16.5.0`
- `i18next-browser-languagedetector@^8.2.0`

### Build
- `vite@^7.3.0`
- `typescript@^5.9.3`
- `@vitejs/plugin-react@^5.1.2`

### Testing
- `vitest@^4.0.16`
- `@testing-library/react@^16.3.1`
- `jsdom@^27.4.0`

## Vấn đề Đã biết

1. **Styling:** Light theme chưa hoàn thiện cho một số components
2. **i18n:** Dynamic keys không tự động trích xuất được
3. **Hooks:** useResponsive yêu cầu client-side rendering
4. **Build:** Heavy libraries cần SSR alias workaround

## Best Practices

### Styling
- Sử dụng design tokens thay vì hardcoded values
- Tuân thủ thẩm mỹ 8-bit (góc vuông, pixel shadows)
- Giữ animations dưới 200ms cho micro-interactions
- Hỗ trợ `prefers-reduced-motion`

### i18n
- Sử dụng keys có namespace (ví dụ: `domain.key.subkey`)
- Implement pluralization cho count-based strings
- Cung cấp interpolation cho dynamic values
- Trích xuất translations sau khi thêm keys mới

### Hooks
- Tuân thủ React hooks rules
- Cung cấp TypeScript types đầy đủ
- Implement cleanup functions
- Test trong thư mục `__tests__/`

### Build
- Sử dụng typecheck (nhanh hơn) cho development
- Exclude test files khỏi production type checking
- Đặt heap size phù hợp (8GB)
- Cấu hình deployment target trước khi build

## Tài liệu Bổ sung

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Documentation](https://www.typescriptlang.org/)
