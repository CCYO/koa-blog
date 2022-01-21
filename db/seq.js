/**
 * @description Sequelize Ins
 */
const { Sequelize, DataTypes } = require('sequelize')

const {MYSQL_CONF, MYSQL_CONF: {
    database,
    username,
    password,
}} = require('../conf/db')

const seq = new Sequelize(database, username, password, MYSQL_CONF)

const test = async () => {
    try {
        await seq.authenticate()
        console.log('Seqalize 測試連結成功')
    } catch(e){
        console.log('Sequalize 測試連結發生錯誤 ===> ', e)
    }
}

test()

module.exports = seq