const { SuccModel } = require('../model')

const {
    addComment,
    setRelatedComment,
    readComment
} = require('../server/comment')

async function createComment({user_id, blog_id, html, p_id, author}){
    let json = await addComment({ user_id, blog_id, html, p_id, author})

    let cacheNews = await setRelatedComment(json, { author })

    let cache = { news: cacheNews, blog: blog_id }
    let [ comment ] = await readComment({ id: json.id })
    return new SuccModel(comment, cache)
}


module.exports = {
    createComment
}