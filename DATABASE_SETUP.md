# 📚 Hướng Dẫn Setup Database

## 🔧 Yêu Cầu Trước

Đảm bảo bạn đã cài đặt:
- PostgreSQL (phiên bản 12+)
- psql client (đã cài cùng PostgreSQL)

## 📋 Các Bước Setup

### Bước 1: Kiểm Tra PostgreSQL Đang Chạy
```bash
# Windows - Kiểm tra service
Get-Service postgresql*

# Linux/Mac - Kiểm tra process
ps aux | grep postgres
```

### Bước 2: Tạo Database Schema

Mở Command Prompt/Terminal và chạy các lệnh sau:

```bash
# Chuyển vào thư mục dự án
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"

# Tạo schema cơ sở
psql -U postgres -f db/schema/bus.sql

# Tạo bảng route_stops
psql -U postgres -f db/schema/setup-route-stops.sql

# Chuẩn hóa dữ liệu
psql -U postgres -f db/schema/chuanhoa_data.sql

# Tạo INDEX cho hiệu suất (RẤT QUAN TRỌNG!)
psql -U postgres -f db/schema/create-indexes.sql
```

### Bước 3: Xác Minh Dữ Liệu Đã Import

```bash
# Kết nối vào PostgreSQL
psql -U postgres -d postgres

# Chạy các lệnh sau:
SELECT COUNT(*) FROM stops;           # Xem số điểm dừng
SELECT COUNT(*) FROM routes;          # Xem số tuyến
SELECT COUNT(*) FROM route_stops;     # Xem số route_stops
SELECT COUNT(*) FROM stop_times;      # Xem số stop_times

# Kiểm tra INDEX đã được tạo
\d stop_times
\d route_stops

# Thoát
\q
```

### Bước 4: Chạy Server

```bash
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"

# Cài dependencies (nếu chưa)
npm install

# Chạy server
npm start

# Hoặc development mode (auto-reload)
npm run dev
```

### Bước 5: Test API

Mở terminal/PowerShell mới và test:

```bash
# Test 1: Health check
curl http://localhost:3000/stops

# Test 2: Tìm trạm gần
curl "http://localhost:3000/stops/nearby?lat=21.0285&lng=105.8542&radius=0.5"

# Test 3: Pathfinding (QUAN TRỌNG!)
curl -X POST "http://localhost:3000/routes/find-path" \
  -H "Content-Type: application/json" \
  -d '{"from_stop_id":"S1","to_stop_id":"S5","time_period":null}'
```

---

## ⚠️ Những Lưu Ý Quan Trọng

### 1. **INDEX Database (Cực Kỳ Quan Trọng!)**
```sql
-- Nếu quên tạo INDEX, query sẽ RẤT CHẬM
CREATE INDEX idx_stop_times_stop_id ON stop_times(stop_id);
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_stop_id ON route_stops(stop_id);
```

### 2. **Dữ Liệu AM/MD/PM**
Dự án có 3 bộ dữ liệu tách biệt:
- **AM** (Sáng): Routes bắt đầu với `01_`
- **MD** (Trưa): Routes bắt đầu với `02_`
- **PM** (Tối): Routes bắt đầu với `03_`

Trong API, có thể chỉ định `time_period: "AM"` hoặc để null (tất cả).

### 3. **Sequence Validation**
API tự động kiểm tra:
```
from_stop.stop_sequence < to_stop.stop_sequence
```

Nếu không thỏa mãn, sẽ trả về lỗi (không cho phép đi ngược).

### 4. **Error Handling**
Nếu gặp lỗi kết nối:
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432

Giải pháp:
1. Kiểm tra PostgreSQL service đang chạy
2. Kiểm tra port 5432 không bị chiếm
3. Kiểm tra credentials trong .env
```

---

## 🧪 Test Pathfinding API

### Test Case 1: Tìm lộ trình hợp lệ
```bash
curl -X POST "http://localhost:3000/routes/find-path" \
  -H "Content-Type: application/json" \
  -d '{
    "from_stop_id": "S1",
    "to_stop_id": "S10",
    "time_period": null
  }'
```

**Response Thành Công:**
```json
{
  "success": true,
  "route": {
    "route_id": "01_1",
    "route_short_name": "01",
    "route_long_name": "Tuyến 01"
  },
  "from": {...},
  "to": {...},
  "total_stops": 5,
  "distance_stops": 4,
  "journey": [...]
}
```

### Test Case 2: Lỗi Sequence (đi ngược)
```bash
curl -X POST "http://localhost:3000/routes/find-path" \
  -H "Content-Type: application/json" \
  -d '{
    "from_stop_id": "S10",
    "to_stop_id": "S1"
  }'
```

**Response Lỗi:**
```json
{
  "error": "Không tìm thấy tuyến nào đi qua cả 2 điểm này theo thứ tự đúng",
  "hint": "Điểm đi phải xuất hiện trước điểm đến trong lộ trình"
}
```

---

## 📞 Troubleshooting

| Vấn Đề | Giải Pháp |
|--------|----------|
| **Port 3000 bị chiếm** | `lsof -i :3000` (Mac/Linux) hoặc `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess` (Windows) |
| **Database không kết nối** | Kiểm tra credentials trong `.env` |
| **API trả về 404** | Đảm bảo dữ liệu đã được import (`COUNT(*)` > 0) |
| **Query rất chậm** | Kiểm tra INDEX đã tạo chưa (`\d stop_times`) |
| **Cannot find module** | Chạy `npm install` lại |

---

## ✅ Kiểm Tra Hoàn Thiện

```bash
# 1. PostgreSQL đang chạy?
psql -U postgres -c "SELECT version();"

# 2. Database và tables tồn tại?
psql -U postgres -d postgres -c "SELECT COUNT(*) FROM stops;"

# 3. INDEX đã tạo?
psql -U postgres -d postgres -c "\d stop_times" | grep idx_

# 4. Server chạy ok?
curl http://localhost:3000/

# 5. API pathfinding hoạt động?
curl -X POST "http://localhost:3000/routes/find-path" \
  -H "Content-Type: application/json" \
  -d '{"from_stop_id":"S1","to_stop_id":"S5"}'
```

Nếu tất cả đều OK, mở trình duyệt và đi tới `http://localhost:3000/homepage.html` để test giao diện!

---

**Chúc bạn thành công!** 🎉
