const { COMMENT: { CHECK_IS_DELETED, SORT_BY, TIME_FORMAT }} = require('../../conf/constant')
const date = require('date-and-time')

const { init_user } = require('./user')

function initComment(comments) {
    if (comments instanceof Array) {
        return comments.reduce((acc, item) => {
            acc.push(_initComment(item))
            return acc
        }, [])
    }
    if (!comments) {
        return comments
    }
    let res = _initComment(comments)
    return res

    function _initComment(comment) {
        let json = comment.toJSON()
        let { id, html, p_id, blog_id, createdAt, deletedAt, updatedAt, User: commenter, Blog: blog } = json
        if (p_id === null) {
            p_id = 0
        }
        if (commenter) {
            commenter = init_user(commenter)
        }
        if (blog) {
            blog = { author: blog.User, title: blog.title, id: blog.id }
        }
        let res = {  }
        let obj = { id, html, p_id, blog_id, createdAt, updatedAt, deletedAt, commenter, blog }
        for (let prop in obj) {
            if (obj[prop]) {
                res[prop] = obj[prop]
            }
        }
        return res
    }
}

function initCommentsForBrowser(initComments) {
    let res
    if (initComments instanceof Array) {
        if (!initComments.length) {
            return []
        }
    } else {
        if (!comments) {
            return []
        }
        initComments = [initComments]
    }
    return _initCommentForBrowser(initComments)

    function _initCommentForBrowser(comments) {
        let commentList = []
        for (let comment of comments) {
            comment.reply = []
            if (!comment.p_id || comments.length === 1) {
                commentList.push(initTime(comment))
            } else {
                nestComments(commentList, comment)
            }
        }
        let list = sortAndTimeFomat(commentList)        
        return list
        function sortAndTimeFomat(list) {
            return list.sort(function (a, b) {
                return b[SORT_BY] - a[SORT_BY]
            })
        }
        function initTime(item) {
            item[SORT_BY] = item.createdAt
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
}

module.exports = {
    initComment,
    initCommentsForBrowser
}