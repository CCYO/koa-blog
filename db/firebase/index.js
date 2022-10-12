/**
 * @description firebase init
 */

//const admin = require('firebase-admin');
const {initializeApp, applicationDefault} = require('firebase-admin/app')
const { getStorage } = require('firebase-admin/storage')
//  const serviceAccount = require('../conf/GFB_admin_key.json');
console.log('@環境變量 => ', process.env.GOOGLE_APPLICATION_CREDENTIALS)
const ops = {
  //  applicationDefault() 會撈取 $GOOGLE_APPLICATION_CREDENTIALS → 服務帳號的密鑰json
  //  export GOOGLE_APPLICATION_CREDENTIALS="/home/study4/koa-blog/conf/GFB_admin_key.json"
  //  在終端可以用 echo 確認 → echo $GOOGLE_APPLICATION_CREDENTIALS
  //  在node運行時，可以用 process.env.GOOGLE_APPLICATION_CREDENTIALS 確認
  credential: applicationDefault(),
  // storageBucket: "gfb20220419.appspot.com" 沒辦法寫在 服務帳號的密鑰json 內?gs://
  storageBucket: "koa-a004ccy.appspot.com"
}

const app = initializeApp(ops)

// const app = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const storage = getStorage(app)

module.exports = {
  storage
}