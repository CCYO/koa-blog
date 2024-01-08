/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/setting/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/setting.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM  ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import npm_SparkMD5 from "spark-md5";
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
import { AJV, PAGE } from "./config";

//  webpack打包後的js，會自動插入< script defer>，而defer的調用會發生在DOM parse後、DOMContentLoaded前，
//  為了確保此js能應用到頁面上可能存在以CDN獲取到的其他JS庫，故將所有內容放入window.load
window.addEventListener("load", init);
async function init() {
  try {
    const $$ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      setting: $$ajv.get_validate(AJV.TYPE.SETTING),
      avartar: $$ajv.get_validate(AJV.TYPE.AVATAR),
      password: $$ajv.get_validate(AJV.TYPE.PASSWORD),
    };
    await G.main(initMain);
    window.G = G;
    function initMain() {
      let { me: $$me } = G.data;
      /* ------------------------- 公用常數 ------------------------- */
      const CONST = {
        AVATAR_EXT: ["JPG", "PNG"],
        AVATAR_SIZE: 1024 * 1024 * 1,
        // 1MB = 1024 KB = 1024 * 1024 Byte
        REG: {
          EXT: /\b.+\.(?<ext>\w+)\b/,
          BASE64URL: /\bdata:.*;base64,(?<avatar_base64>.*)/,
        },
        API: {
          SETTING: "/api/user",
        },
      };

      /* ------------------------- 公用變量 ------------------------- */
      let el_origin_password = document.querySelector(
        `[name=${PAGE.SETTING.NAME.ORIGIN_PASSWORD}]`
      );
      let $newPasswordList = $("[name=password], [name=password_again]");
      let el_password_again = $(`[name=password_again]`).get(0);
      let lock = {
        payload: {},
      };
      let el_model = document.querySelector(
        `#${PAGE.SETTING.ID.MODAL_ORIGIN_PASSWORD}`
      );
      //  公用 BS 原件
      let bs5_modal = new bootstrap.Modal(el_model);
      class $C_genPayload extends Map {
        constructor(selector_form) {
          super();
          this.jq_form = $(selector_form);
          this.jq_submit = this.jq_form.find("[type=submit]").eq(0);
          if (!this.jq_submit.length) {
            throw new Error(`${selector_form}沒有submit元素`);
          }
        }
        setKVpairs(dataObj) {
          //  將kv資料存入
          const entries = Object.entries(dataObj);
          if (entries.length) {
            for (let [key, value] of entries) {
              this.set(key, value);
            }
          }
        }
        getPayload() {
          let res = {};
          for (let [key, value] of [...this]) {
            res[key] = value;
          }
          return res;
        }
        check_submit() {
          let disabled = false;
          let keys = [...this.keys()];
          if (
            keys.length < 1 ||
            (keys.length === 1 && keys[0] === "origin_password")
          ) {
            disabled = true;
          }
          if (!disabled) {
            let { length } = this.jq_form.find(".is-invalid");
            disabled = length > 0;
          }

          this.jq_submit.prop("disabled", disabled);
        }
      }
      let jq_settingForm = $("#setting");
      G.utils.payload = new $C_genPayload("#setting");
      /* ------------------------- handle ------------------------- */
      el_model.addEventListener("shown.bs.modal", () => {
        el_origin_password.focus();
      });
      $newPasswordList.on("focus", handle_showModel);
      //  顯示 origin_password 的 model
      function handle_showModel(e) {
        const KEY = "origin_password";
        e.preventDefault();
        if (G.utils.payload.get(KEY)) {
          return false;
        }
        bs5_modal.show();
      }

      /* ------------------------- 公用 JQ Ele ------------------------- */
      let $checkOrginPassword = $("#checkOrginPassword");
      $checkOrginPassword.on("click", handle_originPassword);
      let jq_avatar = $("#avatar");
      let jq_avatar_previes = $("#avatar-img");
      //  設置原密碼
      async function handle_originPassword(e) {
        e.preventDefault();
        const KEY = "origin_password";
        let kv = { [KEY]: el_origin_password.value };
        let result = await G.utils.validate.password(kv);
        let invalid = result.some(({ valid }) => !valid);
        if (result.length > 1 || (invalid && result[0].keyword.length !== 1)) {
          throw new Error(JSON.stringify(result));
        }
        if (invalid) {
          G.utils.payload.delete(KEY);
          $M_UI.form_feedback.validated(
            el_origin_password,
            false,
            result[0].message
          );
          return;
        }
        //  待修改
        let { errno, msg } = await G.utils.axios.post(
          PAGE.SETTING.API.CHECK_PASSWORD,
          kv
        );
        if (!errno) {
          G.utils.payload.setKVpairs(kv);
          bs5_modal.hide();
        } else {
          $M_UI.form_feedback.validated(el_origin_password, false, msg);
        }
      }

      let { debounce: handle_debounce_input } = new $C_Debounce(handle_input);
      jq_settingForm.on("input", handle_debounce_input);
      async function handle_input(e) {
        let input = e.target;
        const KEY = input.name;
        if (KEY === "avatar") {
          return;
        }
        let value = input.value;

        if (!input.validated) {
          input.validated = true;
        }
        if (KEY === "age") {
          value *= 1;
        }
        let inputEvent_data = { [KEY]: value };
        let result = await _validate(inputEvent_data);

        for (let { field_name, valid, keyword, message, value } of result) {
          let el = document.querySelector(`[name=${field_name}]`);
          if (!el.validated) {
            continue;
          }
          if (valid) {
            if (field_name === "password" && !el_password_again.value) {
              ////  password 與 password_again 為關聯關係，必須做特別處理
              el_password_again.validated = true;
              $(el_password_again).prop("disabled", false);
              $M_UI.form_feedback.validated(el_password_again, false, "必填");
            }
            if (KEY === field_name) {
              G.utils.payload.setKVpairs({ [field_name]: value });
            }
            $M_UI.form_feedback.validated(el, valid);
            G.utils.payload.check_submit();
          } else {
            G.utils.payload.delete(KEY);
            if (field_name === "password" && el_password_again.validated) {
              ////  password 與 password_again 為關聯關係，必須做特別處理
              el_password_again.validated = false;
              $(el_password_again).prop("disabled", true);
              G.utils.payload.delete("password_again");
              el_password_again.value = "";
              $M_UI.form_feedback.clear(el_password_again);
            }
            let txt_count = $(`[name=${field_name}]`).val().length;
            if (txt_count < 1 && field_name !== "password_again") {
              $M_UI.form_feedback.clear(el);
              G.utils.payload.check_submit();
            } else {
              $M_UI.form_feedback.validated(el, valid, message);
              G.utils.payload.check_submit();
            }
          }
        }

        ////  驗證setting
        async function _validate(inputEvent_data) {
          ////  除了當前最新的kv，因為origin_password、password、password_again是關聯關係，需要依情況額外添加需驗證的資料
          let payload = G.utils.payload.getPayload();
          let newData = { ...payload, ...inputEvent_data };
          if (
            newData.hasOwnProperty("password")
            // &&
            // el_password_again.validated
          ) {
            ////  需驗證的資料存在password 且 password_again已經輸入過
            //  el_password_again value 一併校驗
            newData.password_again = el_password_again.value;
          }
          // if (
          //   payload.hasOwnProperty("password") &&
          //   !el_password_again.validated
          // ) {
          //   ////  當前payload已存在有效password 且 password_again 未輸入過
          //   //  el_password_again value 一併校驗
          //   newData.password_again = el_password_again.value;
          // }
          newData._old = G.data.me;
          if (newData.hasOwnProperty("origin_password")) {
            newData._old.password = newData.origin_password;
          }

          let result = await G.utils.validate.setting(newData);
          return result.filter(({ field_name }) => {
            let exclude = ["_old", "avatar_hash", "avatar_ext"];
            return !exclude.some((item) => item === field_name);
          });
        }
      }

      jq_settingForm.on("change", handle_change);
      async function handle_change(e) {
        e.preventDefault();
        if (e.target.name !== "avatar") {
          return;
        }
        if (
          G.utils.payload.has("avatar_hash") &&
          !confirm("要重新傳一顆頭嗎?")
        ) {
          return;
        }
        let files = jq_avatar.prop("files");

        let { valid, message, hash, ext } = await _avatar_data(files);
        if (!valid) {
          alert(message);
          jq_avatar.prop("files", undefined);
          G.utils.payload.delete("avatar_hash");
          G.utils.payload.delete("avatar_ext");
          jq_avatar.val(null);
          jq_avatar_previes.attr("src", G.data.me.avatar);
          G.utils.payload.check_submit();
          //  檔案名稱需手動清空?
          return;
        }
        //  賦予G
        G.utils.payload.setKVpairs({ avatar_hash: hash, avatar_ext: ext });
        //  計算src
        let src = await _src(files[0]);
        jq_avatar_previes.attr("src", src);
        G.utils.payload.check_submit();
        async function _avatar_data(files) {
          let ext = undefined;
          let hash = undefined;
          let valid = false;
          //  確認files數量
          if (files.length > 1) {
            //  移除files
            //  發出警告
            return {
              valid,
              message: "僅限上傳一張",
            };
          }
          let file = files[0];
          if (file.size > PAGE.SETTING.AVATAR.MAX_SIZE) {
            //  移除files
            //  發出警告
            return {
              valid,
              message: `大頭貼容量限${PAGE.SETTING.AVATAR.MAX_SIZE / 1024}Mb`,
            };
          }
          //  確認副檔名
          let regRes = PAGE.SETTING.REG.AVATAR_EXT.exec(file.name);
          if (!regRes) {
            return {
              valid,
              message: `檔名錯誤，且限${PAGE.SETTING.AVATAR.EXT}格式`,
            };
          }
          ext = regRes.groups.ext.toUpperCase();
          if (!PAGE.SETTING.AVATAR.EXT.some((EXT) => EXT === ext)) {
            return {
              valid,
              message: `檔名錯誤，且限${PAGE.SETTING.AVATAR.EXT}格式`,
            };
          }
          //  確認avatar 是否同既有 avatar
          try {
            hash = await _hash(file);
            if (G.data.me.avatar_hash === hash) {
              return {
                valid,
                message: `這張是一樣的頭像`,
              };
            }
            valid = true;
          } catch (e) {
            console.warn("@計算avatar hash 發生錯誤 => ", e);
            return {
              valid,
              message: `計算avatar hash 發生錯誤，請重新嘗試`,
            };
          }
          return { valid, ext, hash };
        }
        //  計算預覽圖
        async function _src(file) {
          return await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.addEventListener("load", (evt) => {
              if (fr.readyState === FileReader.DONE) {
                let base64Url = fr.result;
                resolve(base64Url);
              }
            });
            fr.addEventListener("error", (error) => {
              reject(error);
            });
            fr.readAsDataURL(file);
          });
        }
        //  計算 arrayBuffer
        async function _hash(file) {
          return await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.addEventListener("load", (evt) => {
              if (fr.readyState === FileReader.DONE) {
                let arrayBuffer = fr.result;
                let hash = npm_SparkMD5.ArrayBuffer.hash(arrayBuffer);
                resolve(hash);
              }
            });
            fr.addEventListener("error", (error) => {
              reject(error);
            });
            fr.readAsArrayBuffer(file);
          });
        }
      }
      jq_settingForm.on("submit", handle_submit);
      async function handle_submit(e) {
        e.preventDefault();
        let api = PAGE.SETTING.API.SETTING;
        let payload = G.utils.payload.getPayload();

        let formData = new FormData();
        if (payload.hasOwnProperty("avatar_hash")) {
          api += `?avatar_hash=${payload.avatar_hash}&avatar_ext=${payload.avatar_ext}`;
          formData.append("avatar", jq_avatar.prop("files")[0]);
          delete payload.avatar_hash;
          delete payload.avatar_ext;
        }
        for (let prop in payload) {
          //  整理要更新的請求數據
          let data = payload[prop];
          formData.append(prop, data);
        }
        let { data } = await G.utils.axios.patch(api, formData);

        //  清空avatar數據
        jq_avatar.prop("files", undefined);
        jq_avatar.prop("value", "");
        el_origin_password.value = "";
        $M_UI.form_feedback.reset(jq_settingForm[0]);
        G.utils.payload.clear();
        for (let prop in data) {
          G.data.me[prop] = data[prop];
          let el_input = document.querySelector(`[name=${prop}]`);
          if (!el_input || !data[prop]) {
            continue;
          }
          el_input.validated = false;
          el_input.placeholder = data[prop];
        }
        alert("資料更新完成");
      }
      //  重新選擇要上傳的頭像
      function handle_resetAvatar(e) {
        e.preventDefault();
        if (!$avatar.prop("files")[0]) {
          return;
        }
        if (confirm("要重新傳一顆頭嗎?")) {
          //  重設頭像表格
          G.utils.payload.delete("avatar_hash");
          G.utils.payload.delete("avatar_ext");
          $avatar_img.src = G.data.me.avatar;
          $avatar.val(null);
          G.utils.payload.check_submit();
        }
        // else {
        //   e.preventDefault();
        // }
      }
    }
  } catch (error) {
    $M_Common.error_handle(error);
  }
}
