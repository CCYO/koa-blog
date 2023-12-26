import { error_handle } from "./common";

export default class {
  // args = [];
  ms = 250;
  loading = undefined;
  error_handle = error_handle;
  timeSet = undefined;
  /* 防抖動的函數工廠 */
  constructor(callback, config) {
    if (!callback) {
      throw new Error("創建Debounce Ins必須提供callback參數");
    } else if (typeof callback !== "function") {
      throw new Error("創建Debounce Ins的callback參數必須是function");
    }
    if (config) {
      this.ms = config.ms ? config.ms : this.ms;
      // this.args = config.args ? config.args : this.args;
      this.loading = config.loading ? config.loading : this.loading;
      this.error_handle = config.error_handle
        ? config.error_handle
        : this.error_handle;
    }
    this.callback = callback;
    this.debounce = this.#debounce.bind(this);
  }

  //  setTimeout 標記
  #debounce() {
    let args = arguments;
    let currentTarget = undefined;
    //  創建call時，已將this綁定在實例上，故call若作為eventHandle使用，調用時的this也是指向實例
    //  args 是傳給 fn 的參數
    if (this.timeSet) {
      console.log(`debounce 設定的【編號${this.timeSet}】clearTimeout --- X`);
      /* 取消上一次的 setTimeout */
      currentTarget = undefined;
      this.timeSet = clearTimeout(this.timeSet);
    } else if (this.loading) {
      //  例如fn若是EventHandle，則代表可藉由args[0]取得event
      this.loading(...args);
    }
    this.timeSet = setTimeout(async () => {
      try {
        //  延遲調用fn
        // await this.callback(...this.args);
        await this.callback(...args);
        console.log(
          `debounce 設定的【編號${this.timeSet}】setTimeout，內部 CB 調用結束 --- 2`
        );
        this.timeSet = undefined;
      } catch (e) {
        console.log(
          `捕獲到debounce內setTimeout的報錯，並傳入error_handle --- 從【編號${this.timeSet}】setTimeout 開始暫停`
        );
        this.timeSet = clearTimeout(this.timeSet);
        this.error_handle(e);
      }
      return;
    }, this.ms);
    console.log(
      `debounce fn: ${this.callback.name} 完成【編號${this.timeSet}】setTimeout 設定 --- 1`
    );
  }
}
