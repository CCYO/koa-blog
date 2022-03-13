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
const update = async (filename, file, ext) => {
    const storageRef = ref(storage, filename)
    const mata = { contentType: `image/${ext}`}
    const snapshot = await uploadBytes(storageRef, file , mata)
    console.log('Uploaded a blob or file! snapshot => ', snapshot);
    return snapshot
};

const getUrl = async (filename) => {
    const storageRef = ref(storage, filename)
    const url = await getDownloadURL(storageRef)
    return url
}

export {
    update,
    getUrl
}