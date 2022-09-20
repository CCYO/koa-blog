const { SuccModel } = require('../model')

const {
    addComment
} = require('../server/comment')

async function createComment({author_id, blog_id, html, user_id, p_id = undefined}){
    const res = await addComment({author_id, blog_id, html, user_id, p_id})
    
    return new SuccModel(res)
}


module.exports = {
    createComment
}