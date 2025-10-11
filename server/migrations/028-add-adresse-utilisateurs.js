"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("utilisateurs", "adresse", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "telephone",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("utilisateurs", "adresse");
  },
};
