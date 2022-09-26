const { SuccModel } = require('../model')

const {
    _addComment,
    _addReply
} = require('../server/comment')

async function createComment({user_id, blog_id, html, p_id, listOfNotified, listOfCommentId, listOfAllCommentId, author}){
    
    let res = await _addComment({ user_id, blog_id, html, p_id, listOfNotified, listOfCommentId, listOfAllCommentId, author})
    return new SuccModel(res)
}


module.exports = {
    createComment
}