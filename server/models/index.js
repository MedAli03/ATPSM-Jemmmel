// models/index.js
"use strict";

const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

/**
 * ---- Connection ----
 * Required env:
 *  DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
 * Optional:
 *  SEQ_LOG_SQL=1 (enable SQL logs)
 *  SEQ_LOG_CONNECT=1 (print successful connect)
 *  SEQ_DEBUG_MODELS=1 (print loaded models)
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: process.env.SEQ_LOG_SQL === "1" ? console.log : false,
    define: {
      // expect created_at / updated_at everywhere
      underscored: true,
      // don't pluralize table names
      freezeTableName: true,
      // ensure timestamps columns exist
      timestamps: true,
    },
    timezone: "+00:00",
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: Number(process.env.SEQ_POOL_MAX || 10),
      min: Number(process.env.SEQ_POOL_MIN || 0),
      acquire: Number(process.env.SEQ_POOL_ACQUIRE || 30000),
      idle: Number(process.env.SEQ_POOL_IDLE || 10000),
    },
  }
);

// ---- Load model factories (each should export (sequelize, DataTypes) => Model) ----
const Utilisateur = require("./utilisateur")(sequelize, DataTypes);
const Enfant = require("./enfant")(sequelize, DataTypes);
const FicheEnfant = require("./fiche_enfant")(sequelize, DataTypes);
const ParentsFiche = require("./parents_fiche")(sequelize, DataTypes);
const AnneeScolaire = require("./annee_scolaire")(sequelize, DataTypes);
const Groupe = require("./group")(sequelize, DataTypes);
const InscriptionEnfant = require("./inscription_enfant")(sequelize, DataTypes);
const AffectationEducateur = require("./affectation_educateur")(
  sequelize,
  DataTypes
);
const ObservationInitiale = require("./observation_initiale")(
  sequelize,
  DataTypes
);
const PEI = require("./projet_educatif_individuel")(sequelize, DataTypes);
const ActiviteProjet = require("./activite_projet")(sequelize, DataTypes);
const DailyNote = require("./daily_note")(sequelize, DataTypes);
const EvaluationProjet = require("./evaluation_projet")(sequelize, DataTypes);
const RecoAI = require("./recommendation_ai")(sequelize, DataTypes);
const RecoAIObjectif = require("./recommendation_ai_objectif")(
  sequelize,
  DataTypes
);
const RecoAIActivite = require("./recommendation_ai_activite")(
  sequelize,
  DataTypes
);
const HistoriqueProjet = require("./historique_projet")(sequelize, DataTypes);
const Document = require("./document")(sequelize, DataTypes);
const Reglement = require("./reglement")(sequelize, DataTypes);
const Evenement = require("./evenement")(sequelize, DataTypes);
const Actualite = require("./actualite")(sequelize, DataTypes);
const Thread = require("./thread")(sequelize, DataTypes);
const Message = require("./message")(sequelize, DataTypes);
const Notification = require("./notification")(sequelize, DataTypes);

/* -------------------------------------------------------------------------- */
/*                             ASSOCIATIONS INLINE                            */
/* -------------------------------------------------------------------------- */

// Utilisateur (parent) -> enfants
Utilisateur.hasMany(Enfant, { as: "enfants", foreignKey: "parent_user_id" });
Enfant.belongsTo(Utilisateur, { as: "parent", foreignKey: "parent_user_id" });

// Enfant -> FicheEnfant (1:1)
Enfant.hasOne(FicheEnfant, { as: "fiche", foreignKey: "enfant_id" });
FicheEnfant.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });

// Enfant -> ParentsFiche (1:1)
Enfant.hasOne(ParentsFiche, { as: "parents", foreignKey: "enfant_id" });
ParentsFiche.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });

// Année -> Groupes
AnneeScolaire.hasMany(Groupe, { as: "groupes", foreignKey: "annee_id" });
Groupe.belongsTo(AnneeScolaire, { as: "annee", foreignKey: "annee_id" });

// Utilisateur (manager) -> Groupes (si votre modèle 'group' a manager_id)
// Utilisateur.hasMany(Groupe, { as: "groupes_crees", foreignKey: "manager_id" });
// Groupe.belongsTo(Utilisateur, { as: "manager", foreignKey: "manager_id" });

// Inscriptions (groupe<->enfant/année)
Groupe.hasMany(InscriptionEnfant, {
  as: "inscriptions",
  foreignKey: "groupe_id",
});
InscriptionEnfant.belongsTo(Groupe, { as: "groupe", foreignKey: "groupe_id" });

Enfant.hasMany(InscriptionEnfant, {
  as: "inscriptions",
  foreignKey: "enfant_id",
});
InscriptionEnfant.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });

AnneeScolaire.hasMany(InscriptionEnfant, {
  as: "inscriptions",
  foreignKey: "annee_id",
});
InscriptionEnfant.belongsTo(AnneeScolaire, {
  as: "annee",
  foreignKey: "annee_id",
});

// Affectations (groupe<->educateur/année)
Groupe.hasMany(AffectationEducateur, {
  as: "affectations",
  foreignKey: "groupe_id",
});
AffectationEducateur.belongsTo(Groupe, {
  as: "groupe",
  foreignKey: "groupe_id",
});

Utilisateur.hasMany(AffectationEducateur, {
  as: "affectations",
  foreignKey: "educateur_id",
});
AffectationEducateur.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});

AnneeScolaire.hasMany(AffectationEducateur, {
  as: "affectations",
  foreignKey: "annee_id",
});
AffectationEducateur.belongsTo(AnneeScolaire, {
  as: "annee",
  foreignKey: "annee_id",
});

// Observation initiale
ObservationInitiale.belongsTo(Enfant, {
  as: "enfant",
  foreignKey: "enfant_id",
});
ObservationInitiale.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});
Enfant.hasMany(ObservationInitiale, {
  as: "observations_initiales",
  foreignKey: "enfant_id",
});
Utilisateur.hasMany(ObservationInitiale, {
  as: "observations_initiales",
  foreignKey: "educateur_id",
});

// PEI
PEI.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
PEI.belongsTo(Utilisateur, { as: "educateur", foreignKey: "educateur_id" });
PEI.belongsTo(AnneeScolaire, { as: "annee", foreignKey: "annee_id" });
PEI.belongsTo(PEI, { as: "precedent", foreignKey: "precedent_projet_id" });
Enfant.hasMany(PEI, { as: "peis", foreignKey: "enfant_id" });
Utilisateur.hasMany(PEI, { as: "peis", foreignKey: "educateur_id" });
AnneeScolaire.hasMany(PEI, { as: "peis", foreignKey: "annee_id" });

// Activités & Notes
ActiviteProjet.belongsTo(PEI, { as: "projet", foreignKey: "projet_id" });
ActiviteProjet.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});
ActiviteProjet.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
PEI.hasMany(ActiviteProjet, { as: "activites", foreignKey: "projet_id" });

DailyNote.belongsTo(PEI, { as: "projet", foreignKey: "projet_id" });
DailyNote.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});
DailyNote.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
PEI.hasMany(DailyNote, { as: "notes", foreignKey: "projet_id" });

// Évaluation
EvaluationProjet.belongsTo(PEI, { as: "projet", foreignKey: "projet_id" });
EvaluationProjet.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});
PEI.hasMany(EvaluationProjet, { as: "evaluations", foreignKey: "projet_id" });

// Recommandation IA
RecoAI.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
RecoAI.belongsTo(Utilisateur, { as: "educateur", foreignKey: "educateur_id" });
RecoAI.belongsTo(EvaluationProjet, {
  as: "evaluation",
  foreignKey: "evaluation_id",
});
RecoAI.belongsTo(PEI, { as: "source", foreignKey: "projet_source_id" });
RecoAI.belongsTo(PEI, { as: "cible", foreignKey: "projet_cible_id" });
Enfant.hasMany(RecoAI, { as: "recommandations", foreignKey: "enfant_id" });
Utilisateur.hasMany(RecoAI, {
  as: "recommandations",
  foreignKey: "educateur_id",
});

RecoAIObjectif.belongsTo(RecoAI, {
  as: "reco",
  foreignKey: "recommendation_id",
});
RecoAI.hasMany(RecoAIObjectif, {
  as: "objectifs",
  foreignKey: "recommendation_id",
});

RecoAIActivite.belongsTo(RecoAI, {
  as: "reco",
  foreignKey: "recommendation_id",
});
RecoAI.hasMany(RecoAIActivite, {
  as: "activites",
  foreignKey: "recommendation_id",
});
RecoAIActivite.belongsTo(ActiviteProjet, {
  as: "created_activite",
  foreignKey: "created_activite_id",
});

// Historique PEI
HistoriqueProjet.belongsTo(PEI, { as: "projet", foreignKey: "projet_id" });
HistoriqueProjet.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});
PEI.hasMany(HistoriqueProjet, { as: "historiques", foreignKey: "projet_id" });

// Documents / Règlements / Événements / Actualités
Document.belongsTo(Utilisateur, { as: "admin", foreignKey: "admin_id" });
Utilisateur.hasMany(Document, { as: "documents", foreignKey: "admin_id" });

Reglement.belongsTo(Document, { as: "document", foreignKey: "document_id" });
Document.hasMany(Reglement, { as: "reglements", foreignKey: "document_id" });

Evenement.belongsTo(Document, { as: "document", foreignKey: "document_id" });
Evenement.belongsTo(Utilisateur, { as: "admin", foreignKey: "admin_id" });
Utilisateur.hasMany(Evenement, { as: "evenements", foreignKey: "admin_id" });

Actualite.belongsTo(Utilisateur, { as: "admin", foreignKey: "admin_id" });
Utilisateur.hasMany(Actualite, { as: "actualites", foreignKey: "admin_id" });

// Messagerie
Thread.belongsTo(Utilisateur, { as: "creator", foreignKey: "created_by" });
Utilisateur.hasMany(Thread, { as: "threads_crees", foreignKey: "created_by" });

Thread.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
Enfant.hasMany(Thread, { as: "threads", foreignKey: "enfant_id" });

Message.belongsTo(Thread, { as: "thread", foreignKey: "thread_id" });
Thread.hasMany(Message, { as: "messages", foreignKey: "thread_id" });

Message.belongsTo(Utilisateur, {
  as: "expediteur",
  foreignKey: "expediteur_id",
});
Utilisateur.hasMany(Message, {
  as: "messages_envoyes",
  foreignKey: "expediteur_id",
});

// Notifications
Notification.belongsTo(Utilisateur, {
  as: "utilisateur",
  foreignKey: "utilisateur_id",
});
Utilisateur.hasMany(Notification, {
  as: "notifications",
  foreignKey: "utilisateur_id",
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                   */
/* -------------------------------------------------------------------------- */

const db = {
  sequelize,
  Sequelize,
  Utilisateur,
  Enfant,
  FicheEnfant,
  ParentsFiche,
  AnneeScolaire,
  Groupe,
  InscriptionEnfant,
  AffectationEducateur,
  ObservationInitiale,
  PEI,
  ActiviteProjet,
  DailyNote,
  EvaluationProjet,
  RecoAI,
  RecoAIObjectif,
  RecoAIActivite,
  HistoriqueProjet,
  Document,
  Reglement,
  Evenement,
  Actualite,
  Thread,
  Message,
  Notification,
};

// Optional: print loaded models once (helps debug name mismatches)
if (process.env.SEQ_DEBUG_MODELS === "1") {
  // eslint-disable-next-line no-console
  console.log(
    "Loaded models:",
    Object.keys(db)
      .filter((k) => !["sequelize", "Sequelize"].includes(k))
      .sort()
  );
}

// Optional: test connection once at boot
(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.SEQ_LOG_CONNECT === "1") {
      // eslint-disable-next-line no-console
      console.log("✅ DB connection OK");
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ DB connection error:", err.message);
  }
})();

module.exports = db;
