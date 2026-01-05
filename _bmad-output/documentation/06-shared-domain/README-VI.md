# Tài liệu Domain Shared (Chung)

**Module:** `src/shared`
**Ngày quét:** 2026-01-05
**Trạng thái:** Triển khai một phần (Chỉ có Types)

## Tổng quan

Domain `src/shared` đóng vai trò là kho lưu trữ tập trung cho các mối quan tâm xuyên suốt (cross-cutting concerns) được sử dụng trong nhiều layer của kiến trúc ứng dụng. Nó cung cấp một nguồn sự thật duy nhất cho các type, hằng số, tiện ích và class lỗi chung.

## Cấu trúc thư mục

```
src/shared/
├── types/          # ✅ Hoạt động - Định nghĩa type chung
├── constants/      # ⏳ Dự trữ - Hằng số chung (chưa triển khai)
├── errors/         # ⏳ Dự trữ - Class lỗi chung (chưa triển khai)
└── utils/          # ⏳ Dự trữ - Hàm tiện ích chung (chưa triển khai)
```

## Trạng thái hiện tại

### Đã triển khai

| Module | Trạng thái | Files | Mục đích |
|--------|------------|-------|----------|
| `types` | Hoạt động | 1 | Định nghĩa type tập trung |

### Chưa triển khai

| Module | Trạng thái | Mục đích |
|--------|------------|----------|
| `constants` | Chờ | Hằng số toàn ứng dụng |
| `errors` | Chờ | Class lỗi chung |
| `utils` | Chờ | Hàm tiện ích chung |

## Types chung

Module `src/shared/types/index.ts` xuất (export) các type sau:

### Types nguyên thủy

| Type | Định nghĩa | Mục đích |
|------|------------|---------|
| `Status` | `'online' \| 'offline' \| 'busy' \| 'error'` | Trạng thái entity và kết nối |
| `ProviderType` | Liệt kê LLM provider | Nhận dạng provider |
| `UIVariant` | `'full' \| 'compact' \| 'minimal'` | Biến thể hiển thị component |

### Interface Generic

| Interface | Mục đích |
|-----------|---------|
| `ApiResponse<T>` | Wrapper phản hồi API chuẩn hóa |
| `PaginatedResponse<T>` | Phản hồi API với metadata phân trang |

### Interface Metadata

| Interface | Mục đích |
|-----------|---------|
| `EntityMetadata` | Timestamp và versioning entity chuẩn hóa |

### Interface Lỗi

| Interface | Mục đích |
|-----------|---------|
| `ValidationError` | Biểu diễn lỗi validation có cấu trúc |

### Interface Cấu hình

| Interface | Mục đích |
|-----------|---------|
| `PersistenceConfig` | Cấu hình layer persistence dữ liệu |

### Re-exports

| Type | Nguồn | Mục đích |
|------|-------|----------|
| `WorkspaceType` | `@/domain/value-objects/workspace-type` | Nguồn sự thật duy nhất |

## Cách sử dụng

### Import Types chung

```typescript
// Import types từ module shared
import { 
    ApiResponse, 
    ValidationError, 
    ProviderType,
    UIVariant,
    WorkspaceType 
} from '@/shared/types';

// Sử dụng trong code
const response: ApiResponse<User> = { success: true };
const error: ValidationError = { field: 'email', message: 'Invalid', code: 'ERR001' };
const provider: ProviderType = 'OpenRouter';
const variant: UIVariant = 'compact';
const workspace: WorkspaceType = 'knowledge';
```

### Import các Module tương lai

```typescript
// Constants (khi được triển khai)
import { APP_VERSION, DEFAULT_PAGE_SIZE } from '@/shared/constants';

// Errors (khi được triển khai)
import { AppError, ValidationError } from '@/shared/errors';

// Utilities (khi được triển khai)
import { debounce, deepClone, unique } from '@/shared/utils';
```

## Phụ thuộc xuyên Module

### Imports

Module `src/shared/types` hiện tại **không có imports** nào trong codebase.

### Exports

| Module tiêu thụ | Types đã import | Trạng thái |
|-----------------|-----------------|------------|
| Không có | - | Types chưa được áp dụng |

### Ghi chú về việc áp dụng

Module shared types đã được tạo nhưng chưa được áp dụng trong codebase. Một số file tự định nghĩa các type trùng lặp:

- `ValidationError` được định nghĩa ở 4+ vị trí thay vì dùng type chung
- `ApiResponse` không được sử dụng trong API routes mặc dù đã tồn tại
- `EntityMetadata` không được áp dụng cho domain entities

**Khuyến nghị:** Bắt đầu áp dụng theo giai đoạn bắt đầu với `ValidationError`.

## Tài liệu đi kèm

| File | Mô tả |
|------|-------|
| `scan-inventory.json` | Dữ liệu quét có cấu trúc và metadata |
| `file-structure.txt] | Chế độ xem dạng cây của cấu trúc thư mục |
| `utilities.md` | Tài liệu cho module utilities |
| `constants.md` | Tài liệu cho module constants |
| `shared-types.md` | Tài liệu đầy đủ về định nghĩa types |
| `README.md` | File này - Tổng quan tiếng Anh |
| `README-VI.md` | Tổng quan tiếng Việt |

## Hướng dẫn phát triển

### Thêm Types mới

Khi tạo các types xuyên suốt:

1. **Xác minh tính cần thiết:** Đảm bảo type được sử dụng trong 2+ modules
2. **Vị trí:** Thêm vào `src/shared/types/index.ts`
3. **Tài liệu:** Thêm comment JSDoc
4. **Đặt tên:** Tuân theo quy ước đặt tên hiện có
5. **Testing:** Thêm type tests nếu cần

### Thêm Constants mới

Khi tạo các hằng số toàn ứng dụng:

1. **Xác minh phạm vi:** Đảm bảo hằng số thực sự global
2. **Vị trí:** Thêm vào `src/shared/constants/` (khi được triển khai)
3. **Tổ chức:** Nhóm theo tính năng/danh mục
4. **Tài liệu:** Thêm comment JSDoc

### Thêm Utilities mới

Khi tạo các hàm tiện ích chung:

1. **Pure Functions:** Đảm bảo không có side effects
2. **Hiệu suất:** Tối ưu cho các trường hợp phổ biến
3. **Testing:** Đạt 100% coverage
4. **Type Safety:** Sử dụng TypeScript generics

## Các vấn đề đã biết

### Trùng lặp Types

Nhiều modules tự định nghĩa các phiên bản riêng của types chung:

```typescript
// Định nghĩa ValidationError trùng lặp được tìm thấy:
src/presentation/components/ui/AgentValidationFeedback.tsx
src/presentation/components/agent/AgentValidationErrors.tsx
src/lib/agent/providers/agent-validation-service.ts
src/application/services/AgentService.ts
```

**Giải quyết:** Migrate sang dùng type `ValidationError` chung.

### Chưa sử dụng

Module shared types tồn tại nhưng không được import ở đâu:

- **Imports hiện tại:** 0
- **Người tiêu thụ tiềm năng:** 10+ files

**Giải quyết:** Bắt đầu áp dụng theo giai đoạn trong code review.

## Phát triển tương lai

### Modules kế hoạch

1. **Shared Constants** (`src/shared/constants/`)
   - Metadata ứng dụng (tên, phiên bản)
   - Giới hạn cấu hình (kích thước tối đa, timeouts)
   - Feature flags
   - Quy tắc validation

2. **Shared Errors** (`src/shared/errors/`)
   - Class cơ sở `AppError`
   - Class `ValidationError`
   - `AuthenticationError`
   - `AuthorizationError`
   - `NotFoundError`

3. **Shared Utils** (`src/shared/utils/`)
   - Type guards
   - Object utilities
   - String utilities
   - Array utilities
   - Async utilities

### Lộ trình Migration

1. **Giai đoạn 1:** Áp dụng `ValidationError` từ shared types
2. **Giai đoạn 2:** Áp dụng `ApiResponse` trong API routes
3. **Giai đoạn 3:** Tạo module shared constants
4. **Giai đoạn 4:** Tạo module shared errors
5. **Giai đoạn 5:** Tạo module shared utils

## Tài liệu liên quan

- **Kiến trúc:** `_bmad-output/architecture/`
- **Deep Scan:** `_bmad/modules/deep-scan/`
- **ADR-024:** `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`

## Lịch sử phiên bản

| Phiên bản | Ngày | Thay đổi |
|-----------|------|----------|
| 1.0.0 | 2026-01-05 | Tài liệu ban đầu, chỉ có types |
