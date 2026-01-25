# 🚌 BUS ROUTE FINDER - Hệ thống tìm tuyến xe bus

Một ứng dụng web hoàn chỉnh giúp người dùng tìm kiếm tuyến xe bus, mua vé điện tử và quản lý tài khoản.

## ✨ Tính năng chính

### 🔍 Cho người dùng chưa đăng nhập:
- ✅ Tìm kiếm tuyến xe bus theo điểm đi - điểm đến
- ✅ Xem danh sách tất cả tuyến xe
- ✅ Xem chi tiết tuyến (giá vé, lịch trình, điểm dừng)
- ✅ **Xem thông tin quầy bán vé** (địa chỉ, giờ mở cửa, số điện thoại)
- ✅ **Được thông báo chính sách miễn phí** cho người cao tuổi >60
- ✅ Đăng ký/Đăng nhập tài khoản

### 👤 Cho người dùng đã đăng nhập:
- ✅ Tất cả tính năng trên
- ✅ Mua vé điện tử (single, day-pass, week-pass, month-pass)
- ✅ **Miễn phí vé tự động** nếu trên 60 tuổi (dựa vào ngày sinh)
- ✅ Vé có QR code như VNeID
- ✅ Bookmark/Favorite tuyến thường đi
- ✅ Quản lý profile (avatar, địa chỉ, số điện thoại, **ngày sinh**)
- ✅ Nạp tiền vào tài khoản
- ✅ Xem lịch sử vé đã mua
- ✅ Hủy vé (hoàn 80% tiền)

## 🛠️ Công nghệ sử dụng

### Backend:
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **QRCode** - Tạo QR code cho vé điện tử

### Frontend:
- **HTML5** + **CSS3** + **JavaScript**
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons
- **Vanilla JS** - Không dùng framework (dễ học)

## 📂 Cấu trúc project

```
bus-route-finder/
│
├── backend/                    # Backend API
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── BusRoute.js        # Bus route model
│   │   ├── BusStop.js         # Bus stop model
│   │   └── Ticket.js          # E-ticket model
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── routeRoutes.js     # Route search endpoints
│   │   └── ticketRoutes.js    # Ticket endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── server.js              # Main server file
│   ├── seedData.js            # Sample data seeder
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/                   # Frontend
    ├── css/
    │   └── style.css          # Custom styles
    ├── js/
    │   └── api.js             # API handler
    ├── index.html             # Homepage
    ├── login.html             # Login page
    ├── register.html          # Register page
    ├── dashboard.html         # User dashboard
    ├── routes.html            # Routes list
    ├── tickets.html           # My tickets
    └── profile.html           # User profile
```

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone/Download project

```bash
# Nếu có git
git clone <repository-url>

# Hoặc download ZIP và extract
```

### Bước 2: Cài đặt Backend

```bash
cd backend
npm install
```

**Cấu hình .env:**

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bus_route_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://127.0.0.1:5500
```

**Cài đặt MongoDB:**

- **Windows**: Download từ [mongodb.com](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: `sudo apt-get install mongodb`

**Seed dữ liệu mẫu:**

```bash
node seedData.js
```

Sẽ tạo:
- 10 điểm dừng ở Hà Nội
- 5 tuyến xe bus

**Chạy backend:**

```bash
# Development
npm run dev

# Production
npm start
```

Server chạy tại: `http://localhost:5000`

### Bước 3: Chạy Frontend

**Cách 1: Dùng Live Server (VSCode)**
1. Cài extension "Live Server"
2. Right click vào `index.html` → "Open with Live Server"
3. Tự động mở tại `http://127.0.0.1:5500`

**Cách 2: Dùng Python**
```bash
cd frontend
python -m http.server 8000
```
Mở: `http://localhost:8000`

**Cách 3: Dùng Node.js http-server**
```bash
npm install -g http-server
cd frontend
http-server
```

### Bước 4: Test thử

1. Mở `http://127.0.0.1:5500` (hoặc port của bạn)
2. Click "Đăng ký" → Tạo tài khoản mới
3. Đăng nhập
4. Thử tìm tuyến: "Mỹ Đình" → "Giáp Bát"
5. Mua vé điện tử

## 📖 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication

#### Đăng ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789"
}
```

#### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Routes

#### Tìm tuyến
```http
POST /api/routes/search
Content-Type: application/json

{
  "from": "Mỹ Đình",
  "to": "Giáp Bát"
}
```

### Tickets

#### Mua vé
```http
POST /api/tickets/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "routeId": "...",
  "ticketType": "single",
  "passengerType": "regular"
}
```

**Ticket Types:**
- `single` - Vé lượt (2h)
- `day-pass` - Vé ngày (24h)
- `week-pass` - Vé tuần (7 ngày)
- `month-pass` - Vé tháng (30 ngày)

**Passenger Types:**
- `regular` - Người lớn (100%)
- `student` - Sinh viên (80%)
- `senior` - Người cao tuổi (50%)

Xem full API docs trong `backend/README.md`

## 🎨 Screenshots

### Homepage
- Hero section với gradient đẹp
- Search box tìm tuyến
- Danh sách tuyến phổ biến

### Dashboard
- Profile card với avatar
- Số dư tài khoản
- Vé gần đây với QR code
- Tuyến yêu thích

### Vé điện tử
- QR code để quét
- Thông tin chi tiết
- Status (active/used/expired)

## 🔧 Troubleshooting

### Backend không kết nối được MongoDB
```bash
# Kiểm tra MongoDB đã chạy chưa
# Windows: services.msc → MongoDB Server
# macOS/Linux: mongosh
```

### CORS error
- Kiểm tra FRONTEND_URL trong backend/.env
- Phải khớp với URL frontend đang chạy

### Port already in use
```bash
# Đổi PORT trong .env
# Hoặc kill process:
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000
```

## 📝 Ghi chú cho sinh viên

### Điểm mạnh của project này:

1. **Code rõ ràng, dễ hiểu**
   - Comments tiếng Việt
   - Tên biến/hàm có ý nghĩa
   - Cấu trúc logic

2. **Best practices**
   - JWT authentication
   - Password hashing
   - Input validation
   - Error handling
   - RESTful API design

3. **Scalable**
   - Tách biệt frontend/backend
   - Modular code
   - Dễ mở rộng

4. **Professional**
   - UI đẹp với Bootstrap
   - Responsive design
   - Loading states
   - Error messages

### Có thể mở rộng:

- [ ] Real-time bus tracking với Socket.io
- [ ] Google Maps integration
- [ ] Email notifications
- [ ] SMS OTP verification
- [ ] Payment gateway (Momo, VNPay)
- [ ] Admin dashboard
- [ ] Analytics & reports
- [ ] Mobile app (React Native)
- [ ] PWA (Progressive Web App)

## 📧 Support

Nếu có vấn đề:
1. Đọc kỹ README
2. Check console log (F12)
3. Xem backend logs
4. Hỏi thầy! 😊

## 📄 License

MIT License - Free to use for educational purposes

## 👨‍🏫 Made for Students

Project này được tạo để:
- ✅ Sinh viên học cách build full-stack app
- ✅ Hiểu rõ frontend-backend integration
- ✅ Practice với MongoDB, Express, JWT
- ✅ Có project đẹp để làm portfolio

**Good luck! 🚀**
