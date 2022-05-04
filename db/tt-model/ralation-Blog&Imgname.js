/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { STRING , INTEGER} = require('../types')
 
 
 const BlogImgname = seq.define('BlogImgname', {
     id: {
         type: INTEGER,
         primaryKey: true,
         allowNull: false,
         autoIncrement: true
     },
     imgname_id: {
         type: INTEGER,
         allowNull: false
     },
     blog_id: {
         type: INTEGER,
         allowNull: false
     }
 })
 
 module.exports = BlogImgname