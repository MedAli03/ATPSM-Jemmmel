const { DataTypes } = require('sequelize');
module.exports = (sequelize) =>
  sequelize.define(
    'ActiviteProjet',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_activite: { type: DataTypes.DATE, allowNull: true },
      titre: { type: DataTypes.STRING(150), allowNull: false },
      description: DataTypes.TEXT,
      objectifs: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM('atelier','jeu','autre'),
        allowNull: false,
        defaultValue: 'autre',
      }
    },
    { tableName: 'activite_projet', underscored: true, timestamps: true }
  );
