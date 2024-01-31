/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/register&login/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/register&login.css";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import {
  common as $M_Common,
  G,
  _ajv as $C_ajv,
  Debounce as $C_Debounce,
  ui as $M_UI,
  redir as $M_redir,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { PAGE, AJV } from "./config";

//  webpack打包後的js，會自動插入< script defer>，而defer的調用會發生在DOM parse後、DOMContentLoaded前，
//  為了確保此js能應用到頁面上可能存在以CDN獲取到的其他JS庫，故將所有內容放入window.load
window.addEventListener("load", init);
async function init() {
  try {
    /* ------------------------------------------------------------------------------------------ */
    /* Const ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    const PAGE_REGISTER_LOGIN = PAGE.REGISTER_LOGIN;

    const ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      login: ajv.get_validate(AJV.TYPE.LOGIN),
      register: ajv.get_validate(AJV.TYPE.REGISTER),
      passwordAndAgain: ajv.get_validate(AJV.TYPE.PASSOWRD_AGAIN),
      isEmailExist: ajv.get_validate(AJV.TYPE.IS_EMAIL_EXIST),
    };

    await G.main(initMain);

    function initMain() {
      initRegistFn(`#${PAGE_REGISTER_LOGIN.ID.REGISTER_FORM}`);
      //  初始化 Register Form 功能
      initLoginFn(`#${PAGE_REGISTER_LOGIN.ID.LOGIN_FORM}`);
      //  初始化 Register Form 功能
    }
    /* ------------------------------------------------------------------------------------------ */
    /* Init ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /* 初始化 Register Form 功能 */
    function initLoginFn(form_id) {
      let form = document.querySelector(form_id);
      let axios_payload = {};
      //  依據 input 數據，自動判斷 form 可否開放 submit 功能
      let lock = gen_form_lock(form);
      //  為所有input註冊debounce化的inputEvent handler
      add_form_debounce_inputEvent_handler(form, handle_input_login);
      //  為 form 註冊 submitEvent handler
      form.addEventListener("submit", handle_submit_login);
      /* 登入表單 submit Event handler */
      async function handle_submit_login(e) {
        e.preventDefault();

        let alert_message = PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_FAIL;
        let validated_list = await G.utils.validate.login(axios_payload);
        //  校驗 payload
        let valid = !validated_list.some((item) => !item.valid);
        //  當前進度是否順利
        let status = valid;
        if (valid) {
          /* 送出請求 */
          let { errno, msg } = await G.utils.axios.post(
            PAGE_REGISTER_LOGIN.API.LOGIN,
            axios_payload
          );
          status = !errno;
          alert_message = msg;
        }
        if (status) {
          ////  請求成功
          alert(PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_SUCCESS);
          $M_redir.from(PAGE_REGISTER_LOGIN.API.LOGIN_SUCCESS);
        } else {
          ////  校驗失敗or請求失敗
          //  重置 payload
          axios_payload = {};
          //  重置 lock
          lock.reset();
          alert(alert_message);
        }
        return;
      }
      /* 登入表單內容表格的 input Event handler */
      async function handle_input_login(e) {
        e.preventDefault();
        //  標記，是否呈現標單提醒
        e.target.show_feedback = true;
        //  更新 axios_payload
        for (let { type, name, value } of form) {
          if (type === "submit") {
            continue;
          }
          axios_payload[name] = value;
        }
        //  校驗 axios_payload
        let validated_list = await G.utils.validate.login(axios_payload);
        //  更新 lock
        lock.update(validated_list);
        return;
      }
    }
    /* 初始化 Register Form 功能 */
    function initRegistFn(form_id) {
      const form = document.querySelector(form_id);
      let axios_payload = {};
      //  依據 input 數據，自動判斷 form 可否開放 submit 功能
      let lock = gen_form_lock(form);
      //  為所有input註冊debounce化的inputEvent handler
      add_form_debounce_inputEvent_handler(form, handle_input_register);
      //  為 form 註冊 submitEvent handler
      form.addEventListener("submit", handle_submit_register);
      /* 註冊表單 submit Event handler */
      async function handle_submit_register(e) {
        e.preventDefault();
        let alert_message = PAGE_REGISTER_LOGIN.MESSAGE.REGISTER_SUCCESS;
        //  校驗 axios_payload
        let validated_list = await G.utils.validate.register(axios_payload);
        //  axios_payload 是否有效
        let valid = !validated_list.some((item) => !item.valid);
        //  當前進度狀態是否順利
        let status = valid;
        if (valid) {
          ////  校驗成功
          let { errno } = await G.utils.axios.post(
            PAGE_REGISTER_LOGIN.API.REGISTER,
            axios_payload
          );
          //  更新進度狀態
          status = !errno;
          //  更新提醒內容
          alert_message = !status
            ? PAGE_REGISTER_LOGIN.MESSAGE.REGISTER_FAIL
            : alert_message;
        }
        if (status) {
          ////  請求成功
          alert(alert_message);
          location.href = PAGE_REGISTER_LOGIN.API.REGISTER_SUCCESS;
        } else {
          ////  校驗失敗or請求失敗
          //  重置 payload
          axios_payload = {};
          //  重置 lock
          lock.reset();
          alert(alert_message);
        }
        return status;
      }
      /* 註冊表單內容表格的 input Event handler */
      async function handle_input_register(e) {
        e.preventDefault();
        //  REGISTER
        let target = e.target;
        let target_name = target.name;
        //  標記，是否呈現標單提醒
        target.show_feedback = true;
        //  取得當前fieldset內的表單數據
        let $input_list = $(e.target).parents("fieldset").find("input");
        let payload = {};
        for (let { name, value } of $input_list) {
          payload[name] = value;
        }
        //  更新 axios_payload
        axios_payload = { ...axios_payload, ...payload };
        //  校驗
        let validated_list;
        if (target_name === PAGE_REGISTER_LOGIN.NAME.EMAIL) {
          validated_list = await G.utils.validate.isEmailExist(payload);
        } else {
          validated_list = await G.utils.validate.passwordAndAgain(payload);
        }
        //  更新 lock
        lock.update(validated_list);
        return;
      }
    }

    /* ------------------------------------------------------------------------------------------ */
    /* Utils ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /* genFn => 處理校驗錯誤 ..............*/
    function gen_form_lock(form) {
      /* 管理form可否submit的鎖 */
      class Lock {
        constructor(form) {
          let $form = $(form);
          this.form = form;
          let $input_list = $form.find("input");
          this.input_list = [];
          this.not_required = [];
          for (let input of $input_list) {
            this.input_list.push(input);
            if (!input.required) {
              this.not_required.push(input.name);
            }
          }
          this.lock = new Set();
          //  lock.size === 0 則解鎖
          this.$submit = $form.find("[type=submit]").eq(0);
          //  submit的jq_ele
          this.reset();
        }
        add(inputName) {
          this.lock.add(inputName);
          this.checkSubmit();
        }
        delete(inputName) {
          this.lock.delete(inputName);
          this.checkSubmit();
        }
        checkSubmit() {
          this.$submit.prop("disabled", this.lock.size);
        }
        reset() {
          //  除了submit_ele以外的input
          for (let input of this.input_list) {
            const { name, type } = input;
            input.show_feedback = false;
            if (!this.not_required.some((field_name) => field_name === name)) {
              this.lock.add(name);
            }
          }
          $M_UI.form_feedback.reset(this.form);
          this.checkSubmit();
        }
        update(validated_list) {
          for (let { valid, field_name, message } of validated_list) {
            let input = $(form).find(`input[name=${field_name}]`).get(0);
            //  ↓ 未曾驗證過，那就不需要顯示提醒
            if (!input.show_feedback) {
              continue;
            }
            //  處理驗證成功的lock數據以及表格提醒
            if (valid) {
              this.lock.delete(field_name);
              $M_UI.form_feedback.validated(input, true);
            } else {
              this.lock.add(field_name);
              $M_UI.form_feedback.validated(input, false, message);
            }
          }
          this.checkSubmit();
          return;
        }
      }
      return new Lock(form);
      /* 藉由validateErrors，判斷form可否submit，並於input顯示校驗錯誤 */
    }
    //  將 input 的 inputEvent handler 進行 debounce 化，並註冊在所有 input 上
    function add_form_debounce_inputEvent_handler(form, handle) {
      for (let input of form) {
        if (input.tagName !== "INPUT") {
          continue;
        }
        function loading() {
          $M_UI.form_feedback.loading(input);
          $(form).eq(0).prop("disabled", true);
        }
        const { debounce } = new $C_Debounce(handle, {
          loading,
        });
        input.addEventListener("input", debounce);
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
