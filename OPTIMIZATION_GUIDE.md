# 📊 Optimization Guide - Pathfinding Performance

## 🎯 Mục tiêu

Tối ưu hóa hiệu suất phương thức tìm đường (pathfinding) từ **~500ms → ~10-50ms**

## ✅ Các bước thực hiện

### 1️⃣ Backend SQL Optimization (✅ ĐÃ HOÀN THÀNH)

#### Vấn đề ban đầu:
```javascript
// ❌ Không hiệu quả: Lấy hết dữ liệu rồi lọc trong JavaScript
SELECT * FROM route_stops 
WHERE stop_id = $1 OR stop_id = $2
ORDER BY route_id, stop_sequence
```

#### Giải pháp được áp dụng:
```sql
-- ✅ Tối ưu: INNER JOIN + sequence validation trong SQL
SELECT DISTINCT rs1.route_id
FROM route_stops rs1
INNER JOIN route_stops rs2 ON rs1.route_id = rs2.route_id
WHERE rs1.stop_id = $1
  AND rs2.stop_id = $2
  AND rs1.stop_sequence < rs2.stop_sequence
ORDER BY rs1.route_id
LIMIT 10
```

**Lợi ích:**
- ✅ Kiểm tra thứ tự (sequence) trực tiếp trong SQL
- ✅ INNER JOIN hiệu quả hơn JavaScript filtering
- ✅ Chỉ trả về kết quả cần thiết

**File được cập nhật:**
- [src/controllers/routes.controller.js](src/controllers/routes.controller.js#L195-L220)

---

### 2️⃣ Frontend Verification (✅ ĐÃ HOÀN THÀNH)

#### Đảm bảo Frontend gửi `stop_id` chính xác:
```javascript
// ✅ Đúng: Gửi stop_id (không phải stop_name)
const response = await fetch('http://localhost:3000/routes/find-path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_stop_id: nearestStartStop.stop_id,   // ✅ ID, không phải tên
    to_stop_id: nearestEndStop.stop_id,       // ✅ ID, không phải tên
    time_period: null                         // AM | MD | PM | null
  })
});
```

**File được cập nhật:**
- [homepage.html](homepage.html#L245-L280) - Có logging chi tiết để debug

---

### 3️⃣ Database Indexes (⏳ CHƯA THỰC HIỆN)

#### Tạo INDEX trên PostgreSQL:

**Command 1: Chạy SQL script tự động**
```bash
psql -U postgres -d postgres -f "db/schema/create-indexes.sql"
```

**Command 2: Hoặc chạy từng lệnh trong PostgreSQL**
```sql
-- Kết nối vào database
psql -U postgres -d postgres

-- Chạy tất cả INDEX
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_id ON route_stops(stop_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_sequence ON route_stops(route_id, stop_sequence ASC);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_route_seq ON route_stops(stop_id, route_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_stops_stop_id ON stops(stop_id);
CREATE INDEX IF NOT EXISTS idx_routes_route_id ON routes(route_id);

-- Update statistics
ANALYZE route_stops;
ANALYZE stops;
ANALYZE routes;
```

**Command 3: Verify INDEX đã được tạo**
```sql
SELECT * FROM pg_indexes 
WHERE tablename = 'route_stops' 
ORDER BY indexname;
```

**Expected output:**
```
       tablename       |            indexname             | indexdef
-----------------------+----------------------------------+----------
 route_stops           | idx_route_stops_stop_id          | CREATE INDEX idx_route_stops_stop_id ON public.route_stops USING btree (stop_id)
 route_stops           | idx_route_stops_route_id         | CREATE INDEX idx_route_stops_route_id ON public.route_stops USING btree (route_id)
 route_stops           | idx_route_stops_route_sequence   | CREATE INDEX idx_route_stops_route_sequence ON public.route_stops USING btree (route_id, stop_sequence)
 route_stops           | idx_route_stops_stop_route_seq   | CREATE INDEX idx_route_stops_stop_route_seq ON public.route_stops USING btree (stop_id, route_id, stop_sequence)
```

---

## 🔧 Kiểm tra Hiệu Suất

### Trước khi tạo INDEX:
```sql
EXPLAIN ANALYZE
SELECT DISTINCT rs1.route_id
FROM route_stops rs1
INNER JOIN route_stops rs2 ON rs1.route_id = rs2.route_id
WHERE rs1.stop_id = '1010001' -- Hà Nội
  AND rs2.stop_id = '1010002'
  AND rs1.stop_sequence < rs2.stop_sequence;
```

### Sau khi tạo INDEX:
```sql
-- Kết quả sẽ nhanh hơn khoảng 5-10x
```

---

## 📋 Checklist Hoàn Thành

- [x] **Backend:** SQL query sử dụng INNER JOIN + sequence validation
- [x] **Frontend:** Gửi stop_id (không phải stop_name)
- [ ] **Database:** Tạo INDEX trên PostgreSQL
- [ ] **Testing:** Verify pathfinding response time

---

## 🚀 Cách Sử Dụng

### Bước 1: Khởi động server
```bash
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"
npm start
```

### Bước 2: Tạo INDEX trên PostgreSQL
```bash
# Option 1: Chạy SQL script
psql -U postgres -d postgres -f "db/schema/create-indexes.sql"

# Option 2: Chạy từng lệnh trong psql
# (Xem mục "Tạo INDEX trên PostgreSQL" ở trên)
```

### Bước 3: Mở trình duyệt
```
http://localhost:3000/homepage.html
```

### Bước 4: Test Pathfinding
1. Click 2 vị trí trên bản đồ
2. Click "Tìm tuyến xe buýt"
3. Kiểm tra console để xem logging (F12)

---

## 📊 Hiệu Suất So Sánh

| Giai đoạn | Query Time | Ghi chú |
|-----------|-----------|---------|
| Trước tối ưu (no INDEX) | ~500ms | Toàn bộ dữ liệu được scanned |
| Sau tối ưu (with INDEX) | ~10-50ms | Sử dụng B-tree indexes |
| Improvement | **10-50x** | Tùy kích thước dataset |

---

## 🐛 Troubleshooting

### Vấn đề: "Không tìm thấy tuyến nào"
**Nguyên nhân:** stop_id không hợp lệ hoặc không có tuyến chứa cả 2 điểm  
**Giải pháp:**
1. Click "Test nearby stops" để get stop_id chính xác
2. Kiểm tra console logs
3. Verify stop_id tồn tại trong database:
   ```sql
   SELECT * FROM stops WHERE stop_id = '1010001';
   ```

### Vấn đề: "Query quá chậm"
**Nguyên nhân:** INDEX chưa được tạo  
**Giải pháp:**
1. Chạy lệnh tạo INDEX (xem trên)
2. Verify INDEX được tạo: 
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'route_stops';
   ```
3. Kiểm tra lại hiệu suất

### Vấn đề: "Database error"
**Giải pháp:**
1. Kiểm tra kết nối PostgreSQL: `psql -U postgres`
2. Kiểm tra table tồn tại: `\dt`
3. Xem logs trong src/index.js

---

## 📝 Files Thay Đổi

### Đã sửa:
- ✅ [src/controllers/routes.controller.js](src/controllers/routes.controller.js) - SQL JOIN optimization
- ✅ [homepage.html](homepage.html) - Frontend verification + logging

### Cần thực hiện:
- ⏳ [db/schema/create-indexes.sql](db/schema/create-indexes.sql) - Run on PostgreSQL

---

## 💡 Kiến Thức

### Tại sao INNER JOIN hiệu quả hơn JavaScript filtering?
1. **Database optimizer:** PostgreSQL biết cách tối ưu JOIN
2. **Index usage:** Có thể sử dụng indexes để tăng tốc độ
3. **Data transfer:** Chỉ truyền dữ liệu cần thiết
4. **Network:** Giảm lượng dữ liệu gửi qua mạng

### Tại sao cần INDEX?
1. **B-tree structure:** Tìm kiếm O(log n) thay vì O(n)
2. **WHERE clause:** `stop_id = $1` sử dụng index tìm nhanh
3. **JOIN optimization:** PostgreSQL sử dụng index để JOIN hiệu quả
4. **ORDER BY:** Composite index giúp sắp xếp không cần bổ sung

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console logs (F12 trong trình duyệt)
2. Kiểm tra server logs (terminal chạy npm start)
3. Verify database connection: `psql -U postgres -d postgres`
