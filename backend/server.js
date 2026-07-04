const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/catalog', require('./routes/catalogRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/department-services', require('./routes/departmentServiceRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io available to routes/controllers globally
app.set('io', io);
global.io = io;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
  throw err;
});

// ─── Track open connections so we can destroy them immediately ───
const connections = new Set();
server.on('connection', (socket) => {
  connections.add(socket);
  socket.on('close', () => connections.delete(socket));
});
// Disable HTTP keep-alive so sockets close after each request
server.keepAliveTimeout = 0;

// ─── Graceful shutdown — destroys all sockets immediately ─────────
const gracefulShutdown = (signal) => {
  console.log(`\n[nodemon] ${signal} — closing ${connections.size} connection(s) and exiting...`);
  // 1. Stop accepting new HTTP connections
  server.close();
  // 2. Immediately disconnect all Socket.io clients
  if (io) io.disconnectSockets(true);
  // 3. Destroy all lingering TCP sockets (frees the port NOW)
  for (const sock of connections) { sock.destroy(); }
  connections.clear();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

// ─── Catch unhandled errors (prevent silent crashes) ──────────────
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.log('[FATAL] Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Trigger nodemon reload after freeing port 5005
// Restarting to load new .env variables
// Reconnect trigger

