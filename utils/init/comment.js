const { filterEmptyAndFranferFns, filterEmptyAndFranferFnsForArray } = require('../filterEmpty')
const { COMMENT: { CHECK_IS_DELETED, SORT_BY, TIME_FORMAT } } = require('../../conf/constant')
const date = require('date-and-time')

//  0326
function initCommentsForBrowser(data) {
    let comments = filterEmptyAndFranferFnsForArray(data, nestAndSort)
    filterEmptyAndFranferFns(data, initTime)
    return comments
}
//  nest + sort
function nestAndSort(comments) {
    let list
    if (Array.isArray(comments)) {
        let commentList = []
        for (let comment of comments) {
            comment.reply = []
            if (!comment.p_id || comments.length === 1) {
                commentList.push(comment)
            } else {
                nestComments(commentList, comment)
            }
        }
        list = sort(commentList)
    } else {
        list = comments
    }
    return list


    function sort(list) {
        return list.sort(function (a, b) {
            return b[SORT_BY] - a[SORT_BY]
        })
    }

    function nestComments(commentList, item) {
        for (let index in commentList) {
            let targetComment = commentList[index]
            if (item.p_id === targetComment.id) {
                targetComment.reply.push(item)
                break
            } else if (targetComment.reply.length) {
                nestComments(targetComment.reply, item)
            }
        }
    }
}
//  時間序列化
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
module.exports = {
    initTime,
    initCommentsForBrowser
}