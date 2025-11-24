"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[admin]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='admin@asso.tn' LIMIT 1"
    );
    if (!admin) return;

    await queryInterface.bulkInsert("documents", [
      {
        admin_id: admin.id,
        type: "reglement",
        titre: "Règlement intérieur 2025",
        url: "https://cdn.association.tn/docs/reglement-2025.pdf",
        statut: "publie",
        created_at: now,
        updated_at: now,
      },
      {
        admin_id: admin.id,
        type: "autre",
        titre: "Guide d'accueil des familles",
        url: "https://cdn.association.tn/docs/guide-parents.pdf",
        statut: "publie",
        created_at: now,
        updated_at: now,
      },
    ]);

    const [[reglementDoc]] = await queryInterface.sequelize.query(
      "SELECT id FROM documents WHERE titre='Règlement intérieur 2025' ORDER BY id DESC LIMIT 1"
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

    const evenements = [];
    if (reglementDoc?.id) {
      evenements.push({
        document_id: reglementDoc.id,
        admin_id: admin.id,
        titre: "Réunion parents - rentrée 2025",
        description: "Présentation du règlement et des activités de l'année.",
        debut: "2025-09-10T09:00:00Z",
        fin: "2025-09-10T11:00:00Z",
        audience: "parents",
        lieu: "Salle polyvalente",
        created_at: now,
        updated_at: now,
      });
    }
    evenements.push({
      document_id: null,
      admin_id: admin.id,
      titre: "Atelier communication pictos",
      description: "Formation courte pour les éducateurs sur les pictogrammes.",
      debut: "2025-09-18T14:00:00Z",
      fin: "2025-09-18T16:00:00Z",
      audience: "educateurs",
      lieu: "Salle 2",
      created_at: now,
      updated_at: now,
    });

    await queryInterface.bulkInsert("evenements", evenements);

    await queryInterface.bulkInsert("actualites", [
      {
        admin_id: admin.id,
        titre: "Ouverture de l'année 2025-2026",
        resume: "Nouvelle année, nouveaux projets pour nos enfants.",
        contenu: "L'association démarre avec un focus sur les ateliers sensoriels.",
        contenu_html: null,
        statut: "publie",
        tags: JSON.stringify(["association", "rentrée", "sensoriel"]),
        couverture_url: "https://cdn.association.tn/img/rentree-2025.jpg",
        galerie_urls: JSON.stringify([
          "https://cdn.association.tn/img/atelier1.jpg",
          "https://cdn.association.tn/img/atelier2.jpg",
        ]),
        epingle: true,
        publie_le: now,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("actualites", {
      titre: ["Ouverture de l'année 2025-2026"],
    });
    await queryInterface.bulkDelete("evenements", {
      titre: ["Réunion parents - rentrée 2025", "Atelier communication pictos"],
    });
    await queryInterface.bulkDelete("reglements", {
      version: ["v2025.1"],
    });
    await queryInterface.bulkDelete("documents", {
      titre: ["Règlement intérieur 2025", "Guide d'accueil des familles"],
    });
  },
};
