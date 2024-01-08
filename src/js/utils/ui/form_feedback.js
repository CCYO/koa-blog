import "@css/common/form_feedback.css";

function loading(el_input, msg = "") {
  //  input 讀取中
  $(el_input)
    .next()
    .addClass("loading")
    .text(msg || "loading...");
  return undefined;
}
function validated(el_input, valid, msg = "") {
  //  input 有效 || 無效
  $(el_input)
    .removeClass(valid ? "is-invalid" : "is-valid")
    .addClass(valid ? "is-valid" : "is-invalid")
    .next()
    .removeClass("loading " + (valid ? "invalid-feedback" : "valid-feedback"))
    .addClass(valid ? "valid-feedback" : "invalid-feedback")
    .text(msg);
  return valid;
}
//  清空inp
function clear(el_input) {
  $(el_input)
    .removeClass("is-invalid is-valid")
    .next()
    .removeClass("invalid-feedback valid-feedback loading")
    .text("");
  return undefined;
}

//  清空form
function reset(el_form) {
  el_form.reset();
  let list = ["file", "submit"];
  for (let inp of el_form) {
    let ignore = list.some((item) => item === inp.type);
    if (ignore || inp.tagName !== "INPUT") {
      continue;
    }
    // inp.value = "";
    // if (inp.type === "file") {
    //   inp.files = undefined;
    //   continue;
    // }
    clear(inp);
  }
  return undefined;
}

export default {
  loading,
  validated,
  clear,
  reset,
};
