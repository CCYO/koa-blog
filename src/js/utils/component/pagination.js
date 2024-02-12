/*  初始化文章列表的分頁功能 */
function initPagination() {
  class Pagination {
    #pagination = {
      //    currentPage 當前頁碼
      //    totalPage 總頁數
      //    currentPagination 當前分頁碼
      //    totalPagination 總分頁數
      //  }
    };
    constructor(opts) {
      let { container } = opts;
    }
  }
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
      targetPage = (targetPagination - 1) * DATA_BLOG.PAGINATION.PAGE_COUNT + 1;
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
