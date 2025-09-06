"use strict";
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, dialect: "mysql", logging: false }
);

// Import models
const Utilisateur = require("./utilisateur")(sequelize);
const Enfant = require("./enfant")(sequelize);
const FicheEnfant = require("./fiche_enfant")(sequelize);
const ParentsFiche = require("./parents_fiche")(sequelize);
const AnneeScolaire = require("./annee_scolaire")(sequelize);
const Groupe = require("./group")(sequelize);
const InscriptionEnfant = require("./inscription_enfant")(sequelize);
const AffectationEducateur = require("./affectation_educateur")(sequelize);
const ObservationInitiale = require("./observation_initiale")(sequelize);
const PEI = require("./projet_educatif_individuel")(sequelize);
const ActiviteProjet = require("./activite_projet")(sequelize);
const DailyNote = require("./daily_note")(sequelize);
const EvaluationProjet = require("./evaluation_projet")(sequelize);
const RecoAI = require("./recommendation_ai")(sequelize);
const RecoAIObjectif = require("./recommendation_ai_objectif")(sequelize);
const RecoAIActivite = require("./recommendation_ai_activite")(sequelize);
const HistoriqueProjet = require("./historique_projet")(sequelize);
const Document = require("./document")(sequelize);
const Reglement = require("./reglement")(sequelize);
const Evenement = require("./evenement")(sequelize);
const Actualite = require("./actualite")(sequelize);
const Thread = require("./thread")(sequelize);
const Message = require("./message")(sequelize);
const Notification = require("./notification")(sequelize);

/* -------------------- ASSOCIATIONS -------------------- */

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

// Utilisateur (manager) -> Groupes
Utilisateur.hasMany(Groupe, { as: "groupes_crees", foreignKey: "manager_id" });
Groupe.belongsTo(Utilisateur, { as: "manager", foreignKey: "manager_id" });

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

// Affectations (groupe<->educateur/année) – 1 groupe = 1 éducateur / an
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

// Reco IA
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

module.exports = {
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
