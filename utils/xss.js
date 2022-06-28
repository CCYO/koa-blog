const xss = require('xss')

function xxs_html(html){
    return xss(html, {
        onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
            let attr = name.substr(0, 5)
            if (attr === "data-" || attr === 'style') {
              // 通过内置的escapeAttrValue函数来对属性值进行转义
              return `${name}="${xss.escapeAttrValue(value)}"`;
            }
          }
    })
}

module.exports = {
    xss,
    xxs_html
}