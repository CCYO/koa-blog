const { Op, json } = require('sequelize')
const xss = require('xss')

const { remindNews, del_blog } = require('./cache')

const {
    Comment,
    User,
    Blog,
    FollowBlog,
    FollowComment
} = require('../db/mysql/model')

const { init_comment } = require('../utils/init')

async function _addComment({
    //  創建comment用
    user_id, blog_id, html, p_id,
    //  更新/創建follow用
    commenterOfPid, //串主
    // listOfNotified, listOfCommentId,
    //  更新/創建文章作者的follow用
    author,
    // listOfAllCommentId
}) {
    let data = {
        html: xss(html),
        blog_id,
        user_id,
        p_id
    }

    //  建立 comment
    let commentIns = await Comment.create(data)
    let json_comment = commentIns.toJSON()

    //  確認留言者是否為文章作者


    //  建立同串留言者的 followComment
    let whereOps_comment = { blog_id, p_id }
    if (p_id) {   //  如果是留言回覆，要連串主都撈出
        whereOps_comment = {
            [Op.or]: [
                whereOps_comment,
                { comment_id: p_id }
            ]
        }
    }
    //  與pid相關的comment
    let commentList = await Comment.findAll({
        where: whereOps_comment
    })
    let json_commentList = commentList.length ? commentList.map(comment => comment.toJSON()) : []
    //  與pid相關的commentId
    let commentIdList = json_commentList.length ? json_commentList.map(json => json.id) : []
    //  與pid相關的commenterId
    let commenterIdList = json_commentList.length ? json_commentList.map(json => json.user_id) : []
    //  需被知會的對象
    let notifiedIdList = []
    if (commenterIdList.length) {
        let commenterIdList_set = new Set(commenterIdList)
        console.log(`@set => `, [...commenterIdList_set])
        console.log(`@commentIdList => `, commentIdList)
        //  加入串主
        p_id && commenterIdList_set.add(commenterOfPid)
        //  移除
        commenterIdList_set.delete(author)
        commenterIdList_set.delete(user_id)
        notifiedIdList = [...commenterIdList_set]
    }
    console.log(`@notifiedIdList => `, notifiedIdList)
    console.log(`@commentIdList => `, commentIdList)
    //  撈出需被知會對象的follow
    let followList = []
    if (notifiedIdList.length && commentIdList.length) {
        followList = await FollowComment.findAll({
            where: {
                comment_id: { [Op.in]: commentIdList },
                follower_id: { [Op.in]: notifiedIdList }
            }
        })
    }
    let initVal = {
        addList: [],
        updateList: { confirm: [], unconfirm: [] }
    }
    if (followList.length) {
        let followList_json = followList.length ? followList.map(follow => follow.toJSON()) : []
        let followerList = followList.length ? followList_json.map(json => json.follower_id) : []
        console.log('@followList_json => ', followList_json)
        //  撈出需被知會對象分纇為「要新增follow」與「要更新的follow」
        followList_json.reduce((initVal, json) => {
            if (notifiedIdList.some(notified => notified !== json.follower_id)) {
                console.log(`${notified}要被新增`)
                initVal.addList.push({ follower_id: notified, comment_id: json_comment.id, createdAt: json_comment.createdAt })
            } else {
                let { confirm } = json
                if (confirm) {
                    initVal.updateList.confirm.push(json.id)
                } else {
                    initVal.updateList.unconfirm.push(json.id)
                }
            }
            return initVal
        }, initVal)
    } else {
        notifiedIdList.forEach(notifiedId => initVal.addList.push(
            { follower_id: notifiedId, comment_id: json_comment.id, createdAt: json_comment.createdAt }
        ))
    }

    console.log('@initVal => ', initVal)
    //  新增follow
    if (initVal.addList.length) {
        await FollowComment.bulkCreate(initVal.addList)
    }
    //  更新的follow
    if (initVal.updateList.confirm.length) {
        await FollowComment.update(
            { confirm: false, comment_id: json_comment.id, createdAt: json_comment.createdAt },
            { where: { id: initVal.updateList.confirm } }
        )
    }
    //  更新的follow
    if (initVal.updateList.unconfirm.length) {
        await FollowComment.update(
            { comment_id: json_comment.id },
            { where: { id: initVal.updateList.unconfirm } }
        )
    }

    if (author) {
        //  找出blog內所有commnetId
        let commentListOfBlog = await Comment.findAll({
            where: { blog_id },
            attributes: ['id']
        })
        let commentIdListOfBlog = commentListOfBlog.map(comment => comment.toJSON().id)
        console.log('@commentIdListOfBlog => ', commentIdListOfBlog)
        let follow = await FollowComment.findOne({
            attributes: ['id', 'confirm'],
            where: {
                follower_id: author,
                comment_id: { [Op.in]: commentIdListOfBlog }
            }
        })

        if (follow) {
            let { dataValues: { confirm } } = follow
            if (confirm) {
                console.log('@更新作者本來的confirm關聯')
                await follow.update(
                    { confirm: false, comment_id: json_comment.id, createdAt: json_comment.createdAt }
                )
            } else {
                console.log('@更新作者本來的unconfirm關聯')
                await follow.update(
                    { comment_id: json_comment.id }
                )
            }
        } else {
            console.log('@創建作者的關聯')
            await commentIns.addFollowComment_F(author)
        }
    }

    //  Cache
    if (author) {
        notifiedIdList.push(author)
        notifiedIdList = [...new Set(notifiedIdList)]
    }
    console.log(`@notifiedIdList =>`, notifiedIdList)
    await remindNews(notifiedIdList)

    let [comment] = await readComment({ id: json_comment.id })
    return comment
}
async function _addReply({ blog_id, html, user_id, p_id }) {
    let data = {
        html: xss(html),
        blog_id,
        user_id,
        p_id
    }

    //  建立 comment

    let commentIns = await Comment.create(data)
    let json_comment = commentIns.toJSON()
    let [comment] = await readComment({ id: json_comment.id })
    return comment
}

async function _readComment({ blog_id, html, user_id, p_id }) {

}

async function addComment({ blog_id, html, user_id }) {
    html = xss(html)
    //  建立 comment
    let commentIns = await Comment.create({ blog_id, html, user_id })

    let json_comment = commentIns.toJSON()

    let [comment] = await readComment({ id: json_comment.id })
    return comment

    //  確認是否文章的第一個留言
    let comments = await Comment.findAll({
        where: { blog_id }
    })
    if (!p_id) {//  如果是文章留言
        let json_comments = init_comment(comments)
        //  通知作者

        //  通知文章粉絲
        let list_fans_id = (await FollowBlog.findAll({
            where: { blog_id, p_id: null },
            attributes: ['follower_id']
        })).map(f => f.toJson())
        //  通知
        let list_follower_id = [author_id, ...list_fans_id]
        await commentIns.addComment_F(list_follower_id)
    } else { //  如果是留言回覆
        //  確認是作者是否已有該筆留言的通知
        await Comment.findOne({
            where: {
                user_id: author_id,
                p_id
            }
        })
        //  通知作者
        //  通知留言粉絲
        let list_fans_id = (await Comment.findAll({
            where: { p_id },
            attributes: ['user_id']
        })).map(f => f.json())
    }

    //  處理緩存，將被通知者放入緩存


    //  整理出 同一blog內所有 comment(撇除當前這份，以及非留言者本人的comment)
    const other_comments = await Comment.findAll({
        where: {
            blog_id,
            id: { [Op.not]: json_comment.id },
            // user_id: { [Op.not]: user_id}
        },
        attributes: ['id', 'user_id', 'p_id'],
        include: {
            model: User,
            attributes: ['id', 'email', 'nickname']
        }
    })
    let json_otherComment = init_comment(other_comments, true)
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
    await FollowComment.update({ comment_id: json_comment.id }, {
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
    let listOfUserId = json_otherComment.filter(({ user: { id } }) => id !== user_id).map(({ user: { id } }) => id)
    console.log('@listOfUserId => ', listOfUserId)
    listOfUserId = [...new Set([...listOfUserId])]
    console.log('@listOfUserId => ', listOfUserId)
    await remindNews(listOfUserId)
    await del_blog(blog_id)
    return json_comment
}

async function readComment({ id, blog_id, p_id, createdAt }) {
    let whereOps = {}
    if (blog_id) {
        whereOps.blog_id = blog_id
    }
    if (id) {
        whereOps.id = id
    }
    if (p_id) {
        whereOps.p_id = p_id
    }
    if (createdAt) {
        whereOps.createdAt = { [Op.gt]: createdAt }
    }

    let res = await Comment.findAll({
        attributes: ['id', 'html', 'updatedAt', 'createdAt', 'p_id'],
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
    console.log('初始前的comment => ', res)
    res = init_comment(res)
    console.log('初始化的結果 res => ', res)
    return res
}

module.exports = {
    _addComment,
    _addReply,
    _readComment,
    addComment,
    readComment
}