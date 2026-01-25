# 💾 SAMPLE DATABASE - Hướng dẫn sử dụng

## 📦 File trong thư mục này:

1. **sample-database.json** - Sample data dạng JSON (reference)
2. **import-sample-data.sh** - Script import cho Linux/macOS
3. **import-sample-data.bat** - Script import cho Windows

## 🚀 Cách import nhanh:

### Windows:
```bash
# Double-click file:
import-sample-data.bat

# Hoặc chạy trong CMD:
cd backend
import-sample-data.bat
```

### Linux/macOS:
```bash
cd backend
chmod +x import-sample-data.sh
./import-sample-data.sh
```

## 📊 Dữ liệu được import:

### 1. Users (2 người)
- **nguyenvana@example.com** (Password: `123456`)
  - Nguyễn Văn A, 29 tuổi (sinh 1995)
  - Số dư: 150,000đ
  - Địa chỉ: Hai Bà Trưng, Hà Nội

- **tranthib@example.com** (Password: `123456`)
  - Trần Thị B, 65 tuổi (sinh 1960) → **>60 tuổi = MIỄN PHÍ VÉ**
  - Số dư: 50,000đ
  - Địa chỉ: Thanh Xuân, Hà Nội

### 2. Bus Stops (3 điểm)
- **Bến xe Mỹ Đình** (MD001)
  - ✅ Có quầy vé
  - 📞 024-1234-5678
  - 🕐 T2-T6: 05:00-22:00 | T7-CN: 05:30-21:30
  - Dịch vụ: Bán vé, Nạp thẻ, Tư vấn, Hỗ trợ người cao tuổi

- **Bến xe Giáp Bát** (GB001)
  - ✅ Có quầy vé
  - 📞 024-1234-5679
  - 🕐 T2-T6: 05:00-22:30 | T7-CN: 05:30-22:00
  - Dịch vụ: Bán vé, Nạp thẻ, Tư vấn

- **Hồ Gươm** (HG001)
  - ❌ Không có quầy vé

### 3. Bus Routes (1 tuyến)
- **Tuyến 03**: Mỹ Đình → Hồ Gươm → Giáp Bát
  - Giá: 7,000đ (regular), 5,000đ (student), 3,500đ (senior)
  - Khoảng cách: 22.3 km
  - Thời gian: ~65 phút
  - Tần suất: 12-15 phút/chuyến

## 🧪 Test scenarios:

### Scenario 1: User trẻ mua vé
```bash
1. Login: nguyenvana@example.com / 123456
2. Tìm tuyến: "Mỹ Đình" → "Giáp Bát"
3. Mua vé → Trả 7,000đ
4. ✅ Nhận vé có QR code
```

### Scenario 2: Người cao tuổi mua vé (MIỄN PHÍ)
```bash
1. Login: tranthib@example.com / 123456
2. Tìm tuyến: "Mỹ Đình" → "Giáp Bát"
3. Mua vé → Tự động MIỄN PHÍ (0đ)
4. ✅ Nhận vé có QR code, không mất tiền
```

### Scenario 3: Xem quầy vé (KHÔNG cần login)
```bash
1. Vào homepage (không login)
2. Tìm tuyến: "Mỹ Đình" → "Giáp Bát"
3. Click "Quầy bán vé"
4. ✅ Thấy 2 quầy vé (Mỹ Đình + Giáp Bát)
```

## 🔧 Import thủ công (nếu script lỗi):

### Cách 1: Dùng mongosh
```bash
# Mở mongosh
mongosh

# Chuyển sang database
use bus_route_db

# Copy-paste từng collection từ sample-database.json
db.users.insertMany([...])
db.busstops.insertMany([...])
db.busroutes.insertMany([...])
```

### Cách 2: Dùng seedData.js
```bash
# Nếu script import không chạy, dùng seed data mặc định
cd backend
node seedData.js
```

## 📝 Lưu ý:

1. **Password đã hash**: 
   - File JSON có password hash
   - Password thực tế: `123456`
   - Không thể đăng nhập bằng hash, phải dùng password gốc

2. **ObjectId references**:
   - Script tự động tạo ObjectId
   - Relationships tự động link

3. **Dates**:
   - Dùng `new Date()` trong script
   - JSON file chỉ để tham khảo

## ❌ Troubleshooting:

### Script không chạy?
```bash
# Kiểm tra MongoDB
mongosh --eval "db.version()"

# Nếu lỗi → Start MongoDB
# Windows: services.msc → MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Import thất bại?
```bash
# Xóa database cũ
mongosh bus_route_db --eval "db.dropDatabase()"

# Chạy lại script
```

### Muốn thêm data?
```bash
# Dùng API để tạo thêm users
POST /api/auth/register

# Hoặc edit seedData.js và chạy lại
node seedData.js
```

## 🎯 Sau khi import xong:

1. Chạy server: `npm run dev`
2. Test API: `http://localhost:5000/api/routes`
3. Mở frontend và login bằng accounts trên
4. Thử các tính năng!

**Happy testing! 🚀**
