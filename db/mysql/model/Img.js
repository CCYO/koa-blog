/**
 * @description Sequelize Model
 */
 const seq = require('../seq')
 const { STRING , INTEGER} = require('../types')
 
 
 const Img = seq.define('Img', {
     url: {
         type: STRING,
         allowNull: false
     },
     hash: {
        type: STRING,
        allowNull: false
     }
 })
 
 module.exports = Img