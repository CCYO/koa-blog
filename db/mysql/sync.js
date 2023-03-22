// const { seq } = require('./model')
const { seq, FollowPeople } = require('./model')

const sync = async () => {    
    try{
        await FollowPeople.drop()
        // await FollowPeople.sync({
        //     // force: true,
        //     alter: true
        // })
        console.log('seq同步完成')
        process.exit()
    }catch(e){
        console.log('seq同步失敗 ===> ', e)
    }
}

sync()