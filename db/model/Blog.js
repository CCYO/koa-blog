/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { STRING , INTEGER} = require('../types')
 
 
 const Blog = seq.define('Blog', {
     title: {
         type: STRING,
         allowNull: false
     },
     user_id: {
         type: INTEGER
     },
     html: {
         type: STRING,
         allowNull: true
     }
 })
 
 module.exports = Blog