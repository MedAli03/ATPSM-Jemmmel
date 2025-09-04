"use strict";
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, dialect: "mysql", logging: false }
);

// ---- MODELS (import order doesn’t matter; associations set below)
const Role = require("./role")(sequelize, DataTypes);
const User = require("./user")(sequelize, DataTypes);
const ParentProfile = require("./parentProfile")(sequelize, DataTypes);

const Child = require("./child")(sequelize, DataTypes);
const ChildRecord = require("./childRecord")(sequelize, DataTypes);
const InitialObservation = require("./initialObservation")(
  sequelize,
  DataTypes
);

const PEI = require("./pei")(sequelize, DataTypes);
const ProjectActivity = require("./projectActivity")(sequelize, DataTypes);
const DailyNote = require("./dailyNote")(sequelize, DataTypes);
const ProjectEvaluation = require("./projectEvaluation")(sequelize, DataTypes);
const AiRecommendation = require("./aiRecommendation")(sequelize, DataTypes);
const ProjectHistory = require("./projectHistory")(sequelize, DataTypes);

const Group = require("./group")(sequelize, DataTypes);
const GroupMember = require("./groupMember")(sequelize, DataTypes);

const MessageThread = require("./messageThread")(sequelize, DataTypes);
const Message = require("./message")(sequelize, DataTypes);
const Notification = require("./notification")(sequelize, DataTypes);

const Document = require("./document")(sequelize, DataTypes);
const Event = require("./event")(sequelize, DataTypes);
const News = require("./news")(sequelize, DataTypes);

// ---- ASSOCIATIONS

// RBAC
Role.hasMany(User, { as: "users", foreignKey: "roleId" });
User.belongsTo(Role, { as: "role", foreignKey: "roleId" });

// Parent profile (extra info for parent users)
User.hasOne(ParentProfile, { as: "parentProfile", foreignKey: "userId" });
ParentProfile.belongsTo(User, { as: "user", foreignKey: "userId" });

// Family
User.hasMany(Child, { as: "children", foreignKey: "guardianId" }); // parent → children
Child.belongsTo(User, { as: "guardian", foreignKey: "guardianId" });

Child.hasOne(ChildRecord, { as: "record", foreignKey: "childId" });
ChildRecord.belongsTo(Child, { as: "child", foreignKey: "childId" });

// Pedagogy
User.hasMany(InitialObservation, {
  as: "initialObservations",
  foreignKey: "authorId",
}); // educator
InitialObservation.belongsTo(User, { as: "author", foreignKey: "authorId" });
Child.hasMany(InitialObservation, {
  as: "initialObservations",
  foreignKey: "childId",
});
InitialObservation.belongsTo(Child, { as: "child", foreignKey: "childId" });

Child.hasMany(PEI, { as: "peis", foreignKey: "childId" });
PEI.belongsTo(Child, { as: "child", foreignKey: "childId" });

PEI.hasMany(ProjectActivity, { as: "activities", foreignKey: "peiId" });
ProjectActivity.belongsTo(PEI, { as: "pei", foreignKey: "peiId" });

User.hasMany(DailyNote, { as: "authoredNotes", foreignKey: "authorId" }); // educator
DailyNote.belongsTo(User, { as: "author", foreignKey: "authorId" });
Child.hasMany(DailyNote, { as: "notes", foreignKey: "childId" });
DailyNote.belongsTo(Child, { as: "child", foreignKey: "childId" });
ProjectActivity.hasMany(DailyNote, {
  as: "activityNotes",
  foreignKey: "activityId",
});
DailyNote.belongsTo(ProjectActivity, {
  as: "activity",
  foreignKey: "activityId",
});

// Evaluation + AI
PEI.hasMany(ProjectEvaluation, { as: "evaluations", foreignKey: "peiId" });
ProjectEvaluation.belongsTo(PEI, { as: "pei", foreignKey: "peiId" });
ProjectActivity.hasMany(ProjectEvaluation, {
  as: "activityEvaluations",
  foreignKey: "activityId",
});
ProjectEvaluation.belongsTo(ProjectActivity, {
  as: "activity",
  foreignKey: "activityId",
});

Child.hasMany(AiRecommendation, { as: "aiRecs", foreignKey: "childId" });
AiRecommendation.belongsTo(Child, { as: "child", foreignKey: "childId" });
User.hasMany(AiRecommendation, {
  as: "aiRecsReviewed",
  foreignKey: "reviewedById",
}); // educator who validated/ignored
AiRecommendation.belongsTo(User, {
  as: "reviewedBy",
  foreignKey: "reviewedById",
});
PEI.hasMany(AiRecommendation, { as: "aiRecsForPei", foreignKey: "peiId" });
AiRecommendation.belongsTo(PEI, { as: "pei", foreignKey: "peiId" });

// Project history
PEI.hasMany(ProjectHistory, { as: "history", foreignKey: "peiId" });
ProjectHistory.belongsTo(PEI, { as: "pei", foreignKey: "peiId" });
User.hasMany(ProjectHistory, { as: "historyAuthored", foreignKey: "authorId" });
ProjectHistory.belongsTo(User, { as: "author", foreignKey: "authorId" });

// Groups
Group.belongsTo(User, { as: "educator", foreignKey: "educatorId" });
GroupMember.belongsTo(Group, { as: "group", foreignKey: "groupId" });
Child.hasMany(GroupMember, { as: "groupMemberships", foreignKey: "childId" });
GroupMember.belongsTo(Child, { as: "child", foreignKey: "childId" });
User.hasOne(Group, { as: "groupLed", foreignKey: "educatorId" }); // 👈 was hasMany
// Comms
MessageThread.hasMany(Message, { as: "messages", foreignKey: "threadId" });
Message.belongsTo(MessageThread, { as: "thread", foreignKey: "threadId" });
User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Child.hasMany(MessageThread, { as: "threads", foreignKey: "childId" });
MessageThread.belongsTo(Child, { as: "child", foreignKey: "childId" }); // optional child context

// Notifications
User.hasMany(Notification, { as: "notifications", foreignKey: "userId" });
Notification.belongsTo(User, { as: "user", foreignKey: "userId" });

// Documents / Events / News
User.hasMany(Document, { as: "documents", foreignKey: "ownerUserId" });
Document.belongsTo(User, { as: "owner", foreignKey: "ownerUserId" });
Child.hasMany(Document, { as: "childDocuments", foreignKey: "childId" });
Document.belongsTo(Child, { as: "child", foreignKey: "childId" });

User.hasMany(Event, { as: "eventsAuthored", foreignKey: "authorId" });
Event.belongsTo(User, { as: "author", foreignKey: "authorId" });

User.hasMany(News, { as: "newsAuthored", foreignKey: "authorId" });
News.belongsTo(User, { as: "author", foreignKey: "authorId" });

// Export
module.exports = {
  sequelize,
  Sequelize,
  Role,
  User,
  ParentProfile,
  Child,
  ChildRecord,
  InitialObservation,
  PEI,
  ProjectActivity,
  DailyNote,
  ProjectEvaluation,
  AiRecommendation,
  ProjectHistory,
  Group,
  GroupMember,
  MessageThread,
  Message,
  Notification,
  Document,
  Event,
  News,
};
