/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')


const Follow = seq.define('Follow', {
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

module.exports = Follow