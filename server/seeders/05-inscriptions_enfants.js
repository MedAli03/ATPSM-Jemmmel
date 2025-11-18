"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [groups] = await queryInterface.sequelize.query(
      "SELECT id, nom, annee_id FROM groupes WHERE nom IN ('Groupe أطلس','Groupe الأرز','Groupe الياسمين')"
    );
    const groupByName = Object.fromEntries(groups.map((g) => [g.nom, g]));
    const [children] = await queryInterface.sequelize.query(
      "SELECT id, nom FROM enfants WHERE nom IN ('Sami','Nada')"
    );
    const childByName = Object.fromEntries(children.map((c) => [c.nom, c.id]));
    const rows = [];
    if (childByName.Sami && groupByName["Groupe أطلس"]) {
      rows.push({
        annee_id: groupByName["Groupe أطلس"].annee_id,
        groupe_id: groupByName["Groupe أطلس"].id,
        enfant_id: childByName.Sami,
        date_inscription: now,
        created_at: now,
        updated_at: now,
      });
    }
    if (childByName.Sami && groupByName["Groupe الياسمين"]) {
      rows.push({
        annee_id: groupByName["Groupe الياسمين"].annee_id,
        groupe_id: groupByName["Groupe الياسمين"].id,
        enfant_id: childByName.Sami,
        date_inscription: new Date("2024-09-15"),
        created_at: now,
        updated_at: now,
      });
    }
    if (childByName.Nada && groupByName["Groupe الأرز"]) {
      rows.push({
        annee_id: groupByName["Groupe الأرز"].annee_id,
        groupe_id: groupByName["Groupe الأرز"].id,
        enfant_id: childByName.Nada,
        date_inscription: now,
        created_at: now,
        updated_at: now,
      });
    }
    if (rows.length) {
      await queryInterface.bulkInsert("inscriptions_enfants", rows);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("inscriptions_enfants", null);
  },
};
