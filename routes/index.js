const router = require('koa-router')()
const { async } = require('@firebase/util');

const { initializeApp, applicationDefault, cert} = require('firebase-admin/app');
//const { getDatabase } = require('firebase-admin/database');
//const { getAuth } = require('firebase-admin/auth')

//const {Storage} = require('@google-cloud/storage');
const { getStorage } = require('firebase-admin/storage')

const session = require('../cache/store');

//console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const serviceAccount = require('../keys/cloudStorage/euphoric-stone-337905-b3853b6aedbc.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'koa-blog-302b1.appspot.com'
});

const bucket = getStorage().bucket();

router.get('/ttt', async (ctx, next) => {
  try {
    
    ctx.body ='ok'
    return
  } catch (err) {
    console.error('ERROR:', err);
    ctx.body ='nok'
    return
  }
})
/*
const app = initializeApp({
  credential: applicationDefault(),
  //databaseURL: 'https://a001ccy-koa-blog.firebaseio.com'
  //↑官網的格式 ↓實際上的格式
  databaseURL: "https://koa-blog-302b1-default-rtdb.asia-southeast1.firebasedatabase.app/",
  //  預設就有
  storageBucket: "koa-blog-302b1.appspot.com"
});
*/

//const auth = getAuth()
//const storage = getStorage()

let count = 0

//let db = getDatabase()
//let ref = db.ref("test")

router.get('/', async (ctx, next) => {
  if(ctx.session && ctx.session.count == null){
    ctx.session.count = count
    return ctx.body = ctx.session.count
  }
  console.log('@@@@ => ', ctx.session.count)
  ctx.session.count ++
  return ctx.body = ctx.session.count
})

//ok
router.get('/tt-realtime', async (ctx, next) => {
  let st = ref.child('st')
  let res
  try {
    res = await st.set({
      a: '1',
      b: '2'
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

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
