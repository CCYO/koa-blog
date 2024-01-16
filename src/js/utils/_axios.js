import axios from "axios";
import * as ErrRes from "~/server/model/errRes";
import { error_handle } from "./common/index";
import $M_log from "./log";
import $M_redir from "./redir";
const REG_API_NEWS = /(^\/api\/news$)/;

export default class {
  //  創建一個axios實例

  constructor({ backdrop = undefined }) {
    if (!backdrop) {
      throw new Error("創建axios instance未提供blockPage參數");
    }
    let instance = axios.create();
    instance.backdrop = backdrop;

    /* 配置 axios 的 請求攔截器，統一處理報錯 */
    instance.interceptors.request.use(
      (config) => {
        const backdrop_config = config.backdrop
          ? config.backdrop
          : { blockPage: false };
        //  當 axios 調用請求方法時，依據傳入的config取得backdrop的options
        instance.backdrop.show(backdrop_config);
        //  顯示遮罩
        return config;
      },
      (error) => {
        throw error;
      }
    );

    /* 配置 axios 的 響應攔截器，統一處理報錯 */
    instance.interceptors.response.use(
      (response) => {
        let {
          config: { url },
          data: { errno, msg },
        } = response;
        let res = response.data;
        if (errno === ErrRes.NEWS.READ.NO_LOGIN.errno) {
          ////  針對未登入狀態處理
          if (REG_API_NEWS.test(window.location.pathname)) {
            //  此請求若來自於 getNews
            $M_log.dev("取得news資訊時，發現未登入");
            res = { errno, data: { me: {} } };
          } else {
            //  非 getNews 請求的回應處理
            $M_redir.check_login();
            // alert("尚未登入！請先登入帳號！");
            // location.href = `/login?from=${encodeURIComponent(location.href)}`;
          }
        } else if (errno) {
          console.log("@axios response 取得後端發來「否決」結果 => \n", msg);
        }
        instance.backdrop.hidden();
        return Promise.resolve(res);
      },
      (axiosError) => {
        $M_log.dev("_axios 發生錯誤，交給 $M_common.error_handle 處理");
        let responseData = axiosError.response.data;
        error_handle(responseData);
      }
    );

    return instance;
  }
}
