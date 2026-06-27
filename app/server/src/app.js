const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const visitRoutes = require('./routes/visits.routes');
const dealerRoutes = require('./routes/dealers.routes');
const targetRoutes = require('./routes/targets.routes');
const salesmanRoutes = require('./routes/salesmen.routes');
const reportRoutes = require('./routes/reports.routes');
const notificationRoutes = require('./routes/notifications.routes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/dealers', dealerRoutes);
app.use('/api/v1/targets', targetRoutes);
app.use('/api/v1/salesmen', salesmanRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;