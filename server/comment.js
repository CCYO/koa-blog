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
const { toJSON } = require('../utils/seq')

async function addComment({
    //  創建comment用
    user_id, blog_id, html, p_id,
    //  串主id
    commenterOfPid,
    //  文章作者id
    author
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

    //  查詢與commentIns有關的所有comment
    let whereOps_comment = { blog_id, p_id }
    if (p_id) {   //  如果是留言回覆，要連串主都撈出
        whereOps_comment = {
            [Op.or]: [
                whereOps_comment,
                { id: p_id }
            ]
        }
    }
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
        //  加入串主
        p_id && commenterIdList_set.add(commenterOfPid)
        //  移除
        commenterIdList_set.delete(author)
        commenterIdList_set.delete(user_id)
        notifiedIdList = [...commenterIdList_set]
    }
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
        //  撈出需被知會對象分纇為「要新增follow」與「要更新的follow」
        notifiedIdList.reduce((initVal, notifiedId) => {
            let follow
            let exist = followList_json.some(json => {
                if(notifiedId === json.follower_id){
                    follow = json
                    return true
                }
            })
            if (!exist) {
                console.log(`${notifiedId}要被新增`)
                initVal.addList.push({ follower_id: notifiedId, comment_id: json_comment.id, createdAt: json_comment.createdAt })
            } else {
                let { id, confirm } = follow
                if (confirm) {
                    initVal.updateList.confirm.push(id)
                } else {
                    initVal.updateList.unconfirm.push(id)
                }
            }
            return initVal
        }, initVal)
    } else {
        notifiedIdList.forEach(notifiedId => initVal.addList.push(
            { follower_id: notifiedId, comment_id: json_comment.id, createdAt: json_comment.createdAt }
        ))
    }
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
    //  關於文章作者的follow
    if (author) {
        //  找出blog內所有commnetId
        let commentListOfBlog = await Comment.findAll({
            where: { blog_id },
            attributes: ['id']
        })
        let commentIdListOfBlog = commentListOfBlog.map(comment => comment.toJSON().id)
        //  找出相關follow
        let follow = await FollowComment.findOne({
            attributes: ['id', 'confirm'],
            where: {
                follower_id: author,
                comment_id: { [Op.in]: commentIdListOfBlog }
            }
        })
        if (follow) {   //  若有follow，即作更新
            let { dataValues: { confirm } } = follow
            if (confirm) {  //  針對 confirm 的 follow 更新
                await follow.update(
                    { confirm: false, comment_id: json_comment.id, createdAt: json_comment.createdAt }
                )
            } else {    //  針對 unconfirm 的 follow 更新
                await follow.update(
                    { comment_id: json_comment.id }
                )
            }
        } else {    //  若無follow，即新增
            console.log('@創建作者的關聯')
            await commentIns.addFollowComment_F(author)
        }
    }

    //  提供系統Cache作通知數據
    if (author) {
        notifiedIdList.push(author)
        notifiedIdList = [...new Set(notifiedIdList)]
    }

    let [comment] = await readComment({ id: json_comment.id })
    return { ...comment, notifiedIdList }
}

async function readComment({ id, blog_id, p_id, createdAt }, user_id) {
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
    if(user_id){
        whereOps.user_id = { [Op.not]: user_id }
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
                attributes: ['id', 'title'],
                include: {
                    model: User,
                    attributes: ['nickname', 'id']
                }
            }
        ]
    })
    return init_comment(res)
}

module.exports = {
    addComment,
    readComment
}