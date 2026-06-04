const sequelize = require('../config/database');
const User = require('./User');
const Doador = require('./Doador');
const Alimento = require('./Alimento');

// Relacionamentos
Doador.hasMany(Alimento);
Alimento.belongsTo(Doador);

User.hasMany(Alimento);
Alimento.belongsTo(User);

module.exports = {
    sequelize,
    User,
    Doador,
    Alimento
};