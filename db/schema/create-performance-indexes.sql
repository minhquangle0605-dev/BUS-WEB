-- ============================================================================
-- Performance Optimization Indexes for Pathfinding
-- Purpose: Speed up route finding queries by indexing key columns
-- ============================================================================

-- Index for fast stop_id lookups in stop_times table
-- This dramatically speeds up finding which routes pass through a stop
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id 
  ON stop_times(stop_id);

-- Index for fast route_id lookups in trips table
-- Helps quickly find all trips on a specific route
CREATE INDEX IF NOT EXISTS idx_trips_route_id 
  ON trips(route_id);

-- Composite index for route_stops table
-- Optimizes queries that filter by route_id and check stop_sequence
CREATE INDEX IF NOT EXISTS idx_route_stops_route_sequence 
  ON route_stops(route_id, stop_sequence);

-- Index for reverse lookup: find stops by route_id
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id 
  ON route_stops(route_id);

-- Index for finding nearby stops by coordinates
-- Useful for the nearby stops API endpoint
CREATE INDEX IF NOT EXISTS idx_stops_coordinates 
  ON stops(stop_lat, stop_lon);

-- Composite index for stop_times lookups
-- Optimizes queries filtering by trip_id and arrival_time
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_arrival 
  ON stop_times(trip_id, arrival_time);

-- ============================================================================
-- Verification Query: Check all indexes were created successfully
-- ============================================================================
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('stop_times', 'trips', 'route_stops', 'stops');
