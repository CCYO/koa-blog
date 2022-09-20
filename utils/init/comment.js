const moment = require('moment')

const { init_user } = require('./user')

function init_comment(comment) {
    if (comment instanceof Array) {
        let res = []

        comment.forEach(item => {
            let json = _init_comment(item)
            res.push(json)
        })

        return res
    }

    return _init_comment(comment)
}

function _init_comment(comment) {
    let json = comment.toJSON ? comment.toJSON() : comment
    let { id, html, p_id, createdAt, User: user, Blog: blog } = json
    time = moment(createdAt).format('YYYY-MM-DD HH:mm')

    user = init_user(user)
    delete user.email

    let res = { id, html, p_id, time, createdAt, user, blog }

    return res
}

function init_comment_4_blog(comments) {
    let comments_json
    if (comments instanceof Array) {
        comments_json = comments.map(_init_comment)
    } else {
        comments_json = [_init_comment(comments)]
    }
    let x = init_4_browser(comments_json)
    return x

    function init_4_browser(list) {
        let target
        let res = []

        list.forEach(item => {
            item.reply = []
            if (!item.p_id) {
                res.push(item)
            } else {
                findAndPush(res, item)
            }
        })

        return res

        function findAndPush(list, comment) {
            list.some((item, ind) => {
                target = list[ind]
                if(item.id === item.p_id){
                    return 1
                }
                if (item.id === comment.p_id) {
                    return target.reply.push(comment)
                }
                if (target.reply.length) {
                    target = target.reply
                    findAndPush(target, comment)
                }
            })
        }
    }
}

module.exports = {
    init_comment,
    init_comment_4_blog
}