/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING, INTEGER } = require('../types')


const BlogImgAlt = seq.define('BlogImgAlt', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    blogImg_id: {
        type: INTEGER,
        allowNull: false,
    },
    alt: {
        type: STRING,
        allowNull: true
    }
})

module.exports = BlogImgAlt