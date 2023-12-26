import $M_log from "../log";
import "../../../css/utils/noClick.css";
import "../../../css/wedgets/loadingBackdrop.css";

import { INIT_PAGE } from "../../../../config/constant";
export default class {
  constructor(options = INIT_PAGE.LOADING_BACKDROP) {
    this.options = { ...options };
    this.$backdrop = $(`#${options.ID}`);
    this.$backdrop.on("focus", (e) => {
      e.preventDefault();
      this.$backdrop.get(0).blur();
    });
  }
  editors = [];
  hidden() {
    $(this.options.targetSelector)
      .removeClass(this.options.blockClassName)
      //  取消blockList不可被點擊的狀態
      .off(`.${this.options.backdropClassName}`);
    //  移除指定的事件綁定
    this.$backdrop.removeAttr("style").hide();
    if (this.editors.length) {
      for (let editor of this.editors) {
        editor.enable();
      }
    }
    $M_log.dev("backdrop hidden");
  }
  //  顯示dropBack
  show(config = { blockPage: false, editors: [] }) {
    const {
      blockPage = false,
      //  是否顯示頁面遮罩
      editors = [],
      //  要新添加的wangEditor list
    } = config;
    if (!blockPage) {
      // this.$backdrop.css('visibility', 'hidden')
      this.$backdrop.css("opacity", "0");
      //  不顯示頁面遮罩，將其顯示為不可見(實際上仍存在)
    }
    if (editors.length) {
      //  存入this.editors
      this.insertEditors(editors);
    }
    for (let editor of this.editors) {
      //  關閉所有editor作用
      editor.disable();
    }
    this.$backdrop.show();
    ////  focus事件綁定(且用上jq語法糖，賦予綁定事件一個指定名稱，方便後續取消綁定)
    ////  handle 讓所有 blockList 發生聚焦時，統一將聚焦轉移至 backdrop
    $(this.options.targetSelector)
      .addClass(this.options.blockClassName)
      //  使blockList不可被點擊
      .on(`focus.${this.options.backdropClassName}`, (e) =>
        this.focusBackdrop(e)
      );

    $M_log.dev("backdrop show");
  }
  insertEditors(editors) {
    this.editors = this.editors.concat(editors);
    //  存入this.editors
  }
  /* 統一 focus backdrop */
  focusBackdrop(e) {
    e.preventDefault();
    e.target.blur();
    console.log(e.target, ` 觸發了 focusEvent`);
    this.$backdrop.get(0).focus();
    //  聚焦到 backdrop
  }
}
