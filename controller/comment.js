const { CACHE } = require('../conf/constant')       //  0411
const C_MsgReceiver = require('./msgReceiver')      //  0411
const Init = require('../utils/init')               //  0404
const { COMMENT: {
    //  0404
    NOT_EXIST,
    REMOVE_ERR
} } = require('../model/errRes')
const { SuccModel, ErrModel, MyErr } = require('../model') //  0404
const Opts = require('../utils/seq_findOpts')       //  0404
const Comment = require('../server/comment')        //  0404
const { MsgReceiver } = require('../db/mysql/model')
//  0411
async function add({ commenter_id, article_id, html, pid, author_id }) {
    //  創建 comment
    let comment = await Comment.create({ commenter_id, article_id, html, pid })
    //  找出相關的 comments
    let { data: { comments, commenters, msgReceivers } } = await _findInfoForTheCommentParent({ article_id, pid, commenter_id, author_id })
    //  確認 commenter === author
    let isAuthor = commenter_id === author_id
    //  若相同，不須多做動作
    //  若不相同，找出author在此article的 MsgReceiver_id
    if (!isAuthor) {
        let { errno, data } = await C_MsgReceiver.find(author_id)
        //  若找不到，準備一份 receiver === author 的 unconfirm data，放入 msgReceivers，待後續新增
        if (errno) {
            data = { receiver_id: author_id, msg_id: comment.id, confirm: false, createdAt: comment.created }
        }
        msgReceivers.push(data)
    }
    //  將 MsgReceivers 依據 confirm 分類，生成 bulkCreate 用的 datas
    let datas = msgReceivers.reduce((acc, msgReceiver) => {
        let { confirm } = msgReceiver
        let defData = {
            msg_id: comment_id,
            deletedAt: null,
            updatedAt: comment.createdAt,
        }
        //  confirm   的相關數據，修改為 { receiver_id, confirm: false, createdAt: comment.createdAt, msg_id: comment_id, deletedAt: null, updatedAt: comment.createdAt }
        if (confirm) {
            msgReceiver = {
                ...msgReceiver, //  receiver_id 保持不變
                ...defData,
                confirm: false,
                createdAt: comment.createdAt
            }
            //  unconfirm 的相關數據，修改為 { receiver_id, createdAt, confirm: false, deletedAt: null, msg_id: comment_id, updatedAt: comment.createdAt }   
        } else {
            msgReceiver = {
                ...msgReceiver, //  receiver_id, confirm, createdAt 保持不變
                ...defData
            }
        }
        acc.push(msgReceiver)
        return acc
    }, [])
    let cache = { [CACHE.TYPE.API.COMMENT]: [article_id] }
    if(datas.length){
        let { data: msgReceivers } = await C_MsgReceiver.addList(datas)
        cache[CACHE.TYPE.NEWS] = msgReceivers.map( item => item.receiver_id )
    }
    //  讀取符合Blog格式數據格式的新Comment
    let resModel = await _findItemForPageOfBlog(comment.id)
    if (resModel.errno) {
        throw new MyErr(resModel)
    }
    let data = resModel.data
    return new SuccModel({ data, cache })
}
//  0411
async function _findItemForPageOfBlog(comment_id) {
    let comment = await Comment.read(Opts.COMMENT.find(comment_id))
    if (!comment) {
        return ErrModel(NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({ data })
}
//  0411
async function _findInfoForTheCommentParent({ article_id, pid, commenter_id, author_id }) {
    //  [ comment { id,
    //      receivers: [ { id, 
    //        MsgReceiver: { id, msg_id, receiver_id, confirm, deletedAt, createdAt }
    //      }, ...],
    //      commenter: { id }
    //    }, ... ]
    let comments = await Comment.readList(Opts.COMMENT.findInfoForTheCommentParent({ article_id, pid }))
    //  從 comments 取得用來處理CACHE[NEWS]的commenters(不須包含commenter與author，因為留言者不需要接收自己留言的通知，而author後面統一處理)
    let commenters = comments.map(({ commenter: { id } }) => {
        if (id !== commenter_id && id !== author_id) {
            return id
        }
        return null
    }).filter(id => id)
    //  從 comments 取得用來修改/創建的 MsgReceivers(不須包含commenter與author，因為留言者不需要接收自己留言的通知，而author後面統一處理)
    let msgReceivers = comments.map( ({ receivers }) => receivers ) //  取出每一份comment的msgReceivers
        .flat() //  扁平化
        //  過濾掉 author 與 commenter
        .filter( ( { receiver_id }) => receiver_id !== commenter_id && receiver_id !== author_id )
    let data = {
        comments,
        commenters: [...new Set(commenters)],
        msgReceivers
    }
    return new SuccModel({ data })

    // //  若有 author_id，則代表希望整理相關數據
    // //  撈出相關comments的commenters(不含curCommenter)
    // let relatedCommenterIds = comments.map(({ commenter }) => {
    //     if (commenter.id === commenter_id) {
    //         return null
    //     }
    //     return commenter.id
    // }).filter(commenterId => commenterId)
    // //  author也是相關commenter
    // if (author_id !== commenter_id) {
    //     relatedCommenterIds.push(author_id)
    // }
    // //  刪去重複的commenterId
    // relatedCommenterIds = [...new Set(relatedCommenterIds)]
    // //  撈出目前相關commentId
    // let relatedCommentIds = comments.map(({ id }) => id)
    // let data = {
    //     comments,
    //     commenterIds: relatedCommenterIds,
    //     commentIds: relatedCommentIds
    // }
    // return new SuccModel({ data })
}
//  0411
async function findInfoForPageOfBlog(article_id) {
    let comments = await Comment.readList(Opts.COMMENT.findInfoForPageOfBlog(article_id))
    let data = Init.browser.comment(comments)
    return new SuccModel({ data })
}
//  0404
async function findRelativeUnconfirmList({ pid, article_id, createdAt }) {
    let comments = await Comment.readList(Opts.COMMENT.findRelativeUnconfirmList({ pid, article_id, createdAt }))
    let data = Init.comment(comments)
    return new SuccModel({ data })
}
//  0404
async function findInfoForNews(commentId) {
    let comment = await Comment.read(Opts.COMMENT.find(commentId))
    if (!comment) {
        return new ErrModel(NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({ data })
}

module.exports = {
    //  0411
    add,
    //  0411
    findInfoForPageOfBlog,
    //  0404
    findRelativeUnconfirmList,
    //  0404
    findInfoForNews,
    findBlogsOfCommented,  //  0303
    removeComment
}






//  0303
async function findBlogsOfCommented(commenterId) {
    let comments = await Comment.readComments(Opts.COMMENT.findBlogsOfCommented(commenterId))
    let data = comments.map(({ blog_id }) => blog_id)
    data = [...new Set(data)]
    return new SuccModel({ data })
}
//  0328
async function removeComment({ author_id, commenter_id, commentId, blog_id, p_id }) {
    //  整理出要通知的 commenters
    let { data: { commenterIds } } = await _findInfoForTheCommentParent({ blog_id, p_id, commenter_id, author_id })

    let cache = {
        [API.COMMENT]: [blog_id],
        [NEWS]: commenterIds
    }
    let ok = await Comment.deleteComment({ commentId, blog_id })
    if (!ok) {
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel({ cache })
}