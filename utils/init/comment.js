const { COMMENT: { CHECK_IS_DELETED, SORT_BY, TIME_FORMAT } } = require('../../conf/constant')
const date = require('date-and-time')

function initCommentsForBrowser(comments) {
    console.log('@comments => ', comments)
    if(!comments){
        return 
    }
    let readyInitTime = []
    let commentList = []
    if (!Array.isArray(comments)) {
        readyInitTime.push(comments)
    } else {
        for (let comment of comments) {
            comment.reply = []
            if (!comment.p_id || comments.length === 1) {
                readyInitTime.push(comment)
                commentList.push(comment)
            } else {
                readyInitTime.push(comment)
                nestComments(commentList, comment)
            }
        }
    }
    if (!commentList.length) {
        return initTime(readyInitTime)[0]
    }
    let list = sort(commentList)
    return list.map(initTime)


    function sort(list) {
        return list.sort(function (a, b) {
            return b[SORT_BY] - a[SORT_BY]
        })
    }
    function initTime(item) {
        item[CHECK_IS_DELETED] = item.deletedAt ? true : false
        if (item[CHECK_IS_DELETED]) {
            item.time = date.format(item.deletedAt, TIME_FORMAT)
        } else {
            item.time = date.format(item.createdAt, TIME_FORMAT)
        }
        delete item.createdAt
        delete item.deletedAt
        return item
    }

    function nestComments(commentList, item) {
        for (let index in commentList) {
            let targetComment = commentList[index]
            if (item.p_id === targetComment.id) {
                targetComment.reply.push(initTime(item))
                break
            } else if (targetComment.reply.length) {
                nestComments(targetComment.reply, item)
            }
        }
    }
}


module.exports = initCommentsForBrowser