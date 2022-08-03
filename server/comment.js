const { Op } = require('sequelize')
const xss = require('xss')
const { Comment, User, Blog, FollowComment } = require('../db/model')
const { init_comment } = require('../utils/init')

async function addComment({ blog_id, html, user_id, p_id }) {
    html = xss(html)
    //  建立 comment
    let comment = await Comment.create({ blog_id, html, user_id, p_id })

    //  整理出 同一blog內所有 comment 的 id
    const other_comments = await Comment.findAll({
        where: {
            blog_id,
        },
        attributes: ['id'],
        // include: {
        //     model: User,
        //     attributes: ['id', 'email', 'nickname']
        // }
    })

    let listOfCommentId = init_comment(other_comments).map(item => item.id)

    //  將 FollowComment 內部 comment_id 屬於 listOfCommentId 的數據，全部更新
    let json_comment = init_comment(comment)

    await FollowComment.update({ comment_id: json_comment.id, confirm: false }, {
        where: {
            cid: { [Op.in]: listOfCommentId }
        }
    })

    //  將當前此份留言與留言者自己在 FollowComment 建立一條紀錄，且confirm為true
    await comment.createFollowComment_F(user_id, { through: { confirm: true } })

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
    console.log('@res =====> ', res)
    return res
}

module.exports = {
    addComment,
    readComment
}