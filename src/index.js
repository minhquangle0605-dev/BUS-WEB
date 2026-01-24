const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const routesRouter = require('./routes/routes.routes');
const stopsRouter = require('./routes/stops.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/routes', routesRouter);
app.use('/stops', stopsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Server OK',
    endpoints: {
      stops: 'GET /stops, GET /stops?q=name, GET /stops/:id, GET /stops/nearby?lat=&lng=&radius=',
      routes: 'GET /routes/status, POST /routes/journey',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
