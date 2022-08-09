const { FollowBlog, User } = require('./model')

const { addBlog } = require('../../controller/blog')
const { deleteFollower } = require('../../server/followBlog')
const { readBlogList } = require('../../server/blog')
const { cancelFollowIdol } = require('../../controller/user')
async function rb(follower_id){
    let b1 = await addBlog('xxx', 1)
    let b2 = await addBlog('yyy', 1)
    let bb = [b1.data.id, b2.data.id]
    console.log('@bb => ', bb)
    let user = await User.findByPk(6)
    await user.addFollowBlog_B(bb)
    let user6 = await User.findByPk(6)
    let r = await user6.addFollowPeople_I(1)
    
    let res = await cancelFollowIdol({fans_id: 6, idol_id: 1})
    console.log('@ res => ', res)
}

async function go(){
    try{
        await rb(1)
    }catch(err){
        console.log(err)
    }
}

go()

