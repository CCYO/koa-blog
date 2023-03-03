const { resolve } = require('path') //0228

const { renderFile } = require('ejs')   //  0228

let ejs_comments = resolve(__dirname, '../views/wedgets/comment-list.ejs')  //  0228

let htmlStr = { confirm: undefined, unconfirm: undefined }


let ejs_newsList = resolve(__dirname, '../views/wedgets/navbar/news/news-list.ejs')

//  0228
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

//  0228
async function htmlStr_comments(comments){
    if(!comments.length){
        return ''
    }
    return await _renderFile(ejs_comments, { comments })
}

async function htmlStr_newsList(newsList){
    let htmlStr = {}
    for( confirmOrNot in newsList ){
        let list = newsList[confirmOrNot]
        htmlStr[confirmOrNot] = list.length && await _renderFile(ejs_newsList, { list }) || undefined
    }
    return htmlStr
}



module.exports = {
    htmlStr_newsList,

    htmlStr_comments    //  0228
}