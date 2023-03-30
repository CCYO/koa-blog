function initData(data, fn){
    if(!data){
        return null
    }
    if(!fn){
        return data
    }
    return fn(data)
}
function initDatas(datas, fn){
    if(!datas.length){
        return []
    }
    if(!fn){
        return datas
    }
    return datas.map( data => initData(data, fn) )
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
    let res = data
    if(!fns.length){
        res = init(data)
    }
    for(let fn of fns){
        res = init(res, fn)
    }
    return res
}

module.exports = filterEmpty