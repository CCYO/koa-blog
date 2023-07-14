const ejs = require('ejs')
const { join } = require('path')

async function renderFile(filename, data){
    return new Promise((resolve, reject) => {
        let file = join( __dirname , '../views/', `${filename}.ejs`)
        console.log('@file => ', file)
        ejs.renderFile(file, data, (error, res) => {
            if(error){
                reject(error)
                return
            }
            resolve(res)
            return
        })
    })
}

module.exports = {
    renderFile
}