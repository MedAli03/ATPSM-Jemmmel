"use strict";

const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

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
      underscored: true,
      freezeTableName: true,
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

const Utilisateur = require("./utilisateur")(sequelize, DataTypes);
const UtilisateurSession = require("./utilisateur_session")(sequelize, DataTypes);
const Enfant = require("./enfant")(sequelize, DataTypes);
const FicheEnfant = require("./fiche_enfant")(sequelize, DataTypes);
const ParentsFiche = require("./parents_fiche")(sequelize, DataTypes);
const ParentsEnfant = require("./parents_enfant")(sequelize, DataTypes);
const AnneeScolaire = require("./annee_scolaire")(sequelize, DataTypes);
const Groupe = require("./group")(sequelize, DataTypes);
const GroupeAnnee = require("./groupe_annee")(sequelize, DataTypes);
const AffectationEducateur = require("./affectation_educateur")(sequelize, DataTypes);
const InscriptionEnfant = require("./inscription_enfant")(sequelize, DataTypes);
const ObservationInitiale = require("./observation_initiale")(sequelize, DataTypes);
const PeiVersion = require("./pei_version")(sequelize, DataTypes);
const PeiObjectif = require("./pei_objectif")(sequelize, DataTypes);
const PeiActivite = require("./pei_activite")(sequelize, DataTypes);
const PeiEvaluation = require("./pei_evaluation")(sequelize, DataTypes);
const PeiHistoryLog = require("./pei_history_log")(sequelize, DataTypes);
const DailyNote = require("./daily_note")(sequelize, DataTypes);
const Thread = require("./thread")(sequelize, DataTypes);
const ThreadParticipant = require("./thread_participant")(sequelize, DataTypes);
const Message = require("./message")(sequelize, DataTypes);
const MessageAttachment = require("./message_attachment")(sequelize, DataTypes);
const MessageReadReceipt = require("./message_read_receipt")(sequelize, DataTypes);
const Attachment = require("./attachment")(sequelize, DataTypes);
const Notification = require("./notification")(sequelize, DataTypes);
const Document = require("./document")(sequelize, DataTypes);
const DocumentRole = require("./document_role")(sequelize, DataTypes);
const DocumentGroupe = require("./document_groupe")(sequelize, DataTypes);
const DocumentEnfant = require("./document_enfant")(sequelize, DataTypes);

/* -------------------------------------------------------------------------- */
/*                               CORE RELATIONS                               */
/* -------------------------------------------------------------------------- */

Utilisateur.hasMany(UtilisateurSession, {
  as: "sessions",
  foreignKey: "utilisateur_id",
});
UtilisateurSession.belongsTo(Utilisateur, {
  as: "utilisateur",
  foreignKey: "utilisateur_id",
});

Utilisateur.hasMany(Enfant, { as: "enfants_crees", foreignKey: "created_by" });
Enfant.belongsTo(Utilisateur, { as: "createur", foreignKey: "created_by" });

Enfant.hasOne(FicheEnfant, { as: "fiche", foreignKey: "enfant_id" });
FicheEnfant.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });

Enfant.hasOne(ParentsFiche, { as: "fiche_parents", foreignKey: "enfant_id" });
ParentsFiche.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });

Utilisateur.belongsToMany(Enfant, {
  through: ParentsEnfant,
  as: "enfants",
  foreignKey: "parent_id",
  otherKey: "enfant_id",
});
Enfant.belongsToMany(Utilisateur, {
  through: ParentsEnfant,
  as: "parents",
  foreignKey: "enfant_id",
  otherKey: "parent_id",
});
ParentsEnfant.belongsTo(Utilisateur, { as: "parent", foreignKey: "parent_id" });
ParentsEnfant.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });

AnneeScolaire.hasMany(GroupeAnnee, { as: "groupes_annees", foreignKey: "annee_id" });
GroupeAnnee.belongsTo(AnneeScolaire, { as: "annee", foreignKey: "annee_id" });

Groupe.hasMany(GroupeAnnee, { as: "assignations", foreignKey: "groupe_id" });
GroupeAnnee.belongsTo(Groupe, { as: "groupe", foreignKey: "groupe_id" });

Utilisateur.hasMany(GroupeAnnee, { as: "groupes_diriges", foreignKey: "educateur_id" });
GroupeAnnee.belongsTo(Utilisateur, { as: "educateur", foreignKey: "educateur_id" });

GroupeAnnee.hasMany(AffectationEducateur, {
  as: "affectations",
  foreignKey: "groupe_annee_id",
});
AffectationEducateur.belongsTo(GroupeAnnee, {
  as: "groupe_annee",
  foreignKey: "groupe_annee_id",
});
Utilisateur.hasMany(AffectationEducateur, {
  as: "affectations",
  foreignKey: "educateur_id",
});
AffectationEducateur.belongsTo(Utilisateur, {
  as: "educateur",
  foreignKey: "educateur_id",
});

GroupeAnnee.hasMany(InscriptionEnfant, {
  as: "inscriptions",
  foreignKey: "groupe_annee_id",
});
InscriptionEnfant.belongsTo(GroupeAnnee, {
  as: "groupe_annee",
  foreignKey: "groupe_annee_id",
});
Enfant.hasMany(InscriptionEnfant, { as: "inscriptions", foreignKey: "enfant_id" });
InscriptionEnfant.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
AnneeScolaire.hasMany(InscriptionEnfant, { as: "inscriptions", foreignKey: "annee_id" });
InscriptionEnfant.belongsTo(AnneeScolaire, { as: "annee", foreignKey: "annee_id" });

ObservationInitiale.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
ObservationInitiale.belongsTo(AnneeScolaire, { as: "annee", foreignKey: "annee_id" });
ObservationInitiale.belongsTo(Utilisateur, { as: "educateur", foreignKey: "educateur_id" });
Enfant.hasMany(ObservationInitiale, {
  as: "observations_initiales",
  foreignKey: "enfant_id",
});
Utilisateur.hasMany(ObservationInitiale, {
  as: "observations_initiales",
  foreignKey: "educateur_id",
});

PeiVersion.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
Enfant.hasMany(PeiVersion, { as: "pei_versions", foreignKey: "enfant_id" });
PeiVersion.belongsTo(AnneeScolaire, { as: "annee", foreignKey: "annee_id" });
AnneeScolaire.hasMany(PeiVersion, { as: "pei_versions", foreignKey: "annee_id" });
PeiVersion.belongsTo(GroupeAnnee, { as: "groupe_annee", foreignKey: "groupe_annee_id" });
PeiVersion.belongsTo(ObservationInitiale, {
  as: "observation",
  foreignKey: "observation_id",
});
PeiVersion.belongsTo(Utilisateur, { as: "createur", foreignKey: "created_by" });
PeiVersion.belongsTo(PeiVersion, {
  as: "precedent",
  foreignKey: "previous_version_id",
});

PeiVersion.hasMany(PeiObjectif, {
  as: "objectifs",
  foreignKey: "pei_version_id",
});
PeiObjectif.belongsTo(PeiVersion, {
  as: "pei_version",
  foreignKey: "pei_version_id",
});
PeiObjectif.hasMany(PeiActivite, { as: "activites", foreignKey: "objectif_id" });
PeiActivite.belongsTo(PeiObjectif, { as: "objectif", foreignKey: "objectif_id" });
PeiActivite.belongsTo(Utilisateur, { as: "createur", foreignKey: "created_by" });

PeiVersion.hasMany(PeiEvaluation, {
  as: "evaluations",
  foreignKey: "pei_version_id",
});
PeiEvaluation.belongsTo(PeiVersion, {
  as: "pei_version",
  foreignKey: "pei_version_id",
});
PeiEvaluation.belongsTo(PeiObjectif, { as: "objectif", foreignKey: "objectif_id" });
PeiEvaluation.belongsTo(Utilisateur, { as: "educateur", foreignKey: "educateur_id" });

PeiVersion.hasMany(PeiHistoryLog, {
  as: "historique",
  foreignKey: "pei_version_id",
});
PeiHistoryLog.belongsTo(PeiVersion, {
  as: "pei_version",
  foreignKey: "pei_version_id",
});
PeiHistoryLog.belongsTo(Utilisateur, { as: "auteur", foreignKey: "performed_by" });

DailyNote.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
Enfant.hasMany(DailyNote, { as: "daily_notes", foreignKey: "enfant_id" });
DailyNote.belongsTo(Utilisateur, { as: "educateur", foreignKey: "educateur_id" });
Utilisateur.hasMany(DailyNote, { as: "daily_notes", foreignKey: "educateur_id" });
DailyNote.belongsTo(PeiVersion, { as: "pei_version", foreignKey: "pei_version_id" });
PeiVersion.hasMany(DailyNote, { as: "daily_notes", foreignKey: "pei_version_id" });
DailyNote.belongsTo(PeiObjectif, { as: "objectif", foreignKey: "pei_objectif_id" });
PeiObjectif.hasMany(DailyNote, { as: "daily_notes", foreignKey: "pei_objectif_id" });

Thread.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
Enfant.hasMany(Thread, { as: "threads", foreignKey: "enfant_id" });
Thread.belongsTo(Utilisateur, { as: "createur", foreignKey: "created_by" });
Utilisateur.hasMany(Thread, { as: "threads_crees", foreignKey: "created_by" });
Thread.belongsTo(Message, { as: "lastMessage", foreignKey: "last_message_id" });

Thread.hasMany(ThreadParticipant, {
  as: "participants",
  foreignKey: "thread_id",
  onDelete: "CASCADE",
});
ThreadParticipant.belongsTo(Thread, { as: "thread", foreignKey: "thread_id" });
ThreadParticipant.belongsTo(Utilisateur, { as: "user", foreignKey: "user_id" });
Utilisateur.hasMany(ThreadParticipant, {
  as: "thread_participations",
  foreignKey: "user_id",
});

Thread.hasMany(Message, { as: "messages", foreignKey: "thread_id" });
Message.belongsTo(Thread, { as: "thread", foreignKey: "thread_id" });
Message.belongsTo(Utilisateur, { as: "sender", foreignKey: "sender_id" });
Utilisateur.hasMany(Message, { as: "messages_envoyes", foreignKey: "sender_id" });

Message.hasMany(MessageReadReceipt, {
  as: "readReceipts",
  foreignKey: "message_id",
});
MessageReadReceipt.belongsTo(Message, {
  as: "message",
  foreignKey: "message_id",
});
MessageReadReceipt.belongsTo(Utilisateur, {
  as: "user",
  foreignKey: "user_id",
});
Utilisateur.hasMany(MessageReadReceipt, {
  as: "message_read_receipts",
  foreignKey: "user_id",
});

Attachment.belongsTo(Utilisateur, { as: "uploader", foreignKey: "uploader_id" });
Utilisateur.hasMany(Attachment, { as: "attachments", foreignKey: "uploader_id" });

Message.belongsToMany(Attachment, {
  through: MessageAttachment,
  as: "attachments",
  foreignKey: "message_id",
  otherKey: "attachment_id",
});
Attachment.belongsToMany(Message, {
  through: MessageAttachment,
  as: "messages",
  foreignKey: "attachment_id",
  otherKey: "message_id",
});

Notification.belongsTo(Utilisateur, {
  as: "utilisateur",
  foreignKey: "utilisateur_id",
});
Utilisateur.hasMany(Notification, {
  as: "notifications",
  foreignKey: "utilisateur_id",
});

Document.belongsTo(Utilisateur, { as: "auteur", foreignKey: "created_by" });
Utilisateur.hasMany(Document, { as: "documents", foreignKey: "created_by" });
Document.hasMany(DocumentRole, { as: "roles", foreignKey: "document_id" });
DocumentRole.belongsTo(Document, { as: "document", foreignKey: "document_id" });
Document.hasMany(DocumentGroupe, { as: "groupes", foreignKey: "document_id" });
DocumentGroupe.belongsTo(Document, { as: "document", foreignKey: "document_id" });
DocumentGroupe.belongsTo(Groupe, { as: "groupe", foreignKey: "groupe_id" });
Groupe.hasMany(DocumentGroupe, { as: "documents", foreignKey: "groupe_id" });
Document.hasMany(DocumentEnfant, { as: "enfants", foreignKey: "document_id" });
DocumentEnfant.belongsTo(Document, { as: "document", foreignKey: "document_id" });
DocumentEnfant.belongsTo(Enfant, { as: "enfant", foreignKey: "enfant_id" });
Enfant.hasMany(DocumentEnfant, { as: "documents", foreignKey: "enfant_id" });

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                   */
/* -------------------------------------------------------------------------- */

const db = {
  sequelize,
  Sequelize,
  Utilisateur,
  UtilisateurSession,
  Enfant,
  FicheEnfant,
  ParentsFiche,
  ParentsEnfant,
  AnneeScolaire,
  Groupe,
  GroupeAnnee,
  AffectationEducateur,
  InscriptionEnfant,
  ObservationInitiale,
  PeiVersion,
  PeiObjectif,
  PeiActivite,
  PeiEvaluation,
  PeiHistoryLog,
  DailyNote,
  Thread,
  ThreadParticipant,
  Message,
  MessageAttachment,
  MessageReadReceipt,
  Attachment,
  Notification,
  Document,
  DocumentRole,
  DocumentGroupe,
  DocumentEnfant,
};

if (process.env.SEQ_DEBUG_MODELS === "1") {
  // eslint-disable-next-line no-console
  console.log(
    "Loaded models:",
    Object.keys(db).filter((k) => !["sequelize", "Sequelize"].includes(k))
  );
}

module.exports = db;
