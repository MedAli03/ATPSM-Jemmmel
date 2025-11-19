"use strict";

const TABLE = "threads";
const CREATED_BY_FK = "threads_created_by_foreign_idx";

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

async function assignFallbackCreator(queryInterface) {
  const [[admin]] = await queryInterface.sequelize.query(
    `SELECT id FROM utilisateurs
     WHERE role IN ('PRESIDENT', 'DIRECTEUR')
     ORDER BY id
     LIMIT 1`
  );

  let fallbackId = admin?.id;

  if (!fallbackId) {
    const [[anyUser]] = await queryInterface.sequelize.query(
      `SELECT id FROM utilisateurs ORDER BY id LIMIT 1`
    );

    fallbackId = anyUser?.id;
  }

  if (!fallbackId) {
    throw new Error(
      "Unable to backfill threads.created_by because no utilisateurs exist. Please create at least one user before rerunning this migration."
    );
  }

  await queryInterface.sequelize.query(
    `UPDATE ${TABLE}
     SET created_by = :fallbackId
     WHERE created_by IS NULL`,
    { replacements: { fallbackId } }
  );

  const [[{ missingCreatedBy }]] = await queryInterface.sequelize.query(
    `SELECT COUNT(*) AS missingCreatedBy FROM ${TABLE} WHERE created_by IS NULL`
  );

  if (missingCreatedBy > 0) {
    throw new Error(
      `Unable to backfill created_by for ${missingCreatedBy} threads. Please fix those rows manually before rerunning this migration.`
    );
  }
}

async function removeCreatedByConstraint(queryInterface) {
  try {
    await queryInterface.removeConstraint(TABLE, CREATED_BY_FK);
  } catch (error) {
    if (error?.original?.code !== "ER_CANT_DROP_FIELD_OR_KEY" &&
        error?.original?.code !== "ER_DROP_INDEX_FK" &&
        !/Cannot drop/i.test(error?.message || "")) {
      throw error;
    }
  }
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
    await removeCreatedByConstraint(queryInterface);

    await queryInterface.addColumn(TABLE, "enfant_id", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      after: "id",
      references: { model: "enfants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addColumn(TABLE, "archived_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "archived",
    });

    await populateCreatedBy(queryInterface);
    await assignFallbackCreator(queryInterface);
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
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.changeColumn(TABLE, "created_by", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addConstraint(TABLE, {
      fields: ["created_by"],
      type: "foreign key",
      name: CREATED_BY_FK,
      references: { table: "utilisateurs", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(TABLE, "idx_threads_enfant_archived").catch(() => {});
    await queryInterface.removeIndex(TABLE, "idx_threads_created_by").catch(() => {});

    await queryInterface.removeConstraint(TABLE, CREATED_BY_FK).catch(() => {});

    await queryInterface.changeColumn(TABLE, "created_by", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addConstraint(TABLE, {
      fields: ["created_by"],
      type: "foreign key",
      name: CREATED_BY_FK,
      references: { table: "utilisateurs", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }).catch(() => {});

    await queryInterface.removeColumn(TABLE, "archived_at").catch(() => {});
    await queryInterface.removeColumn(TABLE, "enfant_id").catch(() => {});
  },
};
