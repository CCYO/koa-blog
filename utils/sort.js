const date = require('date-and-time')
const { BLOG: { PRIVATE, PUBLIC, PAGINATION, TIME_FORMAT, SORT_BY } } = require('../conf/constant')

//  分纇為 { [PUBLIC]: blogs, [PRIVATE]: blogs }
function organizeByTargetProp(list, organizeProps) {
    let [PUBLIC, PRIVATE] = organizeProps
    let organize = { [PUBLIC]: [], [PRIVATE]: [] }
    if (!list.length) {
        return organize
    }
    //  依公開與否分纇
    return list.reduce((acc, item) => {
        let value = item[PUBLIC]
        let status = value ? PUBLIC : PRIVATE

        acc[status].push(item)
        return acc
    }, organize)
}

//  格式化時間數據 + 排序
function initTimeFormatAndSort(list, targetTime, format = TIME_FORMAT) {
    //  判斷要以甚麼數據作排列
    let resList = list.sort((A, B) => {
        //  轉換為DATE數據
        //  從新到舊排序
        return new Date(A[targetTime]) - new Date(B[targetTime]) 
    })
    //  指定時間格式
    return resList.map( item => {
        console.log('@ => ', item, targetTime)
        item.time = date.format(item[targetTime], format)
        return item
    })
}

//  
function pagination(list, count = PAGINATION) {
    return list.reduce((acc, item) => {
        let page = acc.length - 1
        let countInPage = acc[page].length
        if( countInPage < count){
            acc[page].push(item)
        }else{
            acc.push([item])
        }
        return acc
    }, [ [] ])
}

function organizedList(list, organizeProps = [ PUBLIC, PRIVATE], sortBy = SORT_BY, timeFormat = TIME_FORMAT, count = PAGINATION) {
    let organize = organizeByTargetProp(list, organizeProps)
    for (let status in organize) {
        let item = organize[status]
        let targetTime = sortBy[status]
        item = initTimeFormatAndSort(item, targetTime, timeFormat)
        organize[status] = pagination(item, count)
    }
    return organize
}

module.exports = {
    organizedList,
    initTimeFormatAndSort
}