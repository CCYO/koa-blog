const seq = require('../seq')
const {
    STRING,
    INTEGER
} = require('../types')

let Comment = seq.define('Comment', {
    html: {
        type: STRING,
        allowNull: false
    },
    user_id: {
        type: INTEGER,
        allowNull: false
    },
    blog_id: {
        type: INTEGER,
        allowNull: false
    }
})

module.exports = Comment