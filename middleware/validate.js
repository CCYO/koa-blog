/**
 * @description middleware validate
 */

const { validator_user } = require('../validator')
const { ErrModel } = require('../model')
const { FORMAT_ERR } = require('../model/errRes')


const validate_user = async (ctx, next) => {
    let errors
    let action
    switch (ctx.path) {
        case '/api/user/isEmailExist':
            action = '信箱確認'
            errors = validator_user('email', ctx.request.body)
            break;
        case '/api/user/register':
            action = '註冊'
            errors = validator_user('register', ctx.request.body)
            break;
        case '/api/user/':
            action = '登入'
            errors = validator_user('register', ctx.request.body)
            break;
        case '/api/user/update':
            action = '更新'
            errors = validator_user('update', ctx.request.body)
            break;
    }

    if (errors) {
        ctx.app.emit('error', new Error(`${action}失敗，因為${errors[0].message}`), ctx)
        return ctx.body = new ErrModel({ ...FORMAT_ERR, msg: errors })
    }
    return await next()
}

module.exports = {
    validate_user
}