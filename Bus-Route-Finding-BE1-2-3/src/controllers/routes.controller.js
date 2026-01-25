const pool = require('../config/db');

const getStatus = (req, res) => {
  res.json({ status: 'ok' });
};

const getRoutes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM routes WHERE route_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRouteStops = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT rs.stop_id, rs.stop_sequence, s.stop_name, s.stop_lat, s.stop_lon
       FROM route_stops rs
       JOIN stops s ON rs.stop_id = s.stop_id
       WHERE rs.route_id = $1
       ORDER BY rs.stop_sequence ASC`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No stops found for this route' });
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getStatus,
  getRoutes,
  getRouteById,
  getRouteStops,
};
