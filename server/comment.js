const { Op } = require('sequelize')
const xss = require('xss')
const { Comment, User, FollowComment } = require('../db/model')
const { init_comment } = require('../utils/init')

async function addComment({blog_id, author_id, html, user_id, p_id}){
    html = xss(html)
    console.log('@ ===> ', {blog_id, author_id, html, user_id, p_id})
    let comment = await Comment.create({ blog_id, html, user_id, p_id })
    
    
    //  找出 同一blog內的所有評論者
    const followers = await Comment.findAll({
        where: { 
            blog_id,
            user_id: {[Op.not]: user_id}
        },
        attributes: [],
        include: {
            model: User,
            attributes: ['id', 'email', 'nickname']
        }
    })

    let listOfFollowerId = init_comment(followers).map( item => item.user.id)

    //  一定要通知blog作者(除非作者自己留言)
    if(author_id !== user_id && !listOfFollowerId.includes(author_id)){
        listOfFollowerId.unshift(author_id)
    }

    //  過濾出
    //  曾留言過的人，也曾經被通知，將他們全都轉為 unconfirm
    
    let _follower = await FollowComment.findAll({
        where: {
            follower_id: { [Op.in]: listOfFollowerId},
        }
    })

    let _listOfFollowerId = init_comment(_follower).map(item => item.user.id)
    await FollowComment.update({ confirm: false, updatedAt: new Date()}, {
        where: { [Op.in]: _listOfFollowerId}
    })

    //  過濾出
    //  曾留言過的人，卻不曾被通知，將他們加入通知列表
    let listOfNewFollowerId = listOfFollowerId.map( item => !_listOfFollowerId.includes(item))
    await comment.addFollowComment_F(listOfNewFollowerId)
    
    return init_comment(comment)
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