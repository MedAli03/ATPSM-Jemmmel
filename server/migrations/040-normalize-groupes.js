"use strict";

// Rebuild groups around a groupe_annee bridge and relink inscriptions/affectations
// without touching deprecated columns (date_debut/date_fin/is_active that no longer
// exist). All operations are MariaDB-safe and only rely on currently existing fields.

const TABLE_GROUPES = "groupes";
const TABLE_GROUPES_ANNEES = "groupes_annees";
const TABLE_INSCRIPTIONS = "inscriptions_enfants";
const TABLE_AFFECTATIONS = "affectations_educateurs";

async function columnExists(queryInterface, table, column) {
  const definition = await queryInterface.describeTable(table);
  return Object.prototype.hasOwnProperty.call(definition, column);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1) Ensure groupes has code/capacite (idempotent)
      const groupesDef = await queryInterface.describeTable(TABLE_GROUPES);
      if (!groupesDef.code) {
        await queryInterface.addColumn(
          TABLE_GROUPES,
          "code",
          {
            type: Sequelize.STRING(50),
            allowNull: true,
            after: "id",
          },
          { transaction }
        );
        await queryInterface.sequelize.query(
          "UPDATE groupes SET code = CONCAT('GRP-', id) WHERE code IS NULL",
          { transaction }
        );
        await queryInterface.addConstraint(
          TABLE_GROUPES,
          {
            fields: ["code"],
            type: "unique",
            name: "uniq_groupes_code",
            transaction,
          }
        );
      }

      if (!groupesDef.capacite) {
        await queryInterface.addColumn(
          TABLE_GROUPES,
          "capacite",
          {
            type: Sequelize.SMALLINT.UNSIGNED,
            allowNull: true,
            after: "description",
          },
          { transaction }
        );
      }

      // 2) Create groupes_annees bridge if absent
      const hasGroupesAnnees = await queryInterface
        .describeTable(TABLE_GROUPES_ANNEES)
        .then(() => true)
        .catch(() => false);

      if (!hasGroupesAnnees) {
        await queryInterface.createTable(
          TABLE_GROUPES_ANNEES,
          {
            id: {
              type: Sequelize.INTEGER.UNSIGNED,
              autoIncrement: true,
              primaryKey: true,
            },
            groupe_id: {
              type: Sequelize.INTEGER.UNSIGNED,
              allowNull: false,
              references: { model: TABLE_GROUPES, key: "id" },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
            },
            annee_id: {
              type: Sequelize.INTEGER.UNSIGNED,
              allowNull: false,
              references: { model: "annees_scolaires", key: "id" },
              onUpdate: "CASCADE",
              onDelete: "RESTRICT",
            },
            educateur_id: {
              type: Sequelize.INTEGER.UNSIGNED,
              allowNull: true,
              references: { model: "utilisateurs", key: "id" },
              onUpdate: "CASCADE",
              onDelete: "SET NULL",
            },
            statut: {
              type: Sequelize.ENUM("OUVERT", "FERME"),
              allowNull: false,
              defaultValue: "OUVERT",
            },
            effectif_max: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
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
          },
          { transaction }
        );

        await queryInterface.addConstraint(
          TABLE_GROUPES_ANNEES,
          {
            fields: ["groupe_id", "annee_id"],
            type: "unique",
            name: "uniq_groupe_annee",
            transaction,
          }
        );

        await queryInterface.addIndex(TABLE_GROUPES_ANNEES, {
          name: "idx_groupes_annees_annee",
          fields: ["annee_id", "statut"],
          transaction,
        });

        await queryInterface.addIndex(TABLE_GROUPES_ANNEES, {
          name: "idx_groupes_annees_educateur",
          fields: ["educateur_id", "annee_id"],
          transaction,
        });

        // Seed bridge using existing groupes and affectations
        await queryInterface.sequelize.query(
          `INSERT INTO ${TABLE_GROUPES_ANNEES} (groupe_id, annee_id, educateur_id, statut, effectif_max, created_at, updated_at)
           SELECT g.id,
                  g.annee_id,
                  a.educateur_id,
                  CASE WHEN g.statut = 'archive' THEN 'FERME' ELSE 'OUVERT' END,
                  g.capacite,
                  COALESCE(g.created_at, NOW()),
                  COALESCE(g.updated_at, NOW())
           FROM ${TABLE_GROUPES} g
           LEFT JOIN (
             SELECT groupe_id, annee_id, MIN(educateur_id) AS educateur_id
             FROM affectations_educateurs
             GROUP BY groupe_id, annee_id
           ) a ON a.groupe_id = g.id AND a.annee_id = g.annee_id`,
          { transaction }
        );
      }

      // 3) Inscriptions -> groupes_annees
      const inscDef = await queryInterface.describeTable(TABLE_INSCRIPTIONS);
      if (!inscDef.groupe_annee_id) {
        await queryInterface.addColumn(
          TABLE_INSCRIPTIONS,
          "groupe_annee_id",
          {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true,
            after: "groupe_id",
          },
          { transaction }
        );
      }

      if (inscDef.date_inscription) {
        await queryInterface.renameColumn(
          TABLE_INSCRIPTIONS,
          "date_inscription",
          "date_entree",
          { transaction }
        );
      }

      const inscDefAfterRename = await queryInterface.describeTable(TABLE_INSCRIPTIONS);
      if (!inscDefAfterRename.date_sortie) {
        await queryInterface.addColumn(
          TABLE_INSCRIPTIONS,
          "date_sortie",
          { type: Sequelize.DATE, allowNull: true, after: "date_entree" },
          { transaction }
        );
      }

      if (!inscDefAfterRename.statut) {
        await queryInterface.addColumn(
          TABLE_INSCRIPTIONS,
          "statut",
          {
            type: Sequelize.ENUM("ACTIVE", "SUSPENDU", "TERMINE"),
            allowNull: false,
            defaultValue: "ACTIVE",
            after: "date_sortie",
          },
          { transaction }
        );
      }

      // Map est_active -> statut when present
      const hasEstActiveIns = await columnExists(
        queryInterface,
        TABLE_INSCRIPTIONS,
        "est_active"
      );
      if (hasEstActiveIns) {
        await queryInterface.sequelize.query(
          `UPDATE ${TABLE_INSCRIPTIONS}
           SET statut = CASE WHEN est_active = 1 THEN 'ACTIVE' ELSE 'TERMINE' END`,
          { transaction }
        );
      }

      // Populate groupe_annee_id
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE_INSCRIPTIONS} ie
         JOIN ${TABLE_GROUPES_ANNEES} ga ON ga.groupe_id = ie.groupe_id AND ga.annee_id = ie.annee_id
         SET ie.groupe_annee_id = ga.id`,
        { transaction }
      );

      const [[{ missingInsc }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) AS missingInsc FROM ${TABLE_INSCRIPTIONS} WHERE groupe_annee_id IS NULL`,
        { transaction }
      );
      if (missingInsc > 0) {
        throw new Error(
          `Impossible de retrouver le groupe/annee pour ${missingInsc} inscriptions. Veuillez corriger avant de relancer.`
        );
      }

      await queryInterface.changeColumn(
        TABLE_INSCRIPTIONS,
        "groupe_annee_id",
        { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        { transaction }
      );

      // Drop old constraints/indexes safely
      await queryInterface
        .removeConstraint(TABLE_INSCRIPTIONS, "uniq_enfant_annee")
        .catch(() => {});
      await queryInterface
        .removeConstraint(TABLE_INSCRIPTIONS, "uniq_enfant_annee_active")
        .catch(() => {});
      await queryInterface.removeIndex(TABLE_INSCRIPTIONS, "idx_inscriptions_annee_active").catch(() => {});
      await queryInterface.removeIndex(TABLE_INSCRIPTIONS, ["groupe_id"]).catch(() => {});

      await queryInterface.addConstraint(
        TABLE_INSCRIPTIONS,
        {
          fields: ["enfant_id", "annee_id", "statut"],
          type: "unique",
          name: "uniq_inscription_enfant_annee_statut",
          transaction,
        }
      );

      await queryInterface.addIndex(TABLE_INSCRIPTIONS, {
        name: "idx_inscription_groupe_annee",
        fields: ["groupe_annee_id", "statut"],
        transaction,
      });

      if (hasEstActiveIns) {
        await queryInterface.removeColumn(TABLE_INSCRIPTIONS, "est_active", { transaction }).catch(() => {});
      }
      if (inscDefAfterRename.groupe_id) {
        await queryInterface.removeColumn(TABLE_INSCRIPTIONS, "groupe_id", { transaction });
      }

      // 4) Affectations -> groupes_annees
      const affDef = await queryInterface.describeTable(TABLE_AFFECTATIONS);
      if (!affDef.groupe_annee_id) {
        await queryInterface.addColumn(
          TABLE_AFFECTATIONS,
          "groupe_annee_id",
          {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true,
            after: "groupe_id",
          },
          { transaction }
        );
      }

      // rename date_affectation -> date_debut
      if (affDef.date_affectation) {
        await queryInterface.renameColumn(
          TABLE_AFFECTATIONS,
          "date_affectation",
          "date_debut",
          { transaction }
        );
      }

      const affDefAfterRename = await queryInterface.describeTable(TABLE_AFFECTATIONS);
      if (affDefAfterRename.date_fin_affectation && !affDefAfterRename.date_fin) {
        await queryInterface.renameColumn(
          TABLE_AFFECTATIONS,
          "date_fin_affectation",
          "date_fin",
          { transaction }
        );
      } else if (!affDefAfterRename.date_fin) {
        await queryInterface.addColumn(
          TABLE_AFFECTATIONS,
          "date_fin",
          { type: Sequelize.DATE, allowNull: true, after: "date_debut" },
          { transaction }
        );
      }

      const hasEstActiveAff = await columnExists(queryInterface, TABLE_AFFECTATIONS, "est_active");
      const hasIsActiveAff = await columnExists(queryInterface, TABLE_AFFECTATIONS, "is_active");
      if (!hasIsActiveAff) {
        if (hasEstActiveAff) {
          await queryInterface.renameColumn(
            TABLE_AFFECTATIONS,
            "est_active",
            "is_active",
            { transaction }
          );
        } else {
          await queryInterface.addColumn(
            TABLE_AFFECTATIONS,
            "is_active",
            { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, after: "date_fin" },
            { transaction }
          );
        }
      }

      // Populate groupe_annee_id
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE_AFFECTATIONS} ae
         JOIN ${TABLE_GROUPES_ANNEES} ga ON ga.groupe_id = ae.groupe_id AND ga.annee_id = ae.annee_id
         SET ae.groupe_annee_id = ga.id`,
        { transaction }
      );

      const [[{ missingAff }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) AS missingAff FROM ${TABLE_AFFECTATIONS} WHERE groupe_annee_id IS NULL`,
        { transaction }
      );
      if (missingAff > 0) {
        throw new Error(
          `Impossible de retrouver le groupe/annee pour ${missingAff} affectations. Corrigez avant de relancer.`
        );
      }

      await queryInterface.changeColumn(
        TABLE_AFFECTATIONS,
        "groupe_annee_id",
        { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        { transaction }
      );

      // Remove old constraints
      await queryInterface
        .removeConstraint(TABLE_AFFECTATIONS, "uniq_educateur_annee")
        .catch(() => {});
      await queryInterface
        .removeConstraint(TABLE_AFFECTATIONS, "uniq_groupe_annee")
        .catch(() => {});
      await queryInterface
        .removeConstraint(TABLE_AFFECTATIONS, "uniq_educateur_annee_active")
        .catch(() => {});
      await queryInterface
        .removeConstraint(TABLE_AFFECTATIONS, "uniq_groupe_annee_active")
        .catch(() => {});
      await queryInterface.removeIndex(TABLE_AFFECTATIONS, "idx_affectations_annee_active").catch(() => {});

      await queryInterface.addConstraint(
        TABLE_AFFECTATIONS,
        {
          fields: ["groupe_annee_id", "is_active"],
          type: "unique",
          name: "uniq_affectation_groupe_active",
          transaction,
        }
      );

      await queryInterface.addConstraint(
        TABLE_AFFECTATIONS,
        {
          fields: ["groupe_annee_id", "educateur_id"],
          type: "unique",
          name: "uniq_affectation_groupe_educateur",
          transaction,
        }
      );

      if (hasEstActiveAff) {
        await queryInterface.removeColumn(TABLE_AFFECTATIONS, "est_active", { transaction }).catch(() => {});
      }
      if (affDefAfterRename.groupe_id) {
        await queryInterface.removeColumn(TABLE_AFFECTATIONS, "groupe_id", { transaction });
      }
      if (affDefAfterRename.annee_id) {
        await queryInterface.removeColumn(TABLE_AFFECTATIONS, "annee_id", { transaction });
      }

      // 5) Drop annee_id from groupes (bridge now owns the relation)
      if (groupesDef.annee_id) {
        await queryInterface.removeColumn(TABLE_GROUPES, "annee_id", { transaction });
      }
    });
  },

  async down() {
    throw new Error("Cette migration est irréversible automatiquement.");
  },
};
