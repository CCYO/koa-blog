const { SuccModel } = require('../model')

const {
    addComment
} = require('../server/comment')

async function createComment({blog_id, html, user_id, p_id=null}){
    const res = await addComment({blog_id, html, user_id, p_id})
    
    return new SuccModel(res)
}

module.exports = {
    createComment
}