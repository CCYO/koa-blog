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

const _init_error = (e) => {
    if(!(e instanceof Error)) return e
    return JSON.parse(
        JSON.stringify(
            e,
            Object.getOwnPropertyNames(e)
        )
    )
}

class ErrModel extends Error {
    constructor({errno, msg}, e){
        super()
        this.stack = e.stack
        this.message = e.message
        this.errno = errno
        this.msg = msg
    }
}

class WarnModel extends _Model {
    constructor({errno, msg}){
        super({errno, msg})
    }
}

module.exports = {
    SuccModel,
    WarnModel,
    ErrModel
}