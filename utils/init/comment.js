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

module.exports = {
    init_comment
}