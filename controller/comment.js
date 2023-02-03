const { SuccModel } = require('../model')

const {
    addComment,
    setRelatedComment,
    readComment,
    deleteComment
} = require('../server/comment')

async function createComment({user_id, blog_id, html, p_id, author}){
    let json = await addComment({ user_id, blog_id, html, p_id, author})

    let cacheNews = await setRelatedComment(json, { author })

    let cache = { news: cacheNews, blog: [ blog_id ] }
    let [ comment ] = await readComment({ id: json.id })
    return new SuccModel(comment, cache)
}

async function removeComment({commentId, blog_id}){
    let res = await deleteComment({ commentId, blog_id })
    let cache = { blog: [blog_id] }
    // let cacheNews = await setRelatedComment(json, { author })

    // let cache = { news: cacheNews, blog: [ blog_id ] }
    // let [ comment ] = await readComment({ id: json.id })
    return new SuccModel(res, cache)
}

module.exports = {
    createComment,
    removeComment
}