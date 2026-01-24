const pool = require('../config/db');

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

// GET /routes/status
const getStatus = (req, res) => {
  res.json({ status: 'ok' });
};

// POST /routes/find-path
const findPath = async (req, res) => {
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
};

module.exports = {
  getStatus,
  findPath,
};
