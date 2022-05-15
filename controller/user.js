/**
 * @description Controller user相關
 */
const { create, read, update } = require('../server/user')
const { upload_avatar_to_GCS } = require('../utils/upload_2_GCS_by_formidable')
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
    const res = await read({ email, password })
    // 僅檢查帳號是否存在
    if (!password) {
        console.log('僅檢查帳號是否已被註冊')
        if (!res) {
            return new SuccModel('此帳號可用')
        } else {
            return new ErrModel(IS_EXIST)
        }
        // 取得帳號
    } else {
        console.log('取得帳號')
        if (res) return new SuccModel(res)
        return new ErrModel(READ.NOT_EXIST)
    }
}

const register = async (email, password) => {
    if (!password) {
        console.error(`@@@創建user時，${NO_PASSWORD.msg}`)
        return new ErrModel(NO_PASSWORD)
    }
    const { errno } = await findUser(email)
    if (errno) {
        console.error(`@@@創建user時，${IS_EXIST.msg}`)
        return new ErrModel(IS_EXIST)
    } else {
        try {
            const user = await create({
                email,
                password
            })
            console.log('@@@成功創建user ===> ', user)
            return new SuccModel(user)
        } catch (e) {
            console.error('@@@創建user時，發生預期外錯誤 ===> ', e)
            return new ErrModel({ ...UNEXPECTED, msg: e })
        }
    }
}

const modifyUserInfo = async (ctx) => {
    const { id } = ctx.session.user
    //  將表單內的圖檔上傳 GCS -> ctx.file
    //  蒐集表單文字資訊，且將 file 的 url 與 hash 一並彙整 -> ctx.fields
    await upload_avatar_to_GCS(ctx)
    let newUserInfo = { id, ...ctx.fields }
    const user = await update(newUserInfo)
    if (user) {
        ctx.session.user = user
        return new SuccModel(user)
    } else {
        return new ErrModel({ ...UPDATE.UNEXPECTED, msg: e })
    }
}

const logout = (ctx) => {
    ctx.session = null
    return new SuccModel('成功登出')
}

module.exports = {
    register,
    findUser,
    modifyUserInfo,
    logout
}