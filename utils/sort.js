const date = require('date-and-time')
const { BLOG: { PAGINATION, TIME_FORMAT, ORGANIZED: { TARGET_PROP, TYPE, TIME } } } = require('../conf/constant')

//  分纇為 { [PUBLIC]: blogs, [PRIVATE]: blogs }
function organizeByTargetProp(list, markProp = TARGET_PROP, organizeTypes = TYPE,) {
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
function initTimeFormatAndSort(list, markProp = TARGET_PROP, timeType = TIME, timeFormat = TIME_FORMAT) {
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
        return new Date(A[markTime]) - new Date(B[markTime])
    })
    //  指定時間格式
    return resList.map(item => {
        item.time = date.format(item[markTime], timeFormat)
        delete item[POSITIVE]
        delete item[NEGATIVE]
        return item
    })
}

//  
function pagination(list, count = PAGINATION) {
    return list.reduce((acc, item) => {
        let page = acc.length - 1
        let countInPage = acc[page].length
        if (countInPage < count) {
            acc[page].push(item)
        } else {
            acc.push([item])
        }
        return acc
    }, [[]])
}

function organizedList(list) {
    let organize = organizeByTargetProp(list)
    for (let type in organize) {
        let items = organize[type]
        items = initTimeFormatAndSort(items)
        organize[type] = pagination(items)
    }
    return organize
}

module.exports = {
    organizedList,
    initTimeFormatAndSort
}