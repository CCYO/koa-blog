/**
 * @description Model api相關
 */

class _Model {
    constructor({errno = 0, msg = undefined, data = undefined, cache = undefined}){
        this.errno = errno
        if(msg) this.msg = msg
        if(data) this.data = data
        if(cache) this.cache = cache
    }
}

class SuccModel extends _Model {
    constructor(obj = {data: undefined , cache: undefined }){
        super(obj)
    }
}

class ErrModel extends _Model {
    constructor({errno, msg}){
        super({errno, msg})
    }
}

class MyErr extends Error {
    constructor({errno, msg, err}){
        super(err)
        this.errno = errno
        this.msg = msg
    }
}

module.exports = {
    SuccModel,
    ErrModel,
    MyErr
}