/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { INTEGER, BOO} = require('../types')
  
 const Blog_Fans = seq.define('Blog_Fans', {
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