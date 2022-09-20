let { Op } = require('sequelize')
let { init_comment_4_blog } = require('./utils/init/comment')
let { Comment } = require('./db/mysql/model/index')

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



go()

async function go() {
    try {
        let x = await Comment.findAll({ where: { p_id: null } })
        console.log(x.map( _ => _.toJSON()))
    } catch (e) {
        console.log(e)
    }
}