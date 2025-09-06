const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('ActiviteProjet', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_activite: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  titre: DataTypes.STRING(150),
  description: DataTypes.TEXT,
  objectifs: DataTypes.TEXT,
  type: { type: DataTypes.ENUM('atelier','jeu','reco','autre'), defaultValue: 'autre' }
}, { tableName: 'activite_projet', underscored: true, timestamps: true });
