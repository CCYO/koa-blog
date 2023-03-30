function initData(data, fn){
    if(!data){
        return null
    }
    if(!fn){
        return data
    }
    return fn(data)
}
function initDatas(data, fn){
    if(!data.length){
        return []
    }
    if(!fn){
        return data
    }
    return data.map(fn)
}
function init(data, fn){
    let res
    if(Array.isArray(data)){
        res = initDatas(data, fn)
    }else{
        res = initData(data, fn)
    }
    return res
}
function filterEmpty(data, ...fns){
    let res
    if(!fns.length){
        res = init(data)
    }
    for(let fn of fns){
        res = re(data, fn)
    }
    return res
}

module.exports = filterEmpty