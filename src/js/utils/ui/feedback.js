import "../../../css/common/feedback.css";

export default function (status, targetEl, valid, msg = "") {
  if (status === 1) {
    //  input 讀取中
    $(targetEl).next().addClass("loading").text("loading...");
    return undefined;
  } else if (status === 2) {
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
  if (status === 3) {
    $(targetEl)
      .removeClass("is-invalid is-valid")
      .next()
      .removeClass("invalid-feedback valid-feedback loading")
      .text("");
    return undefined;
  } else if (status === 4) {
    //  清空form
    for (let inp of targetEl) {
      if (inp.tagName !== "INPUT") {
        continue;
      }
      inp.value = "";
      $(inp)
        .removeClass("is-invalid is-valid")
        .next()
        .removeClass("invalid-feedback valid-feedback loading")
        .text("");
    }
    return undefined;
  }
}
