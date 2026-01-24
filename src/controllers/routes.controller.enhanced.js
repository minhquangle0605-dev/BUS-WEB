// ============================================================================
// ENHANCED routes.controller.js - Additional Validations
// This file contains enhanced versions of critical functions with extra
// error handling and optimization comments
// ============================================================================

/**
 * Enhanced findPath function with additional validations
 * IMPROVEMENTS:
 * 1. Validates stop_id format (basic sanitization)
 * 2. Handles multiple routes and selects the shortest
 * 3. Provides detailed error messages for debugging
 * 4. Supports optional time_period filtering
 */

const findPathEnhanced = async (req, res) => {
    try {
        const { from_stop_id, to_stop_id, time_period } = req.body;

        // INPUT VALIDATION
        if (!from_stop_id || !to_stop_id) {
            return res.status(400).json({
                error: 'from_stop_id và to_stop_id là bắt buộc',
                example: {
                    from_stop_id: 'S1001',
                    to_stop_id: 'S1005',
                    time_period: 'AM' // optional: AM, MD, PM
                },
            });
        }

        // Check if IDs are same
        if (from_stop_id === to_stop_id) {
            return res.status(400).json({
                error: 'from_stop_id và to_stop_id phải khác nhau',
                received: { from_stop_id, to_stop_id }
            });
        }

        // Sanitize input (remove extra spaces)
        const fromStop = from_stop_id.trim();
        const toStop = to_stop_id.trim();

        // VERIFY STOPS EXIST
        const stopsCheck = await pool.query(
            `SELECT stop_id, stop_name, stop_lat, stop_lon 
       FROM stops 
       WHERE stop_id = $1 OR stop_id = $2`,
            [fromStop, toStop]
        );

        if (stopsCheck.rows.length !== 2) {
            const foundIds = stopsCheck.rows.map(r => r.stop_id);
            return res.status(404).json({
                error: 'Một hoặc cả 2 điểm dừng không tồn tại',
                received: { from_stop_id: fromStop, to_stop_id: toStop },
                found: foundIds,
            });
        }

        const stopMap = {};
        stopsCheck.rows.forEach(row => {
            stopMap[row.stop_id] = row;
        });

        // BUILD QUERY WITH OPTIONAL TIME PERIOD FILTER
        let timeFilter = '';
        const params = [fromStop, toStop];

        if (time_period && TIME_PERIOD_MAP[time_period]) {
            const prefix = TIME_PERIOD_MAP[time_period];
            timeFilter = ` AND rs1.route_id LIKE $3 || '%'`;
            params.push(prefix);
        }

        // PATHFINDING QUERY
        // ⭐ KEY: rs1.stop_sequence < rs2.stop_sequence ensures proper direction
        const pathSQL = `
      SELECT DISTINCT
        rs1.route_id,
        rs1.stop_id as from_stop,
        rs1.stop_sequence as from_sequence,
        rs2.stop_id as to_stop,
        rs2.stop_sequence as to_sequence,
        (rs2.stop_sequence - rs1.stop_sequence) as distance
      FROM route_stops rs1
      INNER JOIN route_stops rs2 
        ON rs1.route_id = rs2.route_id
      WHERE rs1.stop_id = $1
        AND rs2.stop_id = $2
        AND rs1.stop_sequence < rs2.stop_sequence
        ${timeFilter}
      ORDER BY distance ASC, rs1.route_id
      LIMIT 10
    `;

        const pathResult = await pool.query(pathSQL, params);

        if (pathResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Không tìm thấy tuyến nào đi qua cả 2 điểm này theo thứ tự đúng',
                hint: 'Điểm đi phải xuất hiện trước điểm đến trong lộ trình (kiểm tra sequence)',
                debug: {
                    from_stop_id: fromStop,
                    to_stop_id: toStop,
                    from_exists: !!stopMap[fromStop],
                    to_exists: !!stopMap[toStop],
                    time_period: time_period || 'ALL'
                }
            });
        }

        // SELECT BEST ROUTE (shortest distance)
        const bestRoute = pathResult.rows[0];
        const routeId = bestRoute.route_id;
        const fromSeq = bestRoute.from_sequence;
        const toSeq = bestRoute.to_sequence;

        // FETCH ROUTE INFO
        const routeInfo = await pool.query(
            `SELECT route_id, route_short_name, route_long_name 
       FROM routes 
       WHERE route_id = $1`,
            [routeId]
        );

        if (!routeInfo.rows[0]) {
            return res.status(500).json({
                error: 'Không tìm thấy thông tin tuyến (database inconsistency)',
                route_id: routeId
            });
        }

        // FETCH ALL STOPS ON ROUTE (from A to B)
        const stopsOnRoute = await pool.query(
            `SELECT stop_id, stop_sequence
       FROM route_stops
       WHERE route_id = $1 
       AND stop_sequence >= $2 
       AND stop_sequence <= $3
       ORDER BY stop_sequence ASC`,
            [routeId, fromSeq, toSeq]
        );

        if (stopsOnRoute.rows.length === 0) {
            return res.status(500).json({
                error: 'Lỗi nội bộ: không tìm thấy điểm dừng trên tuyến',
                route_id: routeId,
                sequence_range: { from: fromSeq, to: toSeq }
            });
        }

        // FETCH STOP DETAILS
        const stopIds = stopsOnRoute.rows.map(s => s.stop_id);
        const stopsDetail = await pool.query(
            `SELECT stop_id, stop_name, stop_lat, stop_lon
       FROM stops
       WHERE stop_id = ANY($1)`,
            [stopIds]
        );

        const stopDetailMap = {};
        stopsDetail.rows.forEach(s => {
            stopDetailMap[s.stop_id] = s;
        });

        // BUILD JOURNEY
        const journey = stopsOnRoute.rows
            .map(s => ({
                ...stopDetailMap[s.stop_id],
                sequence: s.stop_sequence,
            }))
            .filter(stop => stop.stop_id); // Remove null entries

        // RETURN RESPONSE
        return res.json({
            success: true,
            route: {
                route_id: routeInfo.rows[0].route_id,
                route_short_name: routeInfo.rows[0].route_short_name,
                route_long_name: routeInfo.rows[0].route_long_name,
            },
            from: {
                stop_id: fromStop,
                stop_name: stopMap[fromStop]?.stop_name,
                stop_lat: stopMap[fromStop]?.stop_lat,
                stop_lon: stopMap[fromStop]?.stop_lon,
                sequence: fromSeq,
            },
            to: {
                stop_id: toStop,
                stop_name: stopMap[toStop]?.stop_name,
                stop_lat: stopMap[toStop]?.stop_lat,
                stop_lon: stopMap[toStop]?.stop_lon,
                sequence: toSeq,
            },
            total_stops: journey.length,
            distance_stops: journey.length - 1,
            time_period: time_period || 'ALL',
            journey,
        });

    } catch (err) {
        console.error('❌ findPath error:', err);
        return res.status(500).json({
            error: 'Server error',
            message: err.message,
            timestamp: new Date().toISOString(),
        });
    }
};

// ============================================================================
// HELPER: Check if a route is "valid" (doesn't go in reverse)
// ============================================================================
function isValidDirection(fromSeq, toSeq) {
    return fromSeq < toSeq;
}

// ============================================================================
// HELPER: Calculate distance between two sequences
// ============================================================================
function calculateSequenceDistance(fromSeq, toSeq) {
    return Math.abs(toSeq - fromSeq);
}

module.exports = {
    findPathEnhanced,
    isValidDirection,
    calculateSequenceDistance,
};
