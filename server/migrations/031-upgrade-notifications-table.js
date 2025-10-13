"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notifications", "icon", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn("notifications", "action_url", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("notifications", "payload", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("notifications", "payload");
    await queryInterface.removeColumn("notifications", "action_url");
    await queryInterface.removeColumn("notifications", "icon");
  },
};
