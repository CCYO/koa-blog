const router = require('koa-router')()

const axios = require('axios')

const { async } = require('@firebase/util');

const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth')
const { getStorage } = require('firebase-admin/storage')

//const { Storage } = require('@google-cloud/storage')

//console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)

const serviceAccount = require('../keys/admin/firebase-4-koa-blog.json');

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "fir-4-koa-blog.appspot.com",
  });

console.log(`APP NAME => ${app.name}`)

//const auth = getAuth()
const storage = getStorage(app)
//const storage = new Storage()
console.log(`STORAGE => ${storage.app.name}`)

router.get('/ttt', async (ctx, next) => {
  try {
    let bucket = storage.bucket('abc44561')
    let file = bucket.file('gg/Logo321.jpg')
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


//let db = getDatabase()
//let ref = db.ref("test")

//ok
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


//ok
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

//d
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