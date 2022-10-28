const { FollowPeople, FollowBlog, FollowComment } = require('../db/mysql/model')
const { remindNews } = require('../server/cache')

async function confirmFollow(ctx, next) {
    await next()

    if (!ctx.session.user) {
        return
    }

    let { anchorType = undefined, anchorId = undefined } = ctx.query

    if (!anchorType || !anchorId) {
        return
    }
    let type = Number.parseInt(anchorType)
    let id = Number.parseInt(anchorId)
    let opts = { where: { id } }
    let res
    if (type === 1) {
        res = await FollowPeople.update({ confirm: true }, opts)
        console.log(`@ 完成 FollowPeople/${id} confirm => `, res)
    } else if (type === 2) {
        res = await FollowBlog.update({ confirm: true }, opts)
        console.log(`@ 完成 FollowBlog/${id} confirm => `, res)
    } else if (type === 3) {
        res = await FollowComment.update({ confirm: true }, opts)
        console.log(`@ 完成 FollowComment/${id} confirm => `, res)
    }
    if (!res[0]) {
        throw new Error(`發生異常，FollowPeople/${id}無法更新{ confirm: true}`)
    }
    await remindNews([ctx.session.user.id])
    console.log('@ => ', ctx.path)
    ctx.redirect(ctx.path)
    return
}

module.exports = {
    confirmFollow
}