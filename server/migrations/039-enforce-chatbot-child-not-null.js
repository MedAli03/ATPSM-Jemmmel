"use strict";

const TABLE = "chatbot_messages";
const CHILD_ID = "child_id";
const NEW_CONSTRAINT = "chatbot_messages_child_id_enfants_fk";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing FK constraints on child_id to allow altering nullability
    if (queryInterface.getForeignKeyReferencesForTable) {
      const fks = await queryInterface.getForeignKeyReferencesForTable(TABLE);
      const childFks = fks.filter((fk) => fk.columnName === CHILD_ID);
      for (const fk of childFks) {
        await queryInterface.removeConstraint(TABLE, fk.constraintName);
      }
    }

    // Remove orphan records before enforcing NOT NULL
    await queryInterface.sequelize.query(
      `DELETE FROM ${TABLE} WHERE ${CHILD_ID} IS NULL`
    );

    await queryInterface.changeColumn(TABLE, CHILD_ID, {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addConstraint(TABLE, {
      fields: [CHILD_ID],
      type: "foreign key",
      name: NEW_CONSTRAINT,
      references: { table: "enfants", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(TABLE, NEW_CONSTRAINT);

    await queryInterface.changeColumn(TABLE, CHILD_ID, {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });

    await queryInterface.addConstraint(TABLE, {
      fields: [CHILD_ID],
      type: "foreign key",
      name: NEW_CONSTRAINT,
      references: { table: "enfants", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
