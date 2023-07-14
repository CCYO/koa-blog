const xss = require('xss')

function my_xxs(html) {
  return xss(html, {
    //  這定能放過的 attr
    whiteList: {
      ...xss.whiteList,
      //  wangEditor 會自動附加的 attr
      div: ['data-w-e-type'],
      input: ['type'],
      img: ['src', 'alt', 'style', 'data-href']
    },
    //  通過在白名單上後的attr filter
    onTagAttr(tag, attr, value, isW) {
      let checkbbox = tag === 'input' && attr === 'type' && value === 'checkbox'
      //  皆是 wangEditor 自動生成
      let todoDiv = tag === 'div' && attr === 'data-w-e-type' && value === 'todo'
      //  自定義的 img 相關 attr
      let img = tag === 'img' && attr === 'src' || attr === 'alt' || attr === 'style' || attr === 'data-href'
      if (checkbbox || todoDiv || img) {
        return `${attr}="${value}"`
      }
    },
    //  不符合白名單，會進入此過濾函數
    onIgnoreTag(tag, html) {
      if (tag === 'x-img') {
        return html
      }
    }
  })
}

module.exports = my_xxs