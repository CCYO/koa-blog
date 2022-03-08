/**
 * @description firebase auth
 */
import './init'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { async } from '@firebase/util';

const auth = getAuth();

onAuthStateChanged(auth, user => {
    if(user){
        const uid = user.uid
        console.log('NOW user is => ', uid)
    }else{
        console.log('user signed out!')
    }
})

const create = async ( email, password ) => {
    try{
        let { user } = await createUserWithEmailAndPassword(auth, email, password)
        console.log('auth create OK! user => ', user);
        return user
    }catch(error){
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('auth create Err! => ', error)
    }
}

const findCurrentUser = async () => {
    const user = auth.currentUser
    if(user){
        console.log('currentUser => ', user)
        return user
    }else{
        console.log('currentUser no exist!')
        return null
    }
}

const signIn = async (email, pwd) => {
    const { user } = await signInWithEmailAndPassword(auth, email, pwd)
    console.log('singin OK, user => ', user)
}

const logout = async () => {
    const uid = auth.currentUser.uid
    const o = await signOut(auth)
    console.log('currentUser  logout! => ', o)
}

export {
    create,
    findCurrentUser,
    signIn,
    logout
}