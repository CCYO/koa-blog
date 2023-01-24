/**
 * @description firebase init
 */

//const admin = require('firebase-admin');
const {initializeApp, applicationDefault} = require('firebase-admin/app')
const { getStorage } = require('firebase-admin/storage')
const { GFB_CONF } = require('../../conf/key/db')
const firebaseConfig = {
  //  applicationDefault() 會撈取 $GOOGLE_APPLICATION_CREDENTIALS → 服務帳號的密鑰json
  //  export GOOGLE_APPLICATION_CREDENTIALS="/home/study4/koa-blog/conf/GFB_admin_key.json"
  //  在終端可以用 echo 確認 → echo $GOOGLE_APPLICATION_CREDENTIALS
  //  在node運行時，可以用 process.env.GOOGLE_APPLICATION_CREDENTIALS 確認
  credential: applicationDefault(),
  //  firebase storage 功能，需額外設置 firebaseConfig.storageBucket
  //  參考 → https://reurl.cc/AyV3Ke
  storageBucket: GFB_CONF.storageBucket
}

const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

module.exports = {
  storage
}