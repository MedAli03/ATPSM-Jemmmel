"use strict";

const TABLE = "inscriptions_enfants";
const CONSTRAINT = "uniq_inscription_groupe_enfant_annee";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint(TABLE, {
      fields: ["groupe_id", "enfant_id", "annee_id"],
      type: "unique",
      name: CONSTRAINT,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(TABLE, CONSTRAINT).catch(() => {});
  },
};
