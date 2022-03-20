import './init'
import { getDatabase, ref, child, set, get } from "firebase/database";

const db = getDatabase()
const dbRef = ref(db)

const writeUserData = async (uid, username, email, avatarHash, avatarUrl) => {
  await set(child(dbRef, `users/${uid}`), {
    username,
    email,
    avatarHash,
    avatarUrl
  });
  console.log('RealtimeDB set OK!')
}

const readUserData = async (uid) => {
  try{
    const snapshot = await get(child(dbRef, `users/${uid}`))
    return snapshot
  }catch(e){
    console.log('Err => ', e)
  }
  

}

export {
    writeUserData,
    readUserData
}