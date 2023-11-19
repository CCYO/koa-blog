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

import { ajv_custom_keyword } from "./utils/_ajv/keyword";

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
    initRegistFn(`#${PAGE_REGISTER_LOGIN.ID.REGISTER_FORM}`);
    //  初始化 Register Form 功能
    initLoginFn(`#${PAGE_REGISTER_LOGIN.ID.LOGIN_FORM}`);
    //  初始化 Register Form 功能

    /* ------------------------------------------------------------------------------------------ */
    /* Init ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /* 初始化 Register Form 功能 */
    function initLoginFn(form_id) {
      let form = document.querySelector(form_id);
      let login_payload = {};
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
        let validated_list = await $$validate_login(login_payload);
        // let { invalid_list } = $C_ajv.parseErrorsToForm(
        //   validated_list,
        //   login_payload
        // );

        let axios_response = undefined;
        //  校驗
        if (!invalid_list.length) {
          /* 送出請求 */
          /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
          axios_response = await $$axios.post(
            PAGE_REGISTER_LOGIN.API.LOGIN,
            login_payload
          );
          if (!axios_response.errno) {
            alert(PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_SUCCESS);
            $M_redirForm(PAGE_REGISTER_LOGIN.API.LOGIN_SUCCESS);
            return;
          }
        }
        let alert_message = PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_FAIL;
        login_payload = {};
        feedback_for_Form.reset();
        if (axios_response) {
          alert_message = `${PAGE_REGISTER_LOGIN.MESSAGE.LOGIN_FAIL}: ${axios_response.msg}`;
        }
        alert(alert_message);
        return;
      }
      /* 登入表單內容表格的 input Event handler */
      async function handle_input_login(e) {
        e.preventDefault();
        //  LOGIN
        e.target.validated = true;
        let payload = {};
        for (let { type, name, value } of form) {
          if (type === "submit") {
            continue;
          }
          login_payload[name] = value;
        }
        //  更新payload內的表格數據
        let validated_list = await $$validate_login(login_payload);
        feedback_for_Form.update(validated_list);
        return;
      }
    }
    /* 初始化 Register Form 功能 */
    function initRegistFn(form_id) {
      const el_form = document.querySelector(form_id);
      let register_payload = {};
      let feedback_for_Form = gen_feedback_for_Form(el_form);
      deb_eventHandle(
        `#${PAGE_REGISTER_LOGIN.ID.REGISTER_FORM} input`,
        "input",
        handle_input_register
      );
      el_form.addEventListener("submit", handle_submit_register);
      /* 註冊表單 submit Event handler */
      async function handle_submit_register(e) {
        e.preventDefault();
        let validated_list = await $$validate_register(register_payload);
        //  校驗
        if (!invalid_list.length) {
          /* 送出請求 */
          /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
          let { errno } = await $$axios.post(
            PAGE_REGISTER_LOGIN.API.REGISTER,
            register_payload
          );
          if (!errno) {
            alert(PAGE_REGISTER_LOGIN.MESSAGE.REGISTER_SUCCESS);
            location.href = PAGE_REGISTER_LOGIN.API.REGISTER_SUCCESS;
            return;
          }
        }
        register_payload = {};
        feedback_for_Form.reset();
        alert(PAGE_REGISTER_LOGIN.MESSAGE.REGISTER_FAIL);
        return;
      }
      /* 註冊表單內容表格的 input Event handler */
      async function handle_input_register(e) {
        e.preventDefault();
        //  REGISTER
        let targetInput = e.target;
        let targetInputName = targetInput.name;
        targetInput.validated = true;
        //  更新payload內的表格數據
        let $input_list = $(e.target).parents("fieldset").find("input");
        let payload = {};
        for (let { name, value } of $input_list) {
          register_payload[name] = value;
        }
        let validated_list;
        if (targetInputName === PAGE_REGISTER_LOGIN.NAME.EMAIL) {
          validated_list = await $$validate_isEmailExist(register_payload);
        } else {
          validated_list = await $$validate_passwordAndAgain(register_payload);
        }
        feedback_for_Form.update(validated_list);
        return;
      }
    }

    /* ------------------------------------------------------------------------------------------ */
    /* Utils ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    /* genFn => 處理校驗錯誤 ..............*/
    function gen_feedback_for_Form(form, not_required = []) {
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
            input.validated = false;
            if (!this.not_required.some((field_name) => field_name === name)) {
              this.lock.add(name);
            }
          }
          $M_UI.feedback(4, this.form);
          this.checkSubmit();
        }
        update(validated_list) {
          for (let { valid, field_name, message } of validated_list) {
            let input = $(form).find(`input[name=${field_name}]`).get(0);
            //  ↓ 未曾驗證過，那就不需要顯示提醒
            if (!input.validated) {
              continue;
            }
            //  處理驗證成功的lock數據以及表格提醒
            if (valid) {
              this.lock.delete(field_name);
              $M_UI.feedback(2, input, true);
            } else {
              this.lock.add(field_name);
              $M_UI.feedback(2, input, false, message);
            }
          }
          this.checkSubmit();
          console.log("@lock => ", [...this.lock]);
          return;
        }
      }
      return new Lock(form, not_required);
      /* 藉由validateErrors，判斷form可否submit，並於input顯示校驗錯誤 */
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
