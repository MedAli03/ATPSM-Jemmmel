"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("utilisateurs", "username", {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("utilisateurs", "adresse", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("utilisateurs", "last_login", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("utilisateurs", "last_login");
    await queryInterface.removeColumn("utilisateurs", "adresse");
    await queryInterface.removeColumn("utilisateurs", "username");
  },
};
