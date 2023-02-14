const seq = require('../seq')
const {
    STRING,
    INTEGER
} = require('../types')

let Comment = seq.define('Comment', {
    html: {
        type: STRING,
        defaultValue: ''
    },
    user_id: {
        type: INTEGER,
        allowNull: false
    },
    blog_id: {
        type: INTEGER,
        allowNull: false
    },
    p_id: {
        type: INTEGER,
        allowNull: true
    }
}, {
    paranoid: true
})

module.exports = Comment