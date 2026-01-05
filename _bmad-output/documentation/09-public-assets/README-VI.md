# Tài Liệu Tài Nguyên Công Khai

## Tổng Quan

Tài liệu này bao gồm thư mục `public/`, nơi chứa tất cả tài nguyên tĩnh được phục vụ trực tiếp bởi máy chủ web. Các tài nguyên này rất quan trọng cho bản sắc ứng dụng, chức năng PWA và tối ưu hóa SEO.

## Cấu Trúc Thư Mục

```
public/
├── _headers                          (1.192 byte) - Cấu hình header bảo mật Netlify
├── robots.txt                        (67 byte) - Điều khiển truy cập bot
├── manifest.json                     (498 byte) - Manifest PWA để cài đặt
├── favicon.ico                       (3.870 byte) - Favicon legacy (đa độ phân giải)
├── logo192.png                       (5.347 byte) - Icon PWA 192x192 PNG
├── logo512.png                       (9.664 byte) - Icon PWA 512x512 PNG
├── via-gent-logo.svg                 (13.247 byte) - Logo thương hiệu chính (500x120 SVG)
├── tanstack-word-logo-white.svg      (15.002 byte) - Thương hiệu TanStack (3178x660 SVG)
├── tanstack-circle-logo.png          (265.387 byte) - Logo tròn TanStack (600x600 PNG)
└── assets/
    ├── agent-team.svg                (2.450 byte) - Hình minh họa đội tác tử (200x200)
    ├── knowledge-hub.svg             (1.712 byte) - Hình minh họa kho tri thức (200x200)
    └── empty-project.svg             (1.125 byte) - Hình minh họa trạng thái trống (200x200)

Tổng: 12 tệp, 320.387 byte (~313 KB)
```

## Danh Mục Tài Nguyên

### Tệp Cấu Hình

| Tệp | Mục đích | Tính năng chính |
|-----|----------|-----------------|
| `_headers` | Header HTTP Netlify | Header bảo mật, CORS, CSP |
| `robots.txt` | Kiểm soát truy cập bot | Cho phép tất cả bot |
| `manifest.json` | Cấu hình PWA | Icons, chế độ hiển thị, theme |

### Biểu Tượng

| Tệp | Kích thước | Kích thước pixel | Sử dụng |
|-----|------------|------------------|---------|
| `favicon.ico` | 3.9KB | 16-64px | Tab trình duyệt, bookmarks |
| `logo192.png` | 5.3KB | 192x192 | Icons PWA, Android |
| `logo512.png` | 9.7KB | 512x512 | Màn hình splash PWA |

### Logo

| Tệp | Kích thước | Kích thước pixel | Mô tả |
|-----|------------|------------------|-------|
| `via-gent-logo.svg` | 13KB | 500x120 | Logo chính với hiệu ứng động |
| `tanstack-word-logo-white.svg` | 15KB | 3178x660 | Thương hiệu framework TanStack |
| `tanstack-circle-logo.png` | 265KB | 600x600 | Logo tròn TanStack |

### Hình Minh Họa (Phong Cách 8-bit)

| Tệp | Kích thước | Kích thước pixel | Sử dụng |
|-----|------------|------------------|---------|
| `agent-team.svg` | 2.5KB | 200x200 | Hệ thống đa tác tử |
| `knowledge-hub.svg` | 1.7KB | 200x200 | Giao diện quản lý tri thức |
| `empty-project.svg` | 1.1KB | 200x200 | Trạng thái trống |

## Tệp Quan Trọng

### manifest.json

Manifest PWA định nghĩa cách ứng dụng cài đặt trên thiết bị người dùng. Cấu hình hiện tại bao gồm:

- **Chế độ hiển thị:** `standalone` (xóa giao diện trình duyệt)
- **Màu theme:** `#000000`
- **Màu nền:** `#ffffff`
- **Icons:** Ba kích thước (64, 192, 512 pixel)

**Vấn đề đã biết:**
- Tên giữ chỗ chung ("TanStack App")
- Thiếu icon iOS 180x180
- Không có danh mục hoặc mô tả

Xem [manifests.md](./manifests.md) để biết tài liệu chi tiết.

### _headers

Cấu hình header HTTP cho:

- **Cross-Origin Isolation:** Cần thiết cho WebContainers
- **Header bảo mật:** X-Frame-Options, X-Content-Type-Options
- **CSP:** Content Security Policy (với inline scripts cho Monaco Editor)
- **HSTS:** Bắt buộc HTTPS trong 1 năm

Xem [manifests.md](./manifests.md) để biết tài liệu header đầy đủ.

### via-gent-logo.svg

Logo thương hiệu chính với:

- Biểu tượng IDE hình lục giác động
- Lõi mạng thần kinh với các vòng xoay
- Typography "Via-gent" với gradient
- Chỉ báo trạng thái (AI, Code, Terminal, Sync)
- Chi tiết công nghệ phong cách 8-bit

## Ví Dụ Sử Dụng

### Bao Gồm Tài Nguyên Trong Component

```tsx
// Import logo
import viaGentLogo from '/via-gent-logo.svg';
import tanstackLogo from '/tanstack-circle-logo.png';

function Header() {
  return (
    <header>
      <img src={viaGentLogo} alt="Via-gent" height="48" />
      <img src={tanstackLogo} alt="TanStack" width="32" />
    </header>
  );
}
```

### Sử Dụng Hình Minh Họa

```tsx
import agentTeamIllustration from '/assets/agent-team.svg';
import emptyProjectIllustration from '/assets/empty-project.svg';

function AgentView() {
  return <img src={agentTeamIllustration} alt="Đội tác tử" />;
}

function EmptyState() {
  return (
    <div>
      <img src={emptyProjectIllustration} alt="Dự án trống" />
      <p>Chưa có dự án</p>
    </div>
  );
}
```

### Icons PWA

```html
<head>
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/logo192.png" />
  <meta name="theme-color" content="#000000" />
</head>
```

## Tối Ưu Hóa

Tệp lớn nhất là `tanstack-circle-logo.png` với 265KB (82.9% tổng). Các chiến lược tối ưu hóa chính:

1. **Tối ưu SVG:** Sử dụng SVGO để đơn giản hóa đường dẫn
2. **Nén PNG:** Lossless (optipng) hoặc lossy (pngquant)
3. **Chuyển đổi WebP:** Giảm ~50-70% kích thước
4. **Caching:** Cấu hình header cache bất biến
5. **Lazy Loading:** Trì hoãn hình ảnh không quan trọng

Xem [optimization.md](./optimization.md) để biết chiến lược chi tiết.

## Phụ Thuộc Tài Nguyên

### Framework
- **TanStack:** Cần ghi nhận framework
- **PWA:** Sử dụng manifest.json để cài đặt

### Hỗ Trợ Trình Duyệt
| Tài nguyên | Chrome | Firefox | Safari | Edge |
|------------|--------|---------|--------|------|
| SVG | ✓ | ✓ | ✓ | ✓ |
| PNG | ✓ | ✓ | ✓ | ✓ |
| ICO | ✓ | ✓ | ✓ | ✓ |
| PWA | ✓ | ✓ | ✓ | ✓ |

## Ghi Chú Nhà Phát Triển

### Thêm Tài Nguyên Mới

1. Đặt tệp vào `public/` hoặc `public/assets/`
2. Sử dụng kebab-case cho tên tệp
3. Tối ưu hóa trước khi commit (SVGO, optipng)
4. Cập nhật `manifest.json` nếu thêm icons
5. Ghi chú trong tài liệu này

### Quy Ước Đặt Tên
- **Logo:** `{brand-name}-{type}.{ext}`
- **Icon:** `{purpose}-{size}.{ext}` (ví dụ: `logo192.png`)
- **Hình minh họa:** `{context}-{state}.{ext}` (ví dụ: `empty-project.svg`)

### Kiểm Soát Phiên Bản
- Tất cả tài nguyên được theo dõi trong git
- Tệp lớn ảnh hưởng đến kích thước repository
- Cân nhắc Git LFS cho tệp trên 1MB

### Chiến Lược Cache
```nginx
location ~* \.(ico|png|svg|jpg)$ {
  expires 1y;
  cache-control: public, immutable;
}
```

## Vấn Đề Đã Biết

1. **Kích Thước Favicon:** Thiếu các kích thước hiện đại (180x180 cho iOS)
2. **PNG Lớn:** tanstack-circle-logo.png cần tối ưu hóa
3. **SVG Động:** Có thể ảnh hưởng hiệu năng trên thiết bị yếu
4. **Tên Giữ Chỗ:** manifest.json cần thương hiệu đúng
5. **Bảo Mật CSP:** Inline scripts/styles giảm hiệu quả

## Cải Tiến Tương Lai

1. Thêm icons 180x180 và 310x310 cho PWA
2. Chuyển đổi PNG sang WebP với fallback
3. Thêm nhãn accessibility cho SVGs
4. Tạo biến thể dark/light theme
5. Triển khai versioning tài nguyên
6. Thêm service worker cho hỗ trợ offline
7. Triển khai CDN hình ảnh để tối ưu động

## Tệp Tài Liệu

| Tệp | Mô tả |
|-----|-------|
| `scan-inventory.json` | Dữ liệu quét có cấu trúc với metadata tệp |
| `file-structure.txt` | Dạng cây của thư mục public |
| `assets.md` | Tài liệu tài nguyên tĩnh chi tiết |
| `manifests.md` | Tài liệu manifest web và cấu hình |
| `optimization.md` | Chiến lược tối ưu hóa tài nguyên |
| `README.md` | Tệp này (Tiếng Anh) |
| `README-VI.md` | Bản dịch Tiếng Việt |

## Tham Khảo

- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Builder](https://www.pwabuilder.com/)
- [SVGO](https://github.com/svg/svgo)
- [WebP](https://developers.google.com/speed/webp)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
