/**
 * @description firebase init
 */

//const admin = require('firebase-admin');
const {initializeApp, applicationDefault} = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getStorage } = require('firebase-admin/storage')
//  const serviceAccount = require('../conf/GFB_admin_key.json');

const app = initializeApp({
  //  applicationDefault() 會撈取 $GOOGLE_APPLICATION_CREDENTIALS → 服務帳號的密鑰json
  //  export GOOGLE_APPLICATION_CREDENTIALS="/home/study4/koa-blog/conf/GFB_admin_key.json"
  //  確認 echo $GOOGLE_APPLICATION_CREDENTIALS
  credential: applicationDefault(),
  // storageBucket: "gfb20220419.appspot.com" 沒辦法寫在 服務帳號的密鑰json 內?gs://
  storageBucket: "koa-blog-a003ccy.appspot.com"
})

// const app = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const storage = getStorage(app)

const auth = getAuth(app)

module.exports = {
  storage,
  auth
}