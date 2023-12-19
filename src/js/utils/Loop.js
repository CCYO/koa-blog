import { error_handle } from "./common";
import $M_log from "./log";
export default class {
  ms = 5 * 1000 * 60;
  timeSet = undefined;
  loading = undefined;
  args = [];
  error_handle = error_handle;
  /* 防抖動的函數工廠 */
  constructor(callback, config) {
    if (!callback) {
      throw new Error("創建Loop Ins必須提供callback參數");
    } else if (typeof callback !== "function") {
      throw new Error("創建Loop Ins的callback參數必須是function");
    }
    if (config) {
      this.ms = config.ms ? config.ms : this.ms;
      this.args = config.args ? config.args : this.args;
      this.loading = config.loading ? config.loading : this.loading;
      this.error_handle = config.error_handle
        ? config.error_handle
        : this.error_handle;
    }
    this.callback = callback;
  }

  stop() {
    if (this.timeSet) {
      $M_log.dev(`loop stop --- 從【編號${this.timeSet}】setTimeout 開始暫停`);
      this.timeSet = clearTimeout(this.timeSet);
    }
  }
  async now() {
    this.stop();
    $M_log.dev(`loop now --- 立即運行一次 callback/${this.callback.name}`);
    let res = await this.callback(...arguments);
    $M_log.dev(`loop now --- 這次跑完了`);
    this.start();
    return res;
  }
  //  setTimeout 標記
  start() {
    //  創建call時，已將this綁定在實例上，故call若作為eventHandle使用，調用時的this也是指向實例
    //  args 是傳給 fn 的參數
    if (arguments.length) {
      this.args = [...arguments];
    }
    if (this.loading) {
      //  例如fn若是EventHandle，則代表可藉由args[0]取得event
      this.loading(...this.args);
    }
    this.timeSet = setTimeout(async () => {
      try {
        await this.callback(...this.args);
        //  清除timeSet，讓下一次loading順利調用
        $M_log.dev(
          `auto 設定的【編號${this.timeSet}】setTimeout 這次跑完了，將自動進行下一次 --- 2`
        );
        this.timeSet = undefined;
        this.start(...this.args);
      } catch (e) {
        $M_log.dev("捕獲到loop內setTimeout的報錯，並傳入error_handle");
        this.stop();
        this.error_handle(e);
      }
      return;
    }, this.ms);
    $M_log.dev(`auto 已設定【編號${this.timeSet}】setTimeout --- 1`);
  }
}
