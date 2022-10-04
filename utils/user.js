const { SuccModel } = require('../model')
const { init_user } = require('./init')


async function getMe(ctx, next){
    ctx.body = new SuccModel(init_user(ctx.session.user))
    return
}

module.exports = {
    getMe
}
