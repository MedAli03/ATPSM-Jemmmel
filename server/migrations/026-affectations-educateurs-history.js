"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("affectations_educateurs", "date_fin_affectation", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "date_affectation",
    });

    await queryInterface.addColumn("affectations_educateurs", "est_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: "date_fin_affectation",
    });

    await queryInterface.removeConstraint("affectations_educateurs", "uniq_educateur_annee").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_groupe_annee").catch(() => {});

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["educateur_id", "annee_id", "est_active"],
      type: "unique",
      name: "uniq_educateur_annee_active",
    });

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_id", "annee_id", "est_active"],
      type: "unique",
      name: "uniq_groupe_annee_active",
    });

    await queryInterface.addIndex("affectations_educateurs", ["annee_id", "est_active"], {
      name: "idx_affectations_annee_active",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("affectations_educateurs", "idx_affectations_annee_active").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_groupe_annee_active").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_educateur_annee_active").catch(() => {});

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["educateur_id", "annee_id"],
      type: "unique",
      name: "uniq_educateur_annee",
    });

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_id", "annee_id"],
      type: "unique",
      name: "uniq_groupe_annee",
    });

    await queryInterface.removeColumn("affectations_educateurs", "est_active").catch(() => {});
    await queryInterface.removeColumn("affectations_educateurs", "date_fin_affectation").catch(() => {});
  },
};
