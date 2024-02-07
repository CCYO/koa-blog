import $M_log from "../log";

//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}
const DATA_SET = "my-data";
const SELECTOR = `[data-${DATA_SET}]`;
const KEYS = {
  BLOG: "blog",
  ALBUM: "imgs",
};

//  將ejs傳入el[data-my-data]的純字符數據，轉化為物件數據
export default function () {
  let $container = $(SELECTOR);
  if (!$container.length) {
    $M_log.dev("此頁無EJS DATA");
    return;
  }

  //  收集存放ejs data的元素

  let $box_list = Array.from($container, (box) => $(box).first());
  let res = $box_list.reduce((acc, $box) => {
    //  取得data-set，同時代表此數據的類型
    let key = $box.data(DATA_SET);
    //  該ejs數據元素內，所存放的數據種類名稱
    let kv;
    //  取出元素內的字符，其為ejs data的JSON string 格式
    let JSON_string = $box.html();
    //  JSON String → JSON Obj
    let val = JSON.parse(JSON_string);
    //  統整ejs data
    if (key === KEYS.BLOG) {
      //  blog 數據
      kv = { [key]: initBlog(val) };
    } else if (key === KEYS.ALBUM) {
      //  album 數據
      kv = { map_imgs: initAlbum(val) };
    } else {
      //  其餘數據
      kv = { [key]: val };
    }
    return { ...acc, ...kv };
    //  儲存整理後的ejs數據
  }, {});
  $container.parent().remove();
  //  移除存放ejs數據的元素
  return res;
  //  返回整理後的EJS數據
}

//  初始化album數據
function initAlbum(imgs) {
  //  img數據map化
  return init_map_imgs(imgs);
}
//  初始化blog數據
function initBlog(blog) {
  if (blog.hasOwnProperty("imgs")) {
    blog.map_imgs = init_map_imgs(blog.imgs);
    delete blog.imgs;
  }
  if (blog.hasOwnProperty("html")) {
    //  處理blog內的img數據
    //  blog.imgs: [ img { alt_id, alt, blogImg_id, name, img_id, hash, url }]
    //  blog.map_imgs: alt_id → img
    blog.html = parseBlogContent(blog.html);
  }
  //  對 blog.html(百分比編碼格式) 進行解碼
  if (blog.hasOwnProperty("showComment") && blog.showComment) {
    /* 不是編輯頁與預覽頁，請求comment數據 */
    blog.comment.map = init_map_comment(blog.comment);
  }
  if (blog.hasOwnProperty("comment")) {
    delete blog.comment.tree;
    delete blog.comment.list;
  }
  return blog; //  再將整體轉為字符

  function init_map_comment({ tree, list }) {
    class Comment {
      #map;
      constructor({ tree, list }) {
        let kv_list = list.map((comment) => [comment.id, comment]);
        this.#map = new Map(kv_list);
      }
      get(id) {
        return this.#map.get(id);
      }
      set(comment) {
        this.#map.set(comment.id, comment);
        return this._map.get(comment.id);
      }
      delete(id) {
        this.#map.delete(id);
        return true;
      }
    }

    return new Comment({ tree, list });
  }
  //  因為「後端存放的blog.html數據」是以
  //  1.百分比編碼存放
  //  2.<img>是以<x-img>存放
  //  所以此函數是用來將其轉化為一般htmlStr
  function parseBlogContent(URI_String) {
    /* 新創的文章會是空內容 */
    if (!URI_String) {
      return "";
    }
    //  百分比編碼 解碼
    return decodeURI(URI_String);
  }
}
//  將 img 數據 map化
function init_map_imgs(imgs) {
  let map = new Map();
  /* 以 alt_id 作為 Map key，整理為格式 img.key → img 的數據 */
  for (let alt_id in imgs) {
    map.set(alt_id * 1, imgs[alt_id]);
  }
  // imgs.forEach((img) => {
  //   map.set(img.alt_id * 1, { ...img });
  // });
  return map;
}
