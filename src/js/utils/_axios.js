import axios from "axios";
import * as ErrRes from "~/server/model/errRes";
import { error_handle } from "./common/index";
import $M_log from "./log";
import $M_redir from "./redir";
const REG_API_NEWS = /(^\/api\/news$)/;

const REG = {
  IGNORE_PATH: /^\/(login)|(register)|(errPage)|(blog\/preview\/\d+)/,
};

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
        let resolve = true; // 1: Promise.resolve, 2: redir login page
        let {
          config: { url },
          data: { errno, msg },
        } = response;
        let res = response.data;

        if (
          errno === ErrRes.NEWS.READ.NO_LOGIN &&
          !REG.IGNORE_PATH.test(location.pathname)
        ) {
          resolve = false;
        } else if (errno === ErrRes.PAGE.NO_LOGIN) {
          resolve = false;
        }
        instance.backdrop.hidden();
        if (resolve) {
          return Promise.resolve(res);
        }
        $M_redir.check_login();
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
