/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING, INTEGER, TEXT, BOO, DATE } = require('../types')


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
    },
    showAt: {
        type: DATE,
        allowNull: true
    }
})

module.exports = Blog