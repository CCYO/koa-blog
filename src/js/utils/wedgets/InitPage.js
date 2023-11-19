export default class {
  data = {};
  promises = [];

  constructor($$axios) {
    this.$$axios = $$axios;
  }
  /**
   *
   * @param {*} otherInitFn 用來取得頁面初使化所需數據，通常都是異步請求函數
   */
  async addOtherInitFn(otherInitFn) {
    /* 調用otherInitFn，並蒐集其生成的 promise */
    this.promises.push(otherInitFn());
  }
  async render(renderPage) {
    let allRes = await Promise.all(this.promises);

    for (let res of allRes) {
      console.log("@res => ", res);
      for (let prop in res) {
        if (prop === "news") {
          //  省略news數據
          continue;
        }
        this.data[prop] = res[prop];
        //  將所有初始化頁面的函數結果，存放在瀏覽器
      }
    }
    console.log("@this.data => ", this.data);
    if (renderPage) {
      await renderPage(this.data);
      //  渲染頁面的函數
      /* 初始化函數運行結束後，也將頁面元素調整至初始狀態 */
      $("main, nav, main, footer").removeAttr("style");
      $("form button[type=submit]").removeAttr("disabled");
      $("form button[type=submit]").prop("disabled", true);
    }
  }
}
