import './init'
import { getDatabase, ref, set } from "firebase/database";

const writeUserData = async (uid, username, email, avatar) => {
  const db = getDatabase();
  await set(ref(db, 'users/' + uid), {
    username,
    email,
    avatar
  });
  console.log('RealtimeDB set OK!')
}

export {
    writeUserData
}