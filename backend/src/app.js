const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/task.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Task API Routes
app.use('/api/tasks', taskRoutes);

// Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;