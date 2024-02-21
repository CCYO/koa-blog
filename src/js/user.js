/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/user/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/user.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import BetterScroll from "better-scroll";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import {
  common as $M_Common,
  G,
  _ajv as $C_ajv,
  Debounce as $C_Debounce,
  _xss as $M_xss,
  template as $M_template,
  redir as $M_redir,
  ui as $M_ui,
  log as $M_log,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import { AJV, PAGE, SERVER } from "./config";
console.log("import end  ----------------------------------------------");
console.log("user.js readyState => ", document.readyState);
let window_load = false;
let readState_loading = false;
//  webpack打包後的js，會自動插入< script defer>，而defer的調用會發生在DOM parse後、DOMContentLoaded前，
//  為了確保此js能應用到頁面上可能存在以CDN獲取到的其他JS庫，故將所有內容放入window.load
window.addEventListener("load", init);
document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    console.log(
      "-----------@user.js readyState: complete -----------設置timeout"
    );
    setTimeout(() => {
      if (window_load) {
        console.log(
          "@-----------readyState的timeout 發現 load 已完成 init，故取消 init()"
        );
      } else {
        console.log(
          "@-----------readyState的timeout 發現 load 未完成 init，故協助 init()"
        );
        init();
      }
      readState_loading = true;
    }, 1000);
  }
});
async function init() {
  try {
    if (!window_load) {
      window_load = true;
    }
    if (readState_loading) {
      console.log(
        "@------------------------load 發現 readState 已完成 init，故取消init()"
      );
      return;
    } else {
      console.log(
        "@------------------------load 發現 readState 未完成 init，故調用 init()"
      );
    }

    /* ------------------------------------------------------------------------------------------ */
    /* Const ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    const PAGE_USER = PAGE.USER;
    const DATA_BLOG = SERVER.BLOG;

    const $$ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      blog_title: $$ajv.get_validate(AJV.TYPE.BLOG_TITLE),
    };
    await G.main(initMain);

    //  統整頁面數據，並渲染需要用到統整數據的頁面內容
    async function initMain() {
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
      //  let { me, currentUser, relationShip, blogs } = G.data
      const $$isLogin = !!G.data.me.id;
      const $$isSelf = G.data.currentUser.id === G.data.me.id;
      //  初始化追蹤名單滾動功能
      G.utils.betterScroll = initBetterScroll([$fansList, $idolList]);

      //  初始化文章列表的分頁功能
      initPagination();
      if ($$isSelf) {
        //  初始化登入者本人頁面功能權限
        init_self_permission();
      } else {
        //  初始化登入狀態擁有的功能權限(追蹤、退追)
        init_login_permission();
      }
      //  刷新追蹤名單的滾動功能(要在最後執行，確保其他元素都已成形)
      G.utils.betterScroll.refresh();

      /* ------------------------------------------------------------------------------------------ */
      /* Init ------------------------------------------------------------------------------------ */
      /* ------------------------------------------------------------------------------------------ */

      /*  初始化文章列表的分頁功能 */
      function initPagination() {
        //  Closure Var
        let $$pagination_list = {
          //  [status]: {
          //    currentPage 當前頁碼
          //    totalPage 總頁數
          //    currentPagination 當前分頁碼
          //    totalPagination 總分頁數
          //  }
        };

        //  初始化 Closure Var
        for (let status in G.data.blogs) {
          if (!G.data.blogs[status].count) {
            continue;
          }

          let targetBlogData = ($$pagination_list[status] = {});
          //  初始頁碼index從1開始
          targetBlogData.currentPage = 1;
          targetBlogData.totalPage = Math.ceil(
            G.data.blogs[status].count / DATA_BLOG.PAGINATION.BLOG_COUNT
          );
          //  初始分頁index從1開始
          targetBlogData.currentPagination = 1;
          targetBlogData.totalPagination = Math.ceil(
            targetBlogData.totalPage / DATA_BLOG.PAGINATION.PAGE_COUNT
          );
        }
        //  處理頁碼的tab
        $(PAGE_USER.SELECTOR.PAGE_NUM_LINK).each((index, link) => {
          let $link = $(link);
          //  頁碼的容器
          let $container = $link.parents(
            `[data-${PAGE_USER.DATASET.KEY.BLOG_STATUS}]`
          );
          //  文章狀態
          let $$status = $container.data(PAGE_USER.DATASET.KEY.BLOG_STATUS);
          //  分頁資料
          let $$pagination = $$pagination_list[$$status];
          //  目標頁碼
          let $$targetPage = $link.data(PAGE_USER.DATASET.KEY.PAGE_TURN) * 1;
          //  頁碼tab
          link.$tab = $link.parent("li");
          let $$pane_selector = `[data-${PAGE_USER.DATASET.KEY.PAGE_NUM}=${$$targetPage}]`;
          //  頁碼pane
          link.$pane = $container.find($$pane_selector);
          //  下個分頁 tab
          let $tab_pagination_turn_next = $container.find(
            `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.NEXT_PAGINATION}]`
          );
          //  上個分頁 tab
          let $tab_pagination_turn_previous = $container.find(
            `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.PREVIOUS_PAGINATION}]`
          );
          //  下一頁 tab
          let $tab_page_turn_next = $container.find(
            `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.NEXT_PAGE}]`
          );
          //  上一頁 tab
          let $tab_page_turn_previous = $container.find(
            `[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}=${PAGE_USER.DATASET.VALUE.PREVIOUS_PAGE}]`
          );
          //  定義 當前頁碼tab的功能
          link.tab = async function (preLink, paramsObj) {
            //  取出 目標頁、目標分頁、當前分頁
            let { targetPage, targetPagination, currentPagination } = paramsObj;
            //  頁面讀取過渡
            G.utils.loading_backdrop.show();
            //  文章列表讀取過渡
            preLink.$pane.addClass("pane-loading loading");
            //  確認目標頁 pane 是否存在
            if (!link.$pane.length) {
              //  發出請求，取得blogList數據
              let {
                data: { blogs },
              } = await G.utils.axios.post(PAGE_USER.API.GET_BLOG_LIST, {
                author_id: G.data.currentUser.id,
                limit: DATA_BLOG.PAGINATION.BLOG_COUNT,
                //  前端分頁index從1開始，後端分頁index從0開始，所以要-1
                offset: (targetPage - 1) * DATA_BLOG.PAGINATION.BLOG_COUNT,
                show: $$status,
              });
              //  生成html
              let html = $M_template.blog_list({
                isPublic: $$status ? true : false,
                isSelf: $$isSelf,
                page: targetPage,
                blogs,
              });
              //  將生成的html放入
              $container
                .find(`[data-${PAGE_USER.DATASET.KEY.PAGE_NUM}]`)
                .last()
                .after(html);
              //  賦予目標頁碼 pane 內容
              link.$pane = $container.find($$pane_selector);
            }
            /* 同步Closure數據 */
            $$pagination.currentPage = targetPage;
            if (currentPagination && targetPagination) {
              ////  若參數含有 當前分頁、目標分頁，代表分頁數有變化
              $$pagination.currentPagination = targetPagination;
              //  隱藏當前分頁
              $container
                .find(
                  `[data-${PAGE_USER.DATASET.KEY.PAGINATION_NUM}=${currentPagination}]`
                )
                .hide();
              //  顯示目標分頁
              $container
                .find(
                  `[data-${PAGE_USER.DATASET.KEY.PAGINATION_NUM}=${targetPagination}]`
                )
                .show();
              //  下一個目標分頁tab 顯示/隱藏
              $tab_pagination_turn_next.toggleClass(
                "pe-none",
                targetPagination === $$pagination.totalPagination
              );
              //  上一個目標分頁tab 顯示/隱藏
              $tab_pagination_turn_previous.toggleClass(
                "pe-none",
                targetPagination === 1
              );
            }
            //  下一頁tab 顯示/隱藏
            $tab_page_turn_next.toggleClass(
              "pe-none",
              targetPage === $$pagination.totalPage
            );
            //  上一頁tab 顯示/隱藏
            $tab_page_turn_previous.toggleClass("pe-none", targetPage === 1);
            //  移除前一個頁碼tab active效果
            preLink.$tab.removeClass("active");
            //  添加目標頁碼tab active效果
            link.$tab.addClass("active");
            //  隱藏前一個頁碼pane
            preLink.$pane.removeClass("pane-loading loading show").hide();
            //  顯示目標頁碼pane
            link.$pane.show().addClass("show");
            //  移除頁面讀取過渡
            G.utils.loading_backdrop.hidden();
          };
        });
        //  為div註冊clickEvent handler
        $div_blogList.on("click", turnPage);
        async function turnPage(e) {
          //  取得翻頁tab
          let $tab = $(e.target);
          if ($tab.attr("href") === "#") {
            ////  停止默認行為
            e.preventDefault();
          }
          //  翻頁的方式
          let mode = $tab.data(PAGE_USER.DATASET.KEY.PAGE_TURN);
          if (!mode) {
            return;
          }
          //  文章列表元素
          let $container = $(e.currentTarget);
          //  文章列狀態
          const status = $container.data(PAGE_USER.DATASET.KEY.BLOG_STATUS);
          //  取得當前頁碼、當前分頁碼
          let { currentPage, currentPagination } = $$pagination_list[status];
          //  未有任何改變前，目標頁碼即為當前頁碼
          let targetPage = currentPage;
          //  未有任何改變前，目標頁碼即為當前分頁碼
          let targetPagination = currentPagination;
          if (
            mode === PAGE_USER.DATASET.VALUE.NEXT_PAGINATION ||
            mode === PAGE_USER.DATASET.VALUE.PREVIOUS_PAGINATION
          ) {
            ////  以跳分頁作為翻頁的方式
            //  計算目標分頁碼
            targetPagination =
              mode === PAGE_USER.DATASET.VALUE.PREVIOUS_PAGINATION
                ? --targetPagination
                : ++targetPagination;
            //  計算目標頁碼
            targetPage =
              (targetPagination - 1) * DATA_BLOG.PAGINATION.PAGE_COUNT + 1;
          } else if (
            ////  以上下頁作為翻頁的方式
            mode === PAGE_USER.DATASET.VALUE.NEXT_PAGE ||
            mode === PAGE_USER.DATASET.VALUE.PREVIOUS_PAGE
          ) {
            //  計算目標頁碼
            targetPage =
              mode === PAGE_USER.DATASET.VALUE.NEXT_PAGE
                ? currentPage + 1
                : currentPage - 1;
            //  計算目標分頁碼
            targetPagination = Math.ceil(
              targetPage / DATA_BLOG.PAGINATION.PAGE_COUNT
            );
          } else {
            ////  以點選頁碼作為翻頁的方式
            //  計算目標頁碼
            targetPage = mode * 1;
          }
          //  發出請求所攜帶的數據酬載
          let payload = {};
          if (targetPagination !== currentPagination) {
            ////  若目標分頁若有更動，酬載要紀錄目標分頁、當前分頁
            payload = {
              targetPagination,
              currentPagination,
            };
          }
          //  當前頁碼link
          let current_page_link = $container
            .find(`[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}='${currentPage}']`)
            .get(0);
          //  目標頁碼link
          let target_page_link = $container
            .find(`[data-${PAGE_USER.DATASET.KEY.PAGE_TURN}='${targetPage}']`)
            .get(0);
          //  調用目標頁碼link的tab功能
          await target_page_link.tab(current_page_link, {
            targetPage,
            ...payload,
          });
          $tab.get(0).blur();
          return;
        }
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
                if (el.canScroll) {
                  /* 若當前是可滾動狀態，調用 betterScroll.enable實例方法，開啟滾動功能 */
                  el.betterScroll.enable();
                } else {
                  /* 若當前不是可滾動狀態，調用 betterScroll.disable實例方法，禁止滾動功能 */
                  el.betterScroll.disable();
                }
                // $M_log.dev(
                //   `resetBetterScroll: #${el.id}已${
                //     el.canScroll ? "啟" : "禁"
                //   }用滾動狀態`
                // );
                el.betterScroll.refresh();
                //  調用 betterScroll.refresh實例方法，重整狀態
                //  betterScroll.enable 不知道為何，有時候仍沒辦法作用，搭配refresh()就不會有意外
              },
            },
          });
          const { debounce: debounce_reset_betterScroll } = new $C_Debounce(
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
      /* Utils ------------------------------------------------------------------------------------ */
      /* ------------------------------------------------------------------------------------------ */

      //  登入狀態擁有的功能權限(追蹤、退追)
      function init_login_permission() {
        //  判端是否為自己的偶像
        const isMyIdol = $$isLogin
          ? G.data.relationShip.fansList.some(
              (fans) => fans.id === G.data.me.id
            )
          : false;
        //  依據 isMyIdol 顯示 退追紐
        $btn_cancelFollow.toggle(isMyIdol);
        //  依據 isMyIdol 顯示 追蹤紐
        $btn_follow.toggle(!isMyIdol);
        //  為btn註冊clickEvent handler
        $btn_follow.on("click", follow);
        //  為btn註冊clickEvent handler
        $btn_cancelFollow.on("click", cancelFollow);

        /* ------------------------------------------------------------------------------------------ */
        /* Handle ------------------------------------------------------------------------------------ */
        /* ------------------------------------------------------------------------------------------ */
        //  追蹤
        async function follow() {
          $M_redir.check_login(G.data);
          //  檢查登入狀態
          /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
          await G.utils.axios.post(PAGE_USER.API.FOLLOW, {
            id: G.data.currentUser.id,
          });
          //  發出 取消/追蹤 請求
          /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
          //  同步 fansList 數據
          G.data.relationShip.fansList.unshift(G.data.me);

          let html = $M_template.relationship_item({ user: G.data.me });
          //  在粉絲列表中插入 粉絲htmlStr
          if (G.data.relationShip.fansList.length === 1) {
            //  如果追蹤者只有當前的你
            $fansList.html(`<ul>${html}</ul>`);
          } else {
            //  如果追蹤者不只當前的你
            $fansList.children("ul").prepend(html);
            //  插在最前面
          }
          G.utils.betterScroll.refresh();
          //  重整 BetterScroll
          $btn_follow.toggle(false);
          //  追蹤鈕的toggle
          $btn_cancelFollow.toggle(true);
          //  退追鈕的toggle
          alert("已追蹤");
          return;
        }
        //  退追
        async function cancelFollow() {
          $M_redir.check_login(G.data);
          //  檢查登入狀態
          /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
          await G.utils.axios.post(PAGE_USER.API.CANCEL_FOLLOW, {
            id: G.data.currentUser.id,
          });
          /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
          G.data.relationShip.fansList.splice(
            G.data.relationShip.fansList.indexOf(G.data.me.id),
            1
          );
          //  在粉絲列表中移除 粉絲htmlStr
          if (G.data.relationShip.fansList.length > 0) {
            //  如果仍有追蹤者
            $fansList
              .find(`li[data-${PAGE_USER.DATASET.KEY.USER_ID}=${G.data.me.id}]`)
              .remove();
            //  直接移除
          } else {
            //  如果已無追蹤者
            $fansList.html(`<p>可憐阿，沒有朋友</p>`);
            //  撤換掉列表內容
          }
          /*  同步 $$fansList 數據 */
          G.utils.betterScroll.refresh();
          //  重整 BetterScroll
          $btn_follow.toggle(true);
          //  追蹤鈕的toggle
          $btn_cancelFollow.toggle(false);
          //  退追鈕的toggle
          alert("已退追");
          return;
        }
      }
      //  登入者本人頁面功能權限(建立/刪除文章)
      function init_self_permission() {
        //  禁用 創建文章鈕
        $btn_new_blog.prop("disabled", true);
        //  debouncer event handle
        let { debounce: handle_debounce_check_title } = new $C_Debounce(
          check_title,
          {
            loading(e) {
              $btn_new_blog.prop("disabled", true);
              $M_ui.form_feedback.loading(e.target);
            },
          }
        );
        //  為input註冊debounce化的inputEvent handler
        $input_new_blog_title.on("input", handle_debounce_check_title);
        //  為btn註冊clickEvent handler
        $btn_new_blog.on("click", handle_createBlog);
        //  為btn註冊clickEvent handler
        $div_blogList.on("click", handle_removeBlogs);

        /* ------------------------------------------------------------------------------------------ */
        /* Handle ------------------------------------------------------------------------------------ */
        /* ------------------------------------------------------------------------------------------ */
        //  刪除文章
        async function handle_removeBlogs(e) {
          let $target = $(e.target);
          let action = $target.data(PAGE_USER.DATASET.KEY.REMOVE_BLOG);
          if (!action || (action && !confirm("真的要刪除嗎?"))) {
            return;
          }
          e.preventDefault();
          //  確認是否為登入狀態
          $M_redir.check_login(G.data);
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
          //  送出刪除命令
          let { errno } = await G.utils.axios.delete(
            PAGE_USER.API.REMOVE_BLOGS,
            {
              data: {
                blogList,
              },
            }
          );
          if (errno) {
            return;
          }
          alert("刪除成功");
          location.reload();
          //  刷新頁面
        }
        //  創建文章
        async function handle_createBlog(e) {
          e.preventDefault();
          $M_redir.check_login(G.data);
          let title = await check_title();
          if (!title) {
            return;
          }
          const {
            data: { id: blog_id },
          } = await G.utils.axios.post(PAGE_USER.API.CREATE_BLOG, {
            title,
          });
          alert("創建成功，開始編輯文章");
          $input_new_blog_title.val("");
          //  清空表格
          let redir = `${PAGE_USER.API.EDIT_BLOG}/${blog_id}?owner_id=${G.data.me.id}`;
          location.href = redir;
        }
        //  校驗文章標題
        async function check_title() {
          let title = $input_new_blog_title.val();
          let input = $input_new_blog_title.get(0);

          let data = {
            title: $M_xss.trim(input.value),
          };
          let validated_list = await G.utils.validate.blog_title(data);
          let valid = !validated_list.some((item) => !item.valid);
          let msg = "";
          let res = title;
          if (!valid) {
            let error = validated_list.find(({ valid, field_name }) => {
              return !valid && field_name === input.name;
            });
            if (!error) {
              throw new Error(
                `發生預料外的驗證錯誤 => ${JSON.stringify(validated_list)}`
              );
            }
            msg = error.message;
            res = valid;
          }
          $M_ui.form_feedback.validated(input, valid, msg);
          $btn_new_blog.prop("disabled", !valid);
          return res;
        }
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
