/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING, INTEGER } = require('../types')


const BlogImg = seq.define('BlogImg', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    imgId: {
        type: INTEGER,
        allowNull: false,
    },
    blogId: {
        type: INTEGER,
        allowNull: false,
    },
    name: {
        type: STRING,
        allowNull: true
    }
})

module.exports = BlogImg