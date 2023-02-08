var list = [
    {
        id: 1, deletedAt: 1, reply: [
            {
                id: 2, deletedAt: 0, reply: []
            }
        ]
    },
    {
        id: 3, deletedAt: 1, reply: [
            {
                id: 4, deletedAt: 1, reply: []
            },
            {
                id: 5, deletedAt: 1, reply: [
                    {
                        id: 6, deletedAt: 0, reply: []
                    }
                ]
            },
            {
                id: 7, deletedAt: 1, reply: [
                    {
                        id: 8, deletedAt: 1, reply: []
                    }
                ]
            }
        ]
    },
]

function removeDeletedComment(list) {
    //  計算出每串留言串 > (1)共包含幾篇留言 (2)含幾篇已刪除的留言
    let map = getMap_TatalAndDeletedCount(list)
    return filterFromMap(list, map)

    function filterFromMap(_list, map) {
        //  深拷貝
        let list = deepCopy(_list)
        let { mapTotal, mapDel } = map

        let xxx = 0
        mapTotal.forEach((num, id) => {
            //  包含的留言總數 = 包含的已被刪除的留言總數
            if (mapDel.get(id) === num) {
                //  移除該串留言
                removeDeletedCommentList(list, id)
            }
        })
        return list
        removeEmpty(list)

        function removeEmpty(list) {
            return list.filter(comment => {
                if (comment) {
                    if (comment.reply.length) {
                        comment.reply = removeEmpty(comment.reply)
                    }
                    return comment
                }
            })

        }
        
        //  移除整串都已刪除的的留言串
        function removeDeletedCommentList(list, id) {
            console.log(xxx++)
            list.some((comment, ind, _list) => {
                console.log('I => ', ind)
                if (comment.id === id) {
                    console.log('Y => ', id)
                    list.splice(ind, 1)
                    // delete list[ind]
                    console.log('@ => ', list)
                    
                    // list = list.filter(item => item)
                    console.log('X => ', list)
                    return true
                } else if (comment.reply.length) {
                    console.log('YY => ', id)
                    removeDeletedCommentList(comment.reply, id)
                }
            })
        }
    }

    function getMap_TatalAndDeletedCount(list, _opts = { pid: undefined, map: undefined }) {
        let opts
        if (!_opts.map) {
            opts = {
                map: { mapTotal: new Map(), mapDel: new Map() }
            }
        } else {
            opts = _opts
        }

        list.forEach(comment => {
            if (comment.deletedAt) {
                statistics(comment, opts)
            }
            if (!opts.pid & comment.reply.length) {
                getMap_TatalAndDeletedCount(comment.reply, opts)
            }
        })
        //  若非第一次調用的count，則停在這裡
        if (_opts.map) {
            return
        }
        //  返回統計好的 map
        return opts.map

        //  針對當前留言「是否已被刪除」、「是否含有留言串」 > (1)計入所屬留言串的刪減數 (2)計入所屬留言串的留言總數
        function statistics(comment, opts) {
            let { pid, map } = opts
            let { mapTotal, mapDel } = map
            //  當前要統計的數據，屬於哪一筆留言串id
            let commentId = pid ? pid : comment.id
            //  當前留言串的留言總數
            let pidReplyTotal = mapTotal.get(commentId)

            //  若所屬留言串總數的統計資料未初始化，則設定為1
            if (!pidReplyTotal) {
                pidReplyTotal = 1
            }

            let reply = comment.reply
            //  所屬留言串總數 + 當前留言串的留言數
            pidReplyTotal += reply.length
            //  重新設置所屬留言串總數
            mapTotal.set(commentId, pidReplyTotal)

            //  所屬留言串所包含的 已刪除留言數量
            let pidDelCount = mapDel.get(commentId)
            if (!pid & !pidDelCount) {  //  若此次為所屬留言串總數的根留言 且 pidDelCount統計資料未定義，則設定為0
                mapDel.set(commentId, 1)
            } else if (pid) {   //  否則 pidDelCount + 1，並重新設定所屬留言串的已刪除留言數量
                mapDel.set(commentId, pidDelCount + 1)
            }
            //  當前留言仍還有留言串，則將留言串放入 statistics 統計函數內
            if (reply.length) {
                getMap_TatalAndDeletedCount( reply, {
                    pid: commentId,
                    map
                })
            }
        }
    }

    function deepCopy(inputObject) {
        if (typeof inputObject !== 'object' || inputObject === null) {
            return inputObject
        }
        let box = Array.isArray(inputObject) ? [] : {}
        for (let prop in inputObject) {
            let val = inputObject[prop]
            box[prop] = deepCopy(val)
        }
        return box
    }
}



let dd = removeDeletedComment(list)
console.log(JSON.stringify(dd))