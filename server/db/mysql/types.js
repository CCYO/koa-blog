/**
 * @description Sequelize DataTypes
 */

const { DataTypes, Sequelize } = require('sequelize')

module.exports =  {
    NOW: Sequelize.NOW,
    DATE: Sequelize.DATE,
    STRING: DataTypes.STRING,
    TEXT: DataTypes.TEXT,
    INTEGER: DataTypes.INTEGER,
    BOO: DataTypes.BOOLEAN,
    DATE: DataTypes.DATE
}