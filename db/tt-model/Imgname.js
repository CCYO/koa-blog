/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { STRING , INTEGER} = require('../types')
 
 
 const Imgname = seq.define('Imgname', {
     name: {
         type: STRING,
         allowNull: false
     },
     img_id: {
         type: INTEGER,
         allowNull: false
     }
 })
 
 module.exports = Imgname