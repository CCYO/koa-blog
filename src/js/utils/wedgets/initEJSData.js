import $M_log from "../log";
import { SERVER, PAGE } from "../../config";

//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}
const DATA_SET = "my-data";
const SELECTOR = `[data-${DATA_SET}]`;
const KEYS = {
  BLOG: "blog",
  ALBUM_LIST: "album",
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
    } else if (key === KEYS.ALBUM_LIST) {
      kv = { album: initAlbumList(val) };
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

function initAlbumList(albumList) {
  let album = {};
  for (let status in albumList) {
    let { list, count } = albumList[status];
    list = list.reduce((acc, blog, index) => {
      let i = Math.floor(index / SERVER.ALBUM_LIST.PAGINATION.BLOG_COUNT);
      if (!acc[i]) {
        acc[i] = [];
      }
      acc[i].push(blog);
      return acc;
    }, []);
    let totalPage = Math.ceil(count / SERVER.ALBUM_LIST.PAGINATION.BLOG_COUNT);
    let totalPagination = Math.ceil(
      totalPage / SERVER.ALBUM_LIST.PAGINATION.PAGE_COUNT
    );
    album[status] = {
      list,
      page: {
        total: totalPage,
        current: 1,
      },
      pagination: {
        total: totalPagination,
        current: 1,
      },
    };
  }
  return album;
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
    blog.map_comment = init_map_comment(blog.comment.list);
  }
  delete blog.comment;
  return blog; //  再將整體轉為字符

  function init_map_comment(list) {
    class Comment extends Map {
      constructor(list) {
        let kv_list = list.map((comment) => [comment.id, comment]);
        super(kv_list);
      }
      mset(comment) {
        this.set(comment.id, comment);
        return this.get(comment.id);
      }
    }
    return new Comment(list);
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
    let res = decodeURI(URI_String);
    return res;
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
