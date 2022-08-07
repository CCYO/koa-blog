/**
 * @description Sequelize Ins
 */
const { Sequelize, DataTypes } = require('sequelize')

const { MYSQL_CONF } = require('../../conf/db')

let seqOps = { ...MYSQL_CONF, logging: false}
const seq = new Sequelize(seqOps)

const test = async () => {
    try {
        await seq.authenticate()
        console.log('@ => Seqalize 已連結')
    } catch(e){
        console.log('@ => Sequalize 連結發生錯誤 ===> \n', e)
    }
}

test()

module.exports = seq