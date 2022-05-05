/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { STRING , INTEGER} = require('../types')
 
 
 const Blog = seq.define('Blog', {
     name: {
         type: STRING,
         allowNull: false
     },
     user_id: {
         type: INTEGER
     }
 })
 
 module.exports = Blog