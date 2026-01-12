# BUS_PROJECT - Backend 1

Backend API cho hệ thống quản lý lộ trình xe buýt Hà Nội.

## Cấu trúc project

```
BUS_PROJECT/
├── db/
│   ├── schema/
│   │   └── bus.sql              # Schema chính của database
│   ├── migrations/              # Các thay đổi DB sau này
│   ├── scripts/
│   │   └── reset_db.sql         # Script reset database
│   ├── seed/                    # Dữ liệu mẫu (nếu có)
│   └── backup/
│       └── bus_routes_db_backup.sql  # Backup dữ liệu
├── src/
├── .gitignore
├── pom.xml
└── README.md
```

## Hướng dẫn tạo Database

### 1. Yêu cầu
- MySQL 5.7+ hoặc MariaDB
- MySQL Workbench hoặc dòng lệnh MySQL

### 2. Tạo database từ schema

**Cách A: Dùng MySQL Workbench**
- Mở MySQL Workbench
- Chọn `File` → `Open SQL Script`
- Chọn file `db/schema/bus.sql`
- Nhấn `Execute` (hoặc `Ctrl + Shift + Enter`)
- Database `bus_routes_db` sẽ được tạo tự động

**Cách B: Dùng dòng lệnh**
```bash
# Tạo database mới
mysql -u root -p < db/schema/bus.sql

# Kiểm tra xem đã tạo thành công chưa
mysql -u root -p -e "USE bus_routes_db; SELECT COUNT(*) FROM routes;"
```

### 3. Xác nhận dữ liệu

Sau khi tạo xong, chạy những truy vấn sau để kiểm tra:

```sql
USE bus_routes_db;

-- Kiểm tra số lượng records
SELECT COUNT(*) as total_routes FROM routes;
SELECT COUNT(*) as total_stops FROM stops;
SELECT COUNT(*) as total_trips FROM trips;
SELECT COUNT(*) as total_stop_times FROM stop_times;

-- Kiểm tra phân bố AM/MD/PM
SELECT 
  CASE 
    WHEN trip_id LIKE '%_AM_%' THEN 'AM'
    WHEN trip_id LIKE '%_MD_%' THEN 'MD'
    WHEN trip_id LIKE '%_PM_%' THEN 'PM'
    ELSE 'OTHER'
  END as time_of_day,
  COUNT(*) as trip_count
FROM trips
GROUP BY time_of_day
ORDER BY time_of_day;
```

### 4. Reset database (nếu cần)

```bash
mysql -u root -p < db/scripts/reset_db.sql
```

## Database Schema

### Các bảng chính:

- **routes**: Thông tin tuyến bus (route_id, route_code, route_name, description)
- **stops**: Điểm dừng (stop_id, stop_name, latitude, longitude, address)
- **route_stops**: Mối quan hệ giữa tuyến và điểm dừng (route_id, stop_id, stop_sequence)
- **trips**: Các chuyến xe (trip_id, route_id, service_type, start_time)
- **stop_times**: Lịch trình tại mỗi điểm dừng (trip_id, stop_id, arrival_time, departure_time)

## Dữ liệu

- Nguồn: GTFS Hà Nội (3 khung giờ: AM, MD, PM)
- Tổng số tuyến: Xem từ file `db/schema/bus.sql`
- Tổng số điểm dừng: Xem từ file `db/schema/bus.sql`

## Tiếp tục phát triển

### Bước tới:
1. Viết API endpoints REST
2. Tối ưu queries và thêm indexes
3. Viết unit tests
4. Deploy lên production

## Liên hệ

Dự án BUS_PROJECT - Backend 1
Tháng 12, 2025
