"use strict";
const bcrypt = require("bcrypt");
module.exports = {
  async up(qi) {
    const hash = await bcrypt.hash("admin123", 10);
    await qi.bulkInsert("utilisateurs", [
      {
        nom: "Admin",
        prenom: "Root",
        email: "president@asso.tn",
        mot_de_passe: hash,
        telephone: "000",
        role: "PRESIDENT",
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },
  async down(qi) {
    await qi.bulkDelete("utilisateurs", { email: "admin@asso.tn" });
  },
};
