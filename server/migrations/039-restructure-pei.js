"use strict";

const PEI_TABLE = "pei_versions";

async function ensureVersionNumbers(queryInterface) {
  await queryInterface.sequelize.query(
    `WITH ranked AS (
       SELECT id,
              ROW_NUMBER() OVER (PARTITION BY enfant_id, annee_id ORDER BY effective_start, id) AS rn
       FROM ${PEI_TABLE}
     )
     UPDATE ${PEI_TABLE} pv
     JOIN ranked r ON r.id = pv.id
     SET pv.version_number = r.rn`
  );
}

async function migrateObjectifs(queryInterface) {
  await queryInterface.sequelize.query(
    `INSERT INTO pei_objectifs (pei_version_id, titre, description, priorite, source, ordre, created_at, updated_at)
     SELECT id,
            CONCAT('Objectifs PEI #', id) AS titre,
            COALESCE(objectifs, '') AS description,
            'MOYENNE' AS priorite,
            'EDUCATEUR' AS source,
            1 AS ordre,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
     FROM ${PEI_TABLE}`
  );

  await queryInterface.removeColumn(PEI_TABLE, "objectifs").catch(() => {});
}

async function migrateActivites(queryInterface, Sequelize) {
  await queryInterface.renameTable("activite_projet", "pei_activites");

  await queryInterface.renameColumn("pei_activites", "educateur_id", "created_by").catch(() => {});

  await queryInterface.addColumn("pei_activites", "objectif_id", {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    after: "id",
    references: { model: "pei_objectifs", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  await queryInterface.addColumn("pei_activites", "frequence", {
    type: Sequelize.STRING(120),
    allowNull: true,
    after: "description",
  });

  await queryInterface.addColumn("pei_activites", "lieu", {
    type: Sequelize.STRING(120),
    allowNull: true,
  });

  await queryInterface.addColumn("pei_activites", "statut", {
    type: Sequelize.ENUM("PLANIFIEE", "EN_COURS", "TERMINEE", "ABANDONNEE"),
    allowNull: false,
    defaultValue: "PLANIFIEE",
  });

  await queryInterface.sequelize.query(
    `UPDATE pei_activites pa
     JOIN pei_objectifs po ON po.pei_version_id = pa.projet_id
     SET pa.objectif_id = po.id
     WHERE pa.objectif_id IS NULL`
  );

  await queryInterface.changeColumn("pei_activites", "objectif_id", {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  });

  await queryInterface.sequelize.query(
    `UPDATE pei_activites
     SET description = CONCAT('[Type: ', type, '] ', COALESCE(description, ''))
     WHERE type IS NOT NULL`
  );

  await queryInterface.removeColumn("pei_activites", "type").catch(() => {});

  await queryInterface.removeColumn("pei_activites", "projet_id").catch(() => {});
  await queryInterface.removeColumn("pei_activites", "enfant_id").catch(() => {});
}

async function migrateEvaluations(queryInterface, Sequelize) {
  await queryInterface.renameTable("evaluation_projet", "pei_evaluations");

  await queryInterface.renameColumn("pei_evaluations", "projet_id", "pei_version_id").catch(() => {});
  await queryInterface.renameColumn("pei_evaluations", "date_evaluation", "evaluation_date").catch(() => {});
  await queryInterface.renameColumn("pei_evaluations", "notes", "commentaires").catch(() => {});

  await queryInterface.addColumn("pei_evaluations", "objectif_id", {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    after: "pei_version_id",
    references: { model: "pei_objectifs", key: "id" },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  await queryInterface.addColumn("pei_evaluations", "cycle", {
    type: Sequelize.ENUM("3M", "6M", "ANNUEL"),
    allowNull: true,
    after: "evaluation_date",
  });
}

async function migrateHistorique(queryInterface, Sequelize) {
  await queryInterface.renameTable("historique_projet", "pei_history_log");

  await queryInterface.renameColumn("pei_history_log", "projet_id", "pei_version_id").catch(() => {});
  await queryInterface.renameColumn("pei_history_log", "educateur_id", "performed_by").catch(() => {});
  await queryInterface.renameColumn("pei_history_log", "date_modification", "created_at").catch(() => {});

  await queryInterface.addColumn("pei_history_log", "action", {
    type: Sequelize.ENUM("CREATION", "VALIDATION", "REVISION", "CLOTURE"),
    allowNull: false,
    defaultValue: "REVISION",
    after: "performed_by",
  });

  await queryInterface.addColumn("pei_history_log", "details_json", {
    type: Sequelize.JSON,
    allowNull: true,
  });

  await queryInterface.sequelize.query(
    `UPDATE pei_history_log
     SET details_json = JSON_OBJECT(
       'ancien_objectifs', ancien_objectifs,
       'ancien_statut', ancien_statut,
       'raison_modification', raison_modification
     )`
  );

  await queryInterface.removeColumn("pei_history_log", "ancien_objectifs").catch(() => {});
  await queryInterface.removeColumn("pei_history_log", "raison_modification").catch(() => {});
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable("projet_educatif_individuel", PEI_TABLE);

    await queryInterface.renameColumn(PEI_TABLE, "statut", "status").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "date_creation", "effective_start").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "date_derniere_maj", "effective_end").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "educateur_id", "created_by").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "precedent_projet_id", "previous_version_id").catch(() => {});

    await queryInterface.addColumn(PEI_TABLE, "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: "annee_id",
    });

    await queryInterface.addColumn(PEI_TABLE, "version_number", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addColumn(PEI_TABLE, "observation_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "observation_initiale", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn(PEI_TABLE, "motivation", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE ${PEI_TABLE}
       SET effective_start = COALESCE(effective_start, created_at),
           effective_end = COALESCE(effective_end, updated_at)`
    );

    await ensureVersionNumbers(queryInterface);

    await queryInterface.removeIndex(PEI_TABLE, "uniq_pei_enfant_annee_actif").catch(() => {});

    await queryInterface.addIndex(PEI_TABLE, {
      name: "uniq_pei_enfant_annee_actif",
      unique: true,
      fields: ["enfant_id", "annee_id", "est_actif"],
    });

    await queryInterface.addIndex(PEI_TABLE, {
      name: "uniq_pei_version_per_year",
      unique: true,
      fields: ["enfant_id", "annee_id", "version_number"],
    });

    await queryInterface.createTable("pei_objectifs", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      pei_version_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: PEI_TABLE, key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      titre: { type: Sequelize.STRING(255), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      priorite: {
        type: Sequelize.ENUM("BASSE", "MOYENNE", "ELEVEE"),
        allowNull: false,
        defaultValue: "MOYENNE",
      },
      source: {
        type: Sequelize.ENUM("EDUCATEUR", "PARENT"),
        allowNull: false,
        defaultValue: "EDUCATEUR",
      },
      ordre: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await migrateObjectifs(queryInterface);

    await migrateActivites(queryInterface, Sequelize);
    await migrateEvaluations(queryInterface, Sequelize);
    await migrateHistorique(queryInterface, Sequelize);

    await queryInterface.renameColumn("daily_notes", "projet_id", "pei_version_id").catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("daily_notes", "pei_version_id", "projet_id").catch(() => {});

    await queryInterface.renameTable("pei_history_log", "historique_projet").catch(() => {});
    await queryInterface.renameTable("pei_evaluations", "evaluation_projet").catch(() => {});
    await queryInterface.renameTable("pei_activites", "activite_projet").catch(() => {});

    await queryInterface.dropTable("pei_objectifs").catch(() => {});

    await queryInterface.removeIndex(PEI_TABLE, "uniq_pei_version_per_year").catch(() => {});
    await queryInterface.removeIndex(PEI_TABLE, "uniq_pei_enfant_annee_actif").catch(() => {});

    await queryInterface.renameColumn(PEI_TABLE, "status", "statut").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "effective_start", "date_creation").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "effective_end", "date_derniere_maj").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "created_by", "educateur_id").catch(() => {});
    await queryInterface.renameColumn(PEI_TABLE, "previous_version_id", "precedent_projet_id").catch(() => {});

    await queryInterface.removeColumn(PEI_TABLE, "motivation").catch(() => {});
    await queryInterface.removeColumn(PEI_TABLE, "observation_id").catch(() => {});
    await queryInterface.removeColumn(PEI_TABLE, "version_number").catch(() => {});
    await queryInterface.removeColumn(PEI_TABLE, "groupe_annee_id").catch(() => {});

    await queryInterface.renameTable(PEI_TABLE, "projet_educatif_individuel").catch(() => {});
  },
};
