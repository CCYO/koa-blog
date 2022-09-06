const { Op } = require('sequelize')
const xss = require('xss')

const { remindNews } = require('./cache')

const {
    Comment,
    User,
    Blog,
    FollowComment
} = require('../db/mysql/model')

const { init_comment } = require('../utils/init')

async function addComment({ blog_id, html, user_id, p_id }) {
    html = xss(html)
    //  建立 comment
    let commentIns = await Comment.create({ blog_id, html, user_id, p_id })
    let json_comment = commentIns.toJSON()
    let comment = await readComment({ id: json_comment.id })

    //  整理出 同一blog內所有 comment(撇除當前這份，以及非留言者本人的comment)
    const other_comments = await Comment.findAll({
        where: {
            blog_id,
            // id: { [Op.not]: json_comment.id },
            user_id: { [Op.not]: user_id}
        },
        attributes: ['id', 'user_id', 'p_id'],
        include: {
            model: User,
            attributes: ['id', 'email', 'nickname']
        }
    })
    let json_otherComment = init_comment(other_comments)
    console.log('@json_otherComment => ', json_otherComment)
    let listOfCommentId = json_otherComment.map(item => item.id)
    console.log('@listOfCommentId => ', listOfCommentId)

    //  FollowComment 內部 comment_id 屬於 listOfCommentId 的數據，全部更新
    //  針對 confirm 的條目，更新 {comment_id, confirm, createdAt}
    let now = new Date()
    await FollowComment.update({ comment_id: json_comment.id, confirm: false, createdAt: now }, {
        where: {
            comment_id: { [Op.in]: listOfCommentId },
            confirm: true
        }
    })
    //  針對 unconfirm 的條目，更新 {comment_id}
    await FollowComment.update({ comment_id: json_comment.id, createdAt: now }, {
        where: {
            comment_id: { [Op.in]: listOfCommentId },
            confirm: false
        }
    })

    //  確認留言者在同blog內，是否有過其他留言
    let hasComment = json_otherComment.some(({ user: { id } }) => id === user_id)
    console.log('@是否留言過 => ', hasComment)

    //  未留過言，將當前此份留言與留言者自己在 FollowComment 建立一條紀錄，且confirm為true
    if (!hasComment) {
        await commentIns.addFollowComment_F(user_id, { through: { confirm: true } })
    }
    //  於cache通知所有留言者有新消息
    let listOfUserId = json_otherComment.map(item => item.user_id)
    console.log('@listOfUserId => ', listOfUserId)
    await remindNews(listOfUserId)

    return json_comment
}

async function readComment({ id, blog_id }) {
    let whereOps = {}
    if (blog_id) {
        whereOps.blog_id = blog_id
    }
    if (id) {
        whereOps.id = id
    }
    let res = await Comment.findAll({
        attributes: ['id', 'html', 'updatedAt'],
        where: whereOps,
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'nickname']
            },
            {
                model: Blog,
                attributes: ['id', 'title']
            }
        ]
    })
    res = init_comment(res)
    return res
}

module.exports = {
    addComment,
    readComment
}