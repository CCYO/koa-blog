const xss = require('xss')
const { Comment } = require('../db/model')
const { init_comment } = require('../utils/init/comment')

async function addComment({ blog_id, html, user_id }){
    html = xss(html)
    console.log('@html => ', html)
    
    let res = (await Comment.create({ blog_id, html, user_id })).toJSON()
    return res
}

async function readComment({blog_id}){
    console.log('@blog_id => ', blog_id)
    let res = await Comment.findAll({
        where: {
            blog_id
        }
    })
    return init_comment(res)
}

module.exports = {
    addComment,
    readComment
}