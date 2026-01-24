# 🗺️ Pathfinding System Architecture & Flow

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                              │
├────────────────────────────────────────────────────────────────┤
│                                                                   │
│  homepage.html (Leaflet Map Interface)                           │
│  ├─ Map Display (OpenStreetMap)                                 │
│  ├─ Click to place markers (Point A, Point B)                   │
│  ├─ Event: "Tìm tuyến xe buýt" button                           │
│  └─ Display: Route polyline + Stop markers                      │
│                                                                   │
│     ↓ FETCH                                                      │
│                                                                   │
│  API Call 1: GET /stops/nearby                                   │
│  {params: lat, lng, radius}                                      │
│  ← Returns: [list of nearby stops]                               │
│                                                                   │
│     ↓ Process                                                    │
│                                                                   │
│  Select nearest stop for each point                              │
│  {stopA_id, stopB_id}                                            │
│                                                                   │
│     ↓ FETCH                                                      │
│                                                                   │
│  API Call 2: POST /routes/find-path                              │
│  {                                                                │
│    from_stop_id: "S1001",                                       │
│    to_stop_id: "S1010",                                         │
│    time_period: "AM"                                            │
│  }                                                                │
│  ← Returns: {route, from, to, journey[...]}                     │
│                                                                   │
│     ↓ Render                                                     │
│                                                                   │
│  Display journey on map with polyline and markers               │
│                                                                   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                        SERVER SIDE                               │
├────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Express.js Server (src/index.js)                                │
│  ├─ CORS enabled                                                │
│  ├─ JSON middleware                                             │
│  └─ Routes mounted: /routes, /stops                             │
│                                                                   │
│     ↓ Request Handler                                           │
│                                                                   │
│  routes.controller.js :: findPath()                              │
│  ├─ Input Validation (from_stop_id, to_stop_id)                │
│  ├─ Database Query:                                             │
│  │  SELECT DISTINCT rs1.route_id, ...                          │
│  │  FROM route_stops rs1                                        │
│  │  INNER JOIN route_stops rs2                                  │
│  │    ON rs1.route_id = rs2.route_id                            │
│  │  WHERE rs1.stop_id = $1                                      │
│  │    AND rs2.stop_id = $2                                      │
│  │    AND rs1.stop_sequence < rs2.stop_sequence  ⭐ KEY FILTER  │
│  │                                                               │
│  ├─ Results Processing:                                         │
│  │  1. Get best route (shortest distance)                       │
│  │  2. Fetch all stops on route between A and B                │
│  │  3. Get detailed stop info (name, lat, lon, sequence)       │
│  │                                                               │
│  └─ Return JSON Response                                        │
│     {                                                            │
│       success: true,                                            │
│       route: { route_id, route_short_name, ... },               │
│       from: { stop_id, stop_name, lat, lon, sequence },         │
│       to: { stop_id, stop_name, lat, lon, sequence },           │
│       journey: [                                                │
│         { stop_id, stop_name, lat, lon, sequence },             │
│         ...                                                      │
│       ],                                                         │
│       total_stops: N,                                           │
│       distance_stops: N-1                                       │
│     }                                                            │
│                                                                   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                        DATABASE SIDE                             │
├────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PostgreSQL Tables:                                              │
│  ├─ stops: (stop_id, stop_name, stop_lat, stop_lon)            │
│  ├─ routes: (route_id, route_short_name, route_long_name)      │
│  ├─ route_stops: (route_id, stop_id, stop_sequence)  ⭐ MAIN   │
│  ├─ trips: (trip_id, route_id, ...)                            │
│  └─ stop_times: (trip_id, stop_id, arrival_time, ...)          │
│                                                                   │
│  Indexes (Performance):                                          │
│  ├─ idx_route_stops_route_sequence (route_id, stop_sequence)   │
│  ├─ idx_stop_times_stop_id (stop_id)                           │
│  ├─ idx_trips_route_id (route_id)                              │
│  ├─ idx_route_stops_route_id (route_id)                        │
│  ├─ idx_stops_coordinates (stop_lat, stop_lon)                 │
│  └─ idx_stop_times_trip_arrival (trip_id, arrival_time)        │
│                                                                   │
│  Key Table Structure for Pathfinding:                           │
│  ┌─────────────────────────────────────────┐                   │
│  │ route_stops                             │                   │
│  ├─────────────────────────────────────────┤                   │
│  │ route_id  │ stop_id │ stop_sequence     │                   │
│  ├───────────┼─────────┼──────────────────┤                   │
│  │ '01'      │ 'S1001' │ 5                │                   │
│  │ '01'      │ 'S1002' │ 6                │                   │
│  │ '01'      │ 'S1003' │ 7                │ ← Sequence ORDEN  │
│  │ ...       │ ...     │ ...              │                   │
│  │ '01'      │ 'S1010' │ 12               │                   │
│  │ '02'      │ 'S1010' │ 5    ⭐ REVERSE  │                   │
│  │ '02'      │ 'S1001' │ 12   ⭐ BLOCKED  │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                   │
│  Filter Logic:                                                   │
│  ✅ Route '01': 5 < 12 → PASS (S1001 → S1010)                  │
│  ❌ Route '02': 12 < 5 → FAIL (S1010 → S1001 rejected)         │
│                                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Detailed Sequence Flow

```
User Action Timeline:
═════════════════════════════════════════════════════════════════

T=0ms
┌─────────────────────┐
│ User clicks Point A  │ (lat: 21.0100, lng: 105.8000)
└─────────────────────┘
         ↓
      Draw marker A

T=500ms
┌─────────────────────┐
│ User clicks Point B  │ (lat: 21.0200, lng: 105.8100)
└─────────────────────┘
         ↓
      Draw marker B
      Enable "Find Route" button

T=1000ms
┌──────────────────────┐
│ User clicks "Find"   │
└──────────────────────┘
         ↓
    Show "Loading..." status

T=1100ms - API Call 1
┌─────────────────────────────────────────────────┐
│ GET /stops/nearby?lat=21.0100&lng=105.8000     │
└─────────────────────────────────────────────────┘
         ↓
    Database query with index idx_stops_coordinates
    ↓ Returns 5 nearest stops
    
    SELECT stop_id, stop_name, stop_lat, stop_lon
    FROM stops
    WHERE ... (within radius 0.5km)
    ORDER BY distance ASC
    LIMIT 5
    
    ← Result: [
        { stop_id: 'S1001', distance: 0.1 km },
        { stop_id: 'S1002', distance: 0.2 km },
        ...
      ]

T=1200ms - API Call 2 (parallel)
┌─────────────────────────────────────────────────┐
│ GET /stops/nearby?lat=21.0200&lng=105.8100     │
└─────────────────────────────────────────────────┘
         ↓
    Database query with index idx_stops_coordinates
    
    ← Result: [
        { stop_id: 'S1010', distance: 0.05 km },
        ...
      ]

T=1300ms - Processing
┌────────────────────────────────────┐
│ Get nearest stops:                  │
│ A_nearest = 'S1001' (0.1km away)   │
│ B_nearest = 'S1010' (0.05km away)  │
└────────────────────────────────────┘

T=1400ms - API Call 3 (Main Pathfinding)
┌────────────────────────────────────────────────────────┐
│ POST /routes/find-path                                 │
│ {                                                      │
│   from_stop_id: 'S1001',                               │
│   to_stop_id: 'S1010',                                 │
│   time_period: 'AM'                                    │
│ }                                                      │
└────────────────────────────────────────────────────────┘
         ↓
    Backend Processing:
    1. Validate input ✓
    2. Check stops exist ✓
    3. Execute pathfinding SQL:
    
       SELECT DISTINCT rs1.route_id, ...
       FROM route_stops rs1
       INNER JOIN route_stops rs2 
         ON rs1.route_id = rs2.route_id
       WHERE rs1.stop_id = 'S1001'
         AND rs2.stop_id = 'S1010'
         AND rs1.stop_sequence < rs2.stop_sequence
       ORDER BY distance ASC
       LIMIT 10
       
       ⭐ This uses idx_route_stops_route_sequence index
    
    Results:
    ├─ Route '01': S1001(seq=5) → S1010(seq=12) ✓ FOUND
    ├─ Route '02': S1010(seq=5) → S1001(seq=12) ✗ FILTERED
    └─ Route '03': S1001(seq=8) → S1010(seq=15) ✓ (longer)
    
    4. Select best (shortest): Route '01'
    5. Fetch all stops on route from seq 5 to 12
    6. Get details for each stop
    7. Build journey array

T=1500ms - DB Queries for Details
┌────────────────────────────────────────────────────────┐
│ Get route info:                                        │
│ SELECT * FROM routes WHERE route_id = '01'            │
│ → { route_short_name: '01', ... }                      │
│                                                        │
│ Get all stops on route:                                │
│ SELECT * FROM route_stops                              │
│ WHERE route_id = '01'                                  │
│   AND stop_sequence BETWEEN 5 AND 12                   │
│ → [S1001, S1002, ..., S1010]                           │
│                                                        │
│ Get stop details (name, lat, lon):                     │
│ SELECT * FROM stops WHERE stop_id IN (...)            │
│ → [{ stop_id, stop_name, stop_lat, stop_lon }, ...]   │
└────────────────────────────────────────────────────────┘

T=1600ms - Response
┌────────────────────────────────────────────────────────┐
│ 200 OK                                                 │
│ {                                                      │
│   "success": true,                                     │
│   "route": {                                           │
│     "route_id": "01",                                  │
│     "route_short_name": "01",                          │
│     "route_long_name": "Downtown - Uptown"             │
│   },                                                   │
│   "from": {                                            │
│     "stop_id": "S1001",                                │
│     "stop_name": "Main Station",                       │
│     "stop_lat": 21.0100,                               │
│     "stop_lon": 105.8000,                              │
│     "sequence": 5                                      │
│   },                                                   │
│   "to": {                                              │
│     "stop_id": "S1010",                                │
│     "stop_name": "Central Park",                       │
│     "stop_lat": 21.0200,                               │
│     "stop_lon": 105.8100,                              │
│     "sequence": 12                                     │
│   },                                                   │
│   "journey": [                                         │
│     {                                                  │
│       "stop_id": "S1001",                              │
│       "stop_name": "Main Station",                     │
│       "stop_lat": 21.0100,                             │
│       "stop_lon": 105.8000,                            │
│       "sequence": 5                                    │
│     },                                                 │
│     {                                                  │
│       "stop_id": "S1002",                              │
│       "stop_name": "Park Avenue",                      │
│       "stop_lat": 21.0110,                             │
│       "stop_lon": 105.8010,                            │
│       "sequence": 6                                    │
│     },                                                 │
│     ... (more stops)                                   │
│     {                                                  │
│       "stop_id": "S1010",                              │
│       "stop_name": "Central Park",                     │
│       "stop_lat": 21.0200,                             │
│       "stop_lon": 105.8100,                            │
│       "sequence": 12                                   │
│     }                                                  │
│   ],                                                   │
│   "total_stops": 8,                                    │
│   "distance_stops": 7,                                 │
│   "time_period": "AM"                                  │
│ }                                                      │
└────────────────────────────────────────────────────────┘

T=1700ms - Frontend Rendering
┌─────────────────────────────────────────┐
│ 1. Extract journey coordinates:          │
│    [[21.0100,105.8000], ...]             │
│                                           │
│ 2. Draw polyline (blue route on map)     │
│                                           │
│ 3. Create markers for each stop:         │
│    - Green marker: Start (S1001)         │
│    - Blue circles: Intermediate stops    │
│    - Red marker: End (S1010)             │
│                                           │
│ 4. Show popup info on click              │
│    "Main Station (S1001), Seq #5"        │
│                                           │
│ 5. Zoom map to fit entire route          │
└─────────────────────────────────────────┘

T=1800ms - User Sees Result
┌───────────────────────────────────────────────┐
│ ✅ SUCCESS MESSAGE:                           │
│                                               │
│ Tìm thấy tuyến xe buýt!                      │
│ 🚌 Tuyến: 01 - Downtown - Uptown             │
│ 📍 Từ: Main Station                          │
│ 📍 Đến: Central Park                         │
│ 🛑 Tổng trạm: 8                              │
│ 📏 Số đoạn: 7                                │
│                                               │
│ [Map shows blue polyline with colored marks] │
└───────────────────────────────────────────────┘
```

---

## Data Validation Rules

```
Input Validation:
├─ from_stop_id required ✓
├─ to_stop_id required ✓
├─ from_stop_id ≠ to_stop_id ✓
├─ both stops must exist in database ✓
└─ time_period optional (AM/MD/PM)

Database Validation:
├─ Route must contain both stops ✓
├─ from_sequence < to_sequence ✓ ⭐ KEY
└─ Both stops on same route ✓

Output Validation:
├─ journey.length > 0 ✓
├─ journey[0].sequence == from_sequence ✓
├─ journey[-1].sequence == to_sequence ✓
└─ All stops have coordinates ✓
```

---

## Performance Characteristics

```
Without Indexes:
  Query Time: ~500-1000ms
  Scans: Full table scan on route_stops
  Load: High CPU usage
  
With Indexes:
  Query Time: ~10-50ms
  Scans: Index seek on idx_route_stops_route_sequence
  Load: Low CPU usage
  
Improvement: 10-100x faster ⚡

The key index:
CREATE INDEX idx_route_stops_route_sequence 
ON route_stops(route_id, stop_sequence);

This allows:
1. Quick find of stops on a route (route_id)
2. Fast sequence comparison (stop_sequence)
3. Efficient INNER JOIN operations
```

---

## Error Handling Map

```
User Input Error (HTTP 400):
├─ Missing from_stop_id/to_stop_id → "...adalah bắt buộc"
└─ from_stop_id == to_stop_id → "...phải khác nhau"

Not Found Error (HTTP 404):
├─ Stop doesn't exist → "...không tồn tại"
└─ No route between stops → "Không tìm thấy tuyến..."

Server Error (HTTP 500):
└─ Database error → "Server error"

Frontend Error Handling:
├─ Network error → Show connection error message
├─ Invalid response → Log to console
└─ Empty journey → Show warning
```

---

**Diagram created: 24/01/2026**
