/**
 * @description firebase init
 */


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_6oxFoSBBPZ0GQG1pjuH9r2ZoIx6Nnwo",
  authDomain: "a001ccy-koa-blog.firebaseapp.com",
  projectId: "a001ccy-koa-blog",
  storageBucket: "a001ccy-koa-blog.appspot.com",
  messagingSenderId: "858947802118",
  appId: "1:858947802118:web:01e5fa94c57af74f211f87",
  measurementId: "G-FK694Y1YQ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
