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
});

function watchError(error) {
  let message = `發生未知錯誤，頁面${isProd ? "將" : "不會"}重新整裡`;
  alert(message);
  if (isProd) {
    location.reload();
  } else {
    console.log("error_handle捕獲到錯誤-------start-↓↓↓↓");
    console.log(error);
    console.log("error_handle捕獲到錯誤-------end-↑↑↑↑");
  }
  return;
}

export default watchError;
