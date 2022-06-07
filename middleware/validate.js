/**
 * @description middleware validate
 */

const { validator_user_register, validator_user_update } = require('../validator')
const { ErrModel } = require('../model')
const { FORMAT_ERR } = require('../model/errRes')

const validate_user_register = async(ctx, next) => {
    const errors = validator_user_register(ctx.request.body)
    if(errors){
        return ctx.body = new ErrModel({...FORMAT_ERR, msg: errors})
    }
    return await next()
}

const validate_user_update = async(ctx, next) => {
    const errors = validator_user_update(ctx.request.body)
    if (errors) {
        console.log('@validate err => ', errors.name)
        return ctx.body = new ErrModel({...FORMAT_ERR, msg: errors})
    }
    return await next()
}

module.exports = {
    validate_user_register,
    validate_user_update
}