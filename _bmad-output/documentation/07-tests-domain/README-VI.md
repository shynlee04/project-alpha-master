# Tài liệu Miền Kiểm Thử (Tests Domain)

## Tổng Quan

Thư mục này chứa tài liệu toàn diện cho miền `src/__tests__` của dự án. Tài liệu được cấu trúc để giúp nhà phát triển hiểu, duy trì và mở rộng bộ kiểm thử một cách hiệu quả.

## Cấu Trúc Tài Liệu

| Tệp | Mô Tả |
|-----|-------|
| `scan-inventory.json` | Danh sách có cấu trúc của tất cả các tệp kiểm thử, được tổ chức theo danh mục miền |
| `file-structure.txt` | Dạng cây của cấu trúc tệp kiểm thử qua tất cả các miền |
| `testing-patterns.md` | Hướng dẫn toàn diện về các mẫu kiểm thử được sử dụng trong dự án |
| `coverage.md` | Phân tích chi tiết về độ phủ kiểm thử theo miền và danh mục |
| `utilities.md` | Danh mục các tiện ích kiểm thử, trợ giúp và nhà máy giả lập |
| `mocking.md` | Tài liệu về chiến lược và mẫu giả lập |
| `README.md` | Tệp này - tổng quan tiếng Anh |
| `README-VI.md` | Bản dịch tiếng Việt của tổng quan này |

## Tham Khảo Nhanh

### Thống Kê Kiểm Thử

| Chỉ số | Giá trị |
|--------|---------|
| **Tổng Số Tệp Kiểm Thử** | 189 |
| **Tổng Số Ca Kiểm Thử** | ~950 |
| **Khung Kiểm Thử** | Vitest, @testing-library/react |
| **Độ Phủ Ước Tính** | 45% |
| **Tệp Thiết Lập** | `src/test/setup.ts` |

### Chạy Kiểm Thử

```bash
# Chạy tất cả các kiểm thử
pnpm test

# Chạy tệp kiểm thử cụ thể
pnpm vitest run src/__tests__/chat.test.ts

# Chạy ở chế độ watch
pnpm vitest

# Chạy với độ phủ
pnpm vitest run --coverage
```

### Cấu Hình Kiểm Thử

- **Tệp Cấu Hình:** `vitest.config.ts`
- **Môi Trường:** Node (mặc định) / jsdom (per-test với comment)
- **Globals:** Đã bật
- **Tệp Thiết Lập:** `./src/test/setup.ts`

## Độ Phủ Theo Miền

### Độ Phủ Cao (75%+)
- **Agent:** AI agents, providers, tools, permissions (15 tệp kiểm thử)
- **RAG:** Retrieval, chunking, indexing (12 tệp kiểm thử)

### Độ Phủ Trung Bình (50-75%)
- **Filesystem:** FSA, sync, path validation (20 tệp kiểm thử)
- **Knowledge:** Sources, metadata, synthesis (18 tệp kiểm thử)
- **Workspace:** Project, session, state (8 tệp kiểm thử)
- **Sync:** File sync, events, rollback (10 tệp kiểm thử)
- **Presentation:** Components, UI integration (45 tệp kiểm thử)
- **Hooks:** Custom hooks (12 tệp kiểm thử)

### Độ Phủ Thấp (<50%)
- **Notes:** Note operations, AI services (5 tệp kiểm thử)
- **Study:** Quiz, SRS, flashcards (4 tệp kiểm thử)
- **Events:** Event bus, workspace events (5 tệp kiểm thử)
- **WebContainer:** Terminal, manager, crash recovery (6 tệp kiểm thử)

## Các Mẫu Kiểm Thử Chính

### 1. Giả Lập Module

```typescript
const { mockChat } = vi.hoisted(() => ({
    mockChat: vi.fn(),
}));

vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
}));
```

### 2. Kiểm Thử Stream Async

```typescript
const mockStream = (async function* () {
    yield { type: 'text-delta', text: 'Hello' };
    yield { type: 'done' };
})();

for await (const chunk of mockStream) {
    // Xử lý chunk
}
```

### 3. Kiểm Thử Event Bus

```typescript
const mockEventBus = {
    on: vi.fn(),
    emit: vi.fn(),
};

manager.setEventBus(mockEventBus as any);
expect(mockEventBus.emit).toHaveBeenCalledWith('event', data);
```

### 4. Kiểm Thử Theo Workspace

```typescript
it('should allow execute_command in IDE workspace', () => {
    const result = manager.checkPermission('execute_command', 'ide');
    expect(result.canExecute).toBe(true);
});
```

## Tiện Ích Kiểm Thử

### Thiết Lập Toàn Cục (`src/test/setup.ts`)

- **fake-indexeddb/auto** - Triển khai giả lập IndexedDB
- **i18n mock** - Hàm dịch với các bản dịch được định nghĩa trước
- **Router mock** - Các stub TanStack Router
- **Store mocks** - IDE Store, Workspace mock
- **Global stubs** - crypto, ResizeObserver, IntersectionObserver

### Tiện Ích Giả Lập

| Tiện ích | Mục đích |
|----------|----------|
| `vi.hoisted()` | Hàm giả lập được hoist để khởi tạo đúng thứ tự |
| `vi.mocked()` | Xác nhận giả lập an toàn kiểu |
| `vi.fn()` | Tạo hàm giả lập |
| `vi.spyOn()` | Giám sát các phương thức hiện có |
| `vi.stubGlobal()` | Stub các đối tượng toàn cục |

## Thực Hành Tốt Nhất

### Tổ Chức Kiểm Thử

1. **Tên Mô Tả:** Sử dụng tên kiểm thử rõ ràng mô tả hành vi mong đợi
2. **Cô Lập Đúng:** Đặt lại trạng thái giữa các kiểm thử với `beforeEach`
3. **Giả Lập Phụ Thuộc Ngoài:** Sử dụng `vi.mock()` cho các module ngoài
4. **Kiểm Thử Trường Hợp Biên:** Bao gồm các trường hợp trống, lỗi và điều kiện biên

### Hướng Dẫn Giả Lập

1. **Hoist Mocks:** Sử dụng `vi.hoisted()` cho các mock cần thiết về thứ tự khởi tạo
2. **An Toàn Kiểu:** Sử dụng `vi.mocked()` cho các xác nhận an toàn kiểu
3. **Đặt Lại Mocks:** Xóa mocks với `vi.clearAllMocks()` trong `afterEach`
4. **Xác Minh Tương Tác:** Luôn xác minh các lệnh gọi mock với các xác nhận

### Mục Tiêu Độ Phủ

| Ưu tiên | Mục tiêu | Lĩnh vực tập trung |
|---------|----------|--------------------|
| Cao | Mở rộng | Miền Notes, Study |
| Trung bình | Tăng cường | Kiểm thử khả năng truy cập |
| Dài hạn | 75% | Độ phủ tổng thể |

## Các Tác Phẩm Phổ Biến

### Thêm Kiểm Thử Mới

1. Tạo tệp kiểm thử trong thư mục `__tests__` phù hợp
2. Sử dụng tên nhất quán: `*.test.ts` hoặc `*.test.tsx`
3. Theo các mẫu đã thiết lập từ các kiểm thử tương tự
4. Thêm vào phần miền liên quan trong `scan-inventory.json`

### Giả Lập Module Mới

1. Xác định mức giả lập (module, hàm, toàn cục)
2. Sử dụng `vi.hoisted()` cho các mock nhạy cảm với thứ tự khởi tạo
3. Áp dụng với `vi.mock()` ở cấp độ tệp
4. Đặt lại trong `beforeEach` hoặc `afterEach`

### Mở Rộng Độ Phủ

1. Xác định các vùng độ phủ thấp từ `coverage.md`
2. Thêm kiểm thử cho các trường hợp biên và đường dẫn lỗi
3. Cân nhắc kiểm thử tích hợp cho các quy trình làm việc
4. Cập nhật tài liệu mẫu trong `testing-patterns.md`

## Tài Liệu Liên Quan

- [Mẫu Kiểm Thử](./testing-patterns.md)
- [Chiến Lược Giả Lập](./mocking.md)
- [Tiện Ích Kiểm Thử](./utilities.md)
- [Phân Tích Độ Phủ](./coverage.md)
- Tài liệu Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/

## Thông Tin Phiên Bản

| Thuộc tính | Giá trị |
|------------|---------|
| **Phiên Bản Scanner** | 1.0.0 |
| **Ngày Quét** | 2026-01-05 |
| **Cập Nhật Lần Cuối** | 2026-01-05 |
| **Ngôn Ngữ Tài Liệu** | Tiếng Anh, Tiếng Việt |

## Đóng Góp

Khi đóng góp vào bộ kiểm thử:

1. Theo các mẫu đã thiết lập từ các kiểm thử hiện có
2. Thêm tên và comment kiểm thử mô tả
3. Bao gồm kiểm thử xử lý lỗi
4. Giả lập ở mức phù hợp (module, không phải nội bộ)
5. Xác minh độ phủ cho chức năng mới
6. Cập nhật các tệp tài liệu khi cần thiết

## Bản Quyền

Tài liệu này là một phần của tài liệu dự án và tuân theo các điều khoản cấp phép giống như dự án.
