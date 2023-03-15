const { resolve } = require('path') //0228

const { renderFile } = require('ejs')   //  0228

let ejs_comments = resolve(__dirname, '../views/wedgets/comment-list.ejs')  //  0228


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



module.exports = {

    htmlStr_comments    //  0228
}