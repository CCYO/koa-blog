const moment = require('moment')

const { init_4_user } = require('./user')

function init_comment(comment) {
    if (comment instanceof Array) {
        let res = []

        comment.forEach(item => {
            res.push(_init_comment(item))
        })

        return res
    }

    return _init_comment(comment)
}

function _init_comment(comment) {
    let json = comment.toJSON ? comment.toJSON() : comment
    let {User: user, html, updatedAt: time} = json
    time = moment(time).format('YYYY-MM-DD HH:mm')
    if(user){
        user = init_4_user(user)
        delete user.email
    }
    let res = { html, time, user}

    return res
}

module.exports = {
    init_comment
}