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
    commenter_id: {
        type: INTEGER,
        allowNull: false
    },
    article_id: {
        type: INTEGER,
        allowNull: false
    },
    pid: {
        type: INTEGER,
        allowNull: true
    }
}, {
    paranoid: true
})

module.exports = Comment