const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Metadata = sequelize.define('Metadata', {
  key: {
    type: DataTypes.STRING,
    field: 'key_name',
    primaryKey: true
  },
  value: {
    type: DataTypes.STRING,
    field: 'value_text'
  }
}, {
  tableName: 'metadata',
  timestamps: false
});

module.exports = Metadata;
