// backend/config/config.js
require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'autism_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    dialectOptions: { charset: 'utf8mb4' }
  }
};
