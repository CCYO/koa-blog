/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING , INTEGER} = require('../types')


const User = seq.define('User', {
    name: {
        type: STRING,
        allowNull: false
    }
})

module.exports = User