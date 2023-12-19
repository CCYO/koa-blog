import Loading_backdrop from "./LoadingBackdrop";
import _axios from "../_axios";
import initNavbar from "./initNavbar";
import initEJSData from "./initEJSData";
import $M_log from "../log";

class G {
  utils = {};
  data = {};
  async init() {
    let loading_backdrop = new Loading_backdrop();
    let axios = new _axios({ backdrop: loading_backdrop });
    //  { news, me }
    let navbar_data = await initNavbar(axios);
    let ejs_data = initEJSData();
    this.utils = { loading_backdrop, axios };
    this.data = { ...navbar_data, ...ejs_data };
    return this;
  }
  async main(fn) {
    if (fn) {
      this.utils.loading_backdrop.show({ blockPage: true });
      await fn();
      this.utils.loading_backdrop.hidden();
      //  渲染頁面的函數
    }
    /* 初始化函數運行結束後，也將頁面元素調整至初始狀態 */
    this._render();
  }

  _render() {
    $("main, nav, main, footer").removeAttr("style");
    $("form button[type=submit]").removeAttr("disabled");
    $("form button[type=submit]").prop("disabled", true);
    $M_log.dev("頁面初始化完成，目前頁面數據 G.data => ", this.data);
  }
}

let ins = new G();
let init = await ins.init();
export default init;
