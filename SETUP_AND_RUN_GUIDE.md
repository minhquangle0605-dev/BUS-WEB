## 🚀 Hướng Dẫn Thiết Lập và Chạy Ứng Dụng

### ✅ Kiểm tra Đã Hoàn Thành

Mã nguồn của bạn đã được tối ưu với các tính năng sau:

1. **Backend (routes.controller.js)**
   - ✅ Hàm `findPath` có kiểm tra thứ tự stop_sequence
   - ✅ Điều kiện `rs1.stop_sequence < rs2.stop_sequence` bảo đảm không lấy chuyến xe ngược chiều
   - ✅ Xử lý time_period filter (AM, MD, PM)
   - ✅ Trả về chi tiết đầy đủ: route info, stop details, coordinates

2. **Routes (src/routes/routes.routes.js)**
   - ✅ Endpoint `POST /routes/find-path` đã được khai báo
   - ✅ Middleware `express.json()` để parse request body

3. **Frontend (homepage.html)**
   - ✅ Gửi `stop_id` (không phải stop name) trong request
   - ✅ Hiển thị thông báo lỗi chi tiết
   - ✅ Vẽ lộ trình trên bản đồ Leaflet
   - ✅ Xử lý các trạm dừng và routes

---

## 📋 Các Bước Thiết Lập

### 1. Tạo Database Indexes (Quan Trọng - Tăng tốc độ tìm kiếm)

Chạy các lệnh SQL trong PostgreSQL:

```sql
-- Tốc độ tìm kiếm sẽ tăng 10-100x với những indexes này
CREATE INDEX IF NOT EXISTS idx_route_stops_route_sequence 
  ON route_stops(route_id, stop_sequence);

CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id 
  ON stop_times(stop_id);

CREATE INDEX IF NOT EXISTS idx_trips_route_id 
  ON trips(route_id);

CREATE INDEX IF NOT EXISTS idx_route_stops_route_id 
  ON route_stops(route_id);

CREATE INDEX IF NOT EXISTS idx_stops_coordinates 
  ON stops(stop_lat, stop_lon);

CREATE INDEX IF NOT EXISTS idx_stop_times_trip_arrival 
  ON stop_times(trip_id, arrival_time);
```

**Hoặc**: Chạy file SQL đã chuẩn bị:
```bash
psql -U username -d your_database -f db/schema/create-performance-indexes.sql
```

### 2. Chuẩn Bị Môi Trường Python/Node.js

```bash
# Cd vào thư mục project
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"

# Cài đặt dependencies (nếu chưa)
npm install

# Tạo file .env (nếu chưa có)
# Cần các biến sau:
# DB_HOST=localhost
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_NAME=your_database
# DB_PORT=5432
# PORT=3000
```

### 3. Chạy Server Node.js

```bash
# Option 1: Chế độ sản xuất
npm start

# Option 2: Chế độ phát triển (auto-reload)
npm run dev
```

Server sẽ chạy ở `http://localhost:3000`

### 4. Mở Trình Duyệt

```
http://localhost:3000/index.html
```

- Đăng nhập (hoặc đăng ký tài khoản)
- Vào trang homepage
- Click trên bản đồ để chọn điểm xuất phát (A) và điểm đến (B)
- Nhấn nút "Tìm tuyến xe buýt"

---

## 🔍 Cách Thức Hoạt Động

### Flow Tìm Đường:

```
1. User click 2 điểm trên bản đồ (lat, lng)
   ↓
2. API tìm trạm gần nhất: /stops/nearby?lat=X&lng=Y
   ↓
3. Lấy stop_id của 2 trạm gần nhất
   ↓
4. Gọi API Pathfinding: POST /routes/find-path
   {
     "from_stop_id": "S1",
     "to_stop_id": "S5",
     "time_period": "AM"  // optional
   }
   ↓
5. Backend kiểm tra:
   - Có route nào chứa cả 2 stop không?
   - Stop_A có đứng TRƯỚC Stop_B không? (check sequence)
   ↓
6. Trả về:
   {
     "route": { ... },
     "from": { stop_id, stop_name, coordinates, sequence },
     "to": { stop_id, stop_name, coordinates, sequence },
     "journey": [
       { stop_id, stop_name, stop_lat, stop_lon, sequence },
       ...
     ]
   }
   ↓
7. Frontend vẽ lộ trình trên bản đồ
```

---

## 🛠️ Khắc Phục Sự Cố

### ❌ Lỗi: "Không tìm thấy tuyến nào"

**Nguyên nhân**: 
- Hai điểm không nằm trên cùng một tuyến xe
- Điểm đi nằm SAU điểm đến trong lộ trình (xe chạy ngược)
- Trạm không tồn tại trong database

**Giải pháp**:
1. Chọn vị trí gần với các trạm xe buýt thực tế
2. Kiểm tra database có dữ liệu không: 
   ```sql
   SELECT COUNT(*) FROM stops;
   SELECT COUNT(*) FROM route_stops;
   SELECT COUNT(*) FROM routes;
   ```
3. Xem Console (F12) để đọc lỗi chi tiết

### ❌ Lỗi: "Server connection error"

**Giải pháp**:
1. Kiểm tra server đang chạy: `npm start`
2. Kiểm tra cổng 3000 không bị chiếm:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3000
   ```
3. Kiểm tra file `.env` đúng cấu hình database

### ❌ Lỗi: "Không tìm thấy trạm gần vị trí"

**Giải pháp**:
1. Tăng bán kính tìm kiếm (hiện tại là 0.5 km)
2. Sửa trong `homepage.html`:
   ```javascript
   // Tìm từ 0.5 km → thay thành 1 km
   `http://localhost:3000/stops/nearby?lat=${start.lat}&lng=${start.lng}&radius=1`
   ```

---

## 📊 Kiểm Tra Database

```sql
-- Xem số lượng dữ liệu
SELECT COUNT(*) as total_stops FROM stops;
SELECT COUNT(*) as total_routes FROM routes;
SELECT COUNT(*) as total_route_stops FROM route_stops;

-- Xem 1 route có bao nhiêu điểm dừng
SELECT route_id, COUNT(*) as stop_count 
FROM route_stops 
GROUP BY route_id 
LIMIT 5;

-- Xem thứ tự điểm dừng trên 1 tuyến
SELECT stop_id, stop_sequence 
FROM route_stops 
WHERE route_id = '0101001'  -- Thay bằng route_id thực tế
ORDER BY stop_sequence;

-- Kiểm tra indexes đã tạo
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('stop_times', 'trips', 'route_stops', 'stops')
ORDER BY indexname;
```

---

## 🎯 API Endpoints

### GET /routes/status
Kiểm tra server status
```bash
curl http://localhost:3000/routes/status
```

### POST /routes/find-path
Tìm lộ trình từ điểm A đến B
```bash
curl -X POST http://localhost:3000/routes/find-path \
  -H "Content-Type: application/json" \
  -d '{
    "from_stop_id": "S1",
    "to_stop_id": "S5",
    "time_period": "AM"
  }'
```

### GET /stops/nearby
Tìm trạm gần vị trí (lat, lng)
```bash
curl "http://localhost:3000/stops/nearby?lat=21.0278&lng=105.8342&radius=0.5"
```

---

## 📈 Performance Tips

1. **Dữ liệu lớn**: Với 500+ trạm, 200+ tuyến → Indexes rất quan trọng
2. **Query tối ưu**: Sử dụng prepared statements (đã làm)
3. **Limit kết quả**: Chỉ trả 10 tuyến tốt nhất (đã làm)
4. **Caching**: Có thể cache results nếu cần (tương lai)

---

## 📝 Tóm Tắt Lần Sửa

| Thành phần | Sửa | Chi tiết |
|-----------|------|---------|
| Backend | ✅ OK | Có kiểm tra sequence |
| Routes | ✅ OK | Endpoint /find-path hoạt động |
| Frontend | ✅ OK | Gửi stop_id chứ không phải tên |
| Database | 🔧 Cần | Chạy SQL để tạo indexes |
| Server | 🚀 Sẵn sàng | Chỉ cần `npm start` |

---

## 🔗 Liên Hệ / Debug

Nếu gặp lỗi:
1. Xem **Console** (F12) trong trình duyệt
2. Xem **Terminal** nơi chạy `npm start`
3. Kiểm tra **Network tab** (F12) để xem request/response
4. Đọc chi tiết lỗi trong JSON response

---

**Happy Bus Finding! 🚌🗺️**
