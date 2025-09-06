"use strict";
module.exports = {
  async up(qi) {
    const [res] = await qi.sequelize.query(
      "INSERT INTO annees_scolaires (libelle,date_debut,date_fin,est_active,created_at,updated_at) VALUES ('2025-2026','2025-09-01','2026-06-30',1,NOW(),NOW());"
    );
    const anneeId = res ? res : 1; // some MySQL drivers return insertId differently; ok for dev
    await qi.bulkInsert("groupes", [
      {
        annee_id: anneeId.insertId || 1,
        nom: "Groupe A",
        description: "Maternelle",
        manager_id: null,
        statut: "actif",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },
  async down(qi) {
    await qi.bulkDelete("groupes", { nom: "Groupe A" });
    await qi.bulkDelete("annees_scolaires", { libelle: "2025-2026" });
  },
};
