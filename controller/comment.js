const { SuccModel } = require('../model')

const {
    _addComment,
    _addReply
} = require('../server/comment')

async function createComment({user_id, blog_id, html, commentIdList, otherIdList, p_id}){
    
    let res
    if(p_id){
        res = await _addReply({ user_id, blog_id, html, commentIdList, otherIdList, p_id })    
    }else{
        res = await _addComment({ user_id, blog_id, html})
    }
    
    return new SuccModel(res)
}


module.exports = {
    createComment
}