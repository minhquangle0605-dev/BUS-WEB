-- Script: Tạo bảng route_stops từ GTFS trips + stop_times
-- Mục đích: Vì dataset GTFS không có bảng route_stops trực tiếp,
--           tạo mapping route_id -> danh sách stop theo thứ tự từ stop_times

-- 1. Tạo bảng route_stops
CREATE TABLE route_stops (
  route_id TEXT NOT NULL,
  stop_id TEXT NOT NULL,
  stop_sequence INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (route_id, stop_id, stop_sequence)
);

-- 2. Populate bảng: lấy trip đầu tiên mỗi route (hoặc trip sớm nhất),
--    rồi insert dãy stop của trip đó vào route_stops
INSERT INTO route_stops (route_id, stop_id, stop_sequence)
SELECT DISTINCT 
  t.route_id,
  st.stop_id,
  st.stop_sequence
FROM trips t
INNER JOIN stop_times st ON t.trip_id = st.trip_id
INNER JOIN (
  -- Lấy trip đầu tiên mỗi route (theo trip_id)
  SELECT route_id, MIN(trip_id) as first_trip_id
  FROM trips
  GROUP BY route_id
) first_trip ON t.route_id = first_trip.route_id AND t.trip_id = first_trip.first_trip_id
ORDER BY t.route_id, st.stop_sequence;

-- 3. Kiểm tra kết quả
SELECT COUNT(*) as total_route_stops FROM route_stops;
SELECT route_id, COUNT(*) as stops_per_route 
FROM route_stops 
GROUP BY route_id 
ORDER BY stops_per_route DESC 
LIMIT 10;

-- 4. Test query: xem điểm dừng của tuyến đầu tiên
SELECT * FROM route_stops 
WHERE route_id = (SELECT route_id FROM routes LIMIT 1)
ORDER BY stop_sequence;