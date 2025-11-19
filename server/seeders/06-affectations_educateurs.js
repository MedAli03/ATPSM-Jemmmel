"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [groups] = await queryInterface.sequelize.query(
      "SELECT id, nom, annee_id FROM groupes WHERE nom IN ('Groupe أطلس','Groupe الأرز','Groupe الياسمين')"
    );
    const groupByName = Object.fromEntries(groups.map((g) => [g.nom, g]));
    const [educateurs] = await queryInterface.sequelize.query(
      "SELECT id, email FROM utilisateurs WHERE email IN ('educateur@asso.tn','educatrice@asso.tn')"
    );
    const eduByEmail = Object.fromEntries(educateurs.map((e) => [e.email, e.id]));
    const rows = [];
    if (groupByName["Groupe أطلس"] && eduByEmail["educateur@asso.tn"]) {
      rows.push({
        annee_id: groupByName["Groupe أطلس"].annee_id,
        groupe_id: groupByName["Groupe أطلس"].id,
        educateur_id: eduByEmail["educateur@asso.tn"],
        date_affectation: now,
        date_fin_affectation: null,
        est_active: true,
        created_at: now,
        updated_at: now,
      });
    }
    if (groupByName["Groupe الياسمين"] && eduByEmail["educateur@asso.tn"]) {
      rows.push({
        annee_id: groupByName["Groupe الياسمين"].annee_id,
        groupe_id: groupByName["Groupe الياسمين"].id,
        educateur_id: eduByEmail["educateur@asso.tn"],
        date_affectation: new Date("2024-09-01"),
        date_fin_affectation: new Date("2025-06-30"),
        est_active: false,
        created_at: now,
        updated_at: now,
      });
    }
    if (groupByName["Groupe الأرز"] && eduByEmail["educatrice@asso.tn"]) {
      rows.push({
        annee_id: groupByName["Groupe الأرز"].annee_id,
        groupe_id: groupByName["Groupe الأرز"].id,
        educateur_id: eduByEmail["educatrice@asso.tn"],
        date_affectation: now,
        date_fin_affectation: null,
        est_active: true,
        created_at: now,
        updated_at: now,
      });
    }
    if (rows.length) {
      await queryInterface.bulkInsert("affectations_educateurs", rows);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("affectations_educateurs", null);
  },
};
