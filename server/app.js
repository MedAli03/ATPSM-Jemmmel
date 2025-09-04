const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./models"); // loads and associates everything

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("API OK (chemin rapide)"));

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected.");

    // FAST PATH (dev only): create/alter tables automatically
    await db.sequelize.sync({ alter: true });
    console.log("Schema synced (alter).");

    app.listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
  } catch (e) {
    console.error("Startup error:", e.message);
    process.exit(1);
  }
})();
