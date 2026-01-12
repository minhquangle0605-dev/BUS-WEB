const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
});

// Test kết nối DB
pool
    .query('SELECT 1')
    .then(() => console.log('✅ DB connected'))
    .catch((err) => console.error('❌ DB connection error:', err.message));

// ================== GRAPH UTILS (route_stops) ==================

/**
 * Build graph từ bảng route_stops.
 * node: stop_id
 * edge: giữa 2 stop liên tiếp trên cùng route_id
 * weight: 1 (mỗi đoạn 1 đơn vị)
 */
async function buildGraphFromRouteStops() {
    const sql = `
    SELECT route_id, stop_id, stop_sequence
    FROM route_stops
    ORDER BY route_id, stop_sequence ASC
  `;
    const result = await pool.query(sql);
    const rows = result.rows;

    // graph: { [stop_id]: Array<{ to, weight, route_id }> }
    const graph = {};

    for (let i = 0; i < rows.length - 1; i++) {
        const curr = rows[i];
        const next = rows[i + 1];

        if (curr.route_id === next.route_id) {
            const from = curr.stop_id;
            const to = next.stop_id;
            const weight = 1;

            if (!graph[from]) graph[from] = [];
            if (!graph[to]) graph[to] = [];

            // undirected
            graph[from].push({ to, weight, route_id: curr.route_id });
            graph[to].push({ to: from, weight, route_id: curr.route_id });
        }
    }

    return graph;
}

/**
 * Dijkstra: tìm đường ngắn nhất theo số cạnh.
 * Trả về danh sách stop_id từ start đến end hoặc null nếu không tìm được.
 */
function dijkstraShortestPath(graph, start, end) {
    const dist = {};
    const prev = {};
    const visited = new Set();

    Object.keys(graph).forEach((node) => {
        dist[node] = Infinity;
        prev[node] = null;
    });
    if (!(start in dist) || !(end in dist)) {
        return null;
    }
    dist[start] = 0;

    while (true) {
        let u = null;
        let minDist = Infinity;

        for (const node of Object.keys(graph)) {
            if (!visited.has(node) && dist[node] < minDist) {
                minDist = dist[node];
                u = node;
            }
        }

        if (u === null) break;
        if (u === end) break;

        visited.add(u);

        for (const edge of graph[u] || []) {
            const v = edge.to;
            const w = edge.weight || 1;
            const alt = dist[u] + w;
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = u;
            }
        }
    }

    if (dist[end] === Infinity) return null;

    const path = [];
    let cur = end;
    while (cur !== null) {
        path.unshift(cur);
        cur = prev[cur];
    }
    return path;
}

// ================== API STOPS ==================

/**
 * GET /stops
 * - /stops: lấy toàn bộ
 * - /stops?q=ben: tìm theo tên (không phân biệt hoa/thường)
 */
app.get('/stops', async (req, res) => {
    try {
        const { q } = req.query;
        console.log('q =', q);

        let query = `
      SELECT stop_id, stop_name, stop_lat, stop_lon
      FROM stops
    `;
        const params = [];

        if (q && q.trim() !== '') {
            query += ' WHERE stop_name ILIKE $1';
            params.push(`%${q}%`);
        }

        query += ' ORDER BY stop_name ASC';

        console.log('SQL =', query, 'params =', params);
        const result = await pool.query(query, params);
        return res.json(result.rows);
    } catch (err) {
        console.error('getStops error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /stops/:id
 * Trả về 404 nếu không tìm thấy.
 */
app.get('/stops/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `
      SELECT stop_id, stop_name, stop_lat, stop_lon
      FROM stops
      WHERE stop_id = $1
      `,
            [id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stop not found' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('getStopById error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /stops/nearby?lat=&lng=&radius=
 * - lat, lng: bắt buộc
 * - radius: km, mặc định 0.5
 */
app.get('/stops/nearby', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'lat and lng are required' });
        }

        const latNum = Number(lat);
        const lngNum = Number(lng);
        const radiusKm = radius ? Number(radius) : 0.5;

        if (Number.isNaN(latNum) || Number.isNaN(lngNum) || Number.isNaN(radiusKm)) {
            return res
                .status(400)
                .json({ error: 'lat, lng, radius must be numbers' });
        }

        const query = `
      SELECT
        stop_id,
        stop_name,
        stop_lat,
        stop_lon,
        6371 * acos(
          cos(radians($1)) * cos(radians(stop_lat)) *
          cos(radians(stop_lon) - radians($2)) +
          sin(radians($1)) * sin(radians(stop_lat))
        ) AS distance_km
      FROM stops
      WHERE stop_lat IS NOT NULL
        AND stop_lon IS NOT NULL
        AND 6371 * acos(
          cos(radians($1)) * cos(radians(stop_lat)) *
          cos(radians(stop_lon) - radians($2)) +
          sin(radians($1)) * sin(radians(stop_lat))
        ) <= $3
      ORDER BY distance_km ASC
      LIMIT 50;
    `;

        const result = await pool.query(query, [latNum, lngNum, radiusKm]);

        const data = result.rows.map((row) => ({
            stop_id: row.stop_id,
            stop_name: row.stop_name,
            stop_lat: row.stop_lat,
            stop_lon: row.stop_lon,
            distance_m: Math.round(row.distance_km * 1000),
        }));

        return res.json(data);
    } catch (err) {
        console.error('getNearbyStops error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// ================== API TÌM ĐƯỜNG ==================

/**
 * POST /routes/find-path
 * Body:
 * {
 *   "from_stop_id": "S1",
 *   "to_stop_id": "S5",
 *   "mode": "simple" | "dijkstra"  // optional, default: "simple"
 * }
 *
 * mode = "simple":
 *  - Nếu 2 điểm nằm trên cùng 1 route_id
 *  - Trả về đoạn con giữa 2 điểm dừng trên tuyến đó
 *
 * mode = "dijkstra":
 *  - Xây graph từ route_stops
 *  - Tìm đường ngắn nhất theo số cạnh
 */
app.post('/routes/find-path', async (req, res) => {
    try {
        const { from_stop_id, to_stop_id, mode = 'simple' } = req.body;

        if (!from_stop_id || !to_stop_id) {
            return res
                .status(400)
                .json({ error: 'from_stop_id và to_stop_id là bắt buộc' });
        }

        if (mode === 'dijkstra') {
            const graph = await buildGraphFromRouteStops();
            const path = dijkstraShortestPath(graph, from_stop_id, to_stop_id);
            if (!path) {
                return res
                    .status(404)
                    .json({ error: 'Không tìm được đường đi trong graph' });
            }
            return res.json({
                mode: 'dijkstra',
                stops: path,
            });
        }

        // --------- MODE SIMPLE: cùng tuyến, đoạn con ----------
        const sql = `
      SELECT route_id, stop_id, stop_sequence
      FROM route_stops
      WHERE stop_id = $1 OR stop_id = $2
      ORDER BY route_id, stop_sequence
    `;
        const result = await pool.query(sql, [from_stop_id, to_stop_id]);
        const rows = result.rows;

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Không tìm thấy tuyến nào chứa 2 điểm dừng này',
            });
        }

        // Nhóm theo route_id để tìm tuyến có cả from và to
        const routesMap = {};
        for (const row of rows) {
            if (!routesMap[row.route_id]) routesMap[row.route_id] = [];
            routesMap[row.route_id].push(row);
        }

        let chosenRouteId = null;
        let fromSeq = null;
        let toSeq = null;

        for (const [routeId, stops] of Object.entries(routesMap)) {
            let f = null;
            let t = null;
            for (const s of stops) {
                if (s.stop_id === from_stop_id) f = s.stop_sequence;
                if (s.stop_id === to_stop_id) t = s.stop_sequence;
            }
            if (f !== null && t !== null) {
                chosenRouteId = routeId;
                fromSeq = f;
                toSeq = t;
                break;
            }
        }

        if (!chosenRouteId) {
            return res.status(404).json({
                error: 'Không có tuyến nào chứa cả 2 điểm dừng',
            });
        }

        // Lấy full danh sách stop của tuyến đó theo stop_sequence
        const sqlFull = `
      SELECT route_id, stop_id, stop_sequence
      FROM route_stops
      WHERE route_id = $1
      ORDER BY stop_sequence ASC
    `;
        const fullResult = await pool.query(sqlFull, [chosenRouteId]);
        const fullStops = fullResult.rows;

        const start = Math.min(fromSeq, toSeq);
        const end = Math.max(fromSeq, toSeq);

        const pathStops = fullStops
            .filter((s) => s.stop_sequence >= start && s.stop_sequence <= end)
            .map((s) => s.stop_id);

        return res.json({
            mode: 'simple',
            route_id: chosenRouteId,
            stops: pathStops,
        });
    } catch (err) {
        console.error('findPath error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// ================== HEALTH CHECK ==================

app.get('/', (req, res) => {
    res.json({
        message: 'Server OK',
        docs:
            '/stops, /stops?q=, /stops/:id, /stops/nearby, POST /routes/find-path',
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
