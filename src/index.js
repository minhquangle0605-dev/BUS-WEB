const stopsRouter = require('./routes/stops.routes');

const express = require('express');
const db = require('./config/db');
const routesRouter = require('./routes/routes.routes');

const app = express();

app.use('/routes', routesRouter);
app.use('/stops', stopsRouter);


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});