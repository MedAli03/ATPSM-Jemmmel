const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Utilisateur",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
      telephone: { type: DataTypes.STRING(50), allowNull: true },
      role: {
        type: DataTypes.ENUM(
          "PRESIDENT",
          "DIRECTEUR",
          "EDUCATEUR",
          "PARENT"
        ),
        allowNull: false,
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      avatar_url: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: "utilisateurs", underscored: true, timestamps: true }
  );
