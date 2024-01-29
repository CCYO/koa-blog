import xss from "xss";
//  表格內容xss
function myXss(html) {
  let whiteList = {
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
  return xss(html, {
    whiteList,
    //  若ele的tag符合白名單，會進入此過濾函數
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
    //  應該是在後端應用 --> 若ele的tag不符合白名單，會進入此過濾函數
    onIgnoreTag(tag, htmlStr) {
      if (tag === "x-img") {
        return htmlStr;
      }
    },
  });
}

function trim(data) {
  return myXss(data.trim());
}

//  去除空格與進行xss
function blog(data) {
  //  移除前後空格
  let curHtml = trim(data.trim());
  //  移除開頭、結尾的空格與空行
  let reg_start = /^((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*/g;
  let reg_end = /((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*$/g;
  curHtml = curHtml.replace(reg_start, "");
  curHtml = curHtml.replace(reg_end, "");
  return curHtml;
}

export default { myXss, trim, blog };
export { myXss, trim, blog };
