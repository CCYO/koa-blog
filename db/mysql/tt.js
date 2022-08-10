const { FollowBlog, User } = require('./model')

const { addBlog } = require('../../controller/blog')
const { deleteFollower } = require('../../server/followBlog')
const { readBlogList } = require('../../server/blog')
const { cancelFollowIdol } = require('../../controller/user')
async function rb(follower_id){
    // let blogs = [28,29,30,31]
    let user = await User.findByPk(follower_id)
    // let follow = await user.addFollowBlog_B(blogs)
    // console.log('@ follow => ', follow)
    let res = await user.setFollowBlog_B([], {force: true})
    console.log('@ res => ', res)
}

async function go(){
    try{
        await rb(6)
    }catch(err){
        console.log(err)
    }
}

go()

