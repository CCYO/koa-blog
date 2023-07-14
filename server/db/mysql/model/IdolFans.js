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
    idol_id: {
        type: INTEGER,
        allowNull: false,
    },
    fans_id: {
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