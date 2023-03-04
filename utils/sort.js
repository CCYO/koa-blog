const date = require('date-and-time')
const { BLOG: { PRIVATE, PUBLIC, PAGINATION, TIMEFORMAT } } = require('../conf/constant')

//  分纇為 { [PUBLIC]: blogs, [PRIVATE]: blogs }
function organizeByShowAndHidden(blogs) {
    if (!blogs.length) {
        return { [PUBLIC]: [], [PRIVATE]: [] }
    }
    //  依公開與否分纇
    return blogs.reduce((acc, blog) => {
        let { show } = blog
        let status = show ? PUBLIC : PRIVATE
        //  移除show屬性
        delete blog.show
        acc[status].push(blog)
        return acc
    }, { [PUBLIC]: [], [PRIVATE]: [] })
}

//  格式化時間數據 + 排序
function initTimeFormatAndSort(blogs, status, format = TIME_FORMAT) {
    //  判斷要以甚麼數據作排列
    let time = status ? 'showAt' : 'createdAt'
    return blogs.sort((A, B) => {
        //  從新到舊排列順序
        let timeA = new Date(A[time])
        let timeB = new Date(B[time])
        A[time] = date.format(timeA, format)
        return timeB - timeA
    })
}

//  
function pagination(blogs, count = PAGINATION) {
    return blogs.reduce((acc, blog) => {
        let page = acc.length - 1
        let countInPage = acc[page].length
        if( countInPage < count){
            acc[page].push(blog)
        }else{
            acc.push([blog])
        }
        return acc
    }, [ [] ])
}

function go(blogs) {
    let organize = organizeByShowAndHidden(blogs)
    for (let status in organize) {
        let list = organize[status]
        list = initTimeFormatAndSort(list, status)
        organize[status] = pagination(list)
    }
    return organize
}

module.exports = go