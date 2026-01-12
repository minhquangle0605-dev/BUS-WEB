-- Bảng tạm lưu mapping stop cũ → stop mới (Sxxx)
CREATE TABLE IF NOT EXISTS stop_id_mapping (
    old_stop_id text PRIMARY KEY,
    new_stop_id text NOT NULL
);
2. Tự động sinh mã Sxxx cho tất cả stop_id đang dùng
sql
-- Xóa mapping cũ nếu cần
TRUNCATE TABLE stop_id_mapping;

-- Chèn toàn bộ stop_id đang dùng trong route_stops
-- và tự sinh mã S1, S2, ... theo thứ tự
INSERT INTO stop_id_mapping (old_stop_id, new_stop_id)
SELECT old_stop_id,
       'S' || ROW_NUMBER() OVER (ORDER BY old_stop_id) AS new_stop_id
FROM (
    SELECT DISTINCT stop_id AS old_stop_id
    FROM route_stops
) t;
Đoạn này đảm bảo mọi stop_id trong route_stops đều có mã Sxx mới, không bỏ sót tuyến nào.
​

3. Cập nhật bảng stops theo mapping
sql
-- Tạo / cập nhật bản ghi trong stops cho tất cả Sxx mới
-- Giữ nguyên toạ độ của stop cũ nếu có
INSERT INTO stops (stop_id, stop_name, stop_lat, stop_lon)
SELECT
    m.new_stop_id AS stop_id,
    m.old_stop_id AS stop_name,     -- đặt tên theo mã cũ cho dễ debug
    s.stop_lat,
    s.stop_lon
FROM stop_id_mapping m
LEFT JOIN stops s ON s.stop_id = m.old_stop_id
ON CONFLICT (stop_id) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    stop_lat  = EXCLUDED.stop_lat,
    stop_lon  = EXCLUDED.stop_lon;
Nếu có stop cũ chưa nằm trong stops, bản ghi mới vẫn được tạo nhưng stop_lat/stop_lon sẽ là NULL, bạn có thể bổ sung sau.
​

4. Cập nhật route_stops cho tất cả tuyến
sql
-- Đổi toàn bộ stop_id cũ sang Sxx trong route_stops
UPDATE route_stops rs
SET stop_id = m.new_stop_id
FROM stop_id_mapping m
WHERE rs.stop_id = m.old_stop_id;
Sau khi chạy xong, toàn bộ route_stops chỉ còn dạng S1, S2, ..., không còn 01_1_Sx, 02_1_Sx, v.v.
​

5. Các câu kiểm tra sau khi chuẩn hóa
Chạy 3 câu này để chắc chắn:

sql
-- 1) route_stops dùng stop_id mà stops không có? (phải ra 0 dòng)
SELECT DISTINCT rs.stop_id
FROM route_stops rs
LEFT JOIN stops s ON s.stop_id = rs.stop_id
WHERE s.stop_id IS NULL
ORDER BY rs.stop_id;

-- 2) Tuyến 01_1 (hoặc tuyến khác) sau chuẩn hoá
SELECT route_id, stop_id, stop_sequence
FROM route_stops
WHERE route_id = '01_1'
ORDER BY stop_sequence;

-- 3) Có stop_id nào dùng cho nhiều tuyến (điểm trung chuyển)
SELECT stop_id, COUNT(DISTINCT route_id) AS routes
FROM route_stops
GROUP BY stop_id
HAVING COUNT(DISTINCT route_id) > 1
ORDER BY routes DESC;
Nếu cả (1) ra 0 dòng và các tuyến nhìn đã chỉ còn mã Sxx thì thuật toán tìm đường trong Node.js sẽ hoạt động ổn định hơn rất nhiều trên toàn bộ database chứ không chỉ tuyến 01_1.
​
​