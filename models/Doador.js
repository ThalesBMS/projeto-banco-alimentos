const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doador = sequelize.define('Doador', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: DataTypes.STRING,
    endereco: DataTypes.STRING
}, {
    tableName: 'doadores'
});

module.exports = Doador;