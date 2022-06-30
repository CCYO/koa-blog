/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')

const Follow_Blog = seq.define('Follow_Blog', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    blog_id: {
        type: INTEGER
    },
    follower_id: {
        type: INTEGER
    },
    confirm: {
        type: BOO,
        defaultValue: false
    }
})

module.exports = Follow_Blog