# 🚀 QUICK START GUIDE

## Chạy project trong 5 phút!

### Bước 1: Chuẩn bị môi trường

**Cần có:**
- ✅ Node.js (version 14+)
- ✅ MongoDB 
- ✅ VSCode (khuyến nghị)

**Kiểm tra:**
```bash
node --version
npm --version
mongod --version
```

### Bước 2: Setup Backend (3 phút)

```bash
# 1. Vào thư mục backend
cd backend

# 2. Install packages
npm install

# 3. Tạo file .env
cp .env.example .env

# 4. (Optional) Chỉnh sửa .env nếu cần
# Mặc định đã OK cho localhost

# 5. Seed dữ liệu mẫu
node seedData.js

# 6. Chạy server
npm run dev
```

✅ Backend chạy tại: `http://localhost:5000`

### Bước 3: Setup Frontend (1 phút)

**Cách 1: VSCode Live Server (Dễ nhất)**
1. Mở VSCode
2. Cài extension "Live Server"
3. Right-click vào `frontend/index.html`
4. Click "Open with Live Server"

✅ Frontend tự động mở tại: `http://127.0.0.1:5500`

**Cách 2: Python**
```bash
cd frontend
python -m http.server 5500
```

### Bước 4: Test thử!

1. Mở `http://127.0.0.1:5500`
2. Click "Đăng ký"
3. Tạo tài khoản:
   - Email: `test@example.com`
   - Password: `123456`
   - Họ tên: `Nguyễn Test`
4. Tự động nhận 100,000đ
5. Thử tìm tuyến: "Mỹ Đình" → "Giáp Bát"
6. Mua vé!

## 🎯 Test các tính năng

### 1. Tìm tuyến (Không cần login)
- Điểm đi: "Mỹ Đình"
- Điểm đến: "Giáp Bát"
- → Sẽ hiện tuyến 03

### 2. Mua vé (Cần login)
- Vào dashboard
- Click "Tìm tuyến xe"
- Chọn tuyến → "Mua vé"
- Có QR code!

### 3. Nạp tiền
- Dashboard → "Nạp tiền"
- Nhập số tiền
- Done!

### 4. Bookmark tuyến
- Xem chi tiết tuyến
- Click "❤️ Yêu thích"

## ⚠️ Troubleshooting nhanh

### Backend không chạy?
```bash
# Kiểm tra MongoDB đã chạy chưa
mongosh

# Nếu lỗi → Start MongoDB:
# Windows: services.msc → MongoDB Server → Start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### CORS error?
- Kiểm tra frontend URL: `http://127.0.0.1:5500`
- Phải dùng 127.0.0.1, KHÔNG dùng localhost

### Port đã dùng?
```bash
# Đổi port trong backend/.env:
PORT=5001

# Hoặc kill process:
# Windows: Ctrl+C trong terminal
# Mac/Linux: killall node
```

## 📱 Các trang có sẵn

- `index.html` - Homepage (tìm tuyến)
- `login.html` - Đăng nhập
- `register.html` - Đăng ký
- `dashboard.html` - Dashboard user
- `routes.html` - Danh sách tuyến
- `tickets.html` - Vé của tôi
- `profile.html` - Profile

## 🎓 Học gì từ project này?

### Backend:
- ✅ RESTful API design
- ✅ MongoDB + Mongoose
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Error handling
- ✅ CORS configuration

### Frontend:
- ✅ Fetch API
- ✅ JWT trong localStorage
- ✅ Bootstrap 5
- ✅ Form validation
- ✅ Dynamic HTML
- ✅ Loading states

## 💡 Tips cho presentation

1. **Demo flow tốt nhất:**
   - Homepage → Tìm tuyến
   - Đăng ký tài khoản
   - Dashboard → Mua vé
   - Show QR code
   - Nạp tiền
   - Bookmark tuyến

2. **Highlight points:**
   - "Giống VNeID" (vé điện tử)
   - "Full-stack" (backend + frontend)
   - "Professional UI" (Bootstrap)
   - "Security" (JWT, bcrypt)

3. **Nếu bị hỏi:**
   - Database: MongoDB với schema rõ ràng
   - Auth: JWT token trong header
   - Payment: Giả lập (có thể tích hợp VNPay)
   - QR: Library qrcode.js

## 🚀 Next steps

Sau khi hiểu project:

1. Thêm Google Maps
2. Real-time tracking (Socket.io)
3. Email notifications
4. Admin panel
5. Mobile app

**Have fun coding! 🎉**
