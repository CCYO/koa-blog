const { resolve } = require('path')

const { renderFile } = require('ejs')

let htmlStr = { confirm: undefined, unconfirm: undefined }

let ejs_newsList = resolve(__dirname, '../views/wedgets/navbar/news/news-list.ejs')

async function htmlStr_newsList(newsList){
    let htmlStr = {}
    for( confirmOrNot in newsList ){
        let list = newsList[confirmOrNot]
        htmlStr[confirmOrNot] = list.length && await _renderFile(ejs_newsList, { list }) || undefined
    }
    return htmlStr
}

function _renderFile(fileName, data) {
    return new Promise((resolve, reject) => {
        renderFile(fileName, data, function (err, str) {
            if (err) {
                console.log('@ejs.render 發生錯誤 => ', err)
                return reject(err)
            }
            resolve(str)
        })
    })
}

module.exports = {
    htmlStr_newsList
}