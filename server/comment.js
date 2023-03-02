const {
    init_comment_4_blog,    //  0228    未整理
    init_comment            
} = require('../utils/init')

const {
    Comment,        //  0228
    User,
    Blog,
    FollowComment
} = require('../db/mysql/model')

const { Op } = require('sequelize')
const xss = require('xss')

const { remindNews, del_blog } = require('./cache')

//  0228
async function readCommentForBlog(opts){
    let comments = await Comment.findAll(opts)
    return init_comment_4_blog(comments)
}

async function addComment({
    //  創建comment用
    user_id, blog_id, html, p_id,
    //  串主id
    // commenterOfPid,
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
    return json_comment


    let whereOps_comment = { blog_id, p_id }
    //  查詢與commentIns有關的所有comment
    if (p_id) {   //  如果是留言回覆，要連串主都撈出
        whereOps_comment = {
            [Op.or]: [
                whereOps_comment,
                { id: p_id }
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
        let id_set = new Set(commentList.id)
        //  移除
        id_set.delete(author)  // 移除作者，因為會另外處理
        id_set.delete(user_id) //  移除回覆者，因為在系統緩存資料不須變動
        cacheNews = [...id_set]   //  數組化
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
        let followList = followList.map(follow => follow.toJSON())
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
                    comment_id: json_comment.id,
                    createdAt: json_comment.createdAt   //  即為當前comment的創建時間
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
                comment_id: json_comment.id,
                createdAt: json_comment.createdAt   //  即為當前comment的創建時間
            })
        )
    }





    // let json_commentList = commentList.length ? commentList.map(comment => comment.toJSON()) : []
    //  與pid相關的commentId
    // let commentIdList = json_commentList.length ? json_commentList.map(json => json.id) : []
    //  與pid相關的commenterId
    // let commenterIdList = json_commentList.length ? json_commentList.map(json => json.user_id) : []
    //  需放入cacheNews的對象
    // let notifiedIdList = []
    // if (commenterIdList.length) {   //  若有其他回覆者
    //     let commenterIdList_set = new Set(commenterIdList)
    //     //  加入串主
    //     p_id && commenterIdList_set.add(commenterOfPid)
    //     //  移除
    //     commenterIdList_set.delete(author)  // 移除作者，因為會另外處理
    //     commenterIdList_set.delete(user_id) //  移除回覆者，因為在系統緩存資料不須變動
    //     notifiedIdList = [...commenterIdList_set]   //  數組化
    // }
    //  撈出cacheNews相關的follow
    // let followList = []
    // if (notifiedIdList.length && commentIdList.length) {
    //     followList = await FollowComment.findAll({
    //         where: {
    //             comment_id: { [Op.in]: commentIdList },
    //             follower_id: { [Op.in]: notifiedIdList }
    //         }
    //     })
    // }
    //  彙整DB要更新的列表
    // let initVal = {
    //     addList: [],
    //     updateList: { confirm: [], unconfirm: [] }
    // }
    // if (followList.length) {    //  若存在與cacheNews相關的follow
    //     let followList_json = followList.map(follow => follow.toJSON())
    //     let followerList = followList_json.map(json => json.follower_id)    //  撈出被通知者的id
    //     //  撈出需被知會對象分纇為「要新增follow」與「要更新的follow」
    //     notifiedIdList.reduce((initVal, notifiedId) => {
    //         let follow
    //         let exist = followList_json.some(json => {
    //             if (notifiedId === json.follower_id) {    //  若 此cacheNews item 有 follower 紀錄 
    //                 follow = json   //  捕獲 json格式的 follow
    //                 return true // 停止匹配
    //             }
    //         })
    //         if (!exist) {   // 若 此cacheNews item 沒有 follower 紀錄
    //             console.log(`${notifiedId}要新增一條FollowComment紀錄`)
    //             //  將 此cacheNews item 作為創建follow的資料，放入 addList 名單內
    //             initVal.addList.push({
    //                 follower_id: notifiedId,
    //                 comment_id: json_comment.id,
    //                 createdAt: json_comment.createdAt   //  即為當前comment的創建時間
    //             })
    //         } else {    // 若 此cacheNews item 有 follower 紀錄
    //             let { id, confirm } = follow    //  從捕獲到的 json格式follow 取值
    //             if (confirm) {  //  若此條follow 讀取過
    //                 initVal.updateList.confirm.push(id) //  將 此follow_id 放入 confirm 的 updateList 名單內 
    //             } else {    //  若此條follow 未讀取
    //                 initVal.updateList.unconfirm.push(id)   //  將 此follow_id 放入 unconfirm 的 updateList 名單內
    //             }
    //         }
    //         return initVal
    //     }, initVal)
    // } else {    //  若不存在與cacheNews相關的follow
    //     //  將 此cacheNews 所有 item，作為創建follow的資料，放入 addList 名單內
    //     notifiedIdList.forEach(notifiedId =>
    //         initVal.addList.push({
    //             follower_id: notifiedId,
    //             comment_id: json_comment.id,
    //             createdAt: json_comment.createdAt   //  即為當前comment的創建時間
    //         })
    //     )
    // }

    //  關於文章作者的follow
    if (author) {
        cacheNews.push(author)
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
            let { dataValues: { id, confirm } } = follow

            if (confirm) {  //  若此條follow 讀取過
                initVal.updateList.confirm.push(id) //  將 此follow_id 放入 confirm 的 updateList 名單內 
            } else {    //  若此條follow 未讀取
                initVal.updateList.unconfirm.push(id)   //  將 此follow_id 放入 unconfirm 的 updateList 名單內
            }





            // if (confirm) {  //  針對 confirm 的 follow 更新
            //     await follow.update(
            //         { confirm: false, comment_id: json_comment.id, createdAt: json_comment.createdAt }
            //     )
            // } else {    //  針對 unconfirm 的 follow 更新
            //     await follow.update(
            //         { comment_id: json_comment.id }
            //     )
            // }
        } else {    //  若無follow，即新增)
            // await commentIns.addFollowComment_F(author)
            console.log(`@ 創建 comment_id: ${json_comment.id} 與 author_id: ${author} 的關聯`)
            initVal.addList.push(author)
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
    }

    //  提供系統Cache作通知數據
    // if (author) {
    //     notifiedIdList.push(author)
    //     notifiedIdList = [...new Set(notifiedIdList)]
    // }

    let [comment] = await readComment({ id: json_comment.id })
    // return { ...comment, notifiedIdList }

    let cache = { news: cacheNews, blog: blog_id }
    return { comment, cache }
}

async function deleteComment({ commentId, blog_id }){
    await Comment.destroy({
        where: { id: commentId , blog_id}
    })
    return
    let res = await Comment.update({ html: ''}, {
        where: { id: commentId , blog_id}
    })
    console.log('res => ', res)
    return res

}

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
        console.log('@ initVal.addList => ', initVal.addList)
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



async function readCommentForNews({ id, blog_id, p_id, createdAt }, user_id) {
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
    if (user_id) {
        whereOps.user_id = { [Op.not]: user_id }
    }

    let res = await Comment.findAll({
        attributes: ['id', 'html', 'updatedAt', 'createdAt', 'deletedAt', 'p_id'],
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
    deleteComment,
    readCommentForNews,
    setRelatedComment,

    readCommentForBlog  //  0228
}