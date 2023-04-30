const Opts = require('./utils/seq_findOpts')
const S_Comment = require('./server/comment')
const S_Blog = require('./server/blog')
const S_User = require('./server/user')
const C_BlogImg = require('./controller/blogImg')
const { Comment, seq, Blog } = require('./db/mysql/model')
go()
async function go() {
    let res = await Blog.restore({ where: { id: 1 } })
    console.log('@res => ', res)
}