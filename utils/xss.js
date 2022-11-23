const xss = require('xss')

function my_xxs(html) {
  return xss(html, {
    whiteList: {
      ...xss.whiteList,
      div: ['data-w-e-type'],
      input: ['type'],
      img: ['src', 'alt', 'style', 'data-href']
    },
    //  在白名單上的attr filter
    onTagAttr(tag, attr, value, isW) {
      let checkbbox = tag === 'input' && attr === 'type' && value === 'checkbox'
      let todoDiv = tag === 'div' && attr === 'data-w-e-type' && value === 'todo'
      let img = tag === 'img' && attr === 'src' || attr === 'alt' || attr === 'style' || attr === 'data-href'
      if (checkbbox || todoDiv || img) {
        return `${attr}="${value}"`
      }
    },
    onIgnoreTag(tag, html) {
      if (tag === 'x-img') {
        return html
      }
    }
  })
}

module.exports = my_xxs