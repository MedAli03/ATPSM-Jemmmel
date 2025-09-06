const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('PEI', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_creation: { type: DataTypes.DATEONLY, allowNull: false },
  objectifs: DataTypes.TEXT,
  statut: { type: DataTypes.ENUM('brouillon','actif','clos'), defaultValue: 'brouillon' },
  precedent_projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  date_derniere_maj: DataTypes.DATE
}, { tableName: 'projet_educatif_individuel', underscored: true, timestamps: true });
