const { CACHE } = require('../conf/constant')       //  0411
const C_MsgReceiver = require('./msgReceiver')      //  0411
const Init = require('../utils/init')               //  0404
const { SuccModel, ErrModel, MyErr, ErrRes } = require('../model') //  0404
const Opts = require('../utils/seq_findOpts')       //  0404
const Comment = require('../server/comment')        //  0404

const { Op } = require('sequelize')

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
    if(msgReceiverOfAuthor && isAuthor){
        //  報錯，因為作者不可能收到自己評論的通知
        throw new MyErr(ErrRes.MSG_RECEIVER.READ.SHOULD_NOT_EXIST)
    }else if(msgReceiverOfAuthor && !isAuthor){
        //  找出除了被刪除的評論外，文章中最近一次應該給作者提出通知的評論
        let {errno, data: comment } = await _findLastItemOfNotSelf(article_id, author_id, removedComment.createdAt)
        //  假使不存在這樣的評論，代表目前整篇文章都沒有評論 || 評論都屬於作者自己的
        if(errno){
            //  將目前這篇文章中屬於作者的通知，硬刪除
            deleteList.push(msgReceiverOfAuthor.id)
        }else{
            //  假使存在，依屬於作者通知的comfirm值來判斷要如何更新數據
            if(msgReceiverOfAuthor.confirm){
                //  若 confirm，需要修改 msg_id + createdAt
                updateList.push({...msgReceiverOfAuthor, msg_id: comment.id, createdAt: comment.createdAt })
            }else{
                //  若 unconfirm，依據屬於作者通知的 createdAt - updatedAt 來判斷如何更新數據
                if( (msgReceiverOfAuthor.created - msgReceiverOfAuthor.updatedAt) === 0){
                    //  代表僅這筆被刪除的評論通知未確認
                    //  更新 msg_id + createdAt + confirm
                    updateList.push({...msgReceiverOfAuthor, msg_id: comment.id, createdAt: comment.createdAt, confirm: true })
                }else{
                    //  代表除了這筆被刪除的評論通知未確認，至少連最新的這筆回應也未確認
                    //  更新 msg_id + updatedAt
                    updateList.push({...msgReceiverOfAuthor, msg_id: comment.id, updatedAt: comment.updatedAt})
                }
            }
        }
    }   //  其他狀況則是作者的通知不存在，那更本沒東西可更新，則作者的部分不再處理

    //  作者通知的數據更新已完成，接下來處理，其他使用者的通知數據
    //  若存在 除了作者以外，其他使用者的通知
    if(msgReceiverOfOthers.length){
        let _removedComment = removedComment
        //  尋找屬於個別使用者，在此文章中，同一pid + 不屬於自己留言 的最新留言
        for(let msgReceiver of msgReceiverOfOthers){
            let { errno, data: comment } = await _findItemOfSomePidAndNotSelf(article_id, author_id, _removedComment.createdAt, pid)
            if(!errno){
                //  不存在上一個要通知使用者的回覆，那就無法更改，則將 msgReceiver 硬刪除
                deleteList.push(msgReceiver.id)
            }else{
                //  假使存在，依屬於通知的comfirm值來判斷要如何更新數據
                if(msgReceiver.confirm){
                    //  若 confirm，需要修改 msg_id + createdAt
                    updateList.push({...msgReceiver, msg_id: comment.id, createdAt: comment.createdAt })
                }else{
                    //  若 unconfirm，依據通知的 createdAt - updatedAt 來判斷如何更新數據
                    if( (msgReceiver.created - msgReceiver.updatedAt) === 0){
                        //  代表僅這筆被刪除的評論通知未確認
                        //  更新 msg_id + createdAt + confirm
                        updateList.push({...msgReceiver, msg_id: comment.id, createdAt: comment.createdAt, confirm: true })
                    }else{
                        //  代表除了這筆被刪除的評論通知未確認，至少連最新的這筆回應也未確認
                        //  更新 msg_id + updatedAt
                        updateList.push({...msgReceiver, msg_id: comment.id, updatedAt: comment.updatedAt})
                    }
                }
            }
        }
    }//  其他狀況則是其他使用者的通知不存在，那更本沒東西可更新，則其他使用者的部分不再處理
        
    //  更新數據
    if(updateList.length){
        await C_MsgReceiver.modifyList(updateList)
    }
    //  硬刪除
    if(deleteList.length){
        await C_MsgReceiver.forceRemoveList(deleteList)
    }
    return new SuccModel({ cache })
}
//  0414
async function _findItemOfSomePidAndNotSelf(article_id, commenter_id, time, pid){
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
    let { data: { msgReceiver: { author, commenter, list }, listOfNotReceiver, commenters } } = await _findInfoAboutItem({ ...newComment, author_id })
    let defProp = { msg_id: newComment.id, updatedAt: newComment.createdAt }
    list.map(item => {
        if (item.confirm) {
            item = { ...item, ...defProp, confirm: false }
        } else {
            item = { ...item, defProp }
        }
    })
    for (let receiver_id of listOfNotReceiver) {
        list.push({ ...defProp, receiver_id, createdAt: newComment.createdAt })
    }
    //  確認 commenter === author
    let isAuthor = commenter_id === author_id
    //  若相同
    if (isAuthor) {
        if (!author) {
            //  找出符合 { receiver_id: author_id, article_id } 的 msgReceiver
            let { errno, data } = await C_MsgReceiver.find(Opts.MSG_RECEIVER.find({ receiver_id: author_id, article_id }))
            if (!errno) {
                author = data
            }
        }
        //  塞入 list，待後續一起 bulkCreate 
        author && list.push({ ...author, confirm: true })
    } else {
        commenters.push(author_id)
        if (author) {
            //  更新
            if (author.confirm) {
                //  更新 msg_id: newComment.id, createdAt: newComment.createdAt, updatedAt: newComment.createdAt, confirm: false
                list.push({ ...author, msg_id: newComment.id, createdAt: newComment.createdAt, updatedAt: newComment.createdAt, confirm: false })
            } else {
                list.push({ ...author, msg_id: newComment.id, updatedAt: newComment.createdAt })
            }
        } else {
            //  找出符合 { receiver_id: author_id, article_id } 的 msgReceiver
            let { errno, data } = await C_MsgReceiver.find(Opts.MSG_RECEIVER.find({ receiver_id: author_id, article_id }))
            if (errno) {
                //  找不到結果，代表整篇文章目前完全無回覆，或是回覆都是autho自己留的，所以需要新創建
                list.push({ receiver_id: author_id, msg_id: newComment.id, createdAt: newComment.createdAt, updatedAt: newComment.createdAt })
            } else {
                //  更新
                if (data.confirm) {
                    //  更新 msg_id: newComment.id, createdAt: newComment.createdAt, updatedAt: newComment.createdAt, confirm: false
                    list.push({ ...data, msg_id: newComment.id, createdAt: newComment.createdAt, updatedAt: newComment.createdAt, confirm: false })
                } else {
                    list.push({ ...data, msg_id: newComment.id, updatedAt: newComment.createdAt })
                }
            }
        }
        if (commenter) {
            list.push({ ...commenter, updatedAt: newComment.createdAt, confirm: false })
        }
        //  如果沒有，代表commenter是前沒追蹤過這串留言||這串pid尚未有留言，故不需再處理
    }

    let cache = {
        [CACHE.TYPE.API.COMMENT]: [article_id],
        [CACHE.TYPE.NEWS]: commenters
    }
    if (list.length) {
        await C_MsgReceiver.addList(list)
    }
    //  讀取符合Blog格式數據格式的新Comment
    let resModel = await _findItemForPageOfBlog(newComment.id)
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
        return ErrModel(ErrRes.COMMENT.READ.NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({ data })
}
//  0411
async function _findInfoAboutItem({ article_id, commenter_id, pid, author_id }) {
    //  [ comment { id,
    //      receivers: [ { id, 
    //        MsgReceiver: { id, msg_id, receiver_id, confirm, deletedAt, createdAt }
    //      }, ...],
    //      commenter: { id }
    //    }, ... ]
    //  從 comments 取得用來處理CACHE[NEWS]的commenters(不須包含commenter與author，因為留言者不需要接收自己留言的通知，而author後面統一處理)
    let commenters = comments.map(({ commenter: { id } }) => {
        if (id !== commenter_id && id !== author_id) {
            return id
        }
        return null
    }).filter(id => id)
    commenters = [...new Set(commenters)]
    let msgReceiver = {
        list: [],
        author: undefined,
        commenter: undefined
    }
    //  從 comments 取得用來修改/創建的 MsgReceivers(不須包含commenter與author，因為留言者不需要接收自己留言的通知，而author後面統一處理)
    msgReceiver.list = comments.map(({ receivers }) => receivers) //  取出每一份comment的msgReceivers
        .flat() //  扁平化
        //  過濾掉 author 與 commenter
        .filter((item) => {
            let { receiver_id } = item
            if (receiver_id === author_id) {
                msgReceiver.author = item
                return false
            }
            if (receiver_id === commenter_id) {
                msgReceiver.commenter = item
                return false
            }
            return receiver_id !== commenter_id
        })
    let receivers = msgReceiver.list.map(({ receiver_id }) => receiver_id)
    receivers = [...new Set(receivers)]
    let listOfNotReceiver = commenters.filter(commenter => !receivers.include(commenter.id))
    let data = {
        comments,
        commenters,
        msgReceiver,
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
