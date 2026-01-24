-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on stop_times table for faster pathfinding queries
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id ON stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_id ON stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_sequence ON stop_times(stop_sequence);

-- Index on route_stops table
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_id ON route_stops(stop_id);

-- Index on trips table
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_service_id ON trips(service_id);

-- Index on stops table
CREATE INDEX IF NOT EXISTS idx_stops_stop_name ON stops(stop_name);

-- Verify indexes created
\d stop_times
\d route_stops
\d trips
\d stops
