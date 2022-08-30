

const { getNewsByUserId } = require('./controller/news')

async function go(){
    try{
        console.log(await getNewsByUserId(1, {people: [], blogs: [], comments: [56,57]}))
    }catch(e){
        console.log('@ e => ', e)
    }
    
}

go()