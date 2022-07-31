const xss = require('xss')
const { Comment, User } = require('../db/model')
const { init_comment } = require('../utils/init')

async function addComment({ blog_id, html, user_id }){
    html = xss(html)
    console.log('@html => ', html)
    
    let res = await Comment.create({ blog_id, html, user_id })
    return init_comment(res)
}

async function readComment({blog_id}){
    console.log('@blog_id => ', blog_id)
    let res = await Comment.findAll({
        attributes: ['html', 'updatedAt'],
        where: {
            blog_id
        },
        include: {
            model: User,
            attributes: ['email', 'nickname']
        }
    })
    res = init_comment(res)
    console.log('@res =====> ', res)
    return 
}

module.exports = {
    addComment,
    readComment
}