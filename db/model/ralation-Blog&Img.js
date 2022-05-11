/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { STRING , INTEGER} = require('../types')
 
 
 const BlogImg = seq.define('BlogImg', {
     id: {
         type: INTEGER,
         primaryKey: true,
         allowNull: false,
         autoIncrement: true
     },
     img_id: {
         type: INTEGER,
         allowNull: false
     },
     blog_id: {
         type: INTEGER,
         allowNull: false
     },
     alt: {
         type: STRING,
         allowNull: true
     },
     href: {
         type: STRING,
         allowNull: true
     }
 })
 
 module.exports = BlogImg