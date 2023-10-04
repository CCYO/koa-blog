/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  await import("../views/user.ejs");
}
import ejs_str_fansItem from "../views/wedgets/user/fansItem.ejs";
//  使用 template-ejs-loader 將 偶像粉絲列表的項目ejs檔 轉譯為 純字符
import ejs_str_blogList from "../views/wedgets/user/blogList.ejs";
//  使用 template-ejs-loader 將 文章列表的項目ejs檔 轉譯為 純字符

/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import "../css/user.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import BetterScroll from "better-scroll";
import lodash from "lodash";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  Debounce as $M_Debounce,
  _axios as $M_axios,
  _xss as $M_xss,
  wedgets as $M_wedgets,
  validate as $M_validate,
  ui as $M_ui,
  log as $M_log,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const CONS = {
  API: {
    //  api
    FOLLOW: "/api/user/follow",
    CANCEL_FOLLOW: "/api/user/cancelFollow",
    CREATE_BLOG: "/api/blog",
    REMOVE_BLOGS: "/api/blog",
    GET_BLOG_LIST: "/api/blog/list",
    //  view
    EDIT_BLOG: "/blog/edit",
  },
  CLASS: {
    PAGE_NUM_LINK: ".pagination .pagination .page-link",
  },
  ID: {
    NEW_BLOG_TITLE: "new_blog_title",
    NEW_BLOG: "new_blog",
    FANS_LIST: "fansList",
    IDOL_LIST: "idolList",
    FOLLOW: "follow",
    CANCEL_FOLLOW: "cancelFollow",
  },
  DATASET: {
    KEY: {
      BLOG_STATUS: "status",
      PAGE_TURN: "turn",
      PAGE_NUM: "page",
      PAGINATION_NUM: "pagination",
      REMOVE_BLOG: "remove-blog",
      BLOG_ID: "blog-id",
      FANS_ID: "fans-id",
    },
    VALUE: {
      NEXT_PAGE: "next-page",
      PREVIOUS_PAGE: "previous-page",
      NEXT_PAGINATION: "next-pagination",
      PREVIOUS_PAGINATION: "previous-pagination",
      REMOVE_BLOG_ITEM: "item",
      REMOVE_BLOG_LIST: "list",
    },
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Class --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const $C_initPage = new $M_wedgets.InitPage();
//  初始化頁面
const $C_backdrop = new $M_wedgets.LoadingBackdrop();
//  讀取遮罩

/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
window.addEventListener("load", async () => {
  try {
    $C_backdrop.show({ blockPage: true });
    //  讀取中，遮蔽畫面
    //  幫助頁面初始化的統整函數
    await $C_initPage.addOtherInitFn($M_wedgets.initEJSData);
    //  初始化ejs
    await $C_initPage.addOtherInitFn($M_wedgets.initNavbar);
    //  初始化navbar
    await $C_initPage.render(renderPage);
    //  統整頁面數據，並渲染需要用到統整數據的頁面內容
    $C_backdrop.hidden();
    //  讀取完成，解除遮蔽
  } catch (error) {
    throw error;
  }

  async function renderPage({ me, currentUser, fansList, idols, blogs }) {
    /* ------------------------------------------------------------------------------------------ */
    /* Public Var ------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    let $$pageData = { me, currentUser, fansList, idols, blogs };
    const $$isLogin = !!me.id;
    const $$isSelf = currentUser.id === me.id;

    /* 公用 JQ Ele */
    let $input_new_blog_title = $(`#${CONS.ID.NEW_BLOG_TITLE}`);
    let $btn_new_blog = $(`#${CONS.ID.NEW_BLOG}`);
    let $fansList = $(`#${CONS.ID.FANS_LIST}`);
    //  粉絲列表contaner
    let $idolList = $(`#${CONS.ID.IDOL_LIST}`);
    //  偶像列表contaner
    let $btn_follow = $(`#${CONS.ID.FOLLOW}`);
    //  追蹤鈕
    let $btn_cancelFollow = $(`#${CONS.ID.CANCEL_FOLLOW}`);
    //  退追鈕
    let $div_blogList = $(`[data-${CONS.DATASET.KEY.BLOG_STATUS}]`);
    //  文章列表container

    if ($$isSelf) {
      /*  自己的頁面，會擁有「建立文章」、「移除文章」功能 */

      /* render */
      $btn_new_blog.prop("disabled", true);
      //  禁用 創建文章鈕

      /* event handle */
      let { call: handle_debounce_check_title } = new $M_Debounce(check_title, {
        loading(e) {
          $btn_new_blog.prop("disabled", true);
          $M_ui.feedback(1, e.target);
        },
      });
      //  debounce版本的 校驗文章標題 函數
      $input_new_blog_title.on("input", handle_debounce_check_title);
      //  handle 校驗文章標題
      $btn_new_blog.on("click", handle_createBlog);
      //  hanlde 創建文章
      $div_blogList.on("click", handle_removeBlogs);
      //  handle 刪除文章
    } else {
      /* render */
      const isMyIdol = $$isLogin
        ? $$pageData.fansList.some(fans => fans.id === $$pageData.me.id)
        : false;
      //  判端是否為自己的偶像
      $btn_cancelFollow.toggle(isMyIdol);
      //  依據 isMyIdol 顯示 退追紐
      $btn_follow.toggle(!isMyIdol);
      //  依據 isMyIdol 顯示 追蹤紐

      /* event handle */
      $btn_follow.on("click", follow);
      //  handle 追蹤功能
      $btn_cancelFollow.on("click", cancelFollow);
      //  handle 退追功能
    }

    initPagination();
    //  初始化文章列表的分頁功能
    let $$betterScrollEles = initBetterScroll([$fansList, $idolList]);
    //  初始化betterScrol
    $("main, nav, main, footer").removeAttr("style");
    //  展示頁面各部件
    $$betterScrollEles.refresh();

    /* ------------------------------------------------------------------------------------------ */
    /* Handle ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    async function handle_removeBlogs(e) {
      let $target = $(e.target);
      let action = $target.data(CONS.DATASET.KEY.REMOVE_BLOG);
      if (!action || (action && !confirm("真的要刪除嗎?"))) {
        return;
      }
      e.preventDefault();
      checkLogin();
      let blogList = [];
      if (action === CONS.DATASET.VALUE.REMOVE_BLOG_ITEM) {
        blogList.push(
          $target
            .parents(`[data-${CONS.DATASET.KEY.BLOG_ID}]`)
            .data(CONS.DATASET.KEY.BLOG_ID)
        );
      } else {
        let $container = $target.parents(
          `[data-${CONS.DATASET.KEY.BLOG_STATUS}]`
        );
        let $li_blogItem_list = $container
          .find(`.show[data-${CONS.DATASET.KEY.PAGE_NUM}]`)
          .find(`[data-${CONS.DATASET.KEY.BLOG_ID}]`);
        blogList = Array.from($li_blogItem_list).map(li =>
          $(li).data(CONS.DATASET.KEY.BLOG_ID)
        );
      }

      let owner_id = $$pageData.me.id;
      //  送出刪除命令
      let { errno } = await $M_axios.delete(CONS.API.REMOVE_BLOGS, {
        data: {
          blogList,
          owner_id,
        },
      });
      if (errno) {
        return;
      }
      alert("刪除成功");
      location.reload();
      //  刷新頁面
    }
    async function handle_createBlog(e) {
      let title = await check_title();
      if (!title) {
        return;
      }
      const {
        data: { id: blog_id },
      } = await $M_axios.post(CONS.API.CREATE_BLOG, {
        title,
      });
      alert("創建成功，開始編輯文章");
      $input_new_blog_title.val("");
      //  清空表格
      let redir = `${CONS.API.EDIT_BLOG}/${blog_id}?owner_id=${$$pageData.me.id}`;
      location.href = redir;
    }
    async function check_title() {
      let title = $input_new_blog_title.val();
      let input = $input_new_blog_title.get(0);

      title = $M_xss.xssAndTrim(input.value);
      let validateErrors = await $M_validate.blog(
        {
          $$blog: { title: "" },
          title,
        },
        false
      );
      $btn_new_blog.prop("disabled", validateErrors);
      if (validateErrors) {
        delete validateErrors.title.diff;
        validateErrors = $M_validate.parseErrorsToForm(validateErrors);
        let msg = validateErrors[input.name];
        $M_ui.feedback(2, input, false, msg.feedback);
        return false;
      }
      $M_ui.feedback(2, input, true);
      return title;
    }
    async function follow() {
      checkLogin();
      //  檢查登入狀態
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      await $M_axios.post(CONS.API.FOLLOW, {
        id: $$pageData.currentUser.id,
      });
      //  發出 取消/追蹤 請求
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      $$pageData.fansList.unshift($$pageData.me);
      //  同步 $$fansList 數據
      let html = template_fansItem({ me: $$pageData.me });
      //  在粉絲列表中插入 粉絲htmlStr
      if ($$pageData.fansList.length === 1) {
        //  如果追蹤者只有當前的你
        $fansList.html(`<ul>${html}</ul>`);
      } else {
        //  如果追蹤者不只當前的你
        $fansList.children("ul").prepend(html);
        //  插在最前面
      }
      $$betterScrollEles.refresh();
      //  重整 BetterScroll
      $btn_follow.toggle(false);
      //  追蹤鈕的toggle
      $btn_cancelFollow.toggle(true);
      //  退追鈕的toggle
      alert("已追蹤");
      return;
    }
    async function cancelFollow() {
      checkLogin();
      //  檢查登入狀態
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      await $M_axios.post(CONS.API.CANCEL_FOLLOW, {
        id: $$pageData.currentUser.id,
      });
      //  發出 取消/追蹤 請求
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      $$pageData.fansList.splice(
        $$pageData.fansList.indexOf($$pageData.me.id),
        1
      );
      //  在粉絲列表中移除 粉絲htmlStr
      if ($$pageData.fansList.length > 0) {
        //  如果仍有追蹤者
        $(`li[data-${CONS.DATASET.KEY.FANS_ID}=${$$pageData.me.id}]`).remove();
        //  直接移除
      } else {
        //  如果已無追蹤者
        $fansList.html(`<p>可憐阿，沒有朋友</p>`);
        //  撤換掉列表內容
      }
      /*  同步 $$fansList 數據 */
      $$betterScrollEles.refresh();
      //  重整 BetterScroll
      $btn_follow.toggle(true);
      //  追蹤鈕的toggle
      $btn_cancelFollow.toggle(false);
      //  退追鈕的toggle
      alert("已退追");
      return;
    }
    /* ------------------------------------------------------------------------------------------ */
    /* Utils ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /*  初始化文章列表的分頁功能 */
    function initPagination() {
      //  Closure Var
      const PUBLIC = 1;
      const PRIVATE = 0;
      let $$pagination_list = {
        [PRIVATE]: {
          currentPage: 0,
          currentPagination: 0,
          totalPage: 0,
          totalPagination: 0,
        },
        [PUBLIC]: {
          currentPage: 0,
          currentPagination: 0,
          totalPage: 0,
          totalPagination: 0,
        },
      };
      for (let status in $$pageData.blogs) {
        if (!$$pageData.blogs[status].count) {
          continue;
        }
        let targetBlogData =
          $$pagination_list[status === "public" ? PUBLIC : PRIVATE];
        targetBlogData.currentPage = 1;
        targetBlogData.totalPage = Math.ceil(
          $$pageData.blogs[status].count / 5
        );
        targetBlogData.currentPagination = 1;
        targetBlogData.totalPagination = Math.ceil(
          targetBlogData.totalPage / 2
        );
      }
      //  處理 pageNum 的 tab
      $(CONS.CLASS.PAGE_NUM_LINK).each((index, link) => {
        let $link = $(link);
        let $container = $link.parents(
          `[data-${CONS.DATASET.KEY.BLOG_STATUS}]`
        );
        let $$status = $container.data(CONS.DATASET.KEY.BLOG_STATUS) * 1;
        let $$pagination = $$pagination_list[$$status];

        let $$targetPage = $link.data(CONS.DATASET.KEY.PAGE_TURN) * 1;
        link.$tab = $link.parent("li");
        let $$pane_selector = `[data-${CONS.DATASET.KEY.PAGE_NUM}=${$$targetPage}]`;
        link.$pane = $container.find($$pane_selector);

        let $tab_pagination_turn_next = $container.find(
          `[data-${CONS.DATASET.KEY.PAGE_TURN}=${CONS.DATASET.VALUE.NEXT_PAGINATION}]`
        );
        let $tab_pagination_turn_previous = $container.find(
          `[data-${CONS.DATASET.KEY.PAGE_TURN}=${CONS.DATASET.VALUE.PREVIOUS_PAGINATION}]`
        );
        let $tab_page_turn_next = $container.find(
          `[data-${CONS.DATASET.KEY.PAGE_TURN}=${CONS.DATASET.VALUE.NEXT_PAGE}]`
        );
        let $tab_page_turn_previous = $container.find(
          `[data-${CONS.DATASET.KEY.PAGE_TURN}=${CONS.DATASET.VALUE.PREVIOUS_PAGE}]`
        );

        link.tab = async function (preLink, paramsObj) {
          let { targetPage, targetPagination, currentPagination } = paramsObj;
          $C_backdrop.show();
          preLink.$pane.addClass("pane-loading loading");
          //  確認 pane 是否存在
          if (!link.$pane.length) {
            //  發出請求，取得blogList數據
            let {
              data: { blogs },
            } = await $M_axios.post(CONS.API.GET_BLOG_LIST, {
              author_id: $$pageData.currentUser.id,
              limit: 5,
              offset: (targetPage - 1) * 5,
              show: $$status,
            });
            let html = template_blogList_page({
              isPublic: $$status ? true : false,
              isSelf: $$isSelf,
              page: targetPage,
              blogs,
            });
            $container
              .find(`[data-${CONS.DATASET.KEY.PAGE_NUM}]`)
              .last()
              .after(html);
            link.$pane = $container.find($$pane_selector);
          }
          /* 同步數據 */
          $$pagination.currentPage = targetPage;
          if (currentPagination && targetPagination) {
            $$pagination.currentPagination = targetPagination;
            $container
              .find(
                `[data-${CONS.DATASET.KEY.PAGINATION_NUM}=${currentPagination}]`
              )
              .hide();
            $container
              .find(
                `[data-${CONS.DATASET.KEY.PAGINATION_NUM}=${targetPagination}]`
              )
              .show();

            $tab_pagination_turn_next.toggleClass(
              "pe-none",
              targetPagination === $$pagination.totalPagination
            );

            $tab_pagination_turn_previous.toggleClass(
              "pe-none",
              targetPagination === 1
            );
          }

          $tab_page_turn_next.toggleClass(
            "pe-none",
            targetPage === $$pagination.totalPage
          );
          $tab_page_turn_previous.toggleClass("pe-none", targetPage === 1);

          preLink.$tab.removeClass("active");
          link.$tab.addClass("active");
          preLink.$pane.removeClass("pane-loading loading show").hide();
          link.$pane.show().addClass("show");

          $C_backdrop.hidden();
        };
      });

      $div_blogList.on("click", async e => {
        let $tab = $(e.target);

        if ($tab.attr("href") === "#") {
          e.preventDefault();
        }
        let mode = $tab.data(CONS.DATASET.KEY.PAGE_TURN);
        if (!mode) {
          return Promise.resolve();
        }
        let $container = $(e.currentTarget);
        const status = $container.data(CONS.DATASET.KEY.BLOG_STATUS) * 1;
        let { currentPage, currentPagination } = $$pagination_list[status];
        let targetPage = currentPage;
        let targetPagination = currentPagination;
        console.log(mode);
        console.log(CONS.DATASET.VALUE.PREVIOUS_PAGINATION);

        if (
          mode === CONS.DATASET.VALUE.NEXT_PAGINATION ||
          mode === CONS.DATASET.VALUE.PREVIOUS_PAGINATION
        ) {
          targetPagination =
            mode === CONS.DATASET.VALUE.PREVIOUS_PAGINATION
              ? --targetPagination
              : ++targetPagination;
          targetPage = (targetPagination - 1) * 2 + 1;
        } else if (
          mode === CONS.DATASET.VALUE.NEXT_PAGE ||
          mode === CONS.DATASET.VALUE.PREVIOUS_PAGE
        ) {
          targetPage =
            mode === CONS.DATASET.VALUE.NEXT_PAGE
              ? currentPage + 1
              : currentPage - 1;
          targetPagination = Math.ceil(targetPage / 2);
        } else {
          targetPage = mode * 1;
        }
        let payload = {};
        if (targetPagination !== currentPagination) {
          payload = {
            targetPagination,
            currentPagination,
          };
        }
        let current_page_link = $container
          .find(`[data-${CONS.DATASET.KEY.PAGE_TURN}='${currentPage}']`)
          .get(0);
        let target_page_link = $container
          .find(`[data-${CONS.DATASET.KEY.PAGE_TURN}='${targetPage}']`)
          .get(0);
        await target_page_link.tab(current_page_link, {
          targetPage,
          ...payload,
        });
        $tab.get(0).blur();
        return Promise.resolve();
      });
    }
    /*  初始化BetterScroll */
    function initBetterScroll(JQ_Eles) {
      let betterScrollEles = [];
      //  存放 betterScroll 實例的DOM Ele
      /* 調整粉絲、追蹤列表 */
      for (let $el of JQ_Eles) {
        let el = $el.get(0);

        /* 賦予DOM Ele兩個Prop，betterScroll、canScoll */
        Object.defineProperties(el, {
          /* Prop:betterScroll 此屬性指向以DOM Ele本身創建的betterScroll實例 */
          betterScroll: {
            value: new BetterScroll(el, {
              scrollX: true,
              scrollY: false,
              mouseWheel: true,
            }),
            writable: false,
          },
          /* Prop:canScroll 此屬性代表DOM Ele本身的betterScroll是否可滾動 */
          canScroll: {
            get() {
              let outerW = $el.outerWidth();
              let contentW = $el.children(":first-child").outerWidth(true);
              return outerW < contentW;
              //  若DOM Ele的外寬度 < first-child Ele外寬，則代表本身的 betterScroll 可滾動
            },
          },
          /* Method: resetBetterScroll，藉由el.canScroll啟動|停止滾動功能*/
          resetBetterScroll: {
            value() {
              $M_log.dev_log();
              if (el.canScroll) {
                /* 若當前是可滾動狀態，調用 betterScroll.enable實例方法，開啟滾動功能 */
                el.betterScroll.enable();
              } else {
                /* 若當前不是可滾動狀態，調用 betterScroll.disable實例方法，禁止滾動功能 */
                el.betterScroll.disable();
              }
              $M_log.dev_log(
                `resetBetterScroll: #${el.id}已${
                  el.canScroll ? "啟" : "禁"
                }用滾動狀態`
              );
              el.betterScroll.refresh();
              //  調用 betterScroll.refresh實例方法，重整狀態
              //  betterScroll.enable 不知道為何，有時候仍沒辦法作用，搭配refresh()就不會有意外
            },
          },
        });
        const { call: debounce_reset_betterScroll } = new $M_Debounce(
          el.resetBetterScroll
        );
        //  創造 防抖動的 el.handleResize
        window.addEventListener("resize", debounce_reset_betterScroll);
        //  將每個防抖動的 el.handleResize 綁定到 window
        betterScrollEles.push(el);
        //  將每個el都放入betterScrollEles
      }
      /* 為 betterScrollEles 創建方法，內部所有el重新啟動|停止滾動功能*/
      betterScrollEles.refresh = function () {
        for (let el of betterScrollEles) {
          // el.handleResize()
          el.resetBetterScroll();
        }
      };
      return betterScrollEles;
    }
    /*  確認登入狀態 */
    function checkLogin() {
      if ($$isLogin) {
        return;
      }
      /* 若未登入，跳轉到登入頁 */
      alert(`請先登入`);
      location.href = `${CONST.URL.LOGIN}?from=${encodeURIComponent(
        location.href
      )}`;
    }
    let template_blogList_page = lodash.template(ejs_str_blogList);
    let template_fansItem = lodash.template(ejs_str_fansItem);
  }
});
