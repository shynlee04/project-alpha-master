---
title: "Project-Centric Architecture - Social Media Educational Content"
version: "1.0.0-vi"
status: "ACTIVE"
created: "2026-01-25"
platforms: ["LinkedIn", "Facebook", "Zalo", "Twitter/X", "Dev.to"]
content_type: "educational-article"
language: "Vietnamese"
reading_time: "5-7 phút"
word_count: "~2500 từ"
---

# 🏛️ Kiến Trúc Hướng Dự Án: Từ 9 Routes Thành 2 Routes

## Một Câu Chuyện Về Kỹ Thuật Phần Mềm

---

## 🌱 Bắt Đầu Từ Một Cuộc Khủng Hoảng

Vào tháng 1/2026, một ứng dụng ghi chú đã trải qua 5 lần "vá lỗi" liên tiếp - và **TẤT CẢ ĐỀU THẤT BẠI**.

**Hiện tượng:**
- Người dùng Desktop không thể mở Notes
- Vòng xoay vô tận khi tải workspace
- Tự động chuyển hướng sai nơi
- 15+ UI elements đã bị "bỏ rơi" nhưng vẫn tồn tại trong code

**Nguyên nhân gốc rễ?** Không phải từng lỗi riêng lẻ, mà là **kiến trúc sai từ đầu**.

---

## 🔄 Mô Hình Cũ: Workspace-Centric (Phức Tạp)

```
┌─────────────────────────────────────────────────────────┐
│  User → Chọn Workspace (IDE/Notes/Knowledge/Study)      │
│         ↓                                              │
│  /ide/$projectId     → Monaco + Terminal + FileTree    │
│  /notes/$projectId   → BlockNote Editor                │
│  /knowledge/$projectId → RAG Search (không hoạt động)  │
│  /study/$projectId   → Flashcards (chưa làm)           │
│         ↓                                              │
│  Mỗi workspace có state riêng, logic riêng             │
│  → Trùng lặp code, không nhất quán                     │
└─────────────────────────────────────────────────────────┘
```

**Vấn đề:**
- 9 điểm vào ứng dụng
- 7 đường dẫn tạo dự án
- FileTree tồn tại ở 3 nơi khác nhau
- "Mỗi khi sửa lỗi này, lỗi khác lại xuất hiện"

---

## ✅ Mô Hình Mới: Project-Centric (Đơn Giản)

```
┌─────────────────────────────────────────────────────────┐
│  User → Chọn Project                                    │
│         ↓                                              │
│  /$projectId → [FileTree, Monaco, Notes, Chat]         │
│         ↓                                              │
│  Platform (Desktop/Mobile) quyết định plugins có sẵn   │
│  → Single source of truth, KHÔNG TRÙNG LẶP             │
└─────────────────────────────────────────────────────────┘
```

**Cải thiện:**
- Chỉ 2 routes: `/hub` và `/$projectId`
- Một nguồn sự thật duy nhất cho state
- Plugins tự trị, không phụ thuộc workspace

---

## 📱 Kiến Trúc Device: Desktop vs Mobile

### Desktop (FSA - File System Access API)
```
✅ File thật trên đĩa
✅ Full IDE (Monaco + Terminal)
✅ Sync 2 chiều với VS Code, Obsidian
✅ Yêu cầu Chrome 122+
```

### Mobile/Tablet (IndexedDB)
```
📱 Virtual files trong browser
📱 Không có Terminal/Monaco
📱 Notes + Chat only
📱 Single source of truth (không sync)
```

### Chính Sách IDE Access

| Platform | IDE Access | Features |
|----------|-----------|----------|
| Desktop (FSA) | ✅ Full | Monaco + Terminal |
| Desktop (IndexedDB) | ⚠️ Limited | FileTree + Notes |
| Tablet/Mobile | ❌ Blocked | Notes only |

---

## 🔌 Hệ Thống Plugin Tính Năng

### Cấu Trúc Plugin

```typescript
interface FeaturePlugin {
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat';
  name: string;
  requiresFSA: boolean;      // Desktop only?
  requiresProject: boolean;  // Cần load project?
  minWidth: number;          // Layout requirements
}
```

### Platform-Aware Defaults

Thay vì hỏi user "Bạn muốn IDE mode hay Notes mode?", hệ thống **tự động** hiển thị plugins phù hợp:

| Platform | Default Plugins |
|----------|-----------------|
| **Desktop (FSA)** | FileTree + Monaco + Chat |
| **Desktop (IndexedDB)** | FileTree + Notes + Chat |
| **Tablet** | FileTree + Notes + Chat |
| **Mobile** | Notes + (Chat qua sidebar) |

**Không còn concept "IDE mode" hay "Notes mode". Chỉ có Platform.**

---

## 🎯 Hai Plugins Bắt Buộc

### Plugin 1: Project Management
- File tree navigation
- Project switcher
- CRUD operations
- Database & RAG management

### Plugin 2: Chat Cascade
- Agent orchestration
- Thread management (project-scoped)
- Multi-format rendering
- Streaming conversation

---

## 💡 Bài Học Rút Ra

### 1. Vá Lỗi Không Đủ
```
❌ 5 lần sửa lỗi → 5 lần thất bại
✅ Thay đổi kiến trúc → Vấn đề biến mất
```

### 2. Đơn Giản Hóa
```
❌ 9 routes → Phức tạp, dễ lỗi
✅ 2 routes → Rõ ràng, dễ bảo trì
```

### 3. Single Source of Truth
```
❌ Trùng lặp state → Không nhất quán
✅ Một nguồn sự thật → Dễ debug, dễ scale
```

---

## 📚 Tài Liệu Tham Khảo

- **ADR-034:** Project-Centric Architecture
- **ADR-034-AMENDMENT-001:** Platform-First Plugin Selection
- **TanStack AI Docs:** https://tanstack.com/ai/latest/docs/

---

## 🤔 Câu Hỏi Thảo Luận

1. Bạn đã từng gặp trường hợp "vá lỗi mãi không hết" chưa?
2. Làm sao để nhận biết cần refactor kiến trúc thay vì tiếp tục sửa lỗi?
3. Trong dự án của bạn, có "workspace" hay "mode" nào không cần thiết không?

---

> 🔄 **Share nếu bạn thấy hữu ích!**
> 
> #SoftwareArchitecture #ProjectManagement #CleanArchitecture #TechEducation #VietnameseTech

---

*Article generated for educational purposes. Based on ADR-034 architecture decisions from Project Alpha.*
