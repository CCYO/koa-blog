const { seq, Comment } = require('./db/mysql/model/index')

async function go(){
    try{
        let res = await seq.sync({alter: true})
        console.log(res)

    }catch(e){
        console.log('@ e => ', e)
    }
    
}

go()