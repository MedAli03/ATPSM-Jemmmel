const { DataTypes } = require('sequelize');
module.exports = (sequelize) =>
  sequelize.define(
    'EvaluationProjet',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_evaluation: { type: DataTypes.DATEONLY, allowNull: false },
      score: { type: DataTypes.INTEGER, allowNull: true },
      grille: { type: DataTypes.JSON, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'evaluation_projet',
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ['projet_id'] }],
    }
  );
