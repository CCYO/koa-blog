/**
 * @description firebase init
 */
const {initializeApp, applicationDefault} = require('firebase-admin/app')
const { getStorage } = require('firebase-admin/storage')
const { GFB_CONF } = require('../../conf/db')

const credential = applicationDefault()
console.log('@credential => ', credential)
const firebaseConfig = {
  //  applicationDefault() 會撈取 環境變量GOOGLE_APPLICATION_CREDENTIALS存放的路徑，作為服務帳號的密鑰(json格式)
  //  ex: $ export GOOGLE_APPLICATION_CREDENTIALS="/home/使用者帳號/koa-blog/server/conf/GFB_admin_key.json"
  //  在終端可以用 echo 確認 → echo $GOOGLE_APPLICATION_CREDENTIALS
  //  在node運行時，可以用 process.env.GOOGLE_APPLICATION_CREDENTIALS 確認
  //  不過，此部分我是用dotenv來做設定的
  credential,
  //  firebase storage 功能，需額外設置 firebaseConfig.storageBucket
  //  參考 → https://reurl.cc/AyV3Ke
  storageBucket: GFB_CONF.storageBucket
}

/*
const admin = require('firebase-admin');
const serviceAccount = require("../../conf/key/GFB_admin_key.json");
const credential = admin.credential.cert(serviceAccount)
const firebaseConfig = {
  credential,
  storageBucket: GFB_CONF.storageBucket
}
*/

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

module.exports = {
  storage
}