import Loading_backdrop from "./LoadingBackdrop";
import _axios from "../_axios";
import initEJSData from "./initEJSData";
import initNavbar from "./initNavbar";

import { INIT_PAGE as DEF_OPTS } from "../../../../config/constant";

export default class {
  #options = DEF_OPTS;
  utils = {};
  data = {};
  async init(options = this.#options) {
    if (options) {
      options = { ...this.#options, ...options };
    }
    let loading_backdrop = new Loading_backdrop(options.LOADING_BACKDROP);
    let axios = new _axios({ backdrop: loading_backdrop });
    let navbar_data = await initNavbar({ axios });
    let ejs_data = initEJSData(options.EJS_DATA);

    this.utils.axios = axios;
    this.utils.loading_backdrop = loading_backdrop;
    this.data = { ...ejs_data, ...navbar_data };

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
