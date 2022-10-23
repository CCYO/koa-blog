/**
 * @description 數據格式化
 */

/**
 * 
 * @typedef {{ id: number, nickname: string }} author
 * @typedef {{ type: number, id: number, blog_id: id, title: string, author: { author }, timestamp: string }} newsItmeForPeople
 * @typedef {{ id: number }} theNewsItem 
 * @param { { confirm: [{newsItmeForPeople|}], unconfirm: []}} newsList 
 * @returns {{ people: { theNewsItem }, blogs: { theNewsItem }}}
 */

function init_newsOfFollowId(newsList) {
    let res = {
        confirm: { people: [], blogs: [] , comments: []},
        unconfirm: { people: [], blogs: [] , comments: []}
    }

    for (confirmRoNot in newsList) {
        let list = newsList[confirmRoNot]
        let target = res[confirmRoNot]
        if(!list.length){
            continue
        } 
        list.forEach(({ type, id }) => {
            type === 1 && target.people.push(id)
            type === 2 && target.blogs.push(id)
            type === 3 && target.comments.push(id)
        })
    }

    return res
}

function init_excepts(excepts){
	let res = { people: [], blogs: [], comments: [], num: 0}
    /*excepts: {
        unconfirm: { 
            people: [ id, ... ],
            blogs: [ id, ... ],
            comments: [ id, ...],
            num: NUMBER
        },
        confirm: { ... }
    }*/
	for(key in excepts){
		let map = new Map(Object.entries(excepts[key]))
    	map.forEach((list, k) => {
            if(k === 'num'){
                res.num += list
                return
            }
    		res[k] = [...res[k], ...list]
        })
    }
    return res
}


module.exports = {
    init_newsOfFollowId,
    init_excepts
}