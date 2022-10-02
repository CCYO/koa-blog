const { SuccModel } = require('../model')

const {
    addComment,
} = require('../server/comment')

async function createComment({user_id, blog_id, html, p_id, commenterOfPid, author}){
    let res = await addComment({ user_id, blog_id, html, p_id, commenterOfPid, author})
    return new SuccModel(res)
}


module.exports = {
    createComment
}