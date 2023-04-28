const Opts = require('./utils/seq_findOpts')
const S_Comment = require('./server/comment')
const S_Blog = require('./server/blog')
const S_User = require('./server/user')
const { Comment, seq, Blog } = require('./db/mysql/model')
go()
async function go() {
    let res = await S_User.read(Opts.USER.findInfoForFollowIdol({ idol_id: 1, fans_id: 3}))
    console.log('@res => ', res)
}

