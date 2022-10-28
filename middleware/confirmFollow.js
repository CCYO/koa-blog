const { FollowPeople, FollowBlog, FollowComment } = require('../db/mysql/model')

async function confirmFollow(ctx, next){
    await next()

    if(!ctx.session.user){
        return
    }

    let { anchorType = undefined, anchorId = undefined } = ctx.query
    
    if( !anchorType || !anchorId ){
        return
    }
    let type = Number.parseInt(anchorType)
    let id = Number.parseInt(anchorId)
    let opts = { where: { id }}
    let res
    if( type === 1){
        res = await FollowPeople.update({confirm: true}, opts)
        console.log(`@ 完成 FollowPeople/${id} confirm => `, res)
    }else if(type === 2){
        res = await FollowBlog.update({confirm: true}, opts)
        console.log(`@ 完成 FollowBlog/${id} confirm => `, res)
    }else if(type === 3){
        res = await FollowComment.update({confirm: true}, opts)
        console.log(`@ 完成 FollowComment/${id} confirm => `, res)
    }
    console.log('@ ctx.session.user => ', ctx.session.user)
    console.log('@ ctx.body => ', ctx.body)
    return
    // ctx._my = { _cache: { news: [ctx.session.user.id] } }
}

module.exports = {
    confirmFollow
}