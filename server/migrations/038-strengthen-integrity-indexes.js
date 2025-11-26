"use strict";

const INSCRIPTIONS = "inscriptions_enfants";
const AFFECTATIONS = "affectations_educateurs";
const DAILY_NOTES = "daily_notes";
const NOTIFICATIONS = "notifications";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(INSCRIPTIONS, ["groupe_id", "annee_id"], {
      name: "idx_inscriptions_groupe_annee",
    });
    await queryInterface.addIndex(INSCRIPTIONS, ["enfant_id", "annee_id"], {
      name: "idx_inscriptions_enfant_annee",
    });

    await queryInterface.addIndex(AFFECTATIONS, ["educateur_id", "annee_id"], {
      name: "idx_affectations_educateur_annee",
    });
    await queryInterface.addIndex(AFFECTATIONS, ["groupe_id", "annee_id"], {
      name: "idx_affectations_groupe_annee",
    });

    await queryInterface.addIndex(DAILY_NOTES, ["projet_id", "date_note"], {
      name: "idx_daily_notes_projet_date",
    });
    await queryInterface.addIndex(DAILY_NOTES, ["enfant_id", "date_note"], {
      name: "idx_daily_notes_enfant_date",
    });

    await queryInterface.addIndex(NOTIFICATIONS, ["utilisateur_id", "lu_le"], {
      name: "idx_notifications_user_lu",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(NOTIFICATIONS, "idx_notifications_user_lu").catch(() => {});

    await queryInterface.removeIndex(DAILY_NOTES, "idx_daily_notes_enfant_date").catch(() => {});
    await queryInterface.removeIndex(DAILY_NOTES, "idx_daily_notes_projet_date").catch(() => {});

    await queryInterface.removeIndex(AFFECTATIONS, "idx_affectations_groupe_annee").catch(() => {});
    await queryInterface.removeIndex(AFFECTATIONS, "idx_affectations_educateur_annee").catch(() => {});

    await queryInterface.removeIndex(INSCRIPTIONS, "idx_inscriptions_enfant_annee").catch(() => {});
    await queryInterface.removeIndex(INSCRIPTIONS, "idx_inscriptions_groupe_annee").catch(() => {});
  },
};
