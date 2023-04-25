const Opts = require('./utils/seq_findOpts')
const S_Comment = require('./server/comment')
const { Comment } = require('./db/mysql/model')
go()
async function go() {
    let res = await Comment.findOne({
        where: {
            id: 38,
        },
        include: {
            required: true,
            association: 'article'
        }
    })
    console.log('@res => ', res.toJSON())
}

