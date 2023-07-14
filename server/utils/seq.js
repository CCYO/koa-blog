
function toJSON(list){
    if(list instanceof Array){
        return list.map( item => item.toJSON())
    }
    return list.toJSON()
}

module.exports = {
    toJSON
}