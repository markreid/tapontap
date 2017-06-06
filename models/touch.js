/**
 * Touch model.
 */

module.exports = (sequelize, DataTypes) => sequelize.define('Touch', {
  id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  cardUid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  synced: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  kegId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
