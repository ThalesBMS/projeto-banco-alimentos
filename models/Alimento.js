const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alimento = sequelize.define('Alimento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantidade: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unidade: {
        type: DataTypes.ENUM('kg', 'unidade', 'litro'),
        defaultValue: 'kg'
    },
    data_validade: DataTypes.DATE,
    status: {
        type: DataTypes.ENUM('disponivel', 'distribuido', 'vencido'),
        defaultValue: 'disponivel'
    }
}, {
    tableName: 'alimentos'
});

module.exports = Alimento;