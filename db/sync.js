// const { seq } = require('./model')
const { seq } = require('./tt-model')

const sync = async () => {    
    try{
        await seq.sync({force: true})
        console.log('seq同步完成')
        process.exit()
    }catch(e){
        console.log('seq同步失敗 ===> ', e)
    }
}

sync()