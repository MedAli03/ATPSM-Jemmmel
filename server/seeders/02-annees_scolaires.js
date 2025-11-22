"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert("annees_scolaires", [
      {
        libelle: "2024-2025",
        date_debut: "2024-09-01",
        date_fin: "2025-06-30",
        statut: "PLANIFIEE",
        est_active: false,
        created_at: now,
        updated_at: now,
      },
      {
        libelle: "2025-2026",
        date_debut: "2025-09-01",
        date_fin: "2026-06-30",
        statut: "ACTIVE",
        est_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("annees_scolaires", {
      libelle: ["2024-2025", "2025-2026"],
    });
  },
};
