# 🎭 Hệ Thống Vai Trò trong Cuộc Hội Thoại

## 📋 Tổng Quan

Hệ thống vai trò mới được thiết kế để làm rõ vai trò của AI và người dùng trong mỗi cuộc hội thoại, giúp AI phản hồi chính xác hơn và người dùng hiểu rõ họ cần đóng vai trò gì.

## 🎯 Cấu Trúc Vai Trò

### Interface Topic
```typescript
interface Topic {
  name: string;                    // Tên chủ đề
  prompt: string;                  // Prompt cho AI
  initialMessage: string;          // Tin nhắn khởi đầu
  aiRole: string;                  // Vai trò của AI
  userRole: string;                // Vai trò của người dùng
  roleDescription: string;         // Mô tả chi tiết vai trò
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
  estimatedDuration: number;       // Thời gian ước tính (phút)
  tags: string[];                  // Tags phân loại
}
```

## 🎪 Các Chủ Đề Hiện Tại

### 1. Công Viên Chủ Đề
- **AI Role**: Khách tham quan tò mò
- **User Role**: Nhân viên công viên chủ đề
- **Mô tả**: AI sẽ hỏi về các hoạt động, trò chơi, và dịch vụ tại công viên
- **Độ khó**: Cơ bản
- **Thời gian**: 10 phút

### 2. Gọi Món
- **AI Role**: Khách hàng gọi món
- **User Role**: Nhân viên phục vụ nhà hàng
- **Mô tả**: AI sẽ hỏi về menu, giá cả và đặt món ăn
- **Độ khó**: Cơ bản
- **Thời gian**: 8 phút

### 3. Mua Sắm
- **AI Role**: Khách hàng mua sắm
- **User Role**: Nhân viên bán hàng
- **Mô tả**: AI sẽ hỏi về kích thước, màu sắc, giá cả và thử đồ
- **Độ khó**: Trung bình
- **Thời gian**: 12 phút

### 4. Đặt Phòng Khách Sạn
- **AI Role**: Du khách đặt phòng
- **User Role**: Nhân viên lễ tân khách sạn
- **Mô tả**: AI sẽ hỏi về các loại phòng, tiện nghi và đặt phòng
- **Độ khó**: Trung bình
- **Thời gian**: 15 phút

### 5. Hỏi Đường
- **AI Role**: Du khách hỏi đường
- **User Role**: Người dân địa phương
- **Mô tả**: AI sẽ hỏi cách đi đến các địa điểm khác nhau
- **Độ khó**: Cơ bản
- **Thời gian**: 10 phút

## 🔧 Cải Tiến Prompt

### Role Clarification
Mỗi prompt đều có phần "IMPORTANT ROLE CLARIFICATION" để làm rõ:
- Vai trò của AI
- Vai trò của người dùng
- Những gì AI nên hỏi
- Lưu ý quan trọng về việc giữ vai trò

### Ví dụ Prompt
```
You are a curious visitor at a theme park...

IMPORTANT ROLE CLARIFICATION:
- You are the VISITOR asking questions
- The user is the STAFF MEMBER answering your questions
- You should ask about: ride information, show schedules, ticket prices...
- Always stay in character as the curious visitor
- Do not answer questions about the park - you are asking them!
```

## 🎨 Giao Diện Hiển Thị

### Sidebar
- Hiển thị vai trò AI và người dùng
- Mô tả ngắn gọn về tình huống
- Độ khó và thời gian ước tính
- Tags phân loại

### RoleInfo Component
- Thông tin chi tiết về vai trò
- Mô tả đầy đủ tình huống
- Thông tin kỹ thuật (độ khó, từ vựng)
- Hiển thị khi chọn chủ đề

## 🚀 Lợi Ích

1. **Rõ ràng vai trò**: AI và người dùng hiểu rõ vai trò của mình
2. **Phản hồi chính xác**: AI ít bị nhầm lẫn vai trò
3. **Trải nghiệm tốt hơn**: Người dùng biết họ cần làm gì
4. **Dễ mở rộng**: Có thể thêm chủ đề mới dễ dàng
5. **Phân loại rõ ràng**: Độ khó và từ vựng được phân loại

## 🔮 Hướng Phát Triển

- Thêm chủ đề mới với vai trò đa dạng
- Tùy chỉnh độ khó theo trình độ người dùng
- Thêm tính năng lưu vai trò yêu thích
- Tích hợp với hệ thống từ vựng theo chủ đề 