/**
 * @description middleware validate
 */

const { validator_user } = require('../utils/validator')

/** Middleware - 校驗 USER 資料
 * @param {*} ctx 
 * @param {function} next 
 * @returns 
 */
const validate_user = async (ctx, next) => {
    let errors
    let action
    let { method, path } = ctx

    let reg = /\/api\/user(.+?)(\/)?$/
    let _path = reg.exec(path)

    let condition = _path ? `${method}-${_path[1]}` : 'PATCH-/'
    
    switch (condition) {
        case 'POST-/isEmailExist':
            action = '信箱確認'
            errors = validator_user('email', ctx.request.body)
            break;
        case 'POST-/register':
            action = '註冊'
            errors = validator_user('register', ctx.request.body)
            break;
        case 'POST-/':
            action = '登入'
            errors = validator_user('register', ctx.request.body)
            break;
        case 'PATCH-/':
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