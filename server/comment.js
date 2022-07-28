const xss = require('xss')
const { Comment } = require('../db/model')

async function addComment({ blog_id, html, user_id }){
    html = xss(html)
    console.log('@html => ', html)
    
    let res = (await Comment.create({ blog_id, html, user_id })).toJSON()
    return res
}

module.exports = {
    addComment
}