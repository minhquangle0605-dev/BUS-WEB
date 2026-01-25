const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const routeRoutes = require('./routes/routeRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bus Route Finder API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            routes: '/api/routes',
            tickets: '/api/tickets',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tồn tại'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🚌 BUS ROUTE FINDER API SERVER 🚌      ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║   Server running on port: ${PORT}            ║`);
    console.log(`║   Environment: ${process.env.NODE_ENV || 'development'}              ║`);
    console.log('║   API Endpoints:                           ║');
    console.log('║   - Auth:    /api/auth                     ║');
    console.log('║   - Routes:  /api/routes                   ║');
    console.log('║   - Tickets: /api/tickets                  ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
