const { CACHE } = require('../conf/constant')       //  0411
const C_MsgReceiver = require('./msgReceiver')      //  0411
const Init = require('../utils/init')               //  0404
const { SuccModel, ErrModel, MyErr, ErrRes } = require('../model') //  0404
const Opts = require('../utils/seq_findOpts')       //  0404
const Comment = require('../server/comment')        //  0404

//  0411
async function remove({ author_id, commenter_id, comment_id, article_id, pid }) {
    let removedComment = await Comment.read(Opts.COMMENT.find(comment_id))
    //  刪除comment
    await Comment.deleteList(Opts.FOLLOW.removeList([comment_id]))
    let updatedAt = new Date()
    //  找出符合 msg_id = comment_id 的 msgReceiver
    let { errno, data: msgReceivers } = await C_MsgReceiver.findList(comment_id)
    let updateList = []
    let deleteList = []
    //  存在 removedComment 的 msgReceiver
    //  先做過濾
    //  updateList 、 deleteList 存放過濾後的數據
    //  存放符合這筆被刪除評論，且 receiver 為作者的通知數據
    let msgReceiverOfAuthor
    //  存放符合這筆被刪除評論，且 receiver 不是除作者的其他使用者的通知
    let msgReceiverOfOthers
    //  存放緩存更新數據
    let cache = {
        [CACHE.TYPE.API.COMMENT]: [article_id],
        [CACHE.TYPE.NEWS]: []
    }
    //  有符合這筆被刪除評論的通知數據，依據 receiver_id 分類，同時撈取更新緩存所需的數據
    if (!errno) {
        //  除了作者以外，其他使用者的通知
        msgReceiverOfOthers = msgReceivers.filter((msgReceiver) => {
            //  處理緩存
            cache[CACHE.TYPE.NEWS].push(msgReceiver.receiver_id)
            let { receiver_id } = msgReceiver
            if (receiver_id === author_id) {
                msgReceiverOfAuthor = msgReceiver
                return false
            } else {
                return true
            }
        })
    }
    let isAuthor = commenter_id === author_id
    //  從作者的通知開始分析
    //  依據作者的通知是否存在 + 此次刪除的是否為作者自己留下的評論，分析如何更新 MsgReceiver數據
    //  若作者的通知存在，且被刪除的評論屬於作者留下的
    if (msgReceiverOfAuthor && isAuthor) {
        //  報錯，因為作者不可能收到自己評論的通知
        throw new MyErr(ErrRes.MSG_RECEIVER.READ.SHOULD_NOT_EXIST)
    } else if (msgReceiverOfAuthor && !isAuthor) {
        //  找出除了被刪除的評論外，文章中最近一次應該給作者提出通知的評論
        let { errno, data: comment } = await _findLastItemOfNotSelf(article_id, author_id, removedComment.createdAt)
        //  假使不存在這樣的評論，代表目前整篇文章都沒有評論 || 評論都屬於作者自己的
        if (errno) {
            //  將目前這篇文章中屬於作者的通知，硬刪除
            deleteList.push(msgReceiverOfAuthor.id)
        } else {
            //  假使存在，依屬於作者通知的comfirm值來判斷要如何更新數據
            if (msgReceiverOfAuthor.confirm) {
                //  若 confirm，需要修改 msg_id + createdAt
                updateList.push({ ...msgReceiverOfAuthor, msg_id: comment.id, createdAt: comment.createdAt })
            } else {
                //  若 unconfirm，依據屬於作者通知的 createdAt - updatedAt 來判斷如何更新數據
                if ((msgReceiverOfAuthor.created - msgReceiverOfAuthor.updatedAt) === 0) {
                    //  代表僅這筆被刪除的評論通知未確認
                    //  更新 msg_id + createdAt + confirm
                    updateList.push({ ...msgReceiverOfAuthor, msg_id: comment.id, createdAt: comment.createdAt, confirm: true })
                } else {
                    //  代表除了這筆被刪除的評論通知未確認，至少連最新的這筆回應也未確認
                    //  更新 msg_id + updatedAt
                    updateList.push({ ...msgReceiverOfAuthor, msg_id: comment.id, updatedAt: comment.updatedAt })
                }
            }
        }
    }   //  其他狀況則是作者的通知不存在，那更本沒東西可更新，則作者的部分不再處理

    //  作者通知的數據更新已完成，接下來處理，其他使用者的通知數據
    //  若存在 除了作者以外，其他使用者的通知
    if (msgReceiverOfOthers.length) {
        let _removedComment = removedComment
        //  尋找屬於個別使用者，在此文章中，同一pid + 不屬於自己留言 的最新留言
        for (let msgReceiver of msgReceiverOfOthers) {
            let { errno, data: comment } = await _findItemOfSomePidAndNotSelf(article_id, author_id, _removedComment.createdAt, pid)
            if (!errno) {
                //  不存在上一個要通知使用者的回覆，那就無法更改，則將 msgReceiver 硬刪除
                deleteList.push(msgReceiver.id)
            } else {
                //  假使存在，依屬於通知的comfirm值來判斷要如何更新數據
                if (msgReceiver.confirm) {
                    //  若 confirm，需要修改 msg_id + createdAt
                    updateList.push({ ...msgReceiver, msg_id: comment.id, createdAt: comment.createdAt })
                } else {
                    //  若 unconfirm，依據通知的 createdAt - updatedAt 來判斷如何更新數據
                    if ((msgReceiver.created - msgReceiver.updatedAt) === 0) {
                        //  代表僅這筆被刪除的評論通知未確認
                        //  更新 msg_id + createdAt + confirm
                        updateList.push({ ...msgReceiver, msg_id: comment.id, createdAt: comment.createdAt, confirm: true })
                    } else {
                        //  代表除了這筆被刪除的評論通知未確認，至少連最新的這筆回應也未確認
                        //  更新 msg_id + updatedAt
                        updateList.push({ ...msgReceiver, msg_id: comment.id, updatedAt: comment.updatedAt })
                    }
                }
            }
        }
    }//  其他狀況則是其他使用者的通知不存在，那更本沒東西可更新，則其他使用者的部分不再處理

    //  更新數據
    if (updateList.length) {
        await C_MsgReceiver.modifyList(updateList)
    }
    //  硬刪除
    if (deleteList.length) {
        await C_MsgReceiver.forceRemoveList(deleteList)
    }
    return new SuccModel({ cache })
}
//  0414
async function _findItemOfSomePidAndNotSelf(article_id, commenter_id, time, pid) {
    let comment = await Comment.read(Opts.COMMENT.findItemOfSomePidAndNotSelf(article_id, commenter_id, time, pid))
    if (!comment) {
        return new ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    return new SuccModel({ data: comment })
}
//  0414
async function _findLastItemOfNotSelf(article_id, commenter_id, time) {
    let comment = await Comment.read(Opts.COMMENT.findLastItemOfNotSelf(article_id, commenter_id, time))
    if (!comment) {
        return new ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    return new SuccModel({ data: comment })
}
//  0411
async function add({ commenter_id, article_id, html, pid, author_id }) {
    //  創建 comment
    let newComment = await Comment.create({ commenter_id, article_id, html, pid })

    //  找出相關的 comments
    let { data } = await _findInfoForAdd({ ...newComment, author_id })
    let { msgReceiver: { author, curCommenter, others }, commenters:{ notReceiver, other } } = data

    //  存放要更新的數據
    let newDatas = []
    //  存放待整理為 newDatas Item
    let container = []
    //  必定會更新到的數據屬性
    let defProp = { msg_id: newComment.id, updatedAt: newComment.createdAt }
    //  確認 commenter === author
    let isAuthor = commenter_id === author_id
    //  若是留言者是文章作者
    if (isAuthor) {
        //  若不存在符合pid的作者通知
        if (!author) {
            //  找出文章中對作者的通知
            let { errno, data } = await _findMsgReceiverOfAuthor({author_id, article_id})
            //  若存在，賦值給 author
            if (!errno) {
                author = data
            }
        }
        //  若author存在，且未確認，則改為「已確認狀態」，存入 newDatas
        author && !author.confirm && newDatas.push({ ...author, confirm: true })
    } else {
        //  留言者不是文章作者，將作者添入 other，待處理 cache 時使用
        other.add(author_id)
        //  若符合 pid 的作者通知存在
        if (author) {
            //  放入待處理的數據列表 container 中
            container.push(author)
        } else {
            //  如果符合 pid 的作者通知不存在
            //  找出文章中對作者的通知
            let { errno, data } = await _findMsgReceiverOfAuthor({author_id, article_id})
            //  若存在，則放入 待處理的數據列表 container 中
            if (!errno) {
                container.push(data)
            } else {
                //  若不存在，創建全新通知
                newDatas.push({ ...defProp, receiver_id: author_id, createdAt: newComment.createdAt, confirm: false })
            }
        }
        //  若符合 pid 的 留言者自身通知 存在，且處於「未確認」狀態
        if (curCommenter && !curCommenter.confirm) {
            //  改為「已確認狀態」，存入 newDatas
            newDatas.push({ ...curCommenter, confirm: true })
        }
    }
    //  若留言者本人或是作者本人以外的 使用者通知 存在，則一併放入 待處理的數據列表 container 中 
    if (others.length) {
        container.concat(others)
    }
    //  遞歸整理待更新數據
    for (let msgReceiver of container) {
        //  若數據為「已確認」狀態
        if (msgReceiver.confirm) {
            newDatas.push({ ...msgReceiver, ...defProp, createdAt: newComment.createdAt, confirm: false })
        } else {
            //  若數據為「未確認」狀態
            newDatas.push({ ...msgReceiver, ...defProp })
        }
    }
    //  為尚未成為 receiver 的 commenter 建立 msgReceiver
    for (let receiver_id of [...notReceiver]) {
        newDatas.push({ ...defProp, receiver_id, createdAt: newComment.createdAt, confirm: false })
    }
    //  更新
    if (newDatas.length) {
        await C_MsgReceiver.modifyList(newDatas)
    }
    let cache = {
        [CACHE.TYPE.API.COMMENT]: [article_id],
        [CACHE.TYPE.NEWS]: [...other]
    }

    //  讀取符合Blog格式數據格式的新Comment
    let resModel = await _findItemForPageOfBlog(newComment.id)
    if (resModel.errno) {
        throw new MyErr(resModel)
    }

    return new SuccModel({
        data: resModel.data,
        cache
    })
}
//  0420
async function _findMsgReceiverOfAuthor({ article_id, author_id}){
    let comment = await Comment.read(Opts.COMMENT._findMsgReceiverOfAuthor({ article_id, author_id}))
    if(!comment){
        return new ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    let data = comment.receivers[0].MsgReceiver
    return new SuccModel({ data })
}
//  0411
async function _findItemForPageOfBlog(comment_id) {
    let comment = await Comment.read(Opts.COMMENT.find(comment_id))
    if (!comment) {
        return ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({ data })
}
//  0420
async function _findInfoForAdd({ article_id, commenter_id, pid, author_id }) {
    //  [ comment { id,
    //      receivers: [ { id, 
    //        MsgReceiver: { id, msg_id, receiver_id, confirm, deletedAt, createdAt }
    //      }, ...],
    //      commenter: { id }
    //    }, ... ]

    //  尋找 pid、author 相符的 msgReciever
    let list = await Comment.readList(Opts.COMMENT._findInfoAboutItem({article_id, pid }))

    let res = {
        msgReceiver: {
            others: [],
            author: undefined,
            curCommenter: undefined,
        },
        commenters: {
            other: new Set(),
            notReceiver: new Set()
        }
    }

    let data = list.reduce((acc, { receivers, ...comment }) => {
        let { msgReceiver, commenters } = acc
        if(comment.commenter_id !== commenter_id){
            commenters.notReceiver.add(comment.commenter_id)
        }
        if (comment.commenter_id !== author_id && comment.commenter_id !== commenter_id) {
            commenters.other.add(comment.id)
        }
        for (let { id, MsgReceiver } of receivers) {
            if (id === author_id) {
                msgReceiver.author = MsgReceiver
            } else if (id === commenter_id) {
                msgReceiver.curCommenter = MsgReceiver
            } else {
                msgReceiver.others.push(MsgReceiver)
            }
            commenters.notReceiver.delete(id)
        }
        return acc
    }, res)
    return new SuccModel({ data })
}
//  0411
async function findInfoForPageOfBlog(article_id) {
    let comments = await Comment.readList(Opts.COMMENT.findInfoForPageOfBlog(article_id))
    let data = Init.browser.comment(comments)
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

//  0404    --------
async function findRelativeUnconfirmList({ pid, article_id, createdAt }) {
    let comments = await Comment.readList(Opts.COMMENT.findRelativeUnconfirmList({ pid, article_id, createdAt }))
    let data = Init.comment(comments)
    return new SuccModel({ data })
}
//  0404    ----------
async function findInfoForNews(commentId) {
    let comment = await Comment.read(Opts.COMMENT.find(commentId))
    if (!comment) {
        return new ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({ data })
}




//  0303
async function findBlogsOfCommented(commenterId) {
    let comments = await Comment.readComments(Opts.COMMENT.findBlogsOfCommented(commenterId))
    let data = comments.map(({ blog_id }) => blog_id)
    data = [...new Set(data)]
    return new SuccModel({ data })
}
