/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  await import("../views/pages/user/index.ejs");
}
import $M_template from "./utils/template";

/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import "../css/user.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import BetterScroll from "better-scroll";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  Debounce as $M_Debounce,
  _axios as $C_axios,
  _xss as $M_xss,
  wedgets as $M_wedgets,
  validate as $M_validate,
  ui as $M_ui,
  log as $M_log,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import CONFIG_CONST from "../../config/const";

/* ------------------------------------------------------------------------------------------ */
/* Const ------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */

const PAGE_USER = CONFIG_CONST.PAGES.USER;
const DATA_BLOG = CONFIG_CONST.DATAS.BLOG;

/* ------------------------------------------------------------------------------------------ */
/* Class --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const $C_initPage = new $M_wedgets.InitPage();
//  初始化頁面
const $C_backdrop = new $M_wedgets.LoadingBackdrop();
//  讀取遮罩
const $$axios = new $C_axios({ backdrop: $C_backdrop });

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
    await $C_initPage.render(initMain);
    //  統整頁面數據，並渲染需要用到統整數據的頁面內容
    $C_backdrop.hidden();
    //  讀取完成，解除遮蔽
  } catch (error) {
    throw error;
  }

  /* ------------------------------------------------------------------------------------------ */
  /* Init ------------------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------------------------ */

  async function initMain({ me, currentUser, relationShip, blogs }) {
    /* ------------------------------------------------------------------------------------------ */
    /* JQ Ele in Closure -------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    let $input_new_blog_title = $(`#${PAGE_USER.ID.NEW_BLOG_TITLE}`);
    let $btn_new_blog = $(`#${PAGE_USER.ID.NEW_BLOG}`);
    let $fansList = $(`#${PAGE_USER.ID.FANS_LIST}`);
    //  粉絲列表contaner
    let $idolList = $(`#${PAGE_USER.ID.IDOL_LIST}`);
    //  偶像列表contaner
    let $btn_follow = $(`#${PAGE_USER.ID.FOLLOW}`);
    //  追蹤鈕
    let $btn_cancelFollow = $(`#${PAGE_USER.ID.CANCEL_FOLLOW}`);
    //  退追鈕
    let $div_blogList = $(`[data-${PAGE_USER.DATASET.KEY.BLOG_STATUS}]`);
    //  文章列表container

    /* ------------------------------------------------------------------------------------------ */
    /* Public Var in Closure -------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    let $$pageData = { me, currentUser, relationShip, blogs };
    window.$$pageData = $$pageData;
    const $$isLogin = !!me.id;
    const $$isSelf = currentUser.id === me.id;

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
        ? $$pageData.relationShip.fansList.some(
            (fans) => fans.id === $$pageData.me.id
          )
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
    /* Init ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /*  初始化文章列表的分頁功能 */
    function initPagination() {
      //  Closure Var
      let $$pagination_list = {};
      /*  blogList 的 template 函數 */
      for (let status in $$pageData.blogs) {
        if (!$$pageData.blogs[status].count) {
          continue;
        }

        let targetBlogData = ($$pagination_list[status] = {});
        targetBlogData.currentPage = 1;
        targetBlogData.totalPage = Math.ceil(
          $$pageData.blogs[status].count / DATA_BLOG.PAGINATION.BLOG_COUNT
        );
        targetBlogData.currentPagination = 1;
        targetBlogData.totalPagination = Math.ceil(
          targetBlogData.totalPage / DATA_BLOG.PAGINATION.PAGE_COUNT
        );
      }
      //  處理 pageNum 的 tab
      $(PAGE_USER.SELECTOR.PAGE_NUM_LINK).each((index, link) => {
        let $link = $(link);
        let $container = $link.parents(
          `[data-${PAGE_USER.DATASET.KEY.BLOG_STATUS}]`
        );
        let $$status = $container.data(PAGE_USER.DATASET.KEY.BLOG_STATUS);
        let $$pagination = $$pagination_list[$$status];

        let $$targetPage = $link.data(PAGE_USER.DATASET.KEY.PAGE_TURN) * 1;
        link.$tab = $link.parent("li");
        let $$pane_selector = `[data-${PAGE_USER.DATASET.KEY.PAGE_NUM}=${$$targetPage}]`;
        link.$pane = $container.find($$pane_selector);

        let $tab_pagination_turn_next = $container.find(
          `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.NEXT_PAGINATION}]`
        );
        let $tab_pagination_turn_previous = $container.find(
          `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.PREVIOUS_PAGINATION}]`
        );
        let $tab_page_turn_next = $container.find(
          `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.NEXT_PAGE}]`
        );
        let $tab_page_turn_previous = $container.find(
          `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.PREVIOUS_PAGE}]`
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
            } = await $$axios.post(PAGE_USER.API.GET_BLOG_LIST, {
              author_id: $$pageData.currentUser.id,
              limit: DATA_BLOG.PAGINATION.BLOG_COUNT,
              offset: (targetPage - 1) * DATA_BLOG.PAGINATION.BLOG_COUNT,
              show: $$status,
            });
            let html = $M_template.blog_list({
              isPublic: $$status ? true : false,
              isSelf: $$isSelf,
              page: targetPage,
              blogs,
            });
            $container
              .find(`[data-${PAGE_USER.DATASET.KEY.PAGE_NUM}]`)
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
                `[data-${PAGE_USER.DATASET.KEY.PAGINATION_NUM}=${currentPagination}]`
              )
              .hide();
            $container
              .find(
                `[data-${PAGE_USER.DATASET.KEY.PAGINATION_NUM}=${targetPagination}]`
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

      $div_blogList.on("click", async (e) => {
        let $tab = $(e.target);

        if ($tab.attr("href") === "#") {
          e.preventDefault();
        }
        let mode = $tab.data(PAGE_USER.DATASET.KEY.PAGE_TURN);
        if (!mode) {
          return Promise.resolve();
        }
        let $container = $(e.currentTarget);
        const status = $container.data(PAGE_USER.DATASET.KEY.BLOG_STATUS);
        let { currentPage, currentPagination } = $$pagination_list[status];
        let targetPage = currentPage;
        let targetPagination = currentPagination;
        if (
          mode === PAGE_USER.DATASET.VALUE.NEXT_PAGINATION ||
          mode === PAGE_USER.DATASET.VALUE.PREVIOUS_PAGINATION
        ) {
          targetPagination =
            mode === PAGE_USER.DATASET.VALUE.PREVIOUS_PAGINATION
              ? --targetPagination
              : ++targetPagination;
          targetPage =
            (targetPagination - 1) * DATA_BLOG.PAGINATION.PAGE_COUNT + 1;
        } else if (
          mode === PAGE_USER.DATASET.VALUE.NEXT_PAGE ||
          mode === PAGE_USER.DATASET.VALUE.PREVIOUS_PAGE
        ) {
          targetPage =
            mode === PAGE_USER.DATASET.VALUE.NEXT_PAGE
              ? currentPage + 1
              : currentPage - 1;
          targetPagination = Math.ceil(
            targetPage / DATA_BLOG.PAGINATION.PAGE_COUNT
          );
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
          .find(`[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}='${currentPage}']`)
          .get(0);
        let target_page_link = $container
          .find(`[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}='${targetPage}']`)
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

    /* ------------------------------------------------------------------------------------------ */
    /* Handle ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    async function handle_removeBlogs(e) {
      let $target = $(e.target);
      let action = $target.data(PAGE_USER.DATASET.KEY.REMOVE_BLOG);
      if (!action || (action && !confirm("真的要刪除嗎?"))) {
        return;
      }
      e.preventDefault();
      _checkLogin();
      let blogList = [];
      if (action === PAGE_USER.DATASET.VALUE.REMOVE_BLOG_ITEM) {
        blogList.push(
          $target
            .parents(`[data-${PAGE_USER.DATASET.KEY.BLOG_ID}]`)
            .data(PAGE_USER.DATASET.KEY.BLOG_ID)
        );
      } else {
        let $container = $target.parents(
          `[data-${PAGE_USER.DATASET.KEY.BLOG_STATUS}]`
        );
        let $li_blogItem_list = $container
          .find(`.show[data-${PAGE_USER.DATASET.KEY.PAGE_NUM}]`)
          .find(`[data-${PAGE_USER.DATASET.KEY.BLOG_ID}]`);
        blogList = Array.from($li_blogItem_list).map((li) =>
          $(li).data(PAGE_USER.DATASET.KEY.BLOG_ID)
        );
      }

      let owner_id = $$pageData.me.id;
      //  送出刪除命令
      let { errno } = await $$axios.delete(PAGE_USER.API.REMOVE_BLOGS, {
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
      } = await $$axios.post(PAGE_USER.API.CREATE_BLOG, {
        title,
      });
      alert("創建成功，開始編輯文章");
      $input_new_blog_title.val("");
      //  清空表格
      let redir = `${PAGE_USER.API.EDIT_BLOG}/${blog_id}?owner_id=${$$pageData.me.id}`;
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
      _checkLogin();
      //  檢查登入狀態
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      await $$axios.post(PAGE_USER.API.FOLLOW, {
        id: $$pageData.currentUser.id,
      });
      //  發出 取消/追蹤 請求
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      $$pageData.relationShip.fansList.unshift($$pageData.me);
      //  同步 $$fansList 數據
      let html = $M_template.fans_Item({ user: $$pageData.me });
      //  在粉絲列表中插入 粉絲htmlStr
      if ($$pageData.relationShip.fansList.length === 1) {
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
      _checkLogin();
      //  檢查登入狀態
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      await $$axios.post(PAGE_USER.API.CANCEL_FOLLOW, {
        id: $$pageData.currentUser.id,
      });
      //  發出 取消/追蹤 請求
      /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
      $$pageData.relationShip.fansList.splice(
        $$pageData.relationShip.fansList.indexOf($$pageData.me.id),
        1
      );
      //  在粉絲列表中移除 粉絲htmlStr
      if ($$pageData.relationShip.fansList.length > 0) {
        //  如果仍有追蹤者
        $fansList
          .find(`li[data-${PAGE_USER.DATASET.KEY.USER_ID}=${$$pageData.me.id}]`)
          .remove();
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

    /*  確認登入狀態 */
    function _checkLogin() {
      if ($$isLogin) {
        return;
      }
      /* 若未登入，跳轉到登入頁 */
      alert(`請先登入`);
      location.href = `${CONST.URL.LOGIN}?from=${encodeURIComponent(
        location.href
      )}`;
    }
  }
});
