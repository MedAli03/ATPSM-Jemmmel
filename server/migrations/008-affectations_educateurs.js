"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("affectations_educateurs", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "annees_scolaires", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      groupe_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "groupes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      date_affectation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable("affectations_educateurs");
  },
};
