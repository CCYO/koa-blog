// const { seq } = require('./model')
const { seq } = require('./model')

const sync = async () => {    
    try{
        await seq.sync({force: true})
        // await seq.sync({alter: true})
        //await seq.drop()
        console.log('seq同步完成')
        process.exit()
    }catch(e){
        console.log('seq同步失敗 ===> ', e)
    }
}

sync()