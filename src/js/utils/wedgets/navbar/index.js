/* -------------------- CSS MODULE -------------------- */
import "@css/wedgets/navbar.css";
/* -------------------- UTILS MODULE -------------------- */
import $M_news from "./news";
import $C_Loop from "../../Loop";
import $M_template from "../../template";
import { SERVER as $SERVER_CONFIG } from "@js/config";
/* -------------------- CONFIG CONST -------------------- */

const API = `/api/news`;
const REG = {
  IGNORE_PAGES: /^\/(login)|(register)|(errPage)|blog\/\w+?(\?preview=true)$/,
  ACTIVE_PATHNAME: /^\/(?<pathname>\w+)\/?(?<albumList>list\?)?/,
};
//  單位ms, 1 min
const LOAD_NEWS = 1000 * 5 * 60;

/* 初始化 通知列表 功能 */
export default async function (axios) {
  if (!axios) {
    throw new Error("沒提供axios給initNavbar");
  }
  // let navbar_data = { me: undefined, news: undefined };
  let user = {};
  let news = {};
  // if (!REG.IGNORE_PAGES.test(location.pathname)) {
  //   ////  若是可以呈現登入狀態的頁面
  let { errno, data } = await getLoginData();
  if (!errno) {
    let { news: data_news, ...data_user } = data;
    user = data_user;
    news = data_news;
  }
  // }
  render(user);
  //  初始化nav功能
  await initFn(news);
  let G_news = user.id ? $M_news : news;
  return { me: user, news: G_news };

  //  init navbar fn
  async function initFn(news) {
    if (!Object.getOwnPropertyNames(news).length) {
      return;
    }
    let newsData = news;
    /* 公用ele */
    //  更多通知BTN
    let $readMore = $("#readMore");
    //  沒有更多通知BTN
    let $noNews = $("#noNews");
    //  新通知數
    let $newsCount = $(".news-count");
    //  下拉選單按鈕
    let $newsDropdown = $("#newsDropdown");

    //...................................

    //  讓readMore自動循環的類
    let loop = new $C_Loop(readMore.bind(this, false), { ms: LOAD_NEWS });
    //  啟動 readMore 自動循環
    loop.start();
    //  unRender 條目更新
    // $$news.update(data.news, false); ----------------------------------------------
    $M_news.update(newsData);
    //  show/hide about news 提醒
    checkNewsMore();
    //  為 BS5 下拉選單元件 註冊 hide.bs.dropdown handler(選單展開時回調)
    $newsDropdown[0].addEventListener("show.bs.dropdown", () => {
      ////  暫停 readMore自動循環，使用箭頭函數是因為 loop.stop 內部有 this，必須確保this指向loop
      loop.stop();
    });
    //  為 BS5 下拉選單元件 註冊 hide.bs.dropdown handler(選單收起時回調)
    $newsDropdown[0].addEventListener("hide.bs.dropdown", () => {
      ////  開始 readMore自動循環，使用箭頭函數是因為 loop.start 內部有 this，必須確保this指向loop
      loop.start();
    });
    //  綁定「通知鈕」click handle → 顯示通知筆數
    $newsDropdown.on("click", renderHtmlStr);
    //  綁定「讀取更多鈕」click handle → 獲取更多通知數據、同時更新公開數據與渲染葉面
    $readMore.on("click", loop.now.bind(loop, true));
    //  綁定「登出鈕」click handle → 登出功能
    $("#logout").on("click", logout);
    //  自動讀取更多
    async function logout() {
      if (!confirm("真的要登出?")) {
        alert("對嘛，再待一下嘛");
        return;
      }
      let { data } = await axios.get("/api/user/logout");
      alert(data);
      location.href = "/login";
      return;
    }
    function renderHtmlStr() {
      ////  render htmlStr
      for (let isConfirm in $M_news.htmlStr) {
        $M_news.htmlStr.render(isConfirm);
      }
      checkNewsMore();
    }
    function checkNewsMore() {
      //  未渲染的條目數量
      showNewsCount();
      //  是否有更多通知可向後端拉取
      showReadMore();

      function showNewsCount() {
        //  未渲染的 unconfrim_news count
        let count = $M_news.num.db.unconfirm - $M_news.num.dropdown.unconfirm;
        let show = count > 0;
        if (show) {
          $newsCount.show();
        } else {
          $newsCount.hide();
        }
        $newsCount.text(show ? count : "");
        //  顯示新通知筆數
      }
      function showReadMore() {
        //  未渲染的 news count
        let more = $M_news.num.db.total - $M_news.num.dropdown.total > 0;
        //  顯示/隱藏「讀取更多」
        if (more) {
          $readMore.show();
          $noNews.hide();
        } else {
          $readMore.hide();
          $noNews.show();
        }
      }
    }

    async function readMore(insert = true) {
      //  當前已收到的通知數據，提供給後端過濾
      let { data: user } = await getLoginData();
      let newsData = user.news;
      $M_news.update(newsData, insert);
      //  show/hide about news 提醒
      checkNewsMore();
    }
  }
  //  render navbar
  function render(user) {
    if (!user.id) {
      renderLogoutNavBar();
    } else {
      renderLoginNav(user);
    }
    //  根據 path，顯示當前 active NavItem
    activeNavItem();
    return;

    //  渲染 NavItem Active
    function activeNavItem() {
      let { pathname, albumList } = REG.ACTIVE_PATHNAME.exec(
        location.pathname
      ).groups;
      let href = pathname;
      if (albumList) {
        href += `/${albumList}`;
      }
      $(`.nav-link[href^="/${href}"]`).addClass("active");
    }
    //  渲染 登出狀態 navbar template
    function renderLogoutNavBar() {
      //  未登入
      //  navbar始終展開
      $(".navbar").removeClass("navbar-expand-sm").addClass("navbar-expand");
      //  基本nav始終排後面（未登入狀態僅會有 登入/註冊）
      $(".nav").removeClass("order-0 order-md-0").addClass("order-1");
      //  摺疊nav始終盤排前頭（未登入狀態僅會有Home）
      $(".offcanvas").removeClass("order-1 order-md-1").addClass("order-0");
      $(".navbar-toggler, .offcanvas").remove();
    }
    //  渲染 登入狀態的 navbar template
    function renderLoginNav(user) {
      //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
      $("#needCollapse-list").html($M_template.navbar.collapse_list(user));
      //  #noNeedCollapse-list 內放入 NEWS
      $("#noNeedCollapse-list").html($M_template.navbar.uncollapse_list());
      return true;
    }
  }
  //  請求 news
  async function getLoginData() {
    /* 響應的數據 { 
        errno, 
        data: {
            news : {
                newsList: {
                    unconfirm: [
                        { type, id, timestamp, confirm, fans: ... }, ...
                        { type, id, timestamp, confirm, blog: ... }, ...
                        { type, id, timestamp, confirm, comment: ... }, ...
                    ],
                   confirm: [...]
               },
               num: { unconfirm, confirm, total },
               hasNews: boo
           },
           me: ...
       }
    */
    let payload = {};
    if ($M_news.id_list.total === 0) {
      payload.status = $SERVER_CONFIG.NEWS.FRONT_END_STATUS.FIRST;
    } else if ($M_news.num.db.total > $M_news.id_list.total) {
      payload.status = $SERVER_CONFIG.NEWS.FRONT_END_STATUS.AGAIN;
      payload.excepts = $M_news.excepts;
    } else {
      payload.status = $SERVER_CONFIG.NEWS.FRONT_END_STATUS.CHECK;
    }
    return await axios.post(API, payload);
  }
}
