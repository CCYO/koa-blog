const { Op } = require('sequelize')
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

async function _addComment({ user_id, blog_id, html, commentIdList, otherIdList, p_id }) {
    let data = {
        html: xss(html),
        blog_id,
        user_id,
        p_id
    }

    //  建立 comment
    let commentIns = await Comment.create(data)
    let json_comment = commentIns.toJSON()

    //  留言者是不是文章作者，有沒有 author_id

    //  沒有，代表留言者是文章作者，不用提醒作者
    //  有，代表留言者不是文章作者，要提醒作者
    //  找出作者與這篇文章回覆的關聯
    let follow_author = await FollowComment.findOne({
        where: {
            follower_id: author_id,
            comment_id: blogCommentIdList
        }
    })

    let json_follow_author
    if (follow_author) {
        json_follow_author = follow_author.toJSON()
    }

    //  判斷是不是作者
    //  A有 > 通知人不需加作者
    //  B沒有 > 通知人需加作者
    
    //  判斷有沒有其他留言
    //  C有 > 第N筆留言
    //  D沒有 > 第1筆留言 ---> 肯定 F

    //  判斷有沒有其他留言者
    //  E有 > 有留言者與作者以外的人留言過
    //  F沒有 > 目前的留言者，只有當前留言的人或是只有作者

    //  判斷作者是否留過言
    //  G有
    //  H沒有


    //  D && A 不用動作
    //  D && B -> 第1筆留言，且不是作者 -> 通知作者即可
    //  C && E -> +A -> 用CE找出follow + 篩出 E有follow內沒有的人 -> follow依confirm判斷，篩出的人新增通知
    //  C && E -> +B -> 同上，
    

    //  從FollowComment找出要更新的條目
    let where = {}

    if (!commentIdList.length && !author_id) {   //  文章的第一個留言，且留言者不是文章作者
        await FollowComment.create({ comment_id: json_comment.id, follower_id: json_follow_author.id })
    } else if (commentIdList.length ) { //文章的第N個留言
        if(otherIdList.length && author_id){ // 有其他人留言過，作者沒留過
            //  通知其他人，新增作者
        }else if(otherIdList.length && !author_id){ //有其他留言過，作者留言過
            //  通知其他人，更新作者
        }else if(!otherIdList.length && author_id){ //沒有其他人留過，作者沒留過

        }
        //  otherIdList.length 無值，代表沒有作者以外的人留言過，不須處理

        //  otherIdList.length 有值，代表作者以外的人留言過
        let where = {}
        where.comment_id = { [Op.in]: commentIdList }

        if (otherIdList.length) {
            where.follower_id = { [Op.in]: otherIdList }
        }
        let follow = (await FollowComment.findAll({ where })).map(item => item.toJSON())

        console.log('@ => ', follow)
        return

        //  要找出 otherIdList 有，follow 卻沒有的 回覆者，並做成生成條目需要的資料
        let newFollowerIdList = otherIdList.reduce((initVal, { id }) => {
            let isNew = follow.some((item) => item.id !== id)
            if (isNew) {
                initVal.push({
                    comment_id: json_comment.id,
                    follow_id: id,
                    createdAt: json_comment.createdAt
                })
            }
            return initVal
        }, [])

        //  分類出要更新的id
        let updateOfConfirm = { confirm: [], unconfirm: [] }
        follow.reduce((initVal, { id, confirm }) => {
            if (confirm) {
                initVal.confirm.push(id)
            } else {
                initVal.unconfiirm.push(id)
            }
        }, updateOfConfirm)
        //  針對 confirm
        await FollowComment.update(
            {
                comment_id: json_comment.id,
                created: json_comment.createdAt
            },
            {
                where: { id: updateOfConfirm.confirm }
            }
        )
        //  針對unconfirm
        await FollowComment.update(
            { comment_id: json_comment.id },
            {
                where: { id: updateOfConfirm.unconfirm }
            }
        )
        //  針對未在紀錄的留言者
        await FollowComment.bulkCreate(newFollowerIdList)

    }
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