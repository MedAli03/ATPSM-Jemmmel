"use strict";

const TABLE = "threads";

async function populateCreatedBy(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} t
     JOIN (
       SELECT thread_id, sender_id
       FROM (
         SELECT id, thread_id, sender_id,
                ROW_NUMBER() OVER (PARTITION BY thread_id ORDER BY created_at, id) AS rn
         FROM messages
       ) ordered
       WHERE rn = 1
     ) m ON m.thread_id = t.id
     SET t.created_by = m.sender_id
     WHERE t.created_by IS NULL`
  );

  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} t
     JOIN (
       SELECT thread_id, MIN(user_id) AS user_id
       FROM thread_participants
       GROUP BY thread_id
     ) tp ON tp.thread_id = t.id
     SET t.created_by = tp.user_id
     WHERE t.created_by IS NULL`
  );
}

async function populateEnfantId(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE} t
     JOIN (
       SELECT tp.thread_id, MIN(pe.enfant_id) AS enfant_id
       FROM thread_participants tp
       INNER JOIN parents_enfants pe ON pe.parent_id = tp.user_id
       WHERE tp.role = 'PARENT'
       GROUP BY tp.thread_id
       HAVING COUNT(DISTINCT pe.enfant_id) = 1
     ) resolved ON resolved.thread_id = t.id
     SET t.enfant_id = resolved.enfant_id
     WHERE t.enfant_id IS NULL`
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(TABLE, "enfant_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "id",
      references: { model: "enfants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addColumn(TABLE, "created_by", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "enfant_id",
      references: { model: "utilisateurs", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn(TABLE, "archived_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "archived",
    });

    await populateCreatedBy(queryInterface);
    await populateEnfantId(queryInterface);

    const [[{ missing }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS missing FROM ${TABLE} WHERE enfant_id IS NULL`
    );

    if (missing > 0) {
      throw new Error(
        `Unable to infer enfant_id for ${missing} threads. Please update the threads table manually to set enfant_id before re-running this migration.`
      );
    }

    await queryInterface.changeColumn(TABLE, "enfant_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.changeColumn(TABLE, "created_by", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_threads_enfant_archived",
      fields: ["enfant_id", "archived_at"],
    });

    await queryInterface.addIndex(TABLE, {
      name: "idx_threads_created_by",
      fields: ["created_by"],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(TABLE, "idx_threads_enfant_archived").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_threads_created_by").catch(() => {});

    await queryInterface.removeColumn(TABLE, "archived_at").catch(() => {});
    await queryInterface.removeColumn(TABLE, "created_by").catch(() => {});
    await queryInterface.removeColumn(TABLE, "enfant_id").catch(() => {});
  },
};
