import "../../../css/common/form_feedback.css";
import { FORM_FEEDBACK } from "../../config";

export default function (status, targetEl, valid, msg = "") {
  if (status === FORM_FEEDBACK.STATUS.LOADING) {
    //  input 讀取中
    $(targetEl).next().addClass("loading").text("loading...");
    return undefined;
  } else if (status === FORM_FEEDBACK.STATUS.VALIDATED) {
    //  input 有效 || 無效
    //  驗證結束
    $(targetEl)
      .removeClass(valid ? "is-invalid" : "is-valid")
      .addClass(valid ? "is-valid" : "is-invalid")
      .next()
      .removeClass((valid ? "invalid-feedback" : "valid-feedback") + " loading")
      .addClass(valid ? "valid-feedback" : "invalid-feedback")
      .text(msg);
    return valid;
  }
  //  清空inp
  if (status === FORM_FEEDBACK.STATUS.CLEAR) {
    $(targetEl)
      .removeClass("is-invalid is-valid")
      .next()
      .removeClass("invalid-feedback valid-feedback loading")
      .text(msg);
    return undefined;
  } else if (status === FORM_FEEDBACK.STATUS.RESET) {
    //  清空form
    for (let inp of targetEl) {
      if (inp.tagName !== "INPUT") {
        continue;
      }
      inp.value = "";
      if (inp.type === "file") {
        inp.files = undefined;
        continue;
      }
      $(inp)
        .removeClass("is-invalid is-valid")
        .next()
        .removeClass("invalid-feedback valid-feedback loading")
        .text(msg);
    }
    return undefined;
  }
}
