const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Utilisateur",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      prenom: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: true },
      },
      nom: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      username: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
        validate: { len: [3, 80] },
      },
      mot_de_passe: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telephone: { type: DataTypes.STRING(40), allowNull: true },
      role: {
        type: DataTypes.ENUM(
          "PRESIDENT",
          "DIRECTEUR",
          "EDUCATEUR",
          "PARENT",
          "VISITEUR"
        ),
        allowNull: false,
      },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      avatar_url: { type: DataTypes.STRING(500), allowNull: true },
      adresse: { type: DataTypes.STRING(500), allowNull: true },
      last_login: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "utilisateurs",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["role"] },
        { fields: ["is_active", "role"] },
      ],
    }
  );
