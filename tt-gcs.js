

const { initCache, get } = require('./db/cache/redis/_redis')

async function go(){
    try{
        await initCache()
        console.log(await get('cacheNews'))
    }catch(e){
        console.log('@ e => ', e)
    }
    
}

go()