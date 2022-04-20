const router = require('koa-router')()

const axios = require('axios')

const storage = require('../../firebase/init')

router.get('/ttt', async (ctx, next) => {
  try {
    let bucket = storage.bucket()
    console.log('### => ', bucket.name)
    let file = bucket.file('0419/Logo321.jpg')
    let res = file.publicUrl()
    console.log(res)
    //let res = await bucket.upload('/home/a001ccy/koa-blog/index.html', {destination: '祐/首頁圖.html'})
    // const [files, next, apires] = await bucket.getFiles({delimiter: '/', prefix: 'a/', autoPaginate: false})
    // files.forEach( file => console.log(file.name))
    // apires['items'].forEach( res => console.log(JSON.stringify(res)))
    // console.log(apires.items[0] === files[0])
    //const exist = await bucket.get()
    // const config = {
    //   action: 'list',
    //   expires: '03-17-2025'
    // };
    // const [url] = await bucket.getSignedUrl(config)
    // const resp = await axios(url)
    
      // resp.statusCode = 200
    //const res = await bucket.get('abc')
    //const exist = await bucket.file('Logo321.jpg').exists()
    
    ctx.body ='ok'
    return
  } catch (err) {
    console.error('ERROR:', err);
    ctx.body ='nok'
    return
  }
})

router.get('/tt-realtime', async (ctx, next) => {
  let st = ref.child('st')
  let res
  try {
    res = await st.set({
      a: '1',
      b: '2',
      c: '3'
    })
    console.log('@ => ', res)
    ctx.body = 'realtime OK'
  }catch(e){
    console.log('eee => ', e)
    ctx.body = 'realtime NOK'
  }  
})

router.get('/tt-auth', async (ctx, next) => {
  try{
    userRecord = await auth.getUserByEmail('tt20220320@gmail.com')
    console.log('OK => ', userRecord.toJSON())
    ctx.body = 'auth ok'
  }catch(e){
    console.log('err => ', e)
    ctx.body = 'auth nok'
  }
})

router.get('/tt-storage', async (ctx, next ) => {
  try{
    const b = storage.bucket('abc')
    const exist = await b.exists()
    //const exist = await b.exists('Logo321.jpg')
    //console.log('exist => ', exist)
    console.log('@ => ', exist)
    ctx.body = 'ok'
  }catch(e){
    console.log('err => ', e)
    ctx.body = 'Nok'
  }  
})

module.exports = router