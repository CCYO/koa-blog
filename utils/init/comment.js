const moment = require('moment')

const { init_user } = require('./user')

function init_comment(comment) {
    if (comment instanceof Array) {
        let res = []

        comment.forEach(item => {
            let json = _init_comment(item)
            let { id, p_id } = json
            id !== p_id && res.push(json)
        })

        return res
    }

    return _init_comment(comment)
}

function _init_comment(comment) {
    let json = comment.toJSON ? comment.toJSON() : comment
    let { id, html, p_id, updatedAt: time, User: user, Blog: blog } = json
    time = moment(time).format('YYYY-MM-DD HH:mm')

    user = init_user(user)
    delete user.email

    let res = { id, html, p_id, time, user, blog }

    return res
}

module.exports = {
    init_comment
}