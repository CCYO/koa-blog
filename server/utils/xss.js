const xss = require("xss");
const whiteList = {
  ...xss.whiteList,
  div: ["data-w-e-type", "data-w-e-is-void"],
  input: ["type"],
  img: ["src", "alt", "style", "data-href"],
  iframe: [
    "src",
    "title",
    "width",
    "height",
    "title",
    "frameborder",
    "allow",
    "allowfullscreen",
  ],
};
function my_xss(html) {
  return xss(html, {
    //  這定能放過的 attr
    whiteList,
    //  通過在白名單上後的attr filter
    onTagAttr(tag, attr, attrVal, isWhiteAtt) {
      if (!isWhiteAtt) {
        //  若attr不在白名單內
        return;
        //  無返回值的狀況，會再進入onIgnoreTag處理
      }
      attr = attr.trim();
      if (tag !== "img" && typeof attrVal !== "boolean" && !attrVal.length) {
        //  attrVal 無值
        return attr;
      } else {
        return `${attr}="${attrVal}"`;
      }
    },
    //  不符合白名單，會進入此過濾函數
    onIgnoreTag(tag, html) {
      if (tag === "x-img") {
        return html;
      }
    },
  });
}

module.exports = my_xss;
