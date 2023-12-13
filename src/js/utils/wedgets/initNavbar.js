/* -------------------- CSS MODULE -------------------- */
import "../../../css/wedgets/navbar.css";
/* -------------------- UTILS MODULE -------------------- */
import $C_Loop from "../Loop";
import $M_ui from "../ui";
import $M_template from "../template";
/* -------------------- CONFIG CONST -------------------- */
import { INIT_PAGE } from "../../../../config/constant";

/* 初始化 通知列表 功能 */
export default async function (axios, options = INIT_PAGE.NAVBAR) {
  if (!axios) {
    throw new Error("沒提供axios給initNavbar");
  }
  let isLogin = false;
  let navbar_data = { me: undefined, news: undefined };
  if (!options.REG.IGNORE_PAGES.test(location.pathname)) {
    ////  若是可以呈現登入狀態的頁面
    let response = await getLoginData();
    if (!response.errno) {
      isLogin = true;
      navbar_data = response.data;
    }
  }
  renderNavBar(navbar_data);
  //  初始化nav功能
  return await initNavBarFn(navbar_data);
}

//  init navbar fn
async function initNavBarFn(data) {
  if (!data.me) {
    return data;
  }
  /* 公用ele */
  //  更多通知BTN
  let $readMore = $("#readMore");
  //  沒有更多通知BTN
  let $noNews = $("#noNews");
  //  未讀取通知數
  let $newsCount = $(".news-count");
  //  下拉選單按鈕
  let $newsDropdown = $("#newsDropdown");
  //  下拉選單

  //  let count = $$news.num.db.unconfirm - $$news.num.rendered.unconfirm;
  //  let more = $$news.num.db.total - $$news.num.rendered.total;
  //  確認有沒有 $$news.num.unRender.total
  //  let excepts
  let $$news = {
    //  既存的數據
    excepts: {
      idolFans: [],
      articleReader: [],
      msgReceiver: [],
      get num() {
        return (
          this.idolFans.length +
          this.articleReader.length +
          this.msgReceiver.length
        );
      },
    },
    //  readyRender待渲染的html
    htmlStr: {
      confirm: "",
      unconfirm: "",
    },
    //  目前接收到的通知數據
    newsList: {
      confirm: [],
      unconfirm: [],
    },

    num: {
      newsList: {
        get unconfirm() {
          return $$news.newsList.unconfirm.length;
        },
        get confirm() {
          return $$news.newsList.confirm.length;
        },
        get total() {
          return this.confirm + this.unconfirm;
        },
      },
      //  後端server db的總數據量
      db: {
        confirm: 0,
        unconfirm: 0,
        total: 0,
      },
      unRender: {
        confirm: 0,
        unconfirm: 0,
        get total() {
          return this.confirm + this.unconfirm;
        },
        clear() {
          this.confirm = 0;
          this.unconfirm = 0;
        },
      },
      rendered: {
        confirm: 0,
        unconfirm: 0,
        get total() {
          return this.confirm + this.unconfirm;
        },
        clear() {
          this.confirm = 0;
          this.unconfirm = 0;
        },
      },
    },
    clear() {
      this.fn.newsDropdown.clear();
      this.fn.newsList.clear();
      this.fn.htmlStr.clear();
    },
    update(data, insert) {
      //  更新news數據
      //  db.num更新
      this.fn.newsList.update(data);
      //  更新news的htmlStr數據
      //  更新num.unReader
      this.fn.htmlStr.update(data.newsList);
      if (insert) {
        ////  如果參數insert=true，立即渲染news
        this.fn.newsDropdown.insert();
      }
      //  未渲染的條目數量
      checkReadMore();
      //  前端未渲染的條目數量
      checkNewsCount();
    },
    fn: {
      //  取得 list 內共有多少條 news 數據
      listTotal(list) {
        return list.confirm.length + list.unconfirm.length;
      },
      itemIsExist(obj) {
        return !!obj.confirm || !!obj.unconfirm;
      },
      excepts: {
        clear() {
          for (let type in $$news.excepts) {
            if (type !== "num") {
              $$news.excepts[type] = [];
            }
          }
        },
        update(list) {
          for (let { type, id } of list) {
            let prop =
              type === 1
                ? "idolFans"
                : type === 2
                ? "articleReader"
                : "msgReceiver";
            $$news.excepts[prop].push(id);
          }
        },
      },
      //  管理 news 資料數據
      newsList: {
        //  清空
        clear() {
          for (let isConfirm in $$news.newsList) {
            $$news.newsList[isConfirm] = [];
          }
          //  一併清空 excepts
          $$news.fn.excepts.clear();
        },
        //  更新 newsList、num.db、excepts
        update(news) {
          let { newsList, num } = news;
          //  更新後端news的數量
          $$news.num.db = num;
          if ($$news.fn.listTotal(newsList)) {
            ////  若news有數據，進行更新
            for (let isConfirm in newsList) {
              let list = newsList[isConfirm];
              $$news.newsList[isConfirm] = [
                ...$$news.newsList[isConfirm],
                ...list,
              ];
              $$news.fn.excepts.update(list);
            }
          }
          return;
        },
        //  重置
        reset(news) {
          this.clear();
          this.update(news);
        },
      },
      //  由news所生成「待被渲染htmlStr」
      htmlStr: {
        //  生成 htmlStr
        _template(list) {
          let { idolFans, articleReader, msgReceiver } = this._gen;
          return list.reduce((htmlStr, item) => {
            // let { confirm, id, fans, timestamp } = item;
            let { type, confirm } = item;
            if (type === 1) {
              htmlStr += idolFans(item);
            } else if (type === 2) {
              htmlStr += articleReader(item);
            } else {
              htmlStr += msgReceiver(item);
            }
            let hr = confirm
              ? `<li data-my-hr="confirm-news-hr">`
              : `<li data-my-hr="unconfirm-news-hr">`;
            hr += `<hr class="dropdown-divider"></li>`;
            return (htmlStr += hr);
          }, "");
        },
        _gen: {
          idolFans(item) {
            // let { confirm, id, fans, timestamp } = item;
            return $M_template.news_item.fansIdol(item);
          },
          articleReader({ confirm, id, blog, timestamp }) {
            let query = confirm ? "" : `?type=2&id=${id}`;
            return `
                                      <li class="dropdown-item  position-relative news-item">
                                          <a href="/blog/${blog.id}${query}" class="stretched-link text-wrap">
                                              <div>
                                                  <span>${blog.author.nickname} 有新文章唷！</span><br>
                                                  <span>- ${blog.title}-</span><br>
                                                  <span class='text-end mb-0'>${timestamp}</span>
                                              </div>
                                          </a>
                                      </li>`;
          },
          msgReceiver({ confirm, id, comment, timestamp }) {
            let query = confirm ? "" : `?type=3&id=${id}`;
            let { otherComments } = comment;
            let count = otherComments.commenters.length;
            let others = otherComments.commenters.map(
              ({ nickname }) => nickname
            );
            let nicknames =
              comment.commenter.nickname + count > 1
                ? others.slice(0, 2).join(",") +
                  (count > 2 ? `與其他${count - 2}人` : "" + `，都`)
                : count === 1
                ? others[0]
                : comment.commenter.nickname;
            let author =
              comment.article.author.id === data.me.id
                ? "你"
                : comment.article.author.id === comment.commenter.id
                ? "自己"
                : comment.blog.author.nickname;
            return `
                                      <li class="dropdown-item  position-relative news-item">
                                          <a href="/blog/${comment.article.id}${query}#comment_${comment.id}" class="stretched-link text-wrap">
                                              <div>
                                                  <span>${nicknames}在${author}的文章「${comment.article.title}」留言囉！</span><br>
                                                  <span class='text-end mb-0'>${timestamp}</span>
                                              </div>
                                          </a>
                                      </li>`;
          },
        },
        //  清空htmlStr、num.unRender
        clear() {
          for (let isConfirm in $$news.htmlStr) {
            $$news.htmlStr[isConfirm] = "";
          }
          $$news.num.unRender.clear();
        },
        //  更新htmlStr、num.unRender
        update(newsList) {
          if ($$news.fn.listTotal(newsList)) {
            ////  若news有數據，進行更新
            for (let isConfirm in newsList) {
              let str = this._template(newsList[isConfirm]);
              $$news.htmlStr[isConfirm] += str;
              $$news.num.unRender[isConfirm] += newsList[isConfirm].length;
            }
          }
          return;
        },
        //  重置
        reset(newsList) {
          this.clear();
          this.update(newsList);
        },
      },
      //  管理已渲染的通知條目
      newsDropdown: {
        //  清空頁面已渲染的通知條目
        clear() {
          $(".news-item").remove();
          //  清空新聞列表
          $("[data-my-hr]").remove();
          //  清空新聞列表分隔線
          $$news.num.rendered.clear();
          //  將 代表已渲染通知數據的數量 歸零
        },
        //  將未渲染的通知數據 渲染到頁面
        insert() {
          if (!$$news.num.unRender.total) {
            //  不存在 未渲染的數據
            return;
          }
          //  是否第一次渲染 = 已渲染總數為0
          let firstRender = !$$news.num.rendered.total;
          //  渲染存放在 $$htmlStr 內的 htmlStr 數據
          for (let isConfirm in $$news.htmlStr) {
            let htmlStr = $$news.htmlStr[isConfirm];
            //  通知列表title
            let $title = $(`#${isConfirm}-news-title`);
            if (!!!htmlStr) {
              ////  當 htmlStr 是空字符
              // 初次渲染，要隱藏 $title
              firstRender && $M_ui.show($title, false);
              continue;
            }
            ////  當 htmlStr 非空字符
            // 顯示 $title
            $title.is(":hidden") && $M_ui.show($title);
            //  通知列表item的hr
            let hr = $(`[data-my-hr=${isConfirm}-news-hr]`);
            if (!hr.length) {
              ////  hr不存在，代表是首次渲染，要渲染在title後方
              $title.after(htmlStr);
            } else {
              ////  hr存在，代表非首次渲染，渲染在最後一個hr的後方
              hr.last().after(htmlStr);
            }
            //  更新 已被渲染的通知數量
            $$news.num.rendered[isConfirm] += $$news.num.unRender[isConfirm];
            //  更新 未被渲染的通知數量
            $$news.num.unRender[isConfirm] = 0;
          }
          $$news.fn.htmlStr.clear();
        },
      },
    },
  };
  //  讓readMore自動循環的類
  let loop = new $C_Loop(readMore.bind(false), options.LOAD_NEWS);
  //  啟動 readMore 自動循環
  loop.start();
  //  unRender 條目更新
  $$news.update(data.news, false);
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
  $newsDropdown.on("click", renderUnconfirmNewsCount);
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
  function renderUnconfirmNewsCount() {
    /*  渲染新通知筆數的提醒 */
    if ($$news.num.unRender.total) {
      /* 若存在未渲染的通知數據，即進行渲染 */
      $$news.fn.newsDropdown.insert();
    }
    checkReadMore();
    checkNewsCount();
  }
  function checkNewsCount() {
    let count = $$news.num.db.unconfirm - $$news.num.rendered.unconfirm;
    //  尚未被前端渲染的「未讀取通知」數據 的 筆數
    $M_ui.show($newsCount, count).text(count || "");
    //  顯示新通知筆數
  }
  function checkReadMore() {
    //  未渲染的條目數量
    let more = $$news.num.db.total - $$news.num.rendered.total;
    //  顯示/隱藏「讀取更多」
    $M_ui.show($readMore, more);
    //  顯示/隱藏「沒有更多」
    $M_ui.show($noNews, !more);
  }
  async function readMore(insert = true) {
    //  當前已收到的通知數據，提供給後端過濾
    let excepts = { ...$$news.excepts };
    let {
      data: { news },
    } = await getLoginData({ excepts });
    if (news.hasNews) {
      ////  此次請求導致『後端重新處理news緩存』，清空前端news數據
      $$news.clear();
    }
    //  unRender 條目更新
    $$news.update(news, insert);
  }
  //  請求 news
  async function getLoginData(payload) {
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
    return await axios.post(options.API.NEWS, payload);
  }
}
//  render navbar
function renderNavBar({ me, data }) {
  let res = data;
  if (!me) {
    renderLogoutNavBar();
  } else {
    renderLoginNav(data);
  }
  //  根據 path，顯示當前 active NavItem
  activeNavItem();
  return;

  //  渲染 NavItem Active
  function activeNavItem() {
    let reg_pathname = /^\/(?<pathname>\w+)\/?(?<albumList>list)?/;
    let { pathname, albumList } = reg_pathname.exec(location.pathname).groups;
    console.log("pathname => ", pathname);
    $(`.nav-link[href^="/${pathname}"]`).addClass("active");
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
  function renderLoginNav(data) {
    //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
    $("#needCollapse-list").html($M_template.navbar.collapse_list(data));
    //  #noNeedCollapse-list 內放入 NEWS
    $("#noNeedCollapse-list").html($M_template.navbar.uncollapse_list());
    return true;
  }
}
