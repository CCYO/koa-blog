import { isProd } from "~/server/config/env";
window.onerror = (e) => {
  console.log("在window.onerror 捕捉到錯誤", e);
};
window.addEventListener("error", (e) => {
  console.log("在window.addEventListener('error') 捕捉到錯誤", e);
});
window.addEventListener("unhandledrejection", function (promiseRejectionEvent) {
  alert("發生未知錯誤");
  console.log("在window.addEventListener('unhandledrejection') 捕捉到錯誤");
  // handle error here, for example log
  let reason = undefined;
  try {
    reason = JSON.parse(promiseRejectionEvent.reason.message);
    console.log("parse reason => ", reason);
    console.log("reason stack => ", promiseRejectionEvent.reason);
  } catch (e) {
    console.log("reason stack => ", promiseRejectionEvent.reason);
  }
  //  阻止冒泡
  promiseRejectionEvent.preventDefault();
  if (isProd) {
    this.alert("發生未錯誤，頁面將重新整理。");
    window.reload();
  } else {
    console.log("unhandledrejection -> 非isProd模式，不會重整");
  }
});

function watchError(error) {
  let message = `${error.model ? "後端" : "前端"}發生未知錯誤，頁面${
    isProd ? "將" : "不會"
  }重新整裡`;
  alert(message);
  if (isProd) {
    location.reload();
  } else if (error.model) {
    let { serverError, model } = error;
    console.log("【後端】代碼錯誤-------start-↓↓↓↓");
    console.log(`model:\n `, model);
    console.log(`serverError:\n ${serverError.stack}`);
    console.log("後端代碼錯誤-------end---↑↑↑↑");
  } else {
    console.log("【前端】代碼錯誤-------start-↓↓↓↓");
    console.log("error => ", error);
    console.log("前端代碼錯誤-------end---↑↑↑↑");
  }
  return;
}

export default watchError;
