const xss = require('xss')

function my_xxs(html) {
  return xss(html, {
    whiteList: {
      ...xss.whiteList,
      div: ['data-w-e-type'],
      input: ['type']
    },
    onTagAttr(tag, attr, value) {
      let checkbbox = tag === 'input' && attr === 'type' && value === 'checkbox'
      let todoDiv = tag === 'div' && attr === 'data-w-e-type' && value === 'todo'
      if (checkbbox) {
        return 'checkbox'
      }
      if (todoDiv) {
        return 'todo'
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