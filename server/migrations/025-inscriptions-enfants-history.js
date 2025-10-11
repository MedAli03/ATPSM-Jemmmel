"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("inscriptions_enfants", "date_sortie", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "date_inscription",
    });

    await queryInterface.addColumn("inscriptions_enfants", "est_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: "date_sortie",
    });

    await queryInterface.removeConstraint("inscriptions_enfants", "uniq_enfant_annee").catch(() => {});

    await queryInterface.addConstraint("inscriptions_enfants", {
      fields: ["enfant_id", "annee_id", "est_active"],
      type: "unique",
      name: "uniq_enfant_annee_active",
    });

    await queryInterface.addIndex("inscriptions_enfants", ["annee_id", "est_active"], {
      name: "idx_inscriptions_annee_active",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("inscriptions_enfants", "idx_inscriptions_annee_active").catch(() => {});
    await queryInterface.removeConstraint("inscriptions_enfants", "uniq_enfant_annee_active").catch(() => {});

    await queryInterface.addConstraint("inscriptions_enfants", {
      fields: ["enfant_id", "annee_id"],
      type: "unique",
      name: "uniq_enfant_annee",
    });

    await queryInterface.removeColumn("inscriptions_enfants", "est_active").catch(() => {});
    await queryInterface.removeColumn("inscriptions_enfants", "date_sortie").catch(() => {});
  },
};
