/**
 * @description firebase auth
 */
import './init'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

export default async ( email, password ) => {
    try{
        let { user } = await createUserWithEmailAndPassword(auth, email, password)
        return user
    }catch(error){
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('x => ', error)
    }
}