# Bus Route Finder - Backend API

Backend API cho hệ thống tìm tuyến xe bus với các tính năng đăng ký, đăng nhập, tìm tuyến, mua vé điện tử.

## 🚀 Công nghệ sử dụng

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **QRCode** - Tạo QR code cho vé điện tử

## 📦 Cài đặt

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

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

### 3. Cài đặt MongoDB

**Windows:**
- Download và cài đặt MongoDB Community Server từ [mongodb.com](https://www.mongodb.com/try/download/community)
- MongoDB sẽ tự chạy sau khi cài đặt

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 4. Seed dữ liệu mẫu

```bash
node seedData.js
```

Lệnh này sẽ tạo:
- 10 điểm dừng ở Hà Nội
- 5 tuyến xe bus với thông tin đầy đủ

### 5. Chạy server

**Development mode (với nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

#### 1. Đăng ký
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

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "balance": 100000
  }
}
```

#### 2. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 4. Cập nhật profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "address": {
    "street": "123 Phố ABC",
    "ward": "Phường XYZ",
    "district": "Quận 1",
    "city": "Hà Nội"
  }
}
```

#### 5. Nạp tiền
```http
POST /api/auth/topup
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000
}
```

### Route Routes (`/api/routes`)

#### 1. Lấy danh sách tất cả tuyến
```http
GET /api/routes
```

#### 2. Lấy chi tiết 1 tuyến
```http
GET /api/routes/:id
```

#### 3. Tìm tuyến (điểm A -> điểm B)
```http
POST /api/routes/search
Content-Type: application/json

{
  "from": "Mỹ Đình",
  "to": "Giáp Bát"
}
```

#### 4. Gợi ý điểm dừng
```http
GET /api/routes/search/suggestions?q=Mỹ
```

#### 5. Thêm tuyến vào yêu thích
```http
POST /api/routes/:id/favorite
Authorization: Bearer <token>
```

#### 6. Xóa tuyến khỏi yêu thích
```http
DELETE /api/routes/:id/favorite
Authorization: Bearer <token>
```

### Ticket Routes (`/api/tickets`)

#### 1. Mua vé
```http
POST /api/tickets/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "routeId": "...",
  "ticketType": "single",
  "passengerType": "regular",
  "boardingStopId": "...",
  "alightingStopId": "..."
}
```

**Ticket Types:**
- `single` - Vé lượt (2 giờ)
- `day-pass` - Vé ngày (24 giờ)
- `week-pass` - Vé tuần (7 ngày)
- `month-pass` - Vé tháng (30 ngày)

**Passenger Types:**
- `regular` - Người lớn (100% giá)
- `student` - Học sinh/Sinh viên (80% giá)
- `senior` - Người cao tuổi (50% giá)

#### 2. Lấy danh sách vé của tôi
```http
GET /api/tickets/my-tickets?status=active
Authorization: Bearer <token>
```

#### 3. Lấy chi tiết 1 vé
```http
GET /api/tickets/:id
Authorization: Bearer <token>
```

#### 4. Sử dụng vé (quét QR)
```http
POST /api/tickets/:id/use
Authorization: Bearer <token>
```

#### 5. Hủy vé (hoàn 80%)
```http
POST /api/tickets/:id/cancel
Authorization: Bearer <token>
```

## 🗂️ Cấu trúc thư mục

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── models/
│   ├── User.js               # User model
│   ├── BusRoute.js           # Bus route model
│   ├── BusStop.js            # Bus stop model
│   └── Ticket.js             # E-ticket model
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── routeRoutes.js        # Route search routes
│   └── ticketRoutes.js       # Ticket routes
├── middleware/
│   └── auth.js               # JWT authentication
├── server.js                 # Main server file
├── seedData.js               # Seed sample data
├── package.json
└── .env.example
```

## 🔑 Authentication

API sử dụng JWT (JSON Web Token) để xác thực.

### Cách sử dụng:

1. Đăng ký/Đăng nhập để nhận token
2. Thêm token vào header của các request cần authentication:

```
Authorization: Bearer <your_token_here>
```

## 🐛 Troubleshooting

### MongoDB connection failed
- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra MONGODB_URI trong file .env

### Port already in use
- Đổi PORT trong file .env
- Hoặc kill process đang dùng port 5000

### CORS errors
- Kiểm tra FRONTEND_URL trong .env
- Đảm bảo frontend URL khớp với setting

## 📝 Notes cho sinh viên

1. **JWT Secret**: Nhớ đổi JWT_SECRET trong production
2. **Password hashing**: Được tự động bởi User model
3. **Error handling**: Đã có sẵn try-catch trong các routes
4. **Validation**: Có cả database validation và API validation

## 🚀 Mở rộng

Có thể thêm:
- Real-time bus tracking với Socket.io
- Payment gateway integration
- Email notifications
- SMS OTP verification
- Admin dashboard
- Analytics & reporting

## 📧 Support

Nếu có vấn đề, hãy hỏi thầy! 😊
