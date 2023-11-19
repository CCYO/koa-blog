const CONF = {
  ms: 250,
  loop: false,
  loading: undefined,
};

export default class {
  /* 防抖動的函數工廠 */
  constructor(callback, config = CONF) {
    this.callback = callback;
    this.ms = config.ms ? config.ms : CONF.ms;
    this.loop = config.loop ? config.loop : CONF.loop;
    this.loading = config.loading ? config.loading : CONF.loading;
    this.debounce = this._debounce.bind(this);
  }
  timeSet = undefined;
  //  setTimeout 標記
  _debounce() {
    //  創建call時，已將this綁定在實例上，故call若作為eventHandle使用，調用時的this也是指向實例
    const _arguments = arguments;
    //  args 是傳給 fn 的參數
    if (this.timeSet) {
      clearTimeout(this.timeSet);
    } else if (this.loading) {
      //  例如fn若是EventHandle，則代表可藉由args[0]取得event
      this.loading(..._arguments);
    }
    /* 取消上一次的 setTimeout */
    this.timeSet = setTimeout(async (e) => {
      /* 延遲調用fn，且調用完畢後自動再作一次延遲調用 */
      await this.callback(..._arguments);
      this.timeSet = undefined;
      //  清除timeSet，讓下一次loading順利調用
      if (this.loop) {
        this.debounce(..._arguments);
      }
    }, this.ms);
  }
}
