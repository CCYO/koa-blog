let { init_comment_4_blog } = require('./utils/init/comment')

let init = []
let arr = [
    { id: 1, pid: undefined },
    { id: 2, pid: undefined },
    { id: 21, pid: 2 },
    { id: 3, pid: undefined },
    { id: 31, pid: 3 },
    { id: 32, pid: 3 },
    { id: 321, pid: 32 },
    { id: 4, pid: undefined },
    { id: 41, pid: 4 },
    { id: 411, pid: 41 },
    { id: 4111, pid: 411 },
]



go(arr)

function go(item) {
    let target
    let init = []
    item.forEach( one => {
        one.reply = []
        if(!one.pid){
            init.push(one)
        }else{
            findAndPush(init, one)
        }
    })
    function findAndPush(init, item) {
        init.some((one, ind) => {
            target = init[ind]
            if (one.id === item.pid) {
                target.reply.push(item)
                return true
            }
            if (target.reply.length) {
                target = target.reply
                findAndPush(target, item)
            }
        })
        return init
    }
}