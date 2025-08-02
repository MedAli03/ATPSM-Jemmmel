require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    dbConfig: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

// Database initialization
const initDb = async () => {
  try {
    console.log('Initializing database...');
    
    // Test connection
    await db.authenticate();
    console.log('Database connection established');
    
    // Sync models (create tables if not exist)
    await db.sync({ alter: true });
    console.log('Database synchronized');
    
    // Create initial admin user if not exists
    const adminUser = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@example.com'
      }
    });
    
    // Create initial manager user if not exists
    const managerUser = await User.findOrCreate({
      where: { username: 'manager' },
      defaults: {
        password: 'manager123',
        role: 'manager',
        name: 'Manager User',
        email: 'manager@example.com'
      }
    });
    
    console.log('Initial users created');
    
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDb();
});

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});