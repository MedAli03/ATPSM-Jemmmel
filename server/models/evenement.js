"use strict";

module.exports = (sequelize, DataTypes) => {
  const Evenement = sequelize.define(
    "evenements",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      document_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // optionnel (peut référencer un doc)
      admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      titre: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      debut: { type: DataTypes.DATE, allowNull: false },
      fin: { type: DataTypes.DATE, allowNull: false },
      audience: {
        type: DataTypes.ENUM("parents", "educateurs", "tous"),
        allowNull: false,
        defaultValue: "tous",
      },
      lieu: { type: DataTypes.STRING(200), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "evenements",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["admin_id"] },
        { fields: ["document_id"] },
        { fields: ["debut"] },
        { fields: ["fin"] },
        { fields: ["audience"] },
      ],
      validate: {
        datesCoherentes() {
          if (this.debut && this.fin && this.debut >= this.fin) {
            throw new Error("debut doit être < fin");
          }
        },
      },
    }
  );

  // Associations (si gérées dans models/index.js, ne pas dupliquer ici)
  // Evenement.belongsTo(models.Document, { as: "document", foreignKey: "document_id" });
  // Evenement.belongsTo(models.Utilisateur, { as: "admin", foreignKey: "admin_id" });

  return Evenement;
};
