/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  require("../views/pages/page404/index.ejs");
}
/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/user.css";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { G, common as $M_Common, redir as $M_redir } from "./utils";
import ErrRes from "../../server/model/errRes";

/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
window.addEventListener("load", init);

async function init() {
  try {
    await G.main(initMain);

    // setTimeout( $M_redir.check_login , 5000)
    async function initMain() {
      let alertMsg;
      let errno = G.data.errModel.errno;
      let target;
      //  404 -> 上一頁 || 廣場頁
      if (errno === ErrRes.PAGE.NO_PAGE.errno) {
        BackPage();
      } else if (errno === ErrRes.PAGE.NO_LOGIN.errno) {
        //  需登入 -> 登入頁 -> 目的地
        alertMsg = "五秒後將自動往登陸頁";
        target = `/login?from=${encodeURIComponent(G.data.from)}`;
        //  無權限 -> 後端以404處理
      } else if (errno === ErrRes.SERVER.ERR_500.errno) {
        BackPage();
        alertMsg = `${ErrRes.SERVER.ERR_500.msg},${alertMsg}`;
      }
      if (G.data.hasOwnProperty("serverError")) {
        console.log(G.data.serverError);
      }
      setTimeout(() => {
        alert(alertMsg);
        setTimeout(() => {
          location.replace(target);
        }, 6000);
      }, 0);

      function BackPage() {
        let hasReferrer = !!document.referrer;
        let someOrigin =
          hasReferrer && /34\.80\.51\.244:8080/.test(document.referrer);
        let notLoginPage =
          (someOrigin && !G.data.me.id) || !/\/login/.test(document.referrer);
        if (notLoginPage) {
          target = document.referrer;
          alertMsg = "五秒後將自動回到上一頁";
        } else {
          target = "/square";
          alertMsg = "五秒後將自動跳往廣場頁";
        }
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
