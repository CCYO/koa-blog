const date = require('date-and-time')
const { BLOG: { PAGINATION, TIME_FORMAT, ORGANIZED: { TARGET_PROP, TYPE, TIME } } } = require('../conf/constant')

//  分纇為 { [PUBLIC]: blogs, [PRIVATE]: blogs }
function organizeByTargetProp(list, options) {
    let opts = _resetOptions(options)
    let { markProp, organizeTypes } = opts
    let { POSITIVE, NEGATIVE } = organizeTypes
    let organize = { [POSITIVE]: [], [NEGATIVE]: [] }
    if (!list.length) {
        return organize
    }
    //  依公開與否分纇
    return list.reduce((acc, item) => {
        let boo = item[markProp]
        let status = boo ? POSITIVE : NEGATIVE

        acc[status].push(item)
        return acc
    }, organize)
}

//  格式化時間數據 + 排序
function initTimeFormatAndSort(list, options) {
    let opts = _resetOptions(options)
    let { markProp, timeType, timeFormat } = opts
    if (!list.length) {
        return []
    }
    let boo = list[0][markProp]
    let { POSITIVE, NEGATIVE } = timeType
    let markTime = boo ? POSITIVE : NEGATIVE
    //  判斷要以甚麼數據作排列
    let resList = list.sort((A, B) => {
        //  轉換為DATE數據
        //  從新到舊排序
        return new Date(B[markTime]) - new Date(A[markTime])
    })
    //  指定時間格式
    return resList.map(item => {
        item.time = item[markTime]
        delete item[POSITIVE]
        delete item[NEGATIVE]
        return item
    })
}

//  
function pagination(list, options) {
    let opts = _resetOptions(options)
    let { pagination } = opts
    return list.reduce((acc, item) => {
        let page = acc.length - 1
        let countInPage = acc[page].length
        if (countInPage < pagination) {
            acc[page].push(item)
        } else {
            acc.push([item])
        }
        return acc
    }, [[]])
}

function organizedList(list, options) {
    let opts = _resetOptions(options)
    let organize = organizeByTargetProp(list, opts)
    for (let type in organize) {
        let items = organize[type]
        items = initTimeFormatAndSort(items, opts)
        organize[type] = pagination(items, opts)
    }
    
    return organize
}

//  若有傳入 opts，則將相應的屬性覆蓋
function _resetOptions(options){
    let opts = {
        markProp: TARGET_PROP,
        organizeTypes: TYPE,
        timeType: TIME,
        timeFormat: TIME_FORMAT,
        pagination: PAGINATION
    }
    if(!options){
        return opts
    }
    
    let map = new Map(Object.entries(options))
    if(map.size){
        map.forEach((v,k) => {
            opts[k] = v
        })
    }
    return opts
}

module.exports = {
    organizedList,
    initTimeFormatAndSort
}