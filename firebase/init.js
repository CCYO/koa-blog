/**
 * @description firebase init
 */

const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage')

const serviceAccount = require('../conf/GFB_admin_key.json');

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gfb20220419.appspot.com",
  });

const storage = getStorage(app)

module.exports = storage