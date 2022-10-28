const { FollowComment, Comment } = require('./model')

async function go(){
    try{
        let res = await Comment.sync({force: true})
        console.log('@ ok => res => ', res)
    }catch(err){
        console.log(err)
    }
}

go()

