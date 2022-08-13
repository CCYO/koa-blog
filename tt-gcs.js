const { storage } = require('./db/firebase')

async function go() {
    let b = storage.bucket()
    let f = b.file('avatar/703fa0a75dffacb5205dd8e70b014b07.jpg')

    await f.makePublic()
    console.log('@ url => ', f.publicUrl())
}

go()
