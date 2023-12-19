window.onerror = (e) => {
  console.log("在window.onerror 捕捉到錯誤", e);
};
window.addEventListener("error", (e) => {
  console.log("在window.addEventListener('error') 捕捉到錯誤", e);
});
window.addEventListener("unhandledrejection", function (promiseRejectionEvent) {
  this.alert("發生未知錯誤");
  // handle error here, for example log
  console.log("reason => ", promiseRejectionEvent.reason);
  //  阻止冒泡
  promiseRejectionEvent.preventDefault();
});

export default function (error) {
  console.log("error_handle捕獲到錯誤-------start-↓↓↓↓");
  console.error(error);
  console.log("error_handle捕獲到錯誤-------end-↑↑↑↑");
}
