const { COMMENT: { CHECK_IS_DELETED, SORT_BY }} = require('../conf/constant')
//  0228
function removeDeletedComment(list) {
    //  計算出每串留言串 > (1)共包含幾篇留言 (2)含幾篇已刪除的留言
    let map = getListOfNeedToDelete(list)
    return filterFromMap(list, map)

    function filterFromMap(_list, map) {
        //  深拷貝
        let list = deepCopy(_list)
        //let { mapTotal, mapDel } = map

        map.forEach((id) => {
            //  包含的留言總數 = 包含的已被刪除的留言總數

            //  移除該串留言
            removeDeletedCommentList(list, id)
        })
        return list

        //  移除整串都已刪除的的留言串
        function removeDeletedCommentList(list, id) {
            list.some((comment, ind, _list) => {
                if (comment.id === id) {
                    list.splice(ind, 1)
                    return true
                } else if (comment.reply.length) {
                    removeDeletedCommentList(comment.reply, id)
                }
            })
        }
    }

    function getListOfNeedToDelete(commentList, _opts = { p_id: undefined, map: undefined }) {
        let opts
        //  若 opts.map 未定義，代表初次調用此getListOfNeedToDelete
        if (!_opts.map) {
            //  初始化 map（用來紀錄被刪除的comment）
            opts = {
                map: { mapTotal: new Map(), mapDel: new Map() }
            }
        } else {    //  opts.map 有值，代表非初次調用
            opts = _opts
        }
        //  針對已被刪除的 comment 進行統計，並將統計的結果記錄在 opts.map
        commentList.forEach(comment => {
            delete comment[SORT_BY]
            //  若 comment 已被刪除，則將其數據存入map
            // if (comment.deletedAt) {
            if (comment[CHECK_IS_DELETED]) {
                statisticsByMap(comment, opts)
            }
            //  若沒有p_id，代表這次的list是一次新的循環，且擁有留言串，則再將留言串放入統計函數中
            if (!opts.p_id && comment.reply.length) {
                getListOfNeedToDelete(comment.reply, opts)
            }
        })
        //  若非第一次調用的count，則停在這裡
        if (_opts.map) {
            return
        }
        //  返回統計好的 map
        //  return opts.map
        let { mapTotal, mapDel } = opts.map
        let NeedDeleteList = []
        mapDel.forEach((set, p_id) => {
            if (mapTotal.get(p_id).size === set.size) {
                NeedDeleteList.push(p_id)
                return
            }
        })
        NeedDeleteList.forEach((p_idNeedDelete, ind, _arr) => {
            mapDel.forEach((set, p_id) => {
                if (p_id !== p_idNeedDelete) {
                    if (NeedDeleteList.includes(p_id) && set.has(p_idNeedDelete)) {
                        delete _arr[ind]
                    }
                } else {
                    return
                }
            })
        })

        return NeedDeleteList.filter(p_id => p_id)
        //  針對當前留言「是否已被刪除」、「是否含有留言串」 > (1)計入所屬留言串的刪減數 (2)計入所屬留言串的留言總數
        function statisticsByMap(comment, opts) {
            let { p_id, map } = opts
            let { mapTotal, mapDel } = map
            //  當前要統計的數據，屬於哪一筆留言串id
            let commentId = p_id ? p_id : comment.id
            //  當前留言串的留言總數
            let p_idReplyTotal = mapTotal.get(commentId)

            //  若所屬留言串總數的統計資料未初始化，則設定為1
            if (!p_idReplyTotal) {
                p_idReplyTotal = new Set()
            }

            let reply = comment.reply
            //  所屬留言串總數 + 當前留言串的留言數
            reply.forEach(({ id }) =>
                p_idReplyTotal.add(id)
            )
            //  重新設置所屬留言串總數
            mapTotal.set(commentId, p_idReplyTotal)

            //  所屬留言串所包含的 已刪除留言數量
            let p_idDelCount = mapDel.get(commentId)
            if (!p_id && !p_idDelCount) {  //  若此次為所屬留言串總數的根留言 且 p_idDelCount統計資料未定義，則設定為0
                p_idDelCount = new Set()
            } else if (p_id) {   //  否則 p_idDelCount + 1，並重新設定所屬留言串的已刪除留言數量
                p_idDelCount.add(comment.id)
            }
            mapDel.set(commentId, p_idDelCount)
            //  當前留言仍還有留言串，則將留言串放入 statisticsByMap 統計函數內
            if (reply.length) {
                getListOfNeedToDelete(reply, {
                    p_id: commentId,
                    map
                })
            }
        }
    }

    function deepCopy(inputObject, prop) {
        if (typeof inputObject !== 'object' || inputObject === null) {
            return inputObject
        }
        let box = Array.isArray(inputObject) ? [] : {}
        for (let prop in inputObject) {
            let val = inputObject[prop]
            box[prop] = deepCopy(val, prop)
        }
        return box
    }
}




module.exports = removeDeletedComment   //  0228