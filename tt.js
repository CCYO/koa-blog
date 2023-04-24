const { Sequelize, DataTypes } = require('sequelize')
const seq = new Sequelize({
    database: 'test',
    username: 'ccy',
    password: 'tt309091238',
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql'
})

const test = async () => {
    try {
        await seq.authenticate()
        console.log('@ => Seqalize 已連結')
    } catch(e){
        console.log('@ => Sequalize 連結發生錯誤 ===> \n', e)
    }
}

// test()
const { STRING , INTEGER} = require('./db/mysql/types')
const { user } = require('./utils/init')


const User = seq.define('User', {
    name: {
        type: STRING,
        allowNull: false,
        unique: true,
    },age: {
        type: INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
		allowNull: false,
		defaultValue: Sequelize.NOW
    }
},{
	createdAt: false
})

const sync = async () => {    
    try{
        await seq.sync({
            force: true,
            alter: true
        })
        console.log('seq同步完成')
        process.exit()
    }catch(e){
        console.log('seq同步失敗 ===> ', e)
    }
}

async function addUser(){
    return await User.create({ name: 'yoyo', age: 32})
}

async function go(){
    // await sync()
    // let user = await User.create({ name: 'tume20938', age: 12})
    let createdAt = new Date()
    console.log(createdAt)
    // let user = await User.findByPk(1)
    // user = await user.update({createdAt})
    // let user = await User.create({ name: 'tume209', age: 38})
    // console.log('@user => ', user)
    let user = await User.bulkCreate([{id: 1, name: 'ccyy', age: 300, createdAt}], { updateOnDuplicate: ['id', 'createdAt']})
    console.log(user)
}

go()