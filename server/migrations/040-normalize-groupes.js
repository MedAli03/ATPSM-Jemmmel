"use strict";

// Normalize groups into a groupe_annee bridge and align inscriptions/affectations
// without touching deprecated columns such as date_debut/date_fin on groups or
// non-existent is_active fields before they are created.

async function columnExists(queryInterface, table, column) {
  const definition = await queryInterface.describeTable(table);
  return Object.prototype.hasOwnProperty.call(definition, column);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // --- 1) Enrich groupes (code + capacite) ---------------------------------
    if (!(await columnExists(queryInterface, "groupes", "code"))) {
      await queryInterface.addColumn("groupes", "code", {
        type: Sequelize.STRING(50),
        allowNull: true,
        after: "id",
      });
      await queryInterface.sequelize.query(
        "UPDATE groupes SET code = CONCAT('GRP-', id) WHERE code IS NULL"
      );
      await queryInterface.addConstraint("groupes", {
        fields: ["code"],
        type: "unique",
        name: "uniq_groupes_code",
      });
    }

    if (!(await columnExists(queryInterface, "groupes", "capacite"))) {
      await queryInterface.addColumn("groupes", "capacite", {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
        after: "description",
      });
    }

    // --- 2) Create groupes_annees bridge ------------------------------------
    const hasGroupesAnnees = await queryInterface
      .describeTable("groupes_annees")
      .then(() => true)
      .catch(() => false);

    if (!hasGroupesAnnees) {
      await queryInterface.createTable("groupes_annees", {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        groupe_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: "groupes", key: "id" },
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
      });

      await queryInterface.addConstraint("groupes_annees", {
        fields: ["groupe_id", "annee_id"],
        type: "unique",
        name: "uniq_groupe_annee",
      });

      await queryInterface.addIndex("groupes_annees", {
        name: "idx_groupes_annees_annee",
        fields: ["annee_id", "statut"],
      });

      await queryInterface.addIndex("groupes_annees", {
        name: "idx_groupes_annees_educateur",
        fields: ["educateur_id", "annee_id"],
      });

      // Seed bridge rows from existing groupes + affectations
      await queryInterface.sequelize.query(
        `INSERT INTO groupes_annees (groupe_id, annee_id, educateur_id, statut, effectif_max, created_at, updated_at)
         SELECT g.id,
                g.annee_id,
                ae.educateur_id,
                CASE WHEN g.statut = 'archive' THEN 'FERME' ELSE 'OUVERT' END,
                g.capacite,
                COALESCE(g.created_at, NOW()),
                COALESCE(g.updated_at, NOW())
         FROM groupes g
         LEFT JOIN (
           SELECT groupe_id, annee_id, educateur_id
           FROM affectations_educateurs
         ) ae ON ae.groupe_id = g.id AND ae.annee_id = g.annee_id`
      );
    }

    // --- 3) Inscriptions: link to groupes_annees ----------------------------
    if (!(await columnExists(queryInterface, "inscriptions_enfants", "groupe_annee_id"))) {
      await queryInterface.addColumn("inscriptions_enfants", "groupe_annee_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        after: "groupe_id",
        references: { model: "groupes_annees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }

    if (await columnExists(queryInterface, "inscriptions_enfants", "date_inscription")) {
      await queryInterface.renameColumn(
        "inscriptions_enfants",
        "date_inscription",
        "date_entree"
      );
    }

    if (!(await columnExists(queryInterface, "inscriptions_enfants", "date_sortie"))) {
      await queryInterface.addColumn("inscriptions_enfants", "date_sortie", {
        type: Sequelize.DATE,
        allowNull: true,
        after: "date_entree",
      });
    }

    if (!(await columnExists(queryInterface, "inscriptions_enfants", "statut"))) {
      await queryInterface.addColumn("inscriptions_enfants", "statut", {
        type: Sequelize.ENUM("ACTIVE", "SUSPENDU", "TERMINE"),
        allowNull: false,
        defaultValue: "ACTIVE",
        after: "date_sortie",
      });
    }

    await queryInterface.sequelize.query(
      `UPDATE inscriptions_enfants ie
       JOIN groupes_annees ga ON ga.groupe_id = ie.groupe_id AND ga.annee_id = ie.annee_id
       SET ie.groupe_annee_id = ga.id`
    );

    const [[{ remaining }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS remaining FROM inscriptions_enfants WHERE groupe_annee_id IS NULL`
    );

    if (remaining > 0) {
      throw new Error(`Impossible de retrouver le groupe/annee pour ${remaining} inscriptions.`);
    }

    await queryInterface.changeColumn("inscriptions_enfants", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.removeConstraint("inscriptions_enfants", "uniq_enfant_annee").catch(() => {});
    await queryInterface.removeIndex("inscriptions_enfants", ["groupe_id"]).catch(() => {});

    await queryInterface.addConstraint("inscriptions_enfants", {
      fields: ["enfant_id", "annee_id", "statut"],
      type: "unique",
      name: "uniq_inscription_enfant_annee_statut",
    });

    await queryInterface.addIndex("inscriptions_enfants", {
      name: "idx_inscription_groupe_annee",
      fields: ["groupe_annee_id", "statut"],
    });

    if (await columnExists(queryInterface, "inscriptions_enfants", "groupe_id")) {
      await queryInterface.removeColumn("inscriptions_enfants", "groupe_id");
    }

    // --- 4) Affectations: link to groupes_annees ----------------------------
    if (!(await columnExists(queryInterface, "affectations_educateurs", "groupe_annee_id"))) {
      await queryInterface.addColumn("affectations_educateurs", "groupe_annee_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        after: "groupe_id",
        references: { model: "groupes_annees", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }

    await queryInterface.sequelize.query(
      `UPDATE affectations_educateurs ae
       JOIN groupes_annees ga ON ga.groupe_id = ae.groupe_id AND ga.annee_id = ae.annee_id
       SET ae.groupe_annee_id = ga.id`
    );

    await queryInterface.changeColumn("affectations_educateurs", "groupe_annee_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    if (await columnExists(queryInterface, "affectations_educateurs", "date_affectation")) {
      await queryInterface.renameColumn(
        "affectations_educateurs",
        "date_affectation",
        "date_debut"
      );
    }

    if (!(await columnExists(queryInterface, "affectations_educateurs", "date_fin"))) {
      await queryInterface.addColumn("affectations_educateurs", "date_fin", {
        type: Sequelize.DATE,
        allowNull: true,
        after: "date_debut",
      });
    }

    const hasIsActive = await columnExists(queryInterface, "affectations_educateurs", "is_active");
    const hasEstActive = await columnExists(queryInterface, "affectations_educateurs", "est_active");

    if (!hasIsActive) {
      if (hasEstActive) {
        await queryInterface.renameColumn(
          "affectations_educateurs",
          "est_active",
          "is_active"
        );
      } else {
        await queryInterface.addColumn("affectations_educateurs", "is_active", {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          after: "date_fin",
        });
      }
    }

    await queryInterface.removeConstraint("affectations_educateurs", "uniq_educateur_annee").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_groupe_annee").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_educateur_annee_active").catch(() => {});
    await queryInterface.removeConstraint("affectations_educateurs", "uniq_groupe_annee_active").catch(() => {});

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_annee_id", "is_active"],
      type: "unique",
      name: "uniq_affectation_groupe_active",
    });

    await queryInterface.addConstraint("affectations_educateurs", {
      fields: ["groupe_annee_id", "educateur_id"],
      type: "unique",
      name: "uniq_affectation_groupe_educateur",
    });

    if (await columnExists(queryInterface, "affectations_educateurs", "groupe_id")) {
      await queryInterface.removeColumn("affectations_educateurs", "groupe_id");
    }
    if (await columnExists(queryInterface, "affectations_educateurs", "annee_id")) {
      await queryInterface.removeColumn("affectations_educateurs", "annee_id");
    }

    // --- 5) Drop annee_id from groupes now that bridge holds the relation ----
    if (await columnExists(queryInterface, "groupes", "annee_id")) {
      await queryInterface.removeColumn("groupes", "annee_id");
    }
  },

  async down() {
    throw new Error("Cette migration est irréversible automatiquement.");
  },
};
