"use strict";
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { sequelize } = require("./models");
const registerMessagingNamespace = require("./realtime/messages.io");

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

const allowedSocketOrigins = (process.env.CORS_ORIGINS || "")
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const allowAllSockets =
  process.env.NODE_ENV !== "production" || allowedSocketOrigins.length === 0;

const io = new Server(server, {
  path: "/ws",
  transports: ["websocket", "polling"],
  cors: {
    origin: allowAllSockets ? true : allowedSocketOrigins,
    credentials: true,
  },
});

registerMessagingNamespace(server, io);
app.set("io", io);
// Ensure DB connectivity on boot (schema handled by migrations)
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    // If DB is mandatory to start, uncomment:
    // process.exit(1);
  }
})();

server.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});

// Graceful shutdown
["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, async () => {
    try {
      console.log(`\n🔻 Received ${sig}, shutting down…`);
      await new Promise((resolve) => io.close(resolve));
      await new Promise((resolve) => server.close(resolve));
      await sequelize.close();
      console.log("✅ WebSocket namespace closed. ✅ HTTP server closed. ✅ DB connection closed.");
      process.exit(0);
    } catch (e) {
      console.error("❌ Error during shutdown:", e);
      process.exit(1);
    }
  });
});

// Catch unhandled errors
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
