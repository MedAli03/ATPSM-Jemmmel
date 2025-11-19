"use strict";

const TABLES = [
  "recommendation_ai_activite",
  "recommendation_ai_objectif",
  "recommendation_ai",
];

module.exports = {
  async up(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.dropTable(table).catch(() => {});
    }
  },

  async down() {
    throw new Error("Les tables recommendation_ai ne sont pas restaurées automatiquement.");
  },
};
