import './init'

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApp } from "firebase/app";

// Get a non-default Storage bucket
const firebaseApp = getApp();

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);


// Create a reference to 'mountains.jpg'
const mountainsRef = ref(storage, 'mountains.jpg');

// Create a reference to 'images/mountains.jpg'
const mountainImagesRef = ref(storage, 'images/mountains.jpg');

// 'file' comes from the Blob or File API
const update = async (key, keyId, filename, file, ext) => {
    let storageRef
    if(key === 'avatar') storageRef = ref(storage, `uid_${keyId}/${filename}`)
    if(key === 'blogImg') storageRef = ref(storage, `bid_${keyId}/${filename}`)
    let contentType = ext === 'jpg' ? 'image/jpeg' : 'image/png'
    const mata = { contentType }
    const snapshot = await uploadBytes(storageRef, file , mata)
    console.log('Uploaded a blob or file! snapshot => ', snapshot);
    return snapshot
};

const getUrl = async (key, keyId, filename) => {
    let storageRef
    if(key === 'avatar') storageRef = ref(storage, `uid_${keyId}/${filename}`)
    if(key === 'blogImg') storageRef = ref(storage, `bid_${keyId}/${filename}`)
    const url = await getDownloadURL(storageRef)
    return url
}

export {
    update,
    getUrl
}