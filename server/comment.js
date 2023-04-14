const { ErrRes, MyErr } = require('../model')   //  0411
const xss = require('xss')                      //  0411
const Init = require('../utils/init')           //  0404
const {
    //  0404
    Comment,
    FollowComment
} = require('../db/mysql/model')
//  0414
async function deleteList(opts) {
    try {
        //  RV row
        return await Comment.destroy(opts)
    } catch (err) {
        throw new MyErr({ ...ErrRes.COMMENT.DELETE.ERR, err })
    }
}
//  0411
async function create({ commenter_id, article_id, html, pid }) {
    try {
        let data = {
            html: xss(html),
            article_id,
            commenter_id,
            pid: !pid ? null : pid 
        }
        let comment = await Comment.create(data)
        return Init.comment(comment)
    } catch (err) {
        throw new MyErr({...ErrRes.MSG_RECEIVER.CREATE.ERR, err})
    }
}
//  0411
async function readList(opts) {
    let comments = await Comment.findAll(opts)
    return Init.comment(comments)
}
//  0404
async function read(opts) {
    let comment = await Comment.findOne(opts)
    return Init.comment(comment)
}
module.exports = {
    //  0414
    deleteList,
    //  0411
    create,
    //  0411
    readList,
    //  0404
    read,    
    setRelatedComment,
}

const { COMMENT: { CREATE_ERR }} = require('../model/errRes')
const { Op } = require('sequelize')



async function setRelatedComment(comment, { author }) {
    let whereOps_comment = { blog_id: comment.blog_id, p_id: comment.p_id }
    //  查詢與commentIns有關的所有comment
    if (comment.p_id) {   //  如果是留言回覆，要連串主都撈出
        whereOps_comment = {
            [Op.or]: [
                whereOps_comment,
                { id: comment.p_id }
            ]
        }
    }

    let commentList = {
        ins: [],
        json: [],
        id: [],
        replyer: []
    }
    let cacheNews = []

    commentList.ins = await Comment.findAll({
        where: whereOps_comment
    })

    if (commentList.ins.length) {
        commentList.json = commentList.ins.map(comment => comment.toJSON())
        commentList.id = [...new Set(commentList.json.map(({ id }) => id))]
        commentList.replyer = commentList.json.map(({ user_id }) => user_id)
        let replyer_set = new Set(commentList.replyer)
        //  移除
        replyer_set.delete(author)  // 移除作者，因為會另外處理
        replyer_set.delete(comment.user_id) //  移除回覆者，因為在系統緩存資料不須變動
        cacheNews = [...replyer_set]   //  數組化
    }

    let { ins, json, id, replyer } = commentList
    let followList = []
    if (id.length && cacheNews.length) {
        followList = await FollowComment.findAll({
            where: {
                comment_id: { [Op.in]: id },
                follower_id: { [Op.in]: cacheNews }
            }
        })
    }

    let initVal = {
        addList: [],
        updateList: { confirm: [], unconfirm: [] }
    }
    if (followList.length) {    //  若存在與cacheNews相關的follow
        followList = followList.map(follow => follow.toJSON())
        //  撈出需被知會對象分纇為「要新增follow」與「要更新的follow」
        cacheNews.reduce((initVal, user_id) => {
            let follow
            let exist = followList.some(item => {
                let { follower_id } = item
                if (user_id === follower_id) {    //  若 此cacheNews item 有 follower 紀錄 
                    follow = item   //  捕獲 json格式的 follow
                    return true // 停止匹配
                }
            })

            if (!exist) {   // 若 此cacheNews item 沒有 follower 紀錄
                console.log(`${user_id}要新增一條FollowComment紀錄`)
                //  將 此cacheNews item 作為創建follow的資料，放入 addList 名單內
                initVal.addList.push({
                    follower_id: user_id,
                    comment_id: comment.id,
                    createdAt: comment.createdAt   //  即為當前comment的創建時間
                })
            } else {    // 若 此cacheNews item 有 follower 紀錄
                let { id, confirm } = follow    //  從捕獲到的 json格式follow 取值
                if (confirm) {  //  若此條follow 讀取過
                    initVal.updateList.confirm.push(id) //  將 此follow_id 放入 confirm 的 updateList 名單內 
                } else {    //  若此條follow 未讀取
                    initVal.updateList.unconfirm.push(id)   //  將 此follow_id 放入 unconfirm 的 updateList 名單內
                }
            }
            return initVal
        }, initVal)
    } else {    //  若不存在與cacheNews相關的follow
        //  將 此cacheNews 所有 item，作為創建follow的資料，放入 addList 名單內
        cacheNews.forEach(user_id =>
            initVal.addList.push({
                follower_id: user_id,
                comment_id: comment.id,
                createdAt: comment.createdAt   //  即為當前comment的創建時間
            })
        )
    }

    //  關於文章作者的follow
    if (author) {
        cacheNews.push(author)
        //  找出blog內所有commentId
        let commentListOfBlog = await Comment.findAll({
            where: { blog_id: comment.blog_id },
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
            let { dataValues: { id, confirm, follower_id } } = follow

            if (confirm) {  //  若此條follow 讀取過
                initVal.updateList.confirm.push(id) //  將 此follow_id 放入 confirm 的 updateList 名單內 
            } else {    //  若此條follow 未讀取
                initVal.updateList.unconfirm.push(id)   //  將 此follow_id 放入 unconfirm 的 updateList 名單內
            }
            console.log(`@ 更新 commentFollow:${id}，其屬於 user/${follower_id} confirm:${confirm} 的 followComment`)
        } else {    //  若無follow，即新增)
            // await commentIns.addFollowComment_F(author)
            console.log(`@ 創建 comment_id: ${comment.id} 與 author_id: ${author} 的關聯`)
            initVal.addList.push({
                follower_id: author,
                comment_id: comment.id,
                createdAt: comment.createdAt   //  即為當前comment的創建時間
            })
        }
    }

    //  新增follow
    if (initVal.addList.length) {
        await FollowComment.bulkCreate(initVal.addList)
    }
    //  更新的follow
    if (initVal.updateList.confirm.length) {
        await FollowComment.update(
            { confirm: false, comment_id: comment.id, createdAt: comment.createdAt },
            { where: { id: initVal.updateList.confirm } }
        )
    }
    //  更新的follow
    if (initVal.updateList.unconfirm.length) {
        await FollowComment.update(
            { comment_id: comment.id },
            { where: { id: initVal.updateList.unconfirm } }
        )
    }

    return cacheNews

}