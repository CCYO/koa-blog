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

function ff(list) {
    let commentList = deepCopy(list)
    count(commentList)

    mapTotal.forEach((num, id) => {
        if (mapDel.get(id) === num) {
            // deleteList.push(id)
            go(commentList, id)
        }
        function go(commentList, id) {
            commentList.some((comment, ind, list) => {
                if (comment.id === id) {
                    delete list[ind]
                    return true
                } else if (comment.reply.length) {
                    return go(comment.reply, id)
                }
            })
        }
    })

    return removeEmpty(commentList)

    function removeEmpty(commentList) {
        return commentList.filter(comment => {
            if (comment) {
                if (comment.reply.length) {
                    comment.reply = removeEmpty(comment.reply)
                }
                return comment
            }
        })
    }

    function count(list) {
        let box = { mapTotal = new Map(), mapDel = new Map() }

        ccount(list)
        

        function ccount(list, pid) {
            list.forEach(comment => {
                if (comment.deletedAt) {
                    countDelete(comment, pid)
                }
                if (!pid & comment.reply.length) {
                    ccount(comment.reply)
                }
            })

            function countDelete(comment, pid) {
                let commentId = pid ? pid : comment.id
                let reply = comment.reply
                let curReplyCount = box.mapTotal.get(commentId)
                if (!curReplyCount) {
                    curReplyCount = 1
                }
                curReplyCount += reply.length
                box.mapTotal.set(commentId, curReplyCount)

                let curDelCount = box.mapDel.get(commentId)
                if (!pid & !curDelCount) {
                    box.mapDel.set(commentId, 1)
                } else if (pid) {
                    box.mapDel.set(commentId, curDelCount + 1)
                }
                if (reply.length) {
                    count(reply, commentId)
                }
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

let dd = ff(list)
console.log(JSON.stringify(dd))