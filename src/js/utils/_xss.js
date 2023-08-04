import xss from 'xss'
//  表格內容xss
export default function _xss(html) {
    return xss(html, {
        whiteList: {
            ...xss.whiteList,
            div: ['data-w-e-type'],
            input: ['type'],
            img: ['src', 'alt', 'style', 'data-href']
        },
        //  若ele的tag與attr符合白名單，會進入此過濾函數
        onTagAttr(tag, attr, attrVal, isW) {
            let checkbbox = tag === 'input' && attr === 'type' && attrVal === 'checkbox'
            let todoDiv = tag === 'div' && attr === 'data-w-e-type' && attrVal === 'todo'
            //  針對editor的todoList
            let img = tag === 'img' && attr === 'src' || attr === 'alt' || attr === 'style' || attr === 'data-href'
            //  針對editor的img
            if (checkbbox || todoDiv || img) {
                //  返回的字符串會成為ele的attr與attrVal
                return `${attr}="${attrVal}"`
            }
        },
        //  應該是在後端應用 --> 若ele的tag不符合白名單，會進入此過濾函數
        onIgnoreTag(tag, htmlStr) {
            if (tag === 'x-img') {
                return htmlStr
            }
        }
    })
}

export function xssAndTrim(data){
    return _xss(data.trim())
}

//  去除空格與進行xss
export function xssAndRemoveHTMLEmpty(data) {
    //  xss
    let curHtml = xssAndTrim(data.trim())
    //  移除開頭、結尾的空格與空行
    let reg_start = /^((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*/g
    let reg_end = /((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*$/g
    curHtml = curHtml.replace(reg_start, '')
    curHtml = curHtml.replace(reg_end, '')
    return curHtml
}