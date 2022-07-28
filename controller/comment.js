const { SuccModel } = require('../model')

const {
    addComment
} = require('../server/comment')

async function createComment(blog_id, html, user_id){
    const res = await addComment({blog_id, html, user_id})
    return new SuccModel(res)
}

module.exports = {
    createComment
}