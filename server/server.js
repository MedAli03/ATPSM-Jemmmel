// src/server.js
require("dotenv").config();

const http = require("http");
const app = require("./app");
const { sequelize } = require("./models");

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

// Ensure DB connectivity on boot (schema handled by migrations)
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    // Optional: exit if DB is mandatory to start
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
      await new Promise((resolve) => server.close(resolve));
      await sequelize.close();
      console.log("✅ HTTP server closed. ✅ DB connection closed.");
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
