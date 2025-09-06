const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Document', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  type: { type: DataTypes.ENUM('reglement','autre'), defaultValue: 'autre' },
  titre: DataTypes.STRING(200),
  url: DataTypes.STRING(255),
  statut: { type: DataTypes.ENUM('brouillon','publie'), defaultValue: 'publie' }
}, { tableName: 'documents', underscored: true, timestamps: true });
