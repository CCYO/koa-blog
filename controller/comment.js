const { CACHE } = require('../conf/constant')       //  0411
const C_MsgReceiver = require('./msgReceiver')      //  0411
const Init = require('../utils/init')               //  0404
const { COMMENT: {
    //  0404
    NOT_EXIST,
    REMOVE_ERR
} } = require('../model/errRes')
const { SuccModel, ErrModel, MyErr, ErrRes } = require('../model') //  0404
const Opts = require('../utils/seq_findOpts')       //  0404
const Comment = require('../server/comment')        //  0404

//  0411
async function remove({ author_id, commenter_id, comment_id, article_id, pid }) {
    //  刪除comment
    let removedComment
    //  整理出要通知的 commenters
    let { data: { comments, commenters, msgReceivers } } = await _findInfoForTheCommentParent({ article_id, pid, commenter_id, author_id })
    msgReceivers
    //  尋找 article 最新的 comment（commenter !== author）
    let resModel = await _findLastItemOfNotSelf(article_id, author_id)
    if (!resModel.errno) {
        let lastComment = resModel.data
        //  處理 author
        let isAuthor = commenter_id === author_id
        if (!isAuthor) {
            //  commenters 加入 author
            commenters.push(author_id)
            //  此篇文章作為 author 的 msgReceiver
            let { errno, data: msgReceiverOfAuthor } = await C_MsgReceiver.find({ receiver_id: author_id })
            //  若存在
            if (errno) {
                //  判斷 removedComment 是否同 msgReceiverOfAuthor.msg_id
                let some = msgReceiverOfAuthor.msg_id === comment_id
                //  若相等，則 msgReceiverOfAuthor 的 msg_id 必須改為 lastComment
                if (some) {
                    let { msg_id, createdAt, updatedAt } = lastComment
                    if (msgReceiverOfAuthor.confirm) {
                        //  msgReceiverOfAuthor { id, msg_id, receiver_id, confirm, createdAt, updatedAt, deletedAt}
                        //  msgReceiverOfAuthor 已 confirm，故僅需改 msg_id + createdAt
                        msgReceivers.push({ ...msgReceiverOfAuthor, msg_id, createdAt })
                    } else {
                        //  確認 msgReceiverOfAuthor 是否僅 removedComment 未確認
                        let isOnlyRemovedCommentUnConfirm = !(msgReceiverOfAuthor.createdAt - msgReceiverOfAuthor.updatedAt)
                        if (isOnlyRemovedCommentUnConfirm) {
                            //  僅 removedComment 未確認，故需改 msg_id + createdAt + updatedAt
                            msgReceivers.push({ ...msgReceiverOfAuthor, msg_id, createdAt, updatedAt })
                        } else {
                            //  不只 removedComment 未確認，故需改 msg_id
                            msgReceivers.push({ ...msgReceiverOfAuthor, msg_id })
                        }
                    }
                }
            } else {
                //  不可能不存在，因為 removedComment.commenter_id不是 author，故當時 removeComment 創建時，也會給 author 建立一份 msgReceiver
                throw new MyErr(ErrRes.MSG_RECEIVER.READ.NOT_EXIST)
            }
        }
    }
    let cache = {
        [CACHE.TYPE.API.COMMENT]: [article_id],
        [CACHE.TYPE.NEWS]: commenters
    }

    //  若相同，不須多做動作
    //  若不相同，找出author在此article的 MsgReceiver_id
    if (!isAuthor) {

        //  此篇文章內屬於 author 的 msgReceiver

        if (!errno) {
            let { msg_id, createdAt, updatedAt, confirm } = msgReceiver

            if (!resModel.errno) {
                let lastComment = resModel.data
                //  確認 removedComment.id === msgReceocer.msg_id
                if (removedComment.id === msg_id) {
                    //   removedComment 之前的 msgReceiver 都已確認
                    let onlyRemovedCommentUnconfirm = createdAt === updatedAt
                    if (onlyRemovedCommentUnconfirm) {
                        msgReceivers.push({})
                    }
                }

            }
        }
        //  查詢 最新一次的 commit（lastCommit）

        //  確認 msgReceiver.confirm
        //  confirm，代表最近一次的確認過
        //  unconfirm，代表最近一次的未確認
        //  確認 msgReceiver.createdAt >= lastCommit.createdAt
        //  true，表示 author 上一次更新
        if (!errno) {
            data = { receiver_id: author_id, msg_id: comment.id, confirm: false, createdAt: comment.created }
        }
        msgReceivers.push(data)
    }

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
async function _findLastItemOfNotSelf(article_id, commenter_id) {
    let comment = await Comment.read(Opts.COMMENT.findLastItemOfNotSelf(article_id, commenter_id))
    if (!comment) {
        return new ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    return new SuccModel({ data: comment })

}
//  0411
async function add({ commenter_id, article_id, html, pid, author_id }) {
    //  創建 comment
    let comment = await Comment.create({ commenter_id, article_id, html, pid })
    //  找出相關的 comments
    let { data: { comments, commenters, msgReceivers, newReceivers } } = await _findInfoForTheCommentParent(comment)
    //  確認 commenter === author
    let isAuthor = commenter_id === author_id
    //  若相同，不須多做動作
    //  若不相同，找出author在此article的 MsgReceiver_id
    if (!isAuthor) {
        let { errno, data } = await C_MsgReceiver.find({ receiver_id: author_id })
        //  若找不到，準備一份 receiver === author 的 unconfirm data，放入 msgReceivers，待後續新增
        if (errno) {
            data = { receiver_id: author_id, msg_id: comment.id, confirm: false, createdAt: comment.created }
        }
        msgReceivers.push(data)
    }
    let defData = {
        msg_id: comment_id,
        deletedAt: null,
        updatedAt: comment.createdAt,
    }
    //  將 MsgReceivers 依據 confirm 分類，生成 bulkCreate 用的 datas
    let datas = msgReceivers.reduce((acc, msgReceiver) => {
        let { confirm } = msgReceiver   
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
    //  比照 confirm
    let newMsgReceivers = newReceivers.map( receiver_id => ({ receiver_id, ...defData, confirm: false, createdAt: comment.createdAt}))
    datas.push(newMsgReceivers)
    let cache = {
        [CACHE.TYPE.API.COMMENT]: [article_id],
        [CACHE.TYPE.NEWS]: commenters
    }
    if (datas.length) {
        await C_MsgReceiver.addList(datas)
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
async function _findInfoAboutItem({ id, article_id, commenter_id, pid }, author_id) {
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
    commenters = [...new Set(commenters)]
    let msgReceiverOfAuthor = null
    //  從 comments 取得用來修改/創建的 MsgReceivers(不須包含commenter與author，因為留言者不需要接收自己留言的通知，而author後面統一處理)
    let msgReceivers = comments.map(({ receivers }) => receivers) //  取出每一份comment的msgReceivers
        .flat() //  扁平化
        //  過濾掉 author 與 commenter
        .filter((msgReceiver) => {
            let { receiver_id } = msgReceiver
            if(receiver_id !== author_id){
                msgReceiverOfAuthor = msgReceiver
                return false
            }
            return receiver_id !== commenter_id
        })
    let receivers = msgReceivers.map(({ receiver_id }) => receiver_id)
    receivers = [...new Set(receivers)]
    let listOfNotReceiver = commenters.filter(commenter => !receivers.include(commenter.id))
    let data = {
        comments,
        commenters,
        msgReceivers,
        receivers,
        listOfNotReceiver
    }
    return new SuccModel({ data })
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
    remove,
    //  0411
    add,
    //  0411
    findInfoForPageOfBlog,
    //  0404
    findRelativeUnconfirmList,
    //  0404
    findInfoForNews,
    findBlogsOfCommented,  //  0303
}






//  0303
async function findBlogsOfCommented(commenterId) {
    let comments = await Comment.readComments(Opts.COMMENT.findBlogsOfCommented(commenterId))
    let data = comments.map(({ blog_id }) => blog_id)
    data = [...new Set(data)]
    return new SuccModel({ data })
}
