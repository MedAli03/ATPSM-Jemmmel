"use strict";

const TABLE_GROUPES = "groupes";
const TABLE_GROUPES_ANNEES = "groupes_annees";
const TABLE_INSCRIPTIONS = "inscriptions_enfants";
const TABLE_AFFECTATIONS = "affectations_educateurs";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      /* --------------------------------------------------------------------- */
      /* 1) Harden base groupes columns (code/capacite)                       */
      /* --------------------------------------------------------------------- */
      const groupesDef = await queryInterface.describeTable(TABLE_GROUPES);

      if (!groupesDef.code) {
        await queryInterface.addColumn(
          TABLE_GROUPES,
          "code",
          { type: Sequelize.STRING(50), allowNull: true, after: "id" },
          { transaction }
        );
        await queryInterface.sequelize.query(
          "UPDATE groupes SET code = CONCAT('GRP-', id) WHERE code IS NULL",
          { transaction }
        );
        await queryInterface.addConstraint(TABLE_GROUPES, {
          fields: ["code"],
          type: "unique",
          name: "uniq_groupes_code",
          transaction,
        });
      }

      if (!groupesDef.capacite) {
        await queryInterface.addColumn(
          TABLE_GROUPES,
          "capacite",
          { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true, after: "description" },
          { transaction }
        );
      }

      /* --------------------------------------------------------------------- */
      /* 2) Create groupes_annees bridge                                      */
      /* --------------------------------------------------------------------- */
      const hasBridge = await queryInterface
        .describeTable(TABLE_GROUPES_ANNEES)
        .then(() => true)
        .catch(() => false);

      if (!hasBridge) {
        await queryInterface.createTable(
          TABLE_GROUPES_ANNEES,
          {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
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
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
          },
          { transaction }
        );

        await queryInterface.addConstraint(TABLE_GROUPES_ANNEES, {
          fields: ["groupe_id", "annee_id"],
          type: "unique",
          name: "uniq_groupe_annee",
          transaction,
        });
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

        await queryInterface.sequelize.query(
          `INSERT INTO ${TABLE_GROUPES_ANNEES} (groupe_id, annee_id, educateur_id, statut, effectif_max, created_at, updated_at)
           SELECT g.id,
                  g.annee_id,
                  ae.educateur_id,
                  CASE WHEN g.statut = 'archive' THEN 'FERME' ELSE 'OUVERT' END,
                  g.capacite,
                  COALESCE(g.created_at, NOW()),
                  COALESCE(g.updated_at, NOW())
           FROM ${TABLE_GROUPES} g
           LEFT JOIN (
             SELECT groupe_id, annee_id, MIN(educateur_id) AS educateur_id
             FROM affectations_educateurs
             WHERE est_active IS NULL OR est_active = 1
             GROUP BY groupe_id, annee_id
           ) ae ON ae.groupe_id = g.id AND ae.annee_id = g.annee_id`,
          { transaction }
        );
      }

      /* --------------------------------------------------------------------- */
      /* 3) Inscription relinking                                             */
      /* --------------------------------------------------------------------- */
      const inscDef = await queryInterface.describeTable(TABLE_INSCRIPTIONS);

      if (inscDef.date_inscription) {
        await queryInterface.renameColumn(TABLE_INSCRIPTIONS, "date_inscription", "date_entree", { transaction });
      }
      const inscDefAfter = await queryInterface.describeTable(TABLE_INSCRIPTIONS);
      if (!inscDefAfter.date_sortie) {
        await queryInterface.addColumn(
          TABLE_INSCRIPTIONS,
          "date_sortie",
          { type: Sequelize.DATE, allowNull: true, after: "date_entree" },
          { transaction }
        );
      }
      if (!inscDefAfter.statut) {
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
      if (!inscDefAfter.groupe_annee_id) {
        await queryInterface.addColumn(
          TABLE_INSCRIPTIONS,
          "groupe_annee_id",
          { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, after: "groupe_id" },
          { transaction }
        );
      }

      const hasEstActiveIns = Object.prototype.hasOwnProperty.call(inscDefAfter, "est_active");
      if (hasEstActiveIns) {
        await queryInterface.sequelize.query(
          `UPDATE ${TABLE_INSCRIPTIONS}
           SET statut = CASE WHEN est_active = 1 THEN 'ACTIVE' ELSE 'TERMINE' END
           WHERE statut IS NULL`,
          { transaction }
        );
      }
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE_INSCRIPTIONS} ie
         JOIN ${TABLE_GROUPES_ANNEES} ga ON ga.groupe_id = ie.groupe_id AND ga.annee_id = ie.annee_id
         SET ie.groupe_annee_id = ga.id` ,
        { transaction }
      );
      const [[{ missingInsc }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) AS missingInsc FROM ${TABLE_INSCRIPTIONS} WHERE groupe_annee_id IS NULL`,
        { transaction }
      );
      if (missingInsc > 0) {
        throw new Error(`Impossible de retrouver le groupe/annee pour ${missingInsc} inscriptions.`);
      }

      await queryInterface.changeColumn(
        TABLE_INSCRIPTIONS,
        "groupe_annee_id",
        { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        { transaction }
      );
      await queryInterface.addConstraint(TABLE_INSCRIPTIONS, {
        fields: ["groupe_annee_id"],
        type: "foreign key",
        name: "fk_inscriptions_groupe_annee",
        references: { table: TABLE_GROUPES_ANNEES, field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        transaction,
      });
      await queryInterface.addConstraint(TABLE_INSCRIPTIONS, {
        fields: ["enfant_id", "annee_id", "statut"],
        type: "unique",
        name: "uniq_inscription_enfant_annee_statut",
        transaction,
      });
      await queryInterface.addIndex(TABLE_INSCRIPTIONS, {
        name: "idx_inscription_groupe_annee",
        fields: ["groupe_annee_id", "statut"],
        transaction,
      });

      if (hasEstActiveIns) {
        await queryInterface.removeColumn(TABLE_INSCRIPTIONS, "est_active", { transaction }).catch(() => {});
      }
      if (inscDefAfter.groupe_id) {
        await queryInterface.removeColumn(TABLE_INSCRIPTIONS, "groupe_id", { transaction }).catch(() => {});
      }

      /* --------------------------------------------------------------------- */
      /* 4) Affectations relinking                                            */
      /* --------------------------------------------------------------------- */
      const affDef = await queryInterface.describeTable(TABLE_AFFECTATIONS);
      if (!affDef.groupe_annee_id) {
        await queryInterface.addColumn(
          TABLE_AFFECTATIONS,
          "groupe_annee_id",
          { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, after: "groupe_id" },
          { transaction }
        );
      }
      if (affDef.date_affectation) {
        await queryInterface.renameColumn(TABLE_AFFECTATIONS, "date_affectation", "date_debut", { transaction });
      }
      const affAfter = await queryInterface.describeTable(TABLE_AFFECTATIONS);
      if (affAfter.date_fin_affectation && !affAfter.date_fin) {
        await queryInterface.renameColumn(TABLE_AFFECTATIONS, "date_fin_affectation", "date_fin", { transaction });
      } else if (!affAfter.date_fin) {
        await queryInterface.addColumn(
          TABLE_AFFECTATIONS,
          "date_fin",
          { type: Sequelize.DATE, allowNull: true, after: "date_debut" },
          { transaction }
        );
      }
      const hasEstActiveAff = Object.prototype.hasOwnProperty.call(affAfter, "est_active");
      const hasIsActiveAff = Object.prototype.hasOwnProperty.call(affAfter, "is_active");
      if (!hasIsActiveAff) {
        if (hasEstActiveAff) {
          await queryInterface.renameColumn(TABLE_AFFECTATIONS, "est_active", "is_active", { transaction });
        } else {
          await queryInterface.addColumn(
            TABLE_AFFECTATIONS,
            "is_active",
            { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, after: "date_fin" },
            { transaction }
          );
        }
      }

      await queryInterface.sequelize.query(
        `UPDATE ${TABLE_AFFECTATIONS} ae
         JOIN ${TABLE_GROUPES_ANNEES} ga ON ga.groupe_id = ae.groupe_id AND ga.annee_id = ae.annee_id
         SET ae.groupe_annee_id = ga.id` ,
        { transaction }
      );
      const [[{ missingAff }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) AS missingAff FROM ${TABLE_AFFECTATIONS} WHERE groupe_annee_id IS NULL`,
        { transaction }
      );
      if (missingAff > 0) {
        throw new Error(`Impossible de retrouver le groupe/annee pour ${missingAff} affectations.`);
      }

      await queryInterface.changeColumn(
        TABLE_AFFECTATIONS,
        "groupe_annee_id",
        { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        { transaction }
      );
      await queryInterface.addConstraint(TABLE_AFFECTATIONS, {
        fields: ["groupe_annee_id"],
        type: "foreign key",
        name: "fk_affectations_groupe_annee",
        references: { table: TABLE_GROUPES_ANNEES, field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        transaction,
      });
      await queryInterface.addConstraint(TABLE_AFFECTATIONS, {
        fields: ["groupe_annee_id", "is_active"],
        type: "unique",
        name: "uniq_affectation_groupe_active",
        transaction,
      });
      await queryInterface.addConstraint(TABLE_AFFECTATIONS, {
        fields: ["groupe_annee_id", "educateur_id"],
        type: "unique",
        name: "uniq_affectation_groupe_educateur",
        transaction,
      });
      await queryInterface.addIndex(TABLE_AFFECTATIONS, {
        name: "idx_affectation_educateur_active",
        fields: ["educateur_id", "is_active"],
        transaction,
      });

      if (hasEstActiveAff) {
        await queryInterface.removeColumn(TABLE_AFFECTATIONS, "est_active", { transaction }).catch(() => {});
      }
      if (affAfter.groupe_id) {
        await queryInterface.removeColumn(TABLE_AFFECTATIONS, "groupe_id", { transaction }).catch(() => {});
      }
      if (affAfter.annee_id) {
        await queryInterface.removeColumn(TABLE_AFFECTATIONS, "annee_id", { transaction }).catch(() => {});
      }

      /* --------------------------------------------------------------------- */
      /* 5) Clean groupes legacy columns                                      */
      /* --------------------------------------------------------------------- */
      if (groupesDef.statut) {
        await queryInterface.removeColumn(TABLE_GROUPES, "statut", { transaction }).catch(() => {});
      }
      if (groupesDef.annee_id) {
        await queryInterface.removeColumn(TABLE_GROUPES, "annee_id", { transaction }).catch(() => {});
      }
    });
  },

  async down() {
    throw new Error("Cette migration est irréversible automatiquement.");
  },
};
