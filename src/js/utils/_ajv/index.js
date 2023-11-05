/* -------------------- NPM MODULE -------------------- */
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import errors from "ajv-errors";
/* -------------------- Utils MODULE -------------------- */

import keyword_list from "./keyword";
import { dev_log as $F_log } from "../log";

/* -------------------- CONSTANT MODULE -------------------- */

import { AJV } from "../../../../config/constant";
/* -------------------- RUN -------------------- */
import schema_list from "./schema";

export default class extends Ajv2019 {
  constructor(axios) {
    super({
      strict: false,
      allErrors: true,
      $data: true,
    });
    // const ajv = new Ajv2019();
    //  建立ajv instance
    addFormats(this);
    //  為 ajv 添加 format 關鍵字，僅適用 string 與 number
    errors(this);
    //  添加功能：errorMessage 自定義錯誤提示

    for (let keyword of keyword_list) {
      this.addKeyword(keyword);
      //  添加關鍵字
    }
    this.addSchema(schema_list);
    if (axios) {
      this.$$axios = axios;
    }
  }

  get_validate(CONST_AJV_TYPE) {
    let validate = this.getSchema(CONST_AJV_TYPE.ref);
    return async_check.bind(validate);
  }

  static parseErrorsToForm = parseErrorsToForm;
}

async function async_check(data, parseErrorForFeedBack = true) {
  try {
    let validate = this;
    if (validate.$async) {
      await validate(data);
    } else if (!validate(data)) {
      return handle_validate_errors(validate, parseErrorForFeedBack);
    }
    return null;
  } catch (e) {
    return handle_validate_errors(e, parseErrorForFeedBack);
  }
}

function handle_validate_errors(error, parseErrorForFeedBack) {
  let { errors } = error;
  if (errors) {
    $F_log("@整理前的validateErrors => ", errors);
    let _errors = _parseValidateErrors(errors);
    //  { fieldName: { keyword1: message1,  keyword2: message2, ...}, ... }
    $F_log("@整理後的validateErrors => ", _errors);
    if (parseErrorForFeedBack) {
      _errors = parseErrorsToForm(_errors);
      //  { 表格名1: message1, 表格名2: message2, ... }
    }
    return _errors;
  } else {
    throw err;
  }
}

function en_to_tw_for_fieldName(fieldName) {
  const map = {
    //	全局錯誤
    all: "all",
    //	register
    email: "信箱",
    password: "密碼",
    password_again: "密碼確認",
    //	blog
    title: "文章標題",
    contetn: "文章內文",
    show: "文章狀態",
    //	setting
    nickname: "暱稱",
    age: "年齡",
    avatar: "頭像",
    avatar_hash: "頭像hash",
    // myKeyword
    confirm_password: "密碼驗證",
  };
  return map[fieldName];
}
function _parseValidateErrors(validateErrors) {
  /*{ 
        errors: [ { ..., message: 自定義的錯誤說明, ... }, ...],
      }*/
  return validateErrors.reduce((init, validateError) => {
    let {
      keyword,
      //  "errorMessage": 代表該錯誤訊息是利用ajv-errors在schema預先設定的
      //  "其他狀況"：代表該錯誤則否(通常是schema最高級的keyword，ex: if/else)
      params,
      //  若keyword === "errorMessage"，則params即為利用ajv-error設定的錯誤訊息，原生ajv錯誤資訊則存於params.errors
      instancePath,
      //  validatedData 發生錯誤的JSON Pointer(ex: "/email")
      //  若值為""，代表validatedData牴觸的keyword，其指向比validatedData顯示不出來的更高級的JSON Pointer位置(ex: schema.if)
      message,
      //  ajv-errors針對當前錯誤設定錯誤提示，或是原生錯誤提醒
    } = validateError;
    let fieldName = instancePath.split("/").pop();
    //  去除'/'
    let handled_by_ajv_error = keyword === "errorMessage" ? true : false;
    /* 非 ajv-errors 捕獲的錯誤 */
    if (!handled_by_ajv_error) {
      // ↓ 確認校驗錯誤是否來自custom_keyword
      if (!params.myKeyword) {
        $F_log(
          "@提醒用，不被處理的錯誤 => \n keyword: ",
          keyword,
          "\n message: ",
          message
        );
        return;
      } else {
        if (!init.hasOwnProperty(fieldName)) {
          init[fieldName] = {};
        }
        init[fieldName][keyword] = message;
        // }
        return init;
      }
    }
    /*
            被 ajv-errors 捕獲的錯誤 errors，其item:error的keyword都是'errorMessage'
            實際發生錯誤的原生keyword，則在 error.params.errors 裡的 item: error.keyword
        */
    for (let originError of params.errors) {
      let originKeyword = originError.keyword;
      //  被ajv-errors捕獲的原生錯誤keyword
      if (!instancePath) {
        //  代表發生錯誤的keyword，JSON pointer級別高於validatedData
        let originParam = AJV.ERROR_PARAMS[originKeyword];
        //  高級別的錯誤，其keyword也是指向高級別，要找到此高級別keyword是校驗出validatedData的哪些key，
        //  ajv會將keys放入originError.params裡，而originError.params是kvPairs，
        //  kvPair的key是ajv預先對應originKeyword設定的，可參考 https://ajv.js.org/api.html#error-parameters
        fieldName = originParam
          ? originError.params[originParam]
          : AJV.FIELD_NAME.TOP;
        $F_log(
          `@ajv-errors自定義的validateErr：\n
          --JSON Pointer--\n
          keyword → 高於『${originKeyword}』設定的schema\n
          fieldName → ${fieldName}`
        );
      }
      if (!init.hasOwnProperty(fieldName)) {
        init[fieldName] = {};
      }
      init[fieldName][originKeyword] = message;
    }
    return init;
  }, {});
}
function parseErrorsToForm(myErrors) {
  return Object.entries(myErrors).reduce((res, [fieldName, KVpairs]) => {
    let msg = Object.entries(KVpairs).reduce(
      (_msg, [keyword, message], index) => {
        if (index > 0) {
          _msg += ",";
        }

        return (_msg += message);
      },
      ""
    );
    if (!res[fieldName]) {
      res[fieldName] = {};
    }
    let fieldName_tw = en_to_tw_for_fieldName(fieldName);
    !fieldName_tw && console.log("@fieldName 找不到對應的中文 => ", fieldName);
    res[fieldName] = {
      get alert() {
        return `【${fieldName_tw}】欄位值${msg}`;
      },
      get feedback() {
        return msg;
      },
    };
    return res;
  }, {});
}
