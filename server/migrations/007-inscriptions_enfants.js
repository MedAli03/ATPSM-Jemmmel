"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inscriptions_enfants", {
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
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      date_inscription: {
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
    await queryInterface.addConstraint("inscriptions_enfants", {
      fields: ["enfant_id", "annee_id"],
      type: "unique",
      name: "uniq_enfant_annee",
    });
    await queryInterface.addIndex("inscriptions_enfants", ["groupe_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("inscriptions_enfants");
  },
};
