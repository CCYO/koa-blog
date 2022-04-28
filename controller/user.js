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
        NO_EMAIL,
        NO_PASSWORD
    },
    READ,
    UPDATE
} = require('../model/errRes')

const findUser = async (email, password) => {
    const res = await read({email, password})
    // 僅檢查帳號是否存在
    if(!password){
        console.log('僅檢查帳號是否已被註冊')
        if(!res){
            return new SuccModel('此帳號可用')
        }else{
            return new ErrModel(IS_EXIST)
        }
    // 取得帳號
    }else{
        console.log('取得帳號')
        if(res) return new SuccModel(res)
        return new ErrModel(READ.NOT_EXIST)
    }
}

const register = async (email, password) => {
    if(!password){
        console.error(`@@@創建user時，${NO_PASSWORD.msg}`)
        return new ErrModel(NO_PASSWORD)
    }
    const { errno } = await findUser(email)
    if( errno ){
        console.error(`@@@創建user時，${IS_EXIST.msg}`)
        return new ErrModel(IS_EXIST)
    } else {
        try{
            const user = await create({
                email,
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
        console.log('x ==> ', user)
        if(user) return new SuccModel(user)
        return new ErrModel(READ.NOT_EXIST)
    }catch(e){
        console.log('xxx => ', e)
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