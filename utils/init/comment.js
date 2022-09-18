const moment = require('moment')

const { init_user } = require('./user')

function init_comment(comment, need_ppid = false) {
    if (comment instanceof Array) {
        let res = []

        comment.forEach(item => {
            let json = _init_comment(item)
            let { id, p_id } = json
            if(!need_ppid){
                id !== p_id && res.push(json)
            }else{
                res.push(json)
            } 
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

function init_comment_4_blog(comments, need_ppid = false) {
    let comments_json
    if (comments instanceof Array) {
        comments_json = comments.map(_init_comment)
    }else{
        comments_json = [_init_comment(comments)]
    }
    return init_4_browser(comments_json)
    
    function init_4_browser(list) {
        let target
        let res = []

        list.forEach( item => {
            item.reply = []
            if(!item.pid){
                res.push(item)
            }else{
                findAndPush(res, item)
            }
        })

        return res

        function findAndPush(list, comment) {
            list.some((item, ind) => {
                target = list[ind]
                if (item.id === comment.pid) {
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