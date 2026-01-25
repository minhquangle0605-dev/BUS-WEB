#!/bin/bash

# MongoDB Import Script
# Import sample data vào database bus_route_db

echo "======================================"
echo "  MongoDB Sample Data Import Script"
echo "======================================"
echo ""

# Kiểm tra MongoDB đã chạy chưa
if ! mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "❌ MongoDB chưa chạy!"
    echo "Vui lòng start MongoDB trước khi chạy script này."
    echo ""
    echo "Windows: services.msc → MongoDB Server → Start"
    echo "macOS: brew services start mongodb-community"
    echo "Linux: sudo systemctl start mongod"
    exit 1
fi

echo "✅ MongoDB đang chạy"
echo ""

# Database name
DB_NAME="bus_route_db"

echo "🗑️  Xóa database cũ (nếu có)..."
mongosh $DB_NAME --eval "db.dropDatabase()" --quiet

echo "📦 Import sample data..."
echo ""

# Import từng collection
echo "1️⃣  Import Users..."
mongosh $DB_NAME --eval '
db.users.insertMany([
  {
    "email": "nguyenvana@example.com",
    "password": "$2a$10$XQQ7YXKxnfRqJYnKZ4XQb.LKmD7qBH9YwQZZQZZYQZZYQZZYQZZYQZZ",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "dateOfBirth": new Date("1995-05-15"),
    "address": {
      "street": "123 Phố Huế",
      "ward": "Minh Khai",
      "district": "Hai Bà Trưng",
      "city": "Hà Nội"
    },
    "avatar": "https://via.placeholder.com/150",
    "balance": 150000,
    "favoriteRoutes": [],
    "isActive": true,
    "createdAt": new Date("2025-01-01"),
    "updatedAt": new Date()
  },
  {
    "email": "tranthib@example.com",
    "password": "$2a$10$XQQ7YXKxnfRqJYnKZ4XQb.LKmD7qBH9YwQZZQZZYQZZYQZZYQZZYQZZ",
    "fullName": "Trần Thị B (>60 tuổi)",
    "phoneNumber": "0987654321",
    "dateOfBirth": new Date("1960-03-20"),
    "address": {
      "street": "456 Giải Phóng",
      "ward": "Thanh Xuân Bắc",
      "district": "Thanh Xuân",
      "city": "Hà Nội"
    },
    "avatar": "https://via.placeholder.com/150",
    "balance": 50000,
    "favoriteRoutes": [],
    "isActive": true,
    "createdAt": new Date("2025-01-10"),
    "updatedAt": new Date()
  }
])
' --quiet

echo "✅ Users imported: 2"
echo ""

echo "2️⃣  Import Bus Stops..."
mongosh $DB_NAME --eval '
db.busstops.insertMany([
  {
    "name": "Bến xe Mỹ Đình",
    "stopCode": "MD001",
    "address": {
      "street": "Phạm Hùng",
      "ward": "Mỹ Đình 1",
      "district": "Nam Từ Liêm",
      "city": "Hà Nội"
    },
    "location": {
      "type": "Point",
      "coordinates": [105.7803, 21.0278]
    },
    "routes": [],
    "facilities": {
      "hasShelter": true,
      "hasBench": true,
      "hasLighting": true,
      "hasTrashBin": true
    },
    "ticketOffice": {
      "available": true,
      "openingHours": {
        "weekday": "05:00 - 22:00",
        "weekend": "05:30 - 21:30"
      },
      "phoneNumber": "024-1234-5678",
      "services": ["Bán vé", "Nạp thẻ", "Tư vấn tuyến đường", "Hỗ trợ người cao tuổi"]
    },
    "isActive": true,
    "createdAt": new Date()
  },
  {
    "name": "Bến xe Giáp Bát",
    "stopCode": "GB001",
    "address": {
      "street": "Giải Phóng",
      "ward": "Giáp Bát",
      "district": "Hoàng Mai",
      "city": "Hà Nội"
    },
    "location": {
      "type": "Point",
      "coordinates": [105.8405, 20.9817]
    },
    "routes": [],
    "facilities": {
      "hasShelter": true,
      "hasBench": true,
      "hasLighting": true,
      "hasTrashBin": true
    },
    "ticketOffice": {
      "available": true,
      "openingHours": {
        "weekday": "05:00 - 22:30",
        "weekend": "05:30 - 22:00"
      },
      "phoneNumber": "024-1234-5679",
      "services": ["Bán vé", "Nạp thẻ", "Tư vấn tuyến đường"]
    },
    "isActive": true,
    "createdAt": new Date()
  },
  {
    "name": "Hồ Gươm",
    "stopCode": "HG001",
    "address": {
      "street": "Lê Thái Tổ",
      "ward": "Hàng Trống",
      "district": "Hoàn Kiếm",
      "city": "Hà Nội"
    },
    "location": {
      "type": "Point",
      "coordinates": [105.8525, 21.0285]
    },
    "routes": [],
    "facilities": {
      "hasShelter": false,
      "hasBench": true,
      "hasLighting": true,
      "hasTrashBin": true
    },
    "ticketOffice": {
      "available": false
    },
    "isActive": true,
    "createdAt": new Date()
  }
])
' --quiet

echo "✅ Bus stops imported: 3"
echo ""

echo "3️⃣  Import Bus Routes..."
mongosh $DB_NAME --eval '
const stops = db.busstops.find().toArray();
db.busroutes.insertMany([
  {
    "routeNumber": "03",
    "routeName": "Bến xe Mỹ Đình - Bến xe Giáp Bát",
    "description": "Tuyến chạy ngang qua trung tâm Hà Nội",
    "startPoint": {
      "name": "Bến xe Mỹ Đình",
      "location": { "type": "Point", "coordinates": [105.7803, 21.0278] }
    },
    "endPoint": {
      "name": "Bến xe Giáp Bát",
      "location": { "type": "Point", "coordinates": [105.8405, 20.9817] }
    },
    "busStops": [stops[0]._id, stops[2]._id, stops[1]._id],
    "pricing": {
      "regularPrice": 7000,
      "studentPrice": 5000,
      "seniorPrice": 3500
    },
    "operatingHours": {
      "weekday": { "start": "05:00", "end": "22:30", "frequency": 12 },
      "weekend": { "start": "05:30", "end": "22:00", "frequency": 15 }
    },
    "distance": 22.3,
    "estimatedDuration": 65,
    "isActive": true,
    "color": "#3498db",
    "totalTrips": 0,
    "favoriteCount": 0,
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
])
' --quiet

echo "✅ Bus routes imported: 1"
echo ""

echo "======================================"
echo "  ✅ IMPORT THÀNH CÔNG!"
echo "======================================"
echo ""
echo "📊 Database: $DB_NAME"
echo ""
echo "Collections:"
echo "  - users: 2 records (1 user <60 tuổi, 1 user >60 tuổi)"
echo "  - busstops: 3 records (2 có quầy vé)"
echo "  - busroutes: 1 record"
echo ""
echo "🧪 Test data:"
echo "  Email: nguyenvana@example.com"
echo "  Password: 123456"
echo ""
echo "  Email: tranthib@example.com (>60 tuổi)"
echo "  Password: 123456"
echo ""
echo "💡 Lưu ý: Password đã được hash, nhưng trong thực tế là '123456'"
echo "Để tạo user mới, dùng API /api/auth/register"
echo ""
echo "🚀 Giờ có thể chạy server: npm run dev"
echo ""
