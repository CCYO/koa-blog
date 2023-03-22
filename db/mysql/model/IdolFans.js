/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')


const IdolFans = seq.define('IdolFans', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    target: {
        type: INTEGER,
        allowNull: false,
    },
    follow: {
        type: INTEGER,
        allowNull: false,
    },
    confirm: {
        type: BOO,
        defaultValue: false
    }
},{
    paranoid: true
})

module.exports = IdolFans