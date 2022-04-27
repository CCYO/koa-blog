//test

const storage = require('./firebase/init')

async function getFileData(){
	const file_form_GCS = storage.bucket().file('2/avatar.jpg')
    const res = await file_form_GCS.makePublic()
    console.log('@ => ', res)
	//const [{ md5Hash }] = await file_form_GCS.getMetadata()
    
	
}

(async () => {
	try{
		await getFileData()
	}catch(e){
		console.log('ERR =>', e)
	}
})()


