const { seq, User, IdolFans, Blog, PubScr, Comment, FollowComment } = require('./model')

const sync = async () => {    
    try{
        await seq.sync({
            force: true,
            // alter: true
        })
        console.log('seq同步完成')
        process.exit()
    }catch(e){
        console.log('seq同步失敗 ===> ', e)
    }
}

sync()