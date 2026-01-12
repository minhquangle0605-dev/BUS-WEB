CREATE TABLE routes (
  route_id TEXT PRIMARY KEY,
  agency_id TEXT,
  route_short_name TEXT,
  route_long_name TEXT,
  route_desc TEXT,
  route_type INT,
  route_url TEXT,
  route_color TEXT,
  route_text_color TEXT
);

CREATE TABLE stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  stop_desc TEXT,
  stop_lat NUMERIC(9, 6),
  stop_lon NUMERIC(9, 6),
  zone_id TEXT,
  stop_url TEXT
);

CREATE TABLE trips (
  route_id TEXT NOT NULL,
  service_id TEXT,
  trip_id TEXT PRIMARY KEY,
  trip_headsign TEXT,
  direction_id INT,
  block_id TEXT,
  shape_id TEXT,
  FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

CREATE TABLE stop_times (
  trip_id TEXT NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  stop_id TEXT NOT NULL,
  stop_sequence INT,
  stop_headsign TEXT,
  pickup_type INT,
  drop_off_type INT,
  shape_dist_traveled TEXT,
  PRIMARY KEY (trip_id, stop_id),
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
  FOREIGN KEY (stop_id) REFERENCES stops(stop_id)
);