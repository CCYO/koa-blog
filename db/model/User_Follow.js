/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')


const User_Follow = seq.define('User_Follow', {
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
})

module.exports = User_Follow