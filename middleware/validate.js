/**
 * @description middleware validate
 */

const { validator_user } = require('../validator')
const { ErrModel } = require('../model')
const { FORMAT_ERR } = require('../model/errRes')

const validate_user = async(ctx, next) => {
    const { age } = ctx.request.body
    console.log(typeof age)
    console.log(age)
    const res = validator_user(ctx.request.body)
    if(res){
        return ctx.body = new ErrModel({...FORMAT_ERR, msg: res})
    }else{
        await next()
    }
}

module.exports = {
    validate_user
}