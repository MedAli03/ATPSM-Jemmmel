// app.js
const express = require('express');
const mysql = require('mysql2');
// const authRoutes = require('./routes/authRoutes');
// const childRoutes = require('./routes/childRoutes');

const app = express();
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'autism_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/children', childRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));