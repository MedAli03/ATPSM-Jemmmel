"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("parents_fiche", "pere_email", {
      type: Sequelize.STRING(150),
      allowNull: true,
      after: "pere_tel_portable",
    });

    await queryInterface.addColumn("parents_fiche", "mere_email", {
      type: Sequelize.STRING(150),
      allowNull: true,
      after: "mere_tel_portable",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("parents_fiche", "pere_email").catch(() => {});
    await queryInterface.removeColumn("parents_fiche", "mere_email").catch(() => {});
  },
};
