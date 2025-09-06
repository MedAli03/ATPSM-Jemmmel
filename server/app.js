// src/app.js
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// const compression = require("compression");
// const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");

const routes = require("./routes"); // make sure src/routes/index.js exists
const { sequelize } = require("./models"); // Sequelize instance

const app = express();

// Security & hardening
app.set("trust proxy", 1);
app.use(helmet());
// app.use(compression());

// Logging
// const LOG_FORMAT = process.env.NODE_ENV === "production" ? "combined" : "dev";
// app.use(morgan(LOG_FORMAT));

// CORS (adjust origins for production)
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health checks
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/health/db", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Global rate limit (light)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1500,
// });
// app.use(limiter);

// API routes
app.use("/api", routes);

// 404 for API
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Not Found" });
  }
  next();
});

// Centralized error handler
/* eslint-disable no-unused-vars */
app.use((err, _req, res, _next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const payload = { message: err.message || "Internal Server Error" };
  if (process.env.NODE_ENV !== "production" && err.stack)
    payload.stack = err.stack;
  res.status(status).json(payload);
});
/* eslint-enable no-unused-vars */

module.exports = app;
