const pool = require('../config/db');

// TIME_PERIOD_MAP: Mapping time_period to route_id prefix
const TIME_PERIOD_MAP = {
  AM: '01',  // Morning (6h - 11h59)
  MD: '02',  // Midday (12h - 17h59)
  PM: '03',  // Evening (18h - 23h59)
};

/**
 * Build graph từ bảng route_stops với support time_period
 * node: stop_id
 * edge: giữa 2 stop liên tiếp trên cùng route_id
 */
async function buildGraphFromRouteStops(timePeriod = null) {
  const sql = `
    SELECT route_id, stop_id, stop_sequence
    FROM route_stops
    ORDER BY route_id, stop_sequence ASC
  `;
  const result = await pool.query(sql);
  const rows = result.rows;

  const graph = {};
  let filteredRows = rows;

  // Filter by time period nếu được chỉ định
  if (timePeriod && TIME_PERIOD_MAP[timePeriod]) {
    const prefix = TIME_PERIOD_MAP[timePeriod];
    filteredRows = rows.filter(row => row.route_id.startsWith(prefix));
  }

  for (let i = 0; i < filteredRows.length - 1; i++) {
    const curr = filteredRows[i];
    const next = filteredRows[i + 1];

    if (curr.route_id === next.route_id) {
      const from = curr.stop_id;
      const to = next.stop_id;
      const weight = 1;

      if (!graph[from]) graph[from] = [];
      if (!graph[to]) graph[to] = [];

      graph[from].push({ to, weight, route_id: curr.route_id });
      graph[to].push({ to: from, weight, route_id: curr.route_id });
    }
  }

  return graph;
}

/**
 * Dijkstra: tìm đường ngắn nhất theo số cạnh
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

// ============ GET /routes/status ============
const getStatus = (req, res) => {
  res.json({ status: 'ok' });
};

// ============ POST /routes/journey ============
/**
 * Endpoint chuyên dụng: Tìm lộ trình chi tiết giữa 2 điểm dừng
 * Xử lý: Logic Sequence + Time Period
 */
const findJourney = async (req, res) => {
  try {
    const { origin, destination, time_period, mode = 'simple' } = req.body;

    // Validate input
    if (!origin || !destination) {
      return res.status(400).json({
        error: 'origin và destination là bắt buộc',
        example: {
          origin: 'S1',
          destination: 'S5',
          time_period: 'AM',
          mode: 'simple',
        },
      });
    }

    if (origin === destination) {
      return res.status(400).json({ error: 'origin và destination phải khác nhau' });
    }

    // Verify stops exist
    const stopCheck = await pool.query(
      `SELECT stop_id, stop_name FROM stops WHERE stop_id IN ($1, $2)`,
      [origin, destination]
    );

    if (stopCheck.rows.length !== 2) {
      return res.status(404).json({ error: 'Một hoặc cả 2 điểm dừng không tồn tại' });
    }

    const stopMap = {};
    stopCheck.rows.forEach(row => {
      stopMap[row.stop_id] = row.stop_name;
    });

    // ===== DIJKSTRA MODE =====
    if (mode === 'dijkstra') {
      const graph = await buildGraphFromRouteStops(time_period);
      const path = dijkstraShortestPath(graph, origin, destination);

      if (!path) {
        return res.status(404).json({
          error: `Không tìm được lộ trình từ "${origin}" đến "${destination}"`,
          time_period: time_period || 'ALL',
        });
      }

      // Fetch stop details
      const pathDetails = [];
      for (const stopId of path) {
        const stopResult = await pool.query(
          `SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = $1`,
          [stopId]
        );
        if (stopResult.rows.length > 0) {
          pathDetails.push(stopResult.rows[0]);
        }
      }

      return res.json({
        mode: 'dijkstra',
        time_period: time_period || 'ALL',
        origin: { stop_id: origin, stop_name: stopMap[origin] },
        destination: { stop_id: destination, stop_name: stopMap[destination] },
        total_stops: pathDetails.length,
        journey: pathDetails,
      });
    }

    // ===== SIMPLE MODE (Default) =====
    // Tìm tuyến trực tiếp chứa cả 2 điểm dừng với sequence order validation
    // ⭐ SQL được tối ưu để kiểm tra sequence trực tiếp trong query
    let sql = `
      SELECT DISTINCT
        rs1.route_id,
        rs1.stop_id as origin_stop,
        rs1.stop_sequence as origin_sequence,
        rs2.stop_id as destination_stop,
        rs2.stop_sequence as destination_sequence
      FROM route_stops rs1
      INNER JOIN route_stops rs2 
        ON rs1.route_id = rs2.route_id
      WHERE rs1.stop_id = $1
        AND rs2.stop_id = $2
        AND rs1.stop_sequence < rs2.stop_sequence
      ORDER BY rs1.route_id
      LIMIT 10
    `;

    const params = [origin, destination];

    // Add time_period filter if specified
    if (time_period && TIME_PERIOD_MAP[time_period]) {
      const prefix = TIME_PERIOD_MAP[time_period];
      sql = sql.replace(
        'ORDER BY rs1.route_id',
        `AND rs1.route_id LIKE '${prefix}%' ORDER BY rs1.route_id`
      );
    }

    const result = await pool.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `Không tìm thấy tuyến nào chứa cả 2 điểm dừng theo thứ tự đúng.
                Điểm đi phải xuất hiện trước điểm đến trong lộ trình.`,
        hint: `Kiểm tra: "${origin}" (seq?) → "${destination}" (seq?)`,
        time_period: time_period || 'ALL',
      });
    }

    // Lấy tuyến đầu tiên (hoặc ngắn nhất)
    const bestRoute = result.rows[0];
    const chosenRouteId = bestRoute.route_id;
    const originSeq = bestRoute.origin_sequence;
    const destSeq = bestRoute.destination_sequence;

    // Fetch full route stops
    const fullResult = await pool.query(
      `
      SELECT stop_id, stop_sequence
      FROM route_stops
      WHERE route_id = $1
      ORDER BY stop_sequence ASC
      `,
      [chosenRouteId]
    );

    // Fetch route info
    const routeResult = await pool.query(
      `SELECT route_id, route_short_name, route_long_name FROM routes WHERE route_id = $1`,
      [chosenRouteId]
    );
    const routeInfo = routeResult.rows[0] || {};

    // Get journey stops
    const journeyStops = fullResult.rows.filter(
      s => s.stop_sequence >= originSeq && s.stop_sequence <= destSeq
    );

    // Fetch stop details
    const stopIds = journeyStops.map(s => s.stop_id);
    const stopsResult = await pool.query(
      `SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = ANY($1)`,
      [stopIds]
    );

    const stopDetailsMap = {};
    stopsResult.rows.forEach(row => {
      stopDetailsMap[row.stop_id] = row;
    });

    const journeyDetails = journeyStops.map(s => ({
      ...stopDetailsMap[s.stop_id],
      sequence: s.stop_sequence,
    }));

    return res.json({
      mode: 'simple',
      time_period: time_period || 'ALL',
      route: {
        route_id: routeInfo.route_id,
        route_short_name: routeInfo.route_short_name,
        route_long_name: routeInfo.route_long_name,
      },
      origin: { stop_id: origin, stop_name: stopMap[origin] },
      destination: { stop_id: destination, stop_name: stopMap[destination] },
      total_stops: journeyDetails.length,
      distance_stops: journeyDetails.length - 1,
      journey: journeyDetails,
    });
  } catch (err) {
    console.error('findJourney error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ============ POST /routes/find-path ============
/**
 * PATHFINDING API: Tìm lộ trình từ điểm A đến điểm B
 * 
 * Logic:
 * 1. Tìm tất cả tuyến đi qua điểm A
 * 2. Tìm tất cả tuyến đi qua điểm B
 * 3. Tìm tuyến giao nhau (chứa cả A và B)
 * 4. Kiểm tra sequence: A.sequence < B.sequence (không đi ngược)
 * 5. Trả về chi tiết lộ trình với tất cả điểm dừng giữa A và B
 */
const findPath = async (req, res) => {
  try {
    const { from_stop_id, to_stop_id, time_period } = req.body;

    // Validate input
    if (!from_stop_id || !to_stop_id) {
      return res.status(400).json({
        error: 'from_stop_id và to_stop_id là bắt buộc',
        example: { from_stop_id: 'S1', to_stop_id: 'S5', time_period: 'AM' },
      });
    }

    if (from_stop_id === to_stop_id) {
      return res.status(400).json({
        error: 'from_stop_id và to_stop_id phải khác nhau',
      });
    }

    // Verify stops exist
    const stopsCheck = await pool.query(
      `SELECT stop_id, stop_name, stop_lat, stop_lon 
       FROM stops 
       WHERE stop_id IN ($1, $2)`,
      [from_stop_id, to_stop_id]
    );

    if (stopsCheck.rows.length !== 2) {
      return res.status(404).json({
        error: 'Một hoặc cả 2 điểm dừng không tồn tại',
      });
    }

    const stopMap = {};
    stopsCheck.rows.forEach(row => {
      stopMap[row.stop_id] = row;
    });

    // ===== PATHFINDING LOGIC =====
    // Tìm tuyến đi qua cả 2 điểm dừng (sequence A < sequence B)
    let timeFilter = '';
    const params = [from_stop_id, to_stop_id];

    if (time_period && TIME_PERIOD_MAP[time_period]) {
      const prefix = TIME_PERIOD_MAP[time_period];
      timeFilter = ` AND rs.route_id LIKE $3 || '%'`;
      params.push(prefix);
    }

    const pathSQL = `
      SELECT DISTINCT
        rs1.route_id,
        rs1.stop_id as from_stop,
        rs1.stop_sequence as from_sequence,
        rs2.stop_id as to_stop,
        rs2.stop_sequence as to_sequence
      FROM route_stops rs1
      INNER JOIN route_stops rs2 ON rs1.route_id = rs2.route_id
      WHERE rs1.stop_id = $1
        AND rs2.stop_id = $2
        AND rs1.stop_sequence < rs2.stop_sequence
        ${timeFilter}
      LIMIT 10
    `;

    const pathResult = await pool.query(pathSQL, params);

    if (pathResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Không tìm thấy tuyến nào đi qua cả 2 điểm này theo thứ tự đúng',
        hint: 'Điểm đi phải xuất hiện trước điểm đến trong lộ trình',
        time_period: time_period || 'ALL',
      });
    }

    // Lấy tuyến đầu tiên (hoặc có thể chọn tuyến ngắn nhất)
    const bestRoute = pathResult.rows[0];
    const routeId = bestRoute.route_id;
    const fromSeq = bestRoute.from_sequence;
    const toSeq = bestRoute.to_sequence;

    // Lấy thông tin tuyến
    const routeInfo = await pool.query(
      `SELECT route_id, route_short_name, route_long_name 
       FROM routes 
       WHERE route_id = $1`,
      [routeId]
    );

    // Lấy tất cả điểm dừng trên tuyến từ A đến B
    const stopsOnRoute = await pool.query(
      `SELECT stop_id, stop_sequence
       FROM route_stops
       WHERE route_id = $1 AND stop_sequence >= $2 AND stop_sequence <= $3
       ORDER BY stop_sequence ASC`,
      [routeId, fromSeq, toSeq]
    );

    // Lấy chi tiết tất cả điểm dừng
    const stopIds = stopsOnRoute.rows.map(s => s.stop_id);
    const stopsDetail = await pool.query(
      `SELECT stop_id, stop_name, stop_lat, stop_lon
       FROM stops
       WHERE stop_id = ANY($1)
       ORDER BY stop_id`,
      [stopIds]
    );

    const stopDetailMap = {};
    stopsDetail.rows.forEach(s => {
      stopDetailMap[s.stop_id] = s;
    });

    // Xây dựng lộ trình chi tiết
    const journey = stopsOnRoute.rows.map(s => ({
      ...stopDetailMap[s.stop_id],
      sequence: s.stop_sequence,
    }));

    return res.json({
      success: true,
      route: {
        route_id: routeInfo.rows[0]?.route_id,
        route_short_name: routeInfo.rows[0]?.route_short_name,
        route_long_name: routeInfo.rows[0]?.route_long_name,
      },
      from: {
        stop_id: from_stop_id,
        stop_name: stopMap[from_stop_id].stop_name,
        stop_lat: stopMap[from_stop_id].stop_lat,
        stop_lon: stopMap[from_stop_id].stop_lon,
        sequence: fromSeq,
      },
      to: {
        stop_id: to_stop_id,
        stop_name: stopMap[to_stop_id].stop_name,
        stop_lat: stopMap[to_stop_id].stop_lat,
        stop_lon: stopMap[to_stop_id].stop_lon,
        sequence: toSeq,
      },
      total_stops: journey.length,
      distance_stops: journey.length - 1,
      time_period: time_period || 'ALL',
      journey,
    });
  } catch (err) {
    console.error('findPath error:', err);
    return res.status(500).json({
      error: 'Server error',
      details: err.message,
    });
  }
};

module.exports = {
  getStatus,
  findJourney,
  findPath,
};
