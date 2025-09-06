const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('HistoriqueProjet', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_modification: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ancien_objectifs: DataTypes.TEXT,
  ancien_statut: DataTypes.STRING(30),
  raison_modification: DataTypes.TEXT
}, { tableName: 'historique_projet', underscored: true, timestamps: true });
