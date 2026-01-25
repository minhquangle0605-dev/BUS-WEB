const pool = require('../config/db');

// GET /stops?q=
const getStops = async (req, res) => {
    try {
        const { q } = req.query;

        let query = `
      SELECT stop_id, stop_name, stop_lat, stop_lon
      FROM stops
    `;
        const params = [];

        if (q && q.trim() !== '') {
            query += ' WHERE LOWER(stop_name) LIKE $1';
            params.push(`%${q.toLowerCase()}%`);
        }

        query += ' ORDER BY stop_name ASC';

        const result = await pool.query(query, params);
        return res.json(result.rows);
    } catch (err) {
        console.error('getStops error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// GET /stops/:id
const getStopById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
      SELECT stop_id, stop_name, stop_lat, stop_lon
      FROM stops
      WHERE stop_id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stop not found' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('getStopById error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// GET /stops/nearby?lat=&lng=&radius=
const getNearbyStops = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'lat and lng are required' });
        }

        const radiusKm = radius ? Number(radius) : 0.5; // default 0.5 km

        const query = `
      SELECT
        stop_id,
        stop_name,
        stop_lat,
        stop_lon,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(stop_lat)) *
            cos(radians(stop_lon) - radians($2)) +
            sin(radians($1)) * sin(radians(stop_lat))
          )
        ) AS distance_km
      FROM stops
      WHERE stop_lat IS NOT NULL
        AND stop_lon IS NOT NULL
      HAVING (
        6371 * acos(
          cos(radians($1)) * cos(radians(stop_lat)) *
          cos(radians(stop_lon) - radians($2)) +
          sin(radians($1)) * sin(radians(stop_lat))
        )
      ) <= $3
      ORDER BY distance_km ASC
      LIMIT 50;
    `;

        const result = await pool.query(query, [lat, lng, radiusKm]);

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
};

module.exports = {
    getStops,
    getStopById,
    getNearbyStops,
};
