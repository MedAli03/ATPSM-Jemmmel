"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [annees] = await queryInterface.sequelize.query(
      "SELECT id, libelle, est_active FROM annees_scolaires"
    );
    const activeYear = annees.find((a) => a.est_active);
    const previousYear = annees.find((a) => !a.est_active);
    const groups = [];
    if (activeYear) {
      groups.push(
        {
          annee_id: activeYear.id,
          nom: "Groupe أطلس",
          description: "Programme intensif autonomie",
          statut: "actif",
          created_at: now,
          updated_at: now,
        },
        {
          annee_id: activeYear.id,
          nom: "Groupe الأرز",
          description: "Travail socio-émotionnel",
          statut: "actif",
          created_at: now,
          updated_at: now,
        }
      );
    }
    if (previousYear) {
      groups.push({
        annee_id: previousYear.id,
        nom: "Groupe الياسمين",
        description: "Archivage année précédente",
        statut: "archive",
        created_at: now,
        updated_at: now,
      });
    }
    if (groups.length) {
      await queryInterface.bulkInsert("groupes", groups);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("groupes", {
      nom: ["Groupe أطلس", "Groupe الأرز", "Groupe الياسمين", "Groupe A (démo)"],
    });
  },
};
