const Opts = require('./utils/seq_findOpts')
const S_Comment = require('./server/comment')
const S_Blog = require('./server/blog')
const { Comment, seq, Blog } = require('./db/mysql/model')
go()
async function go() {
    let res = await S_Blog.read(Opts.BLOG.findInfoForHidden(2))
    console.log('@res => ', res)
    console.log('@res => ', res.toJSON())
}

