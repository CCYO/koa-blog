//  0404
function filterEmptyAndFranferFns(data, ...fns){
    let res = data
    if(!fns.length){
        res = init(data)
    }
    for(let fn of fns){
        res = init(res, fn)
    }
    return res
}
//  0404
function init(data, fn){
    let res
    if(Array.isArray(data)){
        res = initDatas(data, fn)
    }else{
        res = initData(data, fn)
    }
    return res
}
//  0404
function initDatas(datas, fn){
    if(!datas.length){
        return []
    }
    if(!fn){
        return datas
    }
    return datas.map( data => initData(data, fn) )
}
//  0404
function initData(data, fn){
    if(!data){
        return null
    }
    if(!fn){
        return data
    }
    return fn(data)
}

function initDatasForArray(datas, fn){
    if(!datas.length){
        return []
    }
    if(!fn){
        return datas
    }
    return fn(datas)
}
function initForArray(data, fn){
    let res
    if(Array.isArray(data)){
        res = initDatasForArray(data, fn)
    }else{
        res = initData(data, fn)
    }
    return res
}

function filterEmptyAndFranferFnsForArray(data, ...fns){
    let res = data
    if(!fns.length){
        res = initForArray(data)
    }
    for(let fn of fns){
        res = initForArray(res, fn)
    }
    return res
}

module.exports = {
    filterEmptyAndFranferFns,
    filterEmptyAndFranferFnsForArray
}