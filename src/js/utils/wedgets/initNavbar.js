/* -------------------- CSS MODULE -------------------- */
import "../../../css/wedgets/navbar.css";
/* -------------------- UTILS MODULE -------------------- */
import $C_Loop from "../Loop";
import $M_ui from "../ui";
import $M_template from "../template";
/* -------------------- CONFIG CONST -------------------- */
import { INIT_PAGE } from "../../../../config/constant";
let { NAVBAR: DEF_OPTS } = INIT_PAGE;

/* 初始化 通知列表 功能 */
export default async function ({ axios }) {
  if (!axios) {
    throw new Error("沒提供axios給initNavbar");
  }
  // let _data = { me: {}, news: undefined };
  let navbar_data = { me: undefined, news: undefined };
  //  根據 path，顯示當前 active NavItem
  activeNavItem();
  if (DEF_OPTS.REG.IGNORE_PAGES.test(location.pathname)) {
    renderLogoutNav();
    // return _data;
    return navbar_data;
  }
  let { errno, data } = await getNews();
  // 取得「新聞」數據（含登入者資訊）
  if (!errno) {
    ////  登入狀態
    navbar_data = data;
    // renderLoginNav(data.me.id);
    renderLoginNav(navbar_data);
    initNavFn(data);
  } else {
    ////  登出狀態
    renderLogoutNav();
  }
  return navbar_data;
  //  返回 getNews的數據，提供統整初始化頁面的函數initPageFn使用

  /* 初始化Nav功能 */
  function initNavFn(data) {
    /* 公用ele */
    let $readMore = $("#readMore");
    //  更多通知BTN
    let $noNews = $("#noNews");
    //  沒有更多通知BTN
    let $newsCount = $(".news-count");
    //  未讀取通知數
    let $newsDropdown = $("#newsDropdown");
    //  下拉選單按鈕
    let $$news = {
      // newsDropdownOpen: false,
      //  標記，用來規避 autoReadMore 跟 readMore 同時進行
      // readMoring: {
      //   _value: false,
      //   get status() {
      //     return this._value;
      //   },
      //   set status(value) {
      //     this._value = value;
      //     $readMore.children("button").prop("disabled", value);
      //   },
      // },
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
      htmlStr: {
        confirm: "",
        unconfirm: "",
      },
      newsList: {
        confirm: [],
        unconfirm: [],
      },

      num: {
        newsList: {
          get unconfirm() {
            return $$newsList.unconfirm.length;
          },
          get confirm() {
            return $$newsList.confirm.length;
          },
          get total() {
            return this.confirm + this.unconfirm;
          },
        },
        //  news在後端的數量資訊
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
            for (let type in $$excepts) {
              if (type !== "num") {
                $$excepts[type] = [];
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
              $$excepts[prop].push(id);
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
            //  更新news的數量數據
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
              /*
              let query = confirm ? "" : `?type=1&id=${id}`;
              return `
                                        <!-- 新通知 of fans -->
                                        <li class="dropdown-item position-relative news-item">
                                            <a href="/other/${fans.id}${query}" class="stretched-link text-wrap ">
                                                <div>
                                                    <span>${fans.nickname}追蹤你囉！</span><br>
                                                    <span class='text-end mb-0'>${timestamp}</span>
                                                </div>
                                            </a>
                                        </li>`;
                                        */
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
              $$htmlStr[isConfirm] = "";
            }
            $$num.unRender.clear();
          },
          //  更新htmlStr、num.unRender
          update(newsList) {
            let _newList = newsList ? newsList : $$news.newsList;
            if ($$news.fn.listTotal(_newList)) {
              ////  若news有數據，進行更新
              for (let isConfirm in _newList) {
                let str = this._template(_newList[isConfirm]);
                $$news.htmlStr[isConfirm] += str;
                $$news.num.unRender[isConfirm] += _newList[isConfirm].length;
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
            $$num.rendered.clear();
            //  將 代表已渲染通知數據的數量 歸零
          },
          //  將未渲染的通知數據 渲染到頁面
          insert() {
            if (!$$num.unRender.total) {
              //  確認是否存在 未渲染的數據
              return;
            }
            let firstRender = $$num.unRender.total && !$$num.rendered.total;
            //  是否為通知列表的初次渲染(包含清空後的第一次)
            for (let isConfirm in $$htmlStr) {
              /* 渲染存放在 $$htmlStr 內的 htmlStr 數據 */
              let htmlStr = $$htmlStr[isConfirm];
              let $title = $(`#${isConfirm}-news-title`);
              //  通知列表內的相應title
              if (!!!htmlStr) {
                /* 處理 htmlStr 是空字符的狀況 */
                firstRender && $M_ui.show($title, false);
                // 初次渲染，要隱藏 $title
                continue;
              }
              /* 處理 htmlStr 非空字符的狀況 */
              $title.is(":hidden") && $M_ui.show($title);
              //  若title呈隱藏，則讓其顯示
              let hr = $(`[data-my-hr=${isConfirm}-news-hr]`);
              //  相應此通知列表的item分隔線
              if (!hr.length) {
                //  此類型通知hr不存在，代表是首次渲染此類型通知，item要渲染在title的後方
                $title.after(htmlStr);
              } else {
                //  此類型通知hr存在，代表非首次渲染此類型通知，item要渲染在最後一個hr的後方
                //  渲染在相應通知列的後方
                hr.last().after(htmlStr);
              }
              $$num.rendered[isConfirm] += $$num.unRender[isConfirm];
              //  更新 代表已被渲染的通知 數量
            }
            let count = $$num.db.total - $$num.rendered.total;
            //  未被前端渲染的通知條目數量
            $M_ui.show($readMore, count);
            //  顯示/隱藏「讀取更多」
            $M_ui.show($noNews, !count);
            //  顯示/隱藏「沒有更多」
            $$fn.htmlStr.clear();
          },
        },
      },
    };

    /* 公用 var */
    let $$htmlStr = $$news.htmlStr;
    let $$newsList = $$news.newsList;
    let $$excepts = $$news.excepts;
    let $$num = $$news.num;
    let $$fn = $$news.fn;
    async function readMore(insert = false) {
      //  當前已收到的通知數據，提供給後端濾
      let excepts = { ...$$excepts };

      let {
        data: { news },
      } = await getNews({ excepts });

      let { newsList, hasNews } = news;
      if (hasNews) {
        ////  如果有後端數據有變動，清空前端news數據
        $$fn.newsDropdown.clear();
        $$fn.newsList.clear();
        $$fn.htmlStr.clear();
      }
      //  更新news數據
      $$fn.newsList.update(news);
      //  更新news的htmlStr數據
      $$fn.htmlStr.update(newsList);
      if (insert) {
        ////  如果參數insert=true，立即渲染news
        $$fn.newsDropdown.insert();
      }
      //  前端尚未渲染的筆數
      let count = $$num.db.unconfirm - $$num.rendered.unconfirm;
      $M_ui.show($newsCount, count).text(count || "");
    }
    ////  ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    let loop = new $C_Loop(readMore, DEF_OPTS.LOAD_NEWS);
    loop.now();
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
    ////  ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    /* 初始化 nav 各功能 */
    $$fn.newsList.reset(data.news);

    //  整理頁面初次渲染取得的 news(通知數據)
    $$fn.htmlStr.update();
    //  渲染 $$htmlStr 數據、更新當前與htmlStr相關的公用數據
    $M_ui.show($newsCount, $$num.db.unconfirm).text($$num.db.unconfirm || "");
    //  顯示 所有未確認過的通知數據 筆數
    $newsDropdown.on("show.bs.dropdown", async () => {
      loop.stop();
      // $$news.newsDropdownOpen = true;
    });
    //  通知選單開啟時，更新 $$news.newsDropdownOpen
    $newsDropdown.on("hide.bs.dropdown", () => {
      loop.start();
      // $$news.newsDropdownOpen = false;
    });
    //  通知選單開啟時，更新 $$news.newsDropdownOpen
    $newsDropdown.click(renderUnconfirmNewsCount);
    //  綁定「通知鈕」click handle → 顯示通知筆數

    function renderUnconfirmNewsCount() {
      /*  渲染新通知筆數的提醒 */
      if ($$num.unRender.total) {
        /* 若存在未渲染的通知數據，即進行渲染 */
        $$fn.newsDropdown.insert();
      }
      let count = $$num.db.unconfirm - $$num.rendered.unconfirm;
      //  尚未被前端渲染的「未讀取通知」數據 的 筆數
      $M_ui.show($newsCount, count).text(count || "");
      //  顯示新通知筆數
    }
  }

  //  渲染 登出狀態 navbar template
  function renderLogoutNav() {
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
  //  渲染 NavItem Active
  function activeNavItem() {
    let reg_pathname = /^\/(?<pathname>\w+)\/?(?<albumList>list)?/;
    let { pathname, albumList } = reg_pathname.exec(location.pathname).groups;
    $(`.nav-link[href^="/${pathname}"]`).addClass("active");
  }
  //  請求 news
  async function getNews(payload) {
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
    return await axios.post(DEF_OPTS.API.NEWS, payload);
  }
}
