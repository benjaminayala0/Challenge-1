const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('challenge_db1', 'soporte', '123', {
  host: 'localhost',
  dialect: 'postgres', 
  logging: false, 
});

module.exports = { sequelize };