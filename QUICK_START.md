# 🚀 Quick Start Guide - Bus Route Finder

## ⚡ Nhanh Chóng Bắt Đầu (5 Phút)

### Bước 1: Setup Database (2 phút)
```bash
# Mở PowerShell/Terminal
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"

# Chạy lần lượt các lệnh:
psql -U postgres -f db/schema/bus.sql
psql -U postgres -f db/schema/setup-route-stops.sql
psql -U postgres -f db/schema/chuanhoa_data.sql
psql -U postgres -f db/schema/create-indexes.sql

# Kiểm tra dữ liệu
psql -U postgres -d postgres -c "SELECT COUNT(*) as 'Stops' FROM stops;"
```

### Bước 2: Chạy Server (1 phút)
```bash
cd "c:\Users\Hi\PJ buss\BUS-WEB-main"
npm install
npm start
```

Bạn sẽ thấy:
```
✅ DB connected
🚀 Server running at http://localhost:3000
```

### Bước 3: Test API (1 phút)
```bash
# Mở terminal/PowerShell khác
# Test 1: Xem tất cả trạm
curl http://localhost:3000/stops

# Test 2: Tìm trạm gần
curl "http://localhost:3000/stops/nearby?lat=21.0285&lng=105.8542&radius=0.5"

# Test 3: Tìm lộ trình (PATHFINDING)
curl -X POST "http://localhost:3000/routes/find-path" ^
  -H "Content-Type: application/json" ^
  -d "{\"from_stop_id\":\"S1\",\"to_stop_id\":\"S10\"}"
```

### Bước 4: Dùng Frontend (1 phút)
```
1. Mở trình duyệt
2. Đi tới: http://localhost:3000/homepage.html
3. Click 2 điểm trên bản đồ
4. Bấm "Tìm tuyến xe buýt"
5. Xem kết quả!
```

---

## 🧪 Test Cases Nhanh

### Test 1: Route Hợp Lệ
```bash
curl -X POST "http://localhost:3000/routes/find-path" ^
  -H "Content-Type: application/json" ^
  -d "{\"from_stop_id\":\"S1\",\"to_stop_id\":\"S5\"}"
```
**Kỳ vọng:** 200, trả về journey với tất cả trạm

### Test 2: Route Sáng (AM)
```bash
curl -X POST "http://localhost:3000/routes/find-path" ^
  -H "Content-Type: application/json" ^
  -d "{\"from_stop_id\":\"S1\",\"to_stop_id\":\"S5\",\"time_period\":\"AM\"}"
```
**Kỳ vọng:** 200, chỉ tuyến AM

### Test 3: Lỗi Sequence (Đi Ngược)
```bash
curl -X POST "http://localhost:3000/routes/find-path" ^
  -H "Content-Type: application/json" ^
  -d "{\"from_stop_id\":\"S10\",\"to_stop_id\":\"S1\"}"
```
**Kỳ vọng:** 404, lỗi sequence

### Test 4: Trạm Không Tồn Tại
```bash
curl -X POST "http://localhost:3000/routes/find-path" ^
  -H "Content-Type: application/json" ^
  -d "{\"from_stop_id\":\"INVALID\",\"to_stop_id\":\"S1\"}"
```
**Kỳ vọng:** 404, trạm không tồn tại

---

## ⚠️ Troubleshooting Nhanh

| Vấn Đề | Giải Pháp |
|--------|----------|
| ❌ `ECONNREFUSED` | PostgreSQL không chạy. Bắt đầu PostgreSQL service |
| ❌ `No stops found` | Chưa import dữ liệu. Chạy SQL scripts |
| ❌ `Query too slow` | Chưa tạo INDEX. Chạy `create-indexes.sql` |
| ❌ `404 not found` | Endpoint sai. Kiểm tra URL: `/routes/find-path` |
| ❌ `Port 3000 in use` | Port bận. Thay đổi `PORT=3001 npm start` |

---

## 📚 Tài Liệu Chi Tiết

- 📖 [PATHFINDING_API.md](PATHFINDING_API.md) - Pathfinding API chi tiết
- 📖 [DATABASE_SETUP.md](DATABASE_SETUP.md) - Setup database chi tiết
- 📖 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Tất cả API endpoints
- 📖 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Tóm tắt thay đổi

---

## ✅ Kiểm Tra Hoàn Thiện

```bash
# Tất cả commands này phải pass:

# 1. PostgreSQL running
psql -U postgres -c "SELECT 1"

# 2. Database exists
psql -U postgres -c "SELECT COUNT(*) FROM stops;"

# 3. INDEX created
psql -U postgres -d postgres -c "\d route_stops" | grep idx_

# 4. Server running
curl http://localhost:3000/

# 5. Pathfinding works
curl -X POST "http://localhost:3000/routes/find-path" \
  -H "Content-Type: application/json" \
  -d '{"from_stop_id":"S1","to_stop_id":"S5"}'

echo "✅ All checks passed!"
```

---

## 🎯 Điều Chỉnh Cơ Bản

### Thay Đổi Port
```bash
# .env file
PORT=3001  # Thay từ 3000 thành 3001

# Hoặc:
PORT=3001 npm start
```

### Thay Đổi Database Credentials
```bash
# .env file
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
DB_PORT=5432
```

### Thêm Time Period Filter
```bash
# Frontend code
const response = await fetch('http://localhost:3000/routes/find-path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_stop_id: 'S1',
    to_stop_id: 'S5',
    time_period: 'AM'  // AM | MD | PM | null
  })
});
```

---

## 🔍 Kiểm Tra Lỗi

### Xem Logs Server
```bash
# Terminal 1: Chạy server với debug
npm start

# Xem output console để lỗi
# ❌ DB connected → Check PostgreSQL
# ❌ Error: connect ECONNREFUSED → Check .env
```

### Xem Logs Browser
```
F12 → Console → Xem lỗi JavaScript
F12 → Network → Xem HTTP requests/responses
```

### Xem Database
```bash
# Kết nối PostgreSQL
psql -U postgres -d postgres

# Check stops
SELECT COUNT(*) as total_stops FROM stops;

# Check routes  
SELECT COUNT(*) as total_routes FROM routes;

# Check route_stops
SELECT COUNT(*) as total_route_stops FROM route_stops;

# Check INDEX
\d route_stops

# Thoát
\q
```

---

## 🆘 Cần Giúp?

### Check logs
```bash
1. Server console (terminal chạy npm start)
2. Browser console (F12 → Console)
3. PostgreSQL logs
```

### Verify setup
```bash
npm start
# Nếu thấy: "✅ DB connected" → Database OK
# Nếu thấy error → Xem lỗi chi tiết
```

### Test từng step
```bash
1. curl http://localhost:3000/stops
2. curl "http://localhost:3000/stops/nearby?lat=21.0285&lng=105.8542"
3. curl -X POST "http://localhost:3000/routes/find-path" ...
```

---

## 📊 Architecture

```
Browser (homepage.html)
  ↓
  [Map Interface]
  ↓
  Click 2 points
  ↓
  Call API: /stops/nearby (tìm trạm)
  ↓
  Call API: /routes/find-path (tìm lộ trình)
  ↓
  Draw route on map
```

---

## 🎉 Success Indicators

✅ Server chạy không lỗi  
✅ Database kết nối OK  
✅ API /stops hoạt động  
✅ API /stops/nearby hoạt động  
✅ API /routes/find-path trả về journey  
✅ Frontend vẽ tuyến trên bản đồ  

**Nếu tất cả OK → Bạn đã thành công!** 🚀

---

**Duration:** ~5 minutes  
**Level:** Beginner-friendly  
**Last Updated:** 2026-01-24
