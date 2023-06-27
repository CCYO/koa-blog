/**
 * @description Model api相關
 */
const ErrRes = require('./errRes')  //  0404
//  0404
class _Model {
    constructor({errno = 0, msg = undefined, data = undefined, cache = undefined}){
        this.errno = errno
        if(msg) this.msg = msg
        if(data) this.data = data
        if(cache) this.cache = cache
    }
}
//  0404
class SuccModel extends _Model {
    constructor(obj = {data: undefined , cache: undefined }){
        super(obj)
    }
}
//  0404
class ErrModel extends _Model {
    constructor({errno, msg}){
        super({errno, msg})
    }
}
//  0404
class MyErr extends Error {
    constructor({errno, msg, err}){
        super(err)
        this.errno = errno
        this.msg = msg
    }
    isMyErr = true
}
module.exports = {
    ErrRes,
    SuccModel,
    ErrModel,
    MyErr
}