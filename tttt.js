let map_allReplyCount = new Map()
//  整理要檢查的名單
function getReplyCount(commentList){
    re(commentList)
    return map_allReplyCount
    function re(commentList){
        commentList.forEach( comment => {
            console.log(`commentId => ${comment.id}`)
            countReply(comment)
            if(comment.reply.length){
                console.log('@out id ', comment.id)
                console.log('@out reply ', comment.reply)
                comment.reply.forEach(countReply)
            }
        })
    }
    function countReply(comment, pid){
        let id = pid ? pid : comment.id
        let _allReplyCount = map_allReplyCount.get(id)
        _allReplyCount = _allReplyCount ? _allReplyCount : 1
        map_allReplyCount.set(id, _allReplyCount)
        
        let del = cache_deleteCount.get(id)
        if(!del){
            del = 0
        }
        if(comment.deletedAt){
            cache_deleteCount.set(id, del + 1)
        }
        let reply = comment.reply
        console.log('@reply ', reply)
        
        if(reply.length){
            map_allReplyCount.set(id, _allReplyCount + reply.length)
            reply.forEach( c => countReply(c, id) )
        }
    }
}

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
getReplyCount(list)