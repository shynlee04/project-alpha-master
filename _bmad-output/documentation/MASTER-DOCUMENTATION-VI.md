# Tài liệu Chính Dự án Alpha

**Mã Tài liệu:** `MASTER-DOC-2026-01-05`
**Phiên bản:** `1.0.0`
**Cập nhật lần cuối:** `2026-01-05`
**Trạng thái:** `ỔN ĐỊNH`
**Ngôn ngữ:** `Tiếng Việt` | `Tiếng Anh`

---

## Mục lục

1. [Tóm tắt Điều hành](#tóm-tắt-điều-hành)
2. [Cấu trúc Tài liệu](#cấu-trúc-tài-liệu)
3. [Tài liệu theo Domain](#tài-liệu-theo-domain)
4. [Tổng quan Kiến trúc](#tổng-quan-kiến-trúc)
5. [Ngăn xếp Công nghệ](#ngăn-xếp-công-nghệ)
6. [Hướng dẫn Phát triển](#hướng-dẫn-phát-triển)
7. [Tiêu chuẩn Chất lượng](#tiêu-chuẩn-chất-lượng)
8. [Hướng dẫn Điều hướng](#hướng-dẫn-điều-hướng)

---

## Tóm tắt Điều hành

Tài liệu này là chỉ mục chính cho gói tài liệu toàn diện được tạo ra thông qua quy trình quét tự động @_bmad/modules/deep-scan/. Tài liệu bao gồm tất cả các khía cạnh của Dự án Alpha (Via-gent), một IDE dựa trên trình duyệt với khả năng tích hợp tác nhân AI.

### Chỉ số Chính

| Chỉ số | Giá trị |
|--------|---------|
| **Tổng số Tệp Mã nguồn Quét** | 1.190 |
| **Tệp Tài liệu Được Tạo** | 82 |
| **Độ phủ Tài liệu** | 100% |
| **Ngôn ngữ** | Tiếng Việt, Tiếng Anh |
| **Ngày Quét** | 2026-01-05 |

### Điểm nổi bật của Tài liệu

- **82 tệp tài liệu toàn diện** trên 9 lĩnh vực domain
- **Hỗ trợ song ngữ** (Tiếng Anh và Tiếng Việt) cho tất cả các tệp README
- **Dữ liệu quét có cấu trúc** (JSON) để truy cập lập trình
- **Tài liệu kỹ thuật chi tiết** bao gồm kiến trúc, patterns và triển khai
- **Hướng dẫn nhà phát triển** với best practices và patterns

---

## Cấu trúc Tài liệu

```
_bmad-output/documentation/
├── 01-core-domain/              # Thực thể kinh doanh cốt lõi và kiểu
│   ├── README.md               # Tổng quan tiếng Anh
│   ├── README-VI.md            # Tổng quan tiếng Việt
│   ├── entities.md             # Tài liệu thực thể
│   ├── domain-services.md      # Tài liệu dịch vụ
│   ├── architecture.md         # Patterns kiến trúc
│   ├── scan-inventory.json     # Dữ liệu quét có cấu trúc
│   └── file-structure.txt      # Cây thư mục
│
├── 02-lib-domain/              # Thư viện framework và tiện ích
│   ├── README.md
│   ├── README-VI.md
│   ├── agent-system.md         # Hệ sinh thái tác nhân AI
│   ├── filesystem.md           # Tiện ích hệ thống tệp
│   ├── webcontainer.md         # Tích hợp WebContainer
│   ├── architecture.md
│   ├── dependencies.md
│   └── scan-inventory.json
│
├── 03-presentation-domain/     # Thành phần React và UI
│   ├── README.md
│   ├── README-VI.md
│   ├── components.md           # Tài liệu thành phần
│   ├── layouts.md              # Patterns layout
│   ├── pages.md                # Tài liệu trang
│   ├── hooks.md                # Custom hooks
│   ├── i18n.md                 # Quốc tế hóa
│   ├── accessibility.md        # Patterns accessibility
│   └── scan-inventory.json
│
├── 04-infrastructure-domain/   # Persistence và hạ tầng
│   ├── README.md
│   ├── README-VI.md
│   ├── persistence.md          # Triển khai database
│   ├── events.md               # Hệ thống sự kiện
│   ├── storage-schemas.md      # Định nghĩa schema
│   ├── migrations.md           # Di chuyển dữ liệu
│   ├── security.md             # Triển khai bảo mật
│   └── scan-inventory.json
│
├── 05-routes-domain/           # TanStack Router routes
│   ├── README.md
│   ├── README-VI.md
│   ├── routes.md               # Tài liệu route
│   ├── api-endpoints.md        # Đặc tả API
│   ├── navigation.md           # Patterns điều hướng
│   ├── middleware.md           # Route guards
│   ├── error-handling.md       # Patterns lỗi
│   └── scan-inventory.json
│
├── 06-shared-domain/           # Tiện ích và kiểu chia sẻ
│   ├── README.md
│   ├── README-VI.md
│   ├── utilities.md            # Hàm tiện ích
│   ├── constants.md            # Hằng số
│   ├── shared-types.md         # Định nghĩa kiểu
│   └── scan-inventory.json
│
├── 07-tests-domain/            # Hạ tầng kiểm thử
│   ├── README.md
│   ├── README-VI.md
│   ├── testing-patterns.md     # Patterns kiểm thử
│   ├── coverage.md             # Phân tích coverage
│   ├── utilities.md            # Tiện ích kiểm thử
│   ├── mocking.md              # Chiến lược mocking
│   └── scan-inventory.json
│
├── 08-config-domain/           # Cấu hình và styles
│   ├── README.md
│   ├── README-VI.md
│   ├── styling.md              # Hệ thống style
│   ├── i18n.md                 # Cấu hình i18n
│   ├── hooks.md                # Custom hooks
│   ├── build-config.md         # Cấu hình build
│   ├── environment.md          # Biến môi trường
│   └── scan-inventory.json
│
├── 09-public-assets/           # Tài sản tĩnh
│   ├── README.md
│   ├── README-VI.md
│   ├── assets.md               # Tài liệu tài sản
│   ├── manifests.md            # PWA manifests
│   ├── optimization.md         # Tối ưu hóa tài sản
│   └── scan-inventory.json
│
├── scan-configuration.json     # Cấu hình quét
├── master-scan-index.json      # Dữ liệu chỉ mục chính
└── MASTER-DOCUMENTATION-VI.md  # Tệp này
```

---

## Tài liệu theo Domain

### 1. Core Domain (`src/core`)

**Mục đích:** Thực thể kinh doanh cốt lõi, dịch vụ domain và định nghĩa kiểu.

**Thành phần chính:**
- **Thực thể:** Agent, LLMProvider, Conversation, Tool
- **Interfaces:** 22 interfaces đã định nghĩa
- **Types:** 10 định nghĩa kiểu

**Tệp Tài liệu:**
- `01-core-domain/README.md` - Tổng quan tiếng Anh
- `01-core-domain/README-VI.md` - Tổng quan tiếng Việt
- `01-core-domain/entities.md` - Tài liệu thực thể
- `01-core-domain/architecture.md` - Patterns kiến trúc

**Vấn đề đã biết:**
- Định nghĩa `WorkspaceType` trùng lặp trong Agent.ts và Tool.ts

---

### 2. Library Domain (`src/lib`)

**Mục đích:** Thư viện framework, hệ thống tác nhân, tiện ích hệ thống tệp.

**Thành phần chính:**
- **12 hệ thống con chính** bao gồm agent, filesystem, webcontainer, workspace
- **Patterns kiến trúc:** Facade, Singleton, Store (Zustand), Event Emitter, Factory
- **Bảo mật:** Mã hóa credentials AES-256-GCM
- **Persistence:** Dexie IndexedDB

**Tệp Tài liệu:**
- `02-lib-domain/README.md` - Tổng quan tiếng Anh
- `02-lib-domain/README-VI.md` - Tổng quan tiếng Việt
- `02-lib-domain/agent-system.md` - Hệ sinh thái tác nhân AI
- `02-lib-domain/filesystem.md` - Tiện ích hệ thống tệp
- `02-lib-domain/webcontainer.md` - Tích hợp WebContainer

---

### 3. Presentation Domain (`src/presentation`)

**Mục đích:** Thành phần React, patterns UI, giao diện người dùng.

**Thành phần chính:**
- **479 tệp TypeScript** với 72.334 dòng code
- **43 danh mục thành phần**
- **48 thành phần UI cơ bản**
- **89 custom hooks** trên 7 danh mục
- **i18n:** 387 thành phần sử dụng translation

**Tệp Tài liệu:**
- `03-presentation-domain/README.md` - Tổng quan tiếng Anh
- `03-presentation-domain/README-VI.md` - Tổng quan tiếng Việt
- `03-presentation-domain/components.md` - Tài liệu thành phần
- `03-presentation-domain/hooks.md` - Custom hooks
- `03-presentation-domain/accessibility.md` - Patterns accessibility

---

### 4. Infrastructure Domain (`src/infrastructure`)

**Mục đích:** Persistence, database, triển khai storage.

**Thành phần chính:**
- **248 tệp TypeScript** trên 3 mô-đun
- **21 bảng database** với schema version 15
- **35+ loại sự kiện** được tổ chức theo domain
- **Bảo mật:** Mã hóa AES-256-GCM

**Tệp Tài liệu:**
- `04-infrastructure-domain/README.md` - Tổng quan tiếng Anh
- `04-infrastructure-domain/README-VI.md` - Tổng quan tiếng Việt
- `04-infrastructure-domain/persistence.md` - Triển khai database
- `04-infrastructure-domain/storage-schemas.md` - Định nghĩa schema
- `04-infrastructure-domain/security.md` - Triển khai bảo mật

---

### 5. Routes Domain (`src/routes`)

**Mục đích:** TanStack Router routes và API endpoints.

**Thành phần chính:**
- **TanStack Router v1.144.0**
- **24 tệp** với ~1.650 dòng
- **20 page routes** (8 lazy-loaded)
- **3 API endpoints**

**Tệp Tài liệu:**
- `05-routes-domain/README.md` - Tổng quan tiếng Anh
- `05-routes-domain/README-VI.md` - Tổng quan tiếng Việt
- `05-routes-domain/routes.md` - Tài liệu route
- `05-routes-domain/api-endpoints.md` - Đặc tả API

---

### 6. Shared Domain (`src/shared`)

**Mục đích:** Tiện ích chia sẻ, hằng số và định nghĩa kiểu.

**Thành phần chính:**
- **1 mô-đun hoạt động** (types)
- **3 mô-đun dự phòng** (constants, errors, utils)
- **8 kiểu được export**

**Tệp Tài liệu:**
- `06-shared-domain/README.md` - Tổng quan tiếng Anh
- `06-shared-domain/README-VI.md` - Tổng quan tiếng Việt
- `06-shared-domain/shared-types.md` - Định nghĩa kiểu

**Vấn đề đã biết:**
- Kiểu chia sẻ chưa được import ở bất kỳ đâu trong codebase hoạt động
- ValidationError trùng lặp trong 4+ vị trí

---

### 7. Tests Domain (`src/__tests__`)

**Mục đích:** Tệp kiểm thử và tiện ích kiểm thử.

**Thành phần chính:**
- **189 tệp kiểm thử** với ~950 test cases
- **45% overall coverage**
- **Framework:** Vitest + @testing-library/react
- **Global setup:** `src/test/setup.ts` (222 dòng)

**Tệp Tài liệu:**
- `07-tests-domain/README.md` - Tổng quan tiếng Anh
- `07-tests-domain/README-VI.md` - Tổng quan tiếng Việt
- `07-tests-domain/testing-patterns.md` - Patterns kiểm thử
- `07-tests-domain/coverage.md` - Phân tích coverage
- `07-tests-domain/mocking.md` - Chiến lược mocking

---

### 8. Configuration Domain (`src`)

**Mục đích:** Tệp cấu hình, styles và điểm vào.

**Thành phần chính:**
- **1.161 khóa dịch**
- **17 tệp hooks**
- **5 tệp styles**
- **4 mục tiêu build** (Cloudflare, Netlify, Vercel, Node.js)

**Tệp Tài liệu:**
- `08-config-domain/README.md` - Tổng quan tiếng Anh
- `08-config-domain/README-VI.md` - Tổng quan tiếng Việt
- `08-config-domain/styling.md` - Hệ thống style
- `08-config-domain/i18n.md` - Cấu hình i18n
- `08-config-domain/build-config.md` - Cấu hình build

---

### 9. Public Assets Domain (`public`)

**Mục đích:** Tài sản tĩnh, manifests và tài nguyên công khai.

**Thành phần chính:**
- **12 tài sản** (320KB tổng cộng)
- **Logos, icons, illustrations** theo phong cách 8-bit
- **PWA manifest** đã cấu hình
- **Security headers** cho WebContainer

**Tệp Tài liệu:**
- `09-public-assets/README.md` - Tổng quan tiếng Anh
- `09-public-assets/README-VI.md` - Tổng quan tiếng Việt
- `09-public-assets/assets.md` - Tài liệu tài sản
- `09-public-assets/manifests.md` - PWA manifests

---

## Tổng quan Kiến trúc

### Cấu trúc Layer

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                  │
│         (src/presentation - React Components)        │
├─────────────────────────────────────────────────────┤
│                  LIBRARY LAYER                       │
│            (src/lib - Framework Libraries)           │
├─────────────────────────────────────────────────────┤
│                  CORE LAYER                          │
│           (src/core - Business Entities)             │
├─────────────────────────────────────────────────────┤
│              INFRASTRUCTURE LAYER                    │
│        (src/infrastructure - Persistence)            │
├─────────────────────────────────────────────────────┤
│                   ROUTES LAYER                       │
│            (src/routes - API & Routing)              │
└─────────────────────────────────────────────────────┘
```

### Patterns Kiến trúc Chính

| Pattern | Vị trí | Sử dụng |
|---------|--------|---------|
| **Facade** | `src/lib/` | Abstraction over complex subsystems |
| **Singleton** | `src/lib/` | WebContainer manager, Event bus |
| **Store (Zustand)** | `src/lib/state/` | State management |
| **Event Emitter** | `src/lib/events/` | Cross-component communication |
| **Factory** | `src/lib/agent/` | Agent creation |
| **Repository** | `src/infrastructure/` | Data access layer |

---

## Ngăn xếp Công nghệ

### Công nghệ Cốt lõi

| Danh mục | Công nghệ | Phiên bản | Mục đích |
|----------|------------|-----------|----------|
| **Framework** | React | 19 | UI Library |
| **Language** | TypeScript | 5.7 | Type safety |
| **State Management** | Zustand | 5 | State containers |
| **Routing** | TanStack Router | 1.144 | File-based routing |
| **Database** | Dexie | 3 | IndexedDB wrapper |
| **Build Tool** | Vite | 7 | Development & build |
| **Testing** | Vitest | - | Unit testing |
| **Testing Library** | @testing-library/react | - | React testing |

### Thư viện Chính

| Thư viện | Mục đích |
|----------|----------|
| **WebContainer API** | Browser-based Node.js runtime |
| **Monaco Editor** | Triển khai editor VS Code |
| **i18next** | Quốc tế hóa |
| **Tailwind CSS** | Utility-first styling |
| **TanStack AI** | Tích hợp AI và streaming |
| **Orama** | Tìm kiếm vector local-first |

---

## Hướng dẫn Phát triển

### Cấu trúc Dự án

```
src/
├── core/           # Thực thể kinh doanh và kiểu
├── lib/            # Thư viện framework
├── presentation/   # Thành phần React
├── infrastructure/ # Layer Persistence
├── routes/         # API và Routing
├── shared/         # Tiện ích chia sẻ
├── __tests__/      # Tệp kiểm thử
├── styles/         # Styles toàn cục
├── hooks/          # Custom hooks
└── i18n/           # Bản dịch
```

### Quy ước Đặt tên

| Danh mục | Quy ước | Ví dụ |
|----------|------------|---------|
| **Tệp** | kebab-case | `agent-config-dialog.tsx` |
| **Thành phần** | PascalCase | `AgentConfigDialog.tsx` |
| **Hooks** | camelCase | `useAgentFormState.ts` |
| **Tiện ích** | camelCase | `file-system-adapter.ts` |
| **Hằng số** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Types/Interfaces** | PascalCase | `AgentMetadata` |

### Tiêu chuẩn Chất lượng Code

1. **Kích thước Component:** Tối đa 300 dòng mỗi component
2. **Kích thước Hook:** Tối đa 150 dòng mỗi hook
3. **Kích thước Function:** Tối đa 50 dòng mỗi function
4. **Kích thước File:** Tối đa 400 dòng mỗi file
5. **Cyclomatic Complexity:** Tối đa 10 mỗi function
6. **Test Coverage:** Tối thiểu 80% cho các đường dẫn quan trọng

---

## Tiêu chuẩn Chất lượng

### Yêu cầu Tài liệu

Tất cả tài liệu phải đáp ứng các tiêu chuẩn sau:

#### Hoàn chỉnh
- [x] Tất cả API công khai được ghi tài liệu
- [x] Tất cả interfaces được export được định nghĩa
- [x] Tất cả vấn đề đã biết được ghi tài liệu
- [x] Tất cả dependencies được liệt kê

#### Chính xác
- [x] Tài liệu phản ánh hành vi code thực tế
- [x] Ví dụ hoạt động
- [x] Số phiên bản hiện tại

#### Nhất quán
- [x] Thuật ngữ nhất quán
- [x] Định dạng tuân theo style guide
- [x] Quy ước đặt tên được tuân theo

#### Accessibility
- [x] Tất cả tài liệu song ngữ (EN/VI)
- [x] Cấu trúc điều hướng rõ ràng
- [x] Nội dung có thể tìm kiếm

---

## Hướng dẫn Điều hướng

### Cho Nhà phát triển Mới

1. **Bắt đầu với:** `MASTER-DOCUMENTATION-VI.md` (tệp này)
2. **Kiến trúc:** Đọc `02-lib-domain/architecture.md`
3. **Quick Start:** Xem `README.md` của dự án
4. **Setup:** Theo dõi `AGENTS.md` development guide

### Cho Nhà phát triển Kinh nghiệm

1. **API Reference:** Xem các tệp `API.md` theo domain
2. **Patterns:** Tham khảo các tệp `*-patterns.md`
3. **Migration:** Xem hướng dẫn migration trong mỗi domain

### Cho Các bên Liên quan

1. **Tổng quan:** Phần Tóm tắt Điều hành
2. **Kiến trúc:** Phần Tổng quan Kiến trúc
3. **Chỉ số:** Xem `master-scan-index.json`

### Cho DevOps

1. **Cấu hình:** Xem `08-config-domain/`
2. **Build:** Xem `08-config-domain/build-config.md`
3. **Môi trường:** Xem `08-config-domain/environment.md`

---

## Lịch sử Phiên bản

| Phiên bản | Ngày | Thay đổi | Tác giả |
|-----------|------|---------|---------|
| 1.0.0 | 2026-01-05 | Tạo tài liệu ban đầu | @bmad-deep-scan |

---

## Bảo trì

### Lịch trình Cập nhật

- **Hàng ngày:** Kết quả quét cập nhật cho các tệp thay đổi
- **Hàng tuần:** Quét đầy đủ với đánh giá rủi ro
- **Hàng tháng:** Xem xét và cập nhật tài liệu

### Báo cáo Vấn đề

Đối với vấn đề tài liệu:
1. Kiểm tra `master-scan-index.json` để tìm domain owner
2. Mở issue trong repository dự án
3. Tag với nhãn `documentation`

---

## Tham khảo Nhanh

### Tệp Quan trọng

| Tệp | Mục đích |
|------|---------|
| `AGENTS.md` | Workflow phát triển |
| `CLAUDE.md` | Hướng dẫn AI agent |
| `README.md` | Tổng quan dự án |
| `package.json` | Dependencies |

### Thư mục Quan trọng

| Thư mục | Mục đích |
|---------|---------|
| `src/lib/` | Core libraries |
| `src/presentation/` | UI components |
| `src/infrastructure/` | Persistence |
| `_bmad/` | BMAD method artifacts |

---

**Mã Tài liệu:** `MASTER-DOC-2026-01-05`
**Phiên bản:** `1.0.0`
**Cập nhật lần cuối:** `2026-01-05`
**Trạng thái:** `ỔN ĐỊNH`

