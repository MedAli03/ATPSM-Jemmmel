"use strict";
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { randomUUID } = require("crypto");

const routes = require("./routes"); // make sure src/routes/index.js exists (exports an Express router)
const { sequelize } = require("./models"); // Sequelize instance

// (Swagger) comment these 2 lines out if you don't want docs yet
const { setupSwagger } = require("./swagger"); // exposes /docs + /docs.json

const app = express();

/* -------------------------------------------------------------------------- */
/*                               Security & Core                              */
/* -------------------------------------------------------------------------- */

app.set("trust proxy", 1);

app.use(
  helmet({
    // Keep docs and assets working in dev
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// Request ID for tracing
app.use((req, _res, next) => {
  req.id = req.headers["x-request-id"] || randomUUID();
  next();
});

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/* -------------------------------------------------------------------------- */
/*                                    CORS                                    */
/* -------------------------------------------------------------------------- */

const ALLOW_ALL_IN_DEV = process.env.NODE_ENV !== "production";
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (ALLOW_ALL_IN_DEV || !origin || ALLOWED_ORIGINS.includes(origin))
        return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 86400,
  })
);

/* -------------------------------------------------------------------------- */
/*                                Body Parsers                                */
/* -------------------------------------------------------------------------- */

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------------------------- */
/*                                  Health                                     */
/* -------------------------------------------------------------------------- */

app.get("/", (_req, res) => res.json({ name: "ATPSM API", version: "1.0.0" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/health/db", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                Rate Limiting                               */
/* -------------------------------------------------------------------------- */

// Limit only auth endpoints (avoid throttling the entire API)
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* -------------------------------------------------------------------------- */
/*                                   Swagger                                   */
/* -------------------------------------------------------------------------- */

// (Swagger) comment out if not needed
setupSwagger(app);

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */

app.use("/api", routes);

/* -------------------------------------------------------------------------- */
/*                                     404                                     */
/* -------------------------------------------------------------------------- */

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Not Found" });
  }
  next();
});

/* -------------------------------------------------------------------------- */
/*                               Error Handling                                */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const isProd = process.env.NODE_ENV === "production";
  let status = Number.isInteger(err.status) ? err.status : 500;
  let code = err.code || "INTERNAL";

  // Sequelize validation / unique constraint
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    status = 400;
    code = "VALIDATION_ERROR";
  }
  // Example for Joi/Zod (if you use them)
  if (err.isJoi || err.name === "ZodError") {
    status = 400;
    code = "VALIDATION_ERROR";
  }

  const payload = {
    code,
    message: err.message || "Internal Server Error",
    ...(isProd ? {} : { stack: err.stack }),
  };

  res.status(status).json(payload);
});

module.exports = app;
