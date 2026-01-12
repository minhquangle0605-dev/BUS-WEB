const express = require('express');
const db = require('./db');
const routesRouter = require('./routes/routes.routes');

const app = express();

app.use('/routes', routesRouter);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
