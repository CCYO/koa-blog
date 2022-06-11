/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')

const Blog_Fans = seq.define('Blog_Fans', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    blog_id: {
        type: INTEGER
    },
    fans_id: {
        type: INTEGER
    },
    confirm: {
        type: BOO,
        defaultValue: false
    }
})

module.exports = Blog_Fans