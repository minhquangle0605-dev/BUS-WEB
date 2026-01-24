# ⚡ Chạy INDEX - Quick Start (2 phút)

## 🎯 Mục tiêu
Tạo database indexes để tối ưu hóa pathfinding query từ **~500ms → ~10-50ms**

## ⏱️ Phương pháp nhanh nhất (Chạy SQL Script)

### Bước 1: Mở Command Prompt (Windows)
```
Windows + R → nhập: cmd → Enter
```

### Bước 2: Chuyển tới project folder
```cmd
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"
```

### Bước 3: Chạy SQL script
```cmd
psql -U postgres -d postgres -f "db/schema/create-indexes.sql"
```

**Kết quả mong đợi:**
```
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
ANALYZE
ANALYZE
ANALYZE
ANALYZE
ANALYZE
```

---

## ✔️ Verify INDEX được tạo

### Command:
```cmd
psql -U postgres -d postgres -c "SELECT indexname FROM pg_indexes WHERE tablename = 'route_stops' ORDER BY indexname;"
```

### Kết quả mong đợi:
```
               indexname
---------------------------------------
 idx_route_stops_route_id
 idx_route_stops_route_sequence
 idx_route_stops_stop_id
 idx_route_stops_stop_route_seq
```

---

## 🔧 Nếu không chạy được (Plan B)

### Bước 1: Mở PostgreSQL Interactive Mode
```cmd
psql -U postgres -d postgres
```

### Bước 2: Copy-paste các lệnh này:

```sql
-- ⭐ 4 INDEX QUAN TRỌNG
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_id ON route_stops(stop_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_sequence ON route_stops(route_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_route_seq ON route_stops(stop_id, route_id, stop_sequence);

-- ✅ VERIFY
SELECT * FROM pg_indexes WHERE tablename = 'route_stops' ORDER BY indexname;

-- 📈 UPDATE STATISTICS
ANALYZE route_stops;
ANALYZE stops;
ANALYZE routes;

-- 👋 THOÁT
\q
```

---

## 📊 Kiểm tra Hiệu Suất (Optional)

### Trước INDEX:
```cmd
psql -U postgres -d postgres -c "EXPLAIN ANALYZE SELECT DISTINCT rs1.route_id FROM route_stops rs1 INNER JOIN route_stops rs2 ON rs1.route_id = rs2.route_id WHERE rs1.stop_id = '1010001' AND rs2.stop_id = '1010002' AND rs1.stop_sequence < rs2.stop_sequence;"
```

### Sau INDEX:
Chạy lại lệnh trên - sẽ thấy **"Execution time"** giảm đáng kể!

---

## ✅ Xong! 

Pathfinding của bạn hiện giờ đã được tối ưu hóa! 🚀

### Để test:
1. Khởi động server: `npm start`
2. Mở http://localhost:3000/homepage.html
3. Click 2 điểm trên bản đồ → Click "Tìm tuyến xe buýt"
4. Kiểm tra console (F12) - sẽ thấy response nhanh hơn!
