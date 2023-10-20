import _axios from "../_axios";
//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}
const EJS_DATA = {
  DATA_SET: "my-data",
  KEYS: {
    BLOG: "blog",
    ALBUM: "album",
  },
};
const REG = {
  BLOG: {
    X_IMG:
      /<x-img.+?data-alt-id='(?<alt_id>\w+?)'.+?(data-style='(?<style>.+?)')?.*?\/>/g,
  },
};
//  將ejs傳入el[data-my-data]的純字符數據，轉化為物件數據
export default async function (selector = `[data-${EJS_DATA.DATA_SET}]`) {
  let $ejs_eles = [];
  $(selector).each((index, ejs_ele) => $ejs_eles.push($(ejs_ele).first()));
  //  取得存放ejs數據的元素
  let res = await $ejs_eles.reduce(async (kvPairs, $ejs_ele) => {
    //  數據的用途
    let key = $ejs_ele.data(EJS_DATA.DATA_SET);
    //  該ejs數據元素內，所存放的數據種類名稱
    try {
      let kv;
      let JSON_string = $ejs_ele.html();
      //  該ejs數據元素內的數據(JSON string 格式)
      let val = JSON.parse(JSON_string);
      // JSON String → JSON Obj
      if (key === EJS_DATA.KEYS.BLOG) {
        /* blog 相關數據 */
        kv = { [key]: await initBlog(val) };
      } else if (key === EJS_DATA.KEYS.ALBUM) {
        /* album 相關數據 */
        kv = { [key]: await initAlbum(val) };
      } else {
        /* 其餘數據 */
        kv = { [key]: val };
      }
      let _kvPairs = await kvPairs;
      return { ..._kvPairs, ...kv };
      //  儲存整理後的ejs數據
    } catch (e) {
      throw e;
    }
  }, {});
  $(selector).parent().remove();
  //  移除存放ejs數據的元素
  return res;
  //  返回整理後的EJS數據
}

//  初始化album數據
function initAlbum({ blog, imgs }) {
  let map_imgs = init_map_imgs(imgs);
  //  img數據map化
  return { blog, imgs, map_imgs };
}
//  初始化blog數據
async function initBlog(blog) {
  blog.map_imgs = init_map_imgs(blog.imgs);
  //  處理blog內的img數據
  //  blog.imgs: [ img { alt_id, alt, blogImg_id, name, img_id, hash, url }]
  //  blog.map_imgs: alt_id → img
  blog.html = parseBlogContent(blog.html);
  //  對 blog.html(百分比編碼格式) 進行解碼
  if (!blog.showComment) {
    /* 不是編輯頁與預覽頁，請求comment數據 */
    delete blog.comments
    delete blog.tree_comments
  }
  return blog; //  再將整體轉為字符

  //  因為「後端存放的blog.html數據」是以
  //  1.百分比編碼存放
  //  2.<img>是以<x-img>存放
  //  所以此函數是用來將其轉化為一般htmlStr
  function parseBlogContent(URI_String) {
    /* 新創的文章會是空內容 */
    if (!URI_String) {
      return "";
    }
    let htmlStr = decodeURI(URI_String);
    //  百分比編碼 解碼
    /* 將 <x-img> 數據轉回 <img> */
    let copy = htmlStr;
    //  複製一份htmlStr
    let res;
    //  存放 reg 匹配後 的 img src 數據
    while ((res = REG.BLOG.X_IMG.exec(copy))) {
      let { alt_id, style } = res.groups;
      //  找出對應的img數據
      let tt = [...blog.map_imgs];
      let ggg = blog.map_imgs.get(alt_id * 1);
      let { url, alt } = ggg;
      //  MAP: alt_id → img { alt_id, alt, blogImg_id, name, img_id, hash, url}
      let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}"`;
      let replaceStr = style ? `${imgEle} style="${style}"/>` : `${imgEle}/>`;
      //  修改 _html 內對應的 img相關字符
      htmlStr = htmlStr.replace(res[0], replaceStr);
    }
    return htmlStr;
  }
  //  將comment數據Map化
  function mapComments(comments) {
    return comments.reduce(
      (initVal, comment) => {
        let { map_commentId, map_commentPid } = initVal;
        return set(comment);

        function set(comment) {
          let { id, p_id: pid, reply } = comment;
          map_commentId.set(id, comment);
          //  map_commentId 是一個 map，數據格式為 id → comment
          let commentsOfPid = map_commentPid.get(pid) || [];
          //  如果 pid → comments 不存在，初始化一個數組
          map_commentPid.set(pid, [...commentsOfPid, comment]);
          //  map_commentPid 是一個 map，數據格式為 pid(即parentId) → comments
          /* 遞歸處理當前comment的回覆 */
          if (reply.length) {
            reply.forEach(item => set(item));
          } else {
            map_commentPid.set(id, []);
            //  若當前comment沒有回覆，則順便先將自己作為map_commentPid的一份數據
          }
          return { map_commentId, map_commentPid };
        }
      },
      {
        map_commentId: new Map(),
        map_commentPid: new Map().set(0, []),
      }
    );
  }
}
//  將 img 數據 map化
function init_map_imgs(imgs) {
  let map = new Map();
  /* 以 alt_id 作為 Map key，整理為格式 img.key → img 的數據 */
  imgs.forEach(img => {
    map.set(img.alt_id * 1, { ...img });
  });
  return map;
}
