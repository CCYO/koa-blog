/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')

const Blog_Follow = seq.define('Blog_Follow', {
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

module.exports = Blog_Follow