"use strict";

const TABLE = "enfants";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(TABLE, ["nom"], { name: "idx_enfants_nom" });
    await queryInterface.addIndex(TABLE, ["prenom"], { name: "idx_enfants_prenom" });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(TABLE, "idx_enfants_prenom").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_enfants_nom").catch(() => {});
  },
};
