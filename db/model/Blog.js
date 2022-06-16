/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING, INTEGER, TEXT, BOO } = require('../types')


const Blog = seq.define('Blog', {
    title: {
        type: STRING(),
        allowNull: false
    },
    user_id: {
        type: INTEGER
    },
    html: {
        type: TEXT,
        allowNull: true
    },
    show: {
        type: BOO,
        defaultValue: false
    }
})

module.exports = Blog