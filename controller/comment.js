const { SuccModel } = require('../model')

const {
    addComment
} = require('../server/comment')

async function createComment({blog_id, author_id, html, user_id, p_id=null}){
    const res = await addComment({blog_id, author_id, html, user_id, p_id})
    // 通知所有有關係的對象
    
    return new SuccModel(res)
}

module.exports = {
    createComment
}