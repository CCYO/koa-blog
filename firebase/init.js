/**
 * @description firebase init
 */

const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage')

const serviceAccount = require('../keys/admin/firebase-4-koa-blog.json');

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "fir-4-koa-blog.appspot.com",
  });

const storage = getStorage(app)

module.exports = storage