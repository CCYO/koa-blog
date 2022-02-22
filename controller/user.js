/**
 * @description Controller user相關
 */
const { create, read, update } = require('../server/user')
const hash = require('../utils/crypto')
const { ErrModel, SuccModel } = require('../model')

const { 
    REGISTER: {
        UNEXPECTED,
        IS_EXIST,
        NO_USERNAME,
        NO_PASSWORD
    },
    READ,
    UPDATE
} = require('../model/errRes')

const findUser = async (username, password) => {
    const res = await read({username, password})
    // 僅檢查帳號是否存在
    if(!password){
        if(!res){
            return new SuccModel('此帳號可用')
        }else{
            return new ErrModel(IS_EXIST)
        }
    // 取得帳號
    }else{
        if(res) return new SuccModel(res)
        return new ErrModel(READ.NOT_EXIST)
    }
}

const register = async (username, password) => {
    if(!password){
        console.error(`@@@創建user時，${NO_PASSWORD.msg}`)
        return new ErrModel(NO_PASSWORD)
    }
    const { errno } = await findUser(username)
    if( errno ){
        console.error(`@@@創建user時，${IS_EXIST.msg}`)
        return new ErrModel(IS_EXIST)
    } else {
        try{
            const user = await create({
                username,
                password
            })
            console.log('@@@成功創建user ===> ', user)
            return new SuccModel(user)
        }catch(e){
            console.error('@@@創建user時，發生預期外錯誤 ===> ', e)
            return new ErrModel({...UNEXPECTED, msg: e})
        }
    }
}

const modifyUserInfo = async (newUserInfo ) => {
    try{
        const user = await update(newUserInfo)
        if(user) return new SuccModel(user)
        return new ErrModel(READ.NOT_EXIST)
    }catch(e){
        if(e.name === 'SequelizeValidationError'){
            return new ErrModel({...UPDATE.INVALICATE, msg: e})
        }else{
            return new ErrModel({...UPDATE.UNEXPECTED, msg: e})
        }
    }   
}

module.exports = {
    register,
    findUser,
    modifyUserInfo
}