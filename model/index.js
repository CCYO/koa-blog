/**
 * @description Model api相關
 */

class _Model {
    constructor({errno = 0, msg = undefined, data = undefined}){
        this.errno = errno
        if(msg) this.msg = msg
        if(data) this.data = data

    }
}

class SuccModel extends _Model {
    constructor(data){
        super({data})
    }
}

class ErrModel extends _Model {
    constructor({errno, msg}){
        super({errno, msg})
    }
}

module.exports = {
    SuccModel,
    ErrModel
}