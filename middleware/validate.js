/**
 * @description middleware validate
 */

const { validator_user } = require('../utils/validator')
const { ErrModel } = require('../model')
const { FORMAT_ERR } = require('../model/errRes')

/** Middleware - 校驗 USER 資料
 * @param {*} ctx 
 * @param {function} next 
 * @returns 
 */
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
        throw new Error(`@ => 校驗user${action}發生錯誤 \n !! 錯誤內容為 !! => \n`, errors[0].message)
    }
    return await next()
}

module.exports = {
    validate_user
}