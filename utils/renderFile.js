const { renderFile } = require('ejs')

module.exports = function (fileName, data){
    return new Promise( (resolve, reject) => {
        renderFile(fileName, data, function(err, str){
            if(err){
                console.log('@ejs.render 發生錯誤 => ', err)
                return reject(err)
            }
            resolve(str)
        })
    })
}