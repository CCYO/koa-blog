/**
 * @description middleware validate
 */

const { validator_user_register, validator_user_update } = require('../validator')
const { ErrModel } = require('../model')
const { FORMAT_ERR } = require('../model/errRes')

const validate_user_register = async(ctx, next) => {
    const res = validator_user_register(ctx.request.body)
    if(res){
        return ctx.body = new ErrModel({...FORMAT_ERR, msg: res})
    }else{
        console.log('驗證')
        await next()
    }
}

const validate_user_update = async(ctx, next) => {
    const res = validator_user_update(ctx.request.body)
    if(res){
        return ctx.body = new ErrModel({...FORMAT_ERR, msg: res})
    }else{
        await next()
    }
}

module.exports = {
    validate_user_register,
    validate_user_update
}