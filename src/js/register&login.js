/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  require("../views/pages/register&login/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import "../css/register&login.css";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  ui as $M_UI,
  Debounce as $M_Debounce,
  _ajv as $C_ajv,
  _axios as $C_axios,
  wedgets as $M_wedgets,
  redirFrom as $M_redirForm,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import { AJV, PAGE } from "../../config/constant";

/* ------------------------------------------------------------------------------------------ */
/* Const ------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */

const PAGE_REGISTER_LOGIN = PAGE.REGISTER_LOGIN;

/* ------------------------------------------------------------------------------------------ */
/* Class --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const $C_initPage = new $M_wedgets.InitPage();
//  初始化頁面
const $C_backdrop = new $M_wedgets.LoadingBackdrop();
//  讀取遮罩
const $$axios = new $C_axios({ backdrop: $C_backdrop });
const $$ajv = new $C_ajv($$axios);

let $$validate_login = $$ajv.get_validate(AJV.TYPE.LOGIN);
let $$validate_register = $$ajv.get_validate(AJV.TYPE.REGISTER);
let $$validate_passwordAndAgain = $$ajv.get_validate(AJV.TYPE.PASSOWRD_AGAIN);
let $$validate_isEmailExist = $$ajv.get_validate(AJV.TYPE.IS_EMAIL_EXIST);
/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
window.addEventListener("load", async () => {
  try {
    $C_backdrop.show({ blockPage: true });
    //  讀取中，遮蔽畫面
    await $C_initPage.addOtherInitFn(() => $M_wedgets.initNavbar({ $$axios }));
    //  初始化navbar
    await $C_initPage.render(initMain);
    //  統整頁面數據，並渲染需要用到統整數據的頁面內容
    $C_backdrop.hidden();
    //  讀取完成，解除遮蔽
  } catch (error) {
    let x = error;
    if (confirm("window load 時發生錯誤，前往錯誤原因頁面")) {
      location.href = `/errPage?errno=${encodeURIComponent(
        "???"
      )}&msg=${encodeURIComponent(error.message)}`;
    } else {
      console.warn("↓↓↓ window load 報錯 ↓↓↓↓ ");
      throw error;
    }
  }
  /* 初始化頁面內容功能 */
  function initMain() {
    initRegistFn();
    //  初始化 Register Form 功能
    initLoginFn();
    //  初始化 Register Form 功能

    /* ------------------------------------------------------------------------------------------ */
    /* Init ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /* 初始化 Register Form 功能 */
    function initLoginFn() {
      let form = document.querySelector(
        `#${PAGE_REGISTER_LOGIN.ID.LOGIN_FORM}`
      );
      let payload = {};
      let feedback_for_Form = gen_feedback_for_Form(form);
      deb_eventHandle(
        `#${PAGE_REGISTER_LOGIN.ID.LOGIN_FORM} input`,
        "input",
        handle_input_login
      );
      form.addEventListener("submit", handle_submit_login);
      /* 登入表單 submit Event handler */
      async function handle_submit_login(e) {
        e.preventDefault();
        let validateErrs = await $$validate_login(payload);
        //  校驗
        if (validateErrs) {
          payload = {};
          alert(PAGE_REGISTER_LOGIN.LOGIN.FAIL_MSG);
          location.reload();
          return;
        }
        //  處理校驗錯誤
        /* 送出請求 */
        /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
        let { errno } = await $$axios.post(
          PAGE_REGISTER_LOGIN.API.LOGIN,
          payload
        );
        if (!errno) {
          alert(PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_SUCCESS);
          $M_redirForm(PAGE_REGISTER_LOGIN.API.LOGIN_SUCCESS);
          return;
        }
        alert(PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_FAIL);
      }
      /* 登入表單內容表格的 input Event handler */
      async function handle_input_login(e) {
        e.preventDefault();
        //  LOGIN
        let targetInput = e.target;
        let targetInputName = targetInput.name;
        let targetInputValue = targetInput.value;
        e.target.mark = true;
        //  指向$$payload裡對應的數據對象
        payload[targetInputName] = targetInputValue;
        //  更新payload內的表格數據
        let validateErrs = await $$validate_login(payload, false);
        feedback_for_Form(validateErrs);
        return;
      }
    }
    /* 初始化 Register Form 功能 */
    function initRegistFn() {
      const form = document.querySelector(
        `#${PAGE_REGISTER_LOGIN.ID.REGISTER_FORM}`
      );
      let payload = {};
      let feedback_for_Form = gen_feedback_for_Form(form);
      deb_eventHandle(
        `#${PAGE_REGISTER_LOGIN.ID.REGISTER_FORM} input`,
        "input",
        handle_input_register
      );
      form.addEventListener("submit", handle_submit_register);
      /* 註冊表單 submit Event handler */
      async function handle_submit_register(e) {
        e.preventDefault();
        let validateErrs = await $$validate_register(payload);
        //  校驗
        if (validateErrs) {
          payload = {};
          alert(PAGE_REGISTER_LOGIN.REGISTER.FAIL_MSG);
          location.reload();
          return;
        }
        /* 送出請求 */
        /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
        let { errno } = await $$axios.post(
          PAGE_REGISTER_LOGIN.API.REGISTER,
          payload
        );
        if (!errno) {
          alert(PAGE_REGISTER_LOGIN.MESSAGE.REGISTER_SUCCESS);
          location.href = PAGE_REGISTER_LOGIN.API.REGISTER_SUCCESS;
          return;
        }
        alert(PAGE_REGISTER_LOGIN.MESSAGE.REGISTER_FAIL);
        return;
      }
      /* 註冊表單內容表格的 input Event handler */
      async function handle_input_register(e) {
        e.preventDefault();
        //  REGISTER
        let targetInput = e.target;
        let targetInputName = targetInput.name;
        let targetInputValue = targetInput.value;
        e.target.mark = true;
        //  指向$$payload裡對應的數據對象
        payload[targetInputName] = targetInputValue;
        //  更新payload內的表格數據

        if (targetInputName === "email") {
          // payload.$$axios = $$axios;
          let validateErrs = await $$validate_isEmailExist(payload, false);
          feedback_for_Form(validateErrs);
        } else {
          let validateErrs = await $$validate_passwordAndAgain(payload, false);
          feedback_for_Form(validateErrs);
        }
        return;
      }
    }

    /* ------------------------------------------------------------------------------------------ */
    /* Utils ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /* genFn => 處理校驗錯誤 ..............*/
    function gen_feedback_for_Form(form) {
      /* 管理form可否submit的鎖 */
      class Lock {
        constructor(form) {
          this.lock = new Set();
          //  lock.size === 0 則解鎖
          this.$submit = undefined;
          //  submit的jq_ele
          this.inputs = [];
          //  除了submit_ele以外的input
          for (let input of form) {
            const { name, type } = input;
            if (type === "submit") {
              this.$submit = $(input);
            } else {
              this.inputs.push(input);
              this.lock.add(name);
            }
          }
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
      }
      let lock = new Lock(form);
      /* 藉由validateErrors，判斷form可否submit，並於input顯示校驗錯誤 */
      return (validateErrs) => {
        let valid_inputs;
        /* 蒐集無效inputs */
        for (let field in validateErrs) {
          let list_field_validateErr = validateErrs[field];
          //  invalid_input的校驗錯誤資訊
          if (list_field_validateErr.hasOwnProperty("additionalProperties")) {
            //  若校驗錯誤資訊包含 additionalProperties屬性，刪除此校驗錯誤資訊
            delete validateErrs[field];
          }
          valid_inputs = [...lock.inputs].filter(({ name }) => name !== field);
        }
        /* 有效表格值的提醒 */
        for (let valid_input of valid_inputs) {
          if (!valid_input.mark) {
            //  如果未標示，代表未曾驗證過，那就不需要顯示提醒
            continue;
          }
          //  已標示，代表未曾驗證過，那就不需要顯示提醒
          lock.delete(valid_input.name);
          $M_UI.feedback(2, valid_input, true);
        }
        //  轉換validateErrs格式
        if (validateErrs && Object.keys(validateErrs).length) {
          validateErrs = $C_ajv.parseErrorsToForm(validateErrs);
        }
        /* 無效表格值的提醒 */
        for (let inputName in validateErrs) {
          let input = $(form).find(`input[name=${inputName}]`).get(0);
          if (!input.mark) {
            continue;
          }
          let msg = validateErrs[inputName];
          lock.add(inputName);
          $M_UI.feedback(2, input, false, msg.feedback);
          //  若該非法表格未標記 has_debHandle，則替其inputEvent綁定驗證表格值的handle
        }
        return;
      };
    }
    /* 將事件做防抖動設置，並綁定事件 */
    function deb_eventHandle(selectorOrEl, eventType, handle) {
      let eles =
        typeof selectorOrEl === "string"
          ? document.querySelectorAll(selectorOrEl)
          : [selectorOrEl];
      for (let ele of eles) {
        if (ele.has_debHandle) {
          continue;
        }
        ele.has_debHandle = true;
        const deb_handle = new $M_Debounce(handle, {
          loading: (e) => {
            let input = e.target;
            $M_UI.feedback(1, input);
            $(input).parents("form").eq(0).prop("disabled", true);
          },
        });
        ele.addEventListener(eventType, deb_handle.call);
      }
    }
  }
});
