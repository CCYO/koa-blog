import Loading_backdrop from "./LoadingBackdrop";
import _axios from "../_axios";
import initEJSData from "./initEJSData";
import initNavbar from "./initNavbar";

class initPage {
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
  async render(renderPage) {
    if (renderPage) {
      this.utils.loading_backdrop.show({ blockPage: true });
      await renderPage(this.data);
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
  }
}

let ins = new initPage();
let G = await ins.init();
export default G;
