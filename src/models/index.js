const sequelize = require('../config/database');
const Country = require('./country');
const Metadata = require('./metadata');

module.exports = {
  sequelize,
  Country,
  Metadata
};