"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[admin]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email=:email LIMIT 1",
      {
        replacements: { email: "admin@asso.tn" },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    if (!admin) return;

    await queryInterface.bulkInsert("documents", [
      {
        admin_id: admin.id,
        type: "reglement",
        titre: "Règlement intérieur 2025",
        url: "https://example.com/reglement-interieur-2025.pdf",
        statut: "publie",
        created_at: now,
        updated_at: now,
      },
      {
        admin_id: admin.id,
        type: "autre",
        titre: "Guide d'accueil des familles",
        url: "https://example.com/guide-parents-rentree.pdf",
        statut: "publie",
        created_at: now,
        updated_at: now,
      },
    ]);

    const [[reglementDoc]] = await queryInterface.sequelize.query(
      "SELECT id FROM documents WHERE titre=:titre ORDER BY id DESC LIMIT 1",
      {
        replacements: { titre: "Règlement intérieur 2025" },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    if (reglementDoc?.id) {
      await queryInterface.bulkInsert("reglements", [
        {
          document_id: reglementDoc.id,
          version: "v2025.1",
          date_effet: "2025-09-01",
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    await queryInterface.bulkInsert("actualites", [
      {
        admin_id: admin.id,
        titre: "Lancement des ateliers d'autonomie",
        resume: "Nouvelles sessions hebdomadaires pour développer l'autonomie des enfants.",
        contenu:
          "Les éducateurs animent désormais des ateliers d'autonomie chaque mardi et jeudi, avec des activités adaptées à chaque profil.",
        contenu_html: null,
        statut: "publie",
        tags: JSON.stringify(["atelier", "autonomie", "educateurs"]),
        couverture_url: "https://example.com/images/autonomie.jpg",
        galerie_urls: JSON.stringify([
          "https://example.com/images/autonomie-1.jpg",
          "https://example.com/images/autonomie-2.jpg",
        ]),
        epingle: true,
        publie_le: new Date("2025-09-05T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
      {
        admin_id: admin.id,
        titre: "Sortie pédagogique au musée",
        resume: "Découverte des arts pour renforcer la curiosité et la communication.",
        contenu:
          "Un groupe d'enfants participera à une sortie encadrée au musée régional. Les familles recevront le planning détaillé.",
        contenu_html: null,
        statut: "publie",
        tags: JSON.stringify(["sortie", "culture", "parents"]),
        couverture_url: "https://example.com/images/musee.jpg",
        galerie_urls: JSON.stringify([]),
        epingle: false,
        publie_le: new Date("2025-09-12T10:00:00Z"),
        created_at: now,
        updated_at: now,
      },
    ]);

    const [[guideDoc]] = await queryInterface.sequelize.query(
      "SELECT id FROM documents WHERE titre=:titre ORDER BY id DESC LIMIT 1",
      {
        replacements: { titre: "Guide d'accueil des familles" },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    await queryInterface.bulkInsert("evenements", [
      {
        document_id: guideDoc?.id ?? null,
        admin_id: admin.id,
        titre: "Réunion de rentrée",
        description: "Présentation des équipes et des projets pour l'année 2025-2026.",
        debut: new Date("2025-09-08T16:00:00Z"),
        fin: new Date("2025-09-08T17:30:00Z"),
        audience: "parents",
        lieu: "Salle polyvalente",
        created_at: now,
        updated_at: now,
      },
      {
        document_id: reglementDoc?.id ?? null,
        admin_id: admin.id,
        titre: "Formation interne éducateurs",
        description: "Atelier sur les nouvelles approches ABA et communication augmentée.",
        debut: new Date("2025-09-10T08:30:00Z"),
        fin: new Date("2025-09-10T12:00:00Z"),
        audience: "educateurs",
        lieu: "Salle atelier 2",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("evenements", {
      titre: ["Réunion de rentrée", "Formation interne éducateurs"],
    });
    await queryInterface.bulkDelete("actualites", {
      titre: ["Lancement des ateliers d'autonomie", "Sortie pédagogique au musée"],
    });
    await queryInterface.bulkDelete("reglements", { version: "v2025.1" });
    await queryInterface.bulkDelete("documents", {
      titre: ["Règlement intérieur 2025", "Guide d'accueil des familles"],
    });
  },
};
