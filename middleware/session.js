const { SuccModel } = require('../model')   //  0404
//  取得登入者session  0228
async function get(ctx){
    console.log('@取得登入資料')
    let data = ctx.session.user
    ctx.body = new SuccModel({data})
}

module.exports = {
    get,    //  0228
}