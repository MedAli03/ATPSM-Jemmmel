"use strict";

const TABLE = "annees_scolaires";
const COLUMN = "statut";
const STATUSES = ["PLANIFIEE", "ACTIVE", "ARCHIVEE"];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE, COLUMN, {
      type: Sequelize.ENUM(...STATUSES),
      allowNull: false,
      defaultValue: "PLANIFIEE",
    });

    // Align existing rows: keep current active year, mark others as planned.
    await queryInterface.sequelize.query(
      `UPDATE ${TABLE} SET ${COLUMN} = CASE WHEN est_active = 1 THEN 'ACTIVE' ELSE 'PLANIFIEE' END`
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(TABLE, COLUMN);
  },
};
