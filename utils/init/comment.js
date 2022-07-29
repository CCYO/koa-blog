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

    return json
}

module.exports = {
    init_comment
}