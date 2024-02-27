/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/albumList/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/albumList.css";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { G, common as $M_Common } from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { SERVER, PAGE } from "./config";

window.addEventListener("load", init);
async function init() {
  try {
    await G.main(initMain);
    async function initMain() {
      //  上/下一頁功能
      $(".page-link").on("click", async (event) => {
        //  當前page
        let status = $(event.target).parents("[data-status]").data("status");
        let $container = $(`[data-status=${status}]`);
        let $curPage_li = $container.find(".page-item.active");
        let curPage = G.data.album[status].page.current;
        let $curPagination_ul = $curPage_li.parents("ul[data-pagination]");
        let curPagination = G.data.album[status].pagination.current;
        //  根據翻頁模式取得targetPage與targetPagination
        let turnMode = $(event.target).data("turn");
        let targetPage;
        let targetPagination;
        if (isNaN(turnMode * 1)) {
          switch (turnMode) {
            case "previous-pagination":
              targetPage =
                (curPagination - 2) * SERVER.ALBUM_LIST.PAGINATION.BLOG_COUNT +
                1;
              // 2 -> 1   ---> 4 -> 1
              // 3 -> 2   ---> 6 -> 3
              break;
            case "next-pagination":
              targetPage =
                curPagination * SERVER.ALBUM_LIST.PAGINATION.BLOG_COUNT + 1;
              // 3
              break;
            case "previous-page":
              targetPage = curPage - 1;
              break;
            case "next-page":
              targetPage = curPage + 1;
          }
        } else {
          targetPage = turnMode * 1;
        }
        targetPagination = Math.ceil(
          targetPage / SERVER.ALBUM_LIST.PAGINATION.PAGE_COUNT
        );

        //  同步數據
        G.data.album[status].page.current = targetPage;
        G.data.album[status].pagination.current = targetPagination;

        let $targetPagination_ul = $container.find(
          `[data-pagination=${targetPagination}]`
        );
        let $targetPage_a = $container.find(`[data-turn=${targetPage}]`);

        //  blogList 顯示
        $container.find(`[data-page=${curPage}]`).hide();
        $container.find(`[data-page=${targetPage}]`).show();
        //  頁碼 顯示
        $curPage_li.removeClass("active").children().removeClass("pe-none");
        $targetPage_a.addClass("pe-none").parent().addClass("active");
        //  上/下頁鈕 顯示
        if (curPage === 1) {
          $("[data-turn=previous-page]").removeClass("pe-none");
        } else if (curPage === G.data.album[status].page.total) {
          $("[data-turn=next-page]").removeClass("pe-none");
        }
        if (targetPage === 1) {
          $("[data-turn=previous-page]").addClass("pe-none");
        } else if (targetPage === G.data.album[status].page.total) {
          $("[data-turn=next-page]").addClass("pe-none");
        }

        //  paginationList 與 上/下分頁鈕 顯示
        if (targetPagination !== curPagination) {
          //  隱藏當前分頁
          $curPagination_ul.hide();
          //  顯示目標分頁
          $targetPagination_ul.show();
          ////  上/下分頁鈕 顯示
          let $previousPagination_a = $container.find(
            "[data-turn=previous-pagination]"
          );
          let $nextPagination_a = $container.find(
            "[data-turn=next-pagination]"
          );
          if (curPagination === 1) {
            $previousPagination_a.removeClass("pe-none");
          } else if (curPagination === G.data.album[status].pagination.total) {
            $nextPagination_a.removeClass("pe-none");
          }
          if (targetPagination === 1) {
            $previousPagination_a.addClass("pe-none");
          } else if (
            targetPagination === G.data.album[status].pagination.total
          ) {
            $nextPagination_a.addClass("pe-none");
          }
        }
      });

      return;
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
