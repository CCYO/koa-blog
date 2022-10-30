const { FollowBlog } = require('./model')

async function go(){
    try{
        let data = [
            { blog_id: 27, follower_id: 3, deletedAt: null},
            { blog_id: 27, follower_id: 2, deletedAt: null},
        ]
        let res = await FollowBlog.bulkCreate(data, { updateOnDuplicate: ['deletedAt']})
        console.log('@ ok => res => ', res)
    }catch(err){
        console.log(err)
    }
}

go()

