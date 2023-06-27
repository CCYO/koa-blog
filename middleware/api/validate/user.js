/**
 * @description middleware validate
 */
const { VALIDATE } = require('../../../conf/constant')
const { ErrRes, MyErr } = require('../../../model')
const validator = require('../../../utils/validator')

/** Middleware - 校驗 USER 資料
 * @param {*} ctx 
 * @param {function} next 
 * @returns 
 */
 module.exports = async (ctx, next) => {
    let action
    let errorMessages
    let method = ctx.method.toUpperCase()
    let reg = /\/api\/user(?:\/)?(?<to>[^\/\?]*)?.*/
    let res = reg.exec(ctx.path)
    let to = res.groups.to ? res.groups.to : ''
    let condition = `${method}-/${to}`
    switch (condition) {
        case 'POST-/isEmailExist':
            action = '確認信箱是否可用'
            errorMessages = await validator.user(VALIDATE.USER.IS_EMAIL_EXIST, ctx.request.body)
            break;
        case 'POST-/register':
            action = '註冊'
            errorMessages = await validator.user(VALIDATE.USER.REGISTER, ctx.request.body)
            break;
        case 'POST-/':
            action = '登入'
            errorMessages = await validator.user(VALIDATE.USER.LOGIN, ctx.request.body)
            break;
        case 'PATCH-/':
            action = '更新'
            errorMessages = await validator.user(VALIDATE.USER.SETTING, ctx.request.body)
            break;
    }
    if (errorMessages) {
        let msg = ''
        let index = 1
        for( let key in errorMessages ){
            msg += `(${index++})${key} ${errorMessages[key]} `
        }
        throw new MyErr(ErrRes.VALIDATE.USER(action, msg))
    }
    return await next()
}