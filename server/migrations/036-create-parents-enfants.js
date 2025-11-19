"use strict";

const TABLE = "parents_enfants";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE, {
      parent_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      relation: {
        type: Sequelize.ENUM("MERE", "PERE", "TUTEUR", "AUTRE"),
        allowNull: true,
      },
      is_guardian: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addConstraint(TABLE, {
      fields: ["parent_id", "enfant_id"],
      type: "primary key",
      name: "pk_parents_enfants",
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_parents_enfants_enfant",
      fields: ["enfant_id"],
    });

    await queryInterface.sequelize.query(
      `INSERT INTO ${TABLE} (parent_id, enfant_id, relation, is_guardian, created_at, updated_at)
       SELECT parent_user_id, id, 'AUTRE', 1, COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
       FROM enfants
       WHERE parent_user_id IS NOT NULL`
    );

    await queryInterface.removeIndex("enfants", "enfants_parent_user_id").catch(() => {});

    await queryInterface.removeColumn("enfants", "parent_user_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("enfants", "parent_user_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "utilisateurs", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("enfants", {
      name: "enfants_parent_user_id",
      fields: ["parent_user_id"],
    });

    await queryInterface.sequelize.query(
      `UPDATE enfants e
       LEFT JOIN (
         SELECT enfant_id, MIN(parent_id) AS parent_id
         FROM ${TABLE}
         GROUP BY enfant_id
       ) pe ON pe.enfant_id = e.id
       SET e.parent_user_id = pe.parent_id`
    );

    await queryInterface.dropTable(TABLE);
  },
};
