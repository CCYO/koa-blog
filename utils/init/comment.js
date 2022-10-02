const moment = require('moment')

const { init_user } = require('./user')
// const { init_blog } = require('./blog')

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
    console.log('@createdAt => ', createdAt)
    time = moment(createdAt).format('YYYY-MM-DD HH:mm')
    p_id = !p_id ? 0 : p_id
    user = init_user(user)
    delete user.email
    // blog = init_blog(blog)
    console.log('@>>>', comment)
    console.log('@>>>', blog)
    if(blog){
        blog = { author: blog.User, title: blog.title, id: blog.id }
        return { id, html, p_id, time, createdAt, user, blog }
    }
    
    return { id, html, p_id, time, createdAt, user}
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
                item.p_id = 0
                res.push(item)
            } else {
                findAndPush(res, item)
            }
        })
        res.sort(function(a, b){
            return b.createdAt - a.createdAt
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