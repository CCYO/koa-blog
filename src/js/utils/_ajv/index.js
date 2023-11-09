/* -------------------- NPM MODULE -------------------- */
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import errors from "ajv-errors";
/* -------------------- Utils MODULE -------------------- */

import list_ajv_keyword from "./keyword";
import { dev_log as $F_log } from "../log";

/* -------------------- CONSTANT MODULE -------------------- */

import { AJV } from "../../../../config/constant";
/* -------------------- RUN -------------------- */
import schema_list from "./schema";
import Ajv from "ajv";

export default class extends Ajv2019 {
  constructor(axios) {
    super({
      // strict: false,
      allErrors: true,
      $data: true,
    });
    // const ajv = new Ajv2019();
    //  建立ajv instance
    addFormats(this);
    //  為 ajv 添加 format 關鍵字，僅適用 string 與 number
    errors(this);
    //  添加功能：errorMessage 自定義錯誤提示

    for (let keyword of list_ajv_keyword) {
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
    return check.bind(validate);
  }
}

async function check(data) {
  try {
    let validate = this;
    if (validate.$async) {
      await validate(data);
    } else if (!validate(data)) {
      throw new Ajv.ValidationError(validate.errors);
      // return handle_validate_errors(validate);
    }
    return null;
  } catch (invalid_error) {
    return handle_validate_errors(invalid_error.errors);
  }
}

function handle_validate_errors(invalid_errors) {
  $F_log("@整理前的validateErrors => ", invalid_errors);
  let res = invalid_errors.reduce((init, invalid_error) => {
    let {
      myKeyword,
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
    } = invalid_error;
    // let fieldName = instancePath.split("/").pop();
    //  去除'/'
    let handled_by_ajv_error = keyword === "errorMessage" ? true : false;

    /* 全局錯誤 */
    if (!instancePath) {
      if (keyword === "errorMessage" || keyword === "myKeyword") {
        let key = AJV.ERROR_PARAMS[keyword];
        let properties = params.map((param) => param[key]);
        init[AJV.FIELD_NAME.TOP] = { [keyword]: { list: properties, message } };
      } else {
        console.log(
          `全局錯誤${keyword}，因為ajv-errors未預先設定，所以忽略不不需處理`
        );
      }
      return init;
    }
    /* 局部錯誤 */
    if (myKeyword || keyword === "errorMessage") {
      let origin_error = params.errors[0];
      keyword = origin_error.keyword;
    } else {
      console.log(
        `局部錯誤${keyword}，因為ajv-errors未預先設定，所以忽略不不需處理`
      );
      return init;
    }
    let fieldName = instancePath.split("/").pop();
    if (!init.hasOwnProperty(fieldName)) {
      init[fieldName] = {};
    }
    init[fieldName] = { [keyword]: message };
    return init;

    /* 非 ajv-errors 捕獲的錯誤 */
    if (!handled_by_ajv_error) {
      // ↓ 確認校驗錯誤是否來自custom_keyword
      if (!myKeyword) {
        $F_log(
          `@提醒用，發現一個「非custom_keyword」或「未使用ajv-errors預處理」的錯誤訊息:`,
          invalid_error
        );
      } else if (!instancePath) {
      } else {
        if (!init.hasOwnProperty(fieldName)) {
          init[fieldName] = {};
        }
        init[fieldName][keyword] = message;
      }
      return init;
    }
    /*
              被 ajv-errors 捕獲的錯誤 errors，其item:error的keyword都是'errorMessage'
              實際發生錯誤的原生keyword，則在 error.params.errors 裡的 item: error.keyword
          */
    for (let origin_error of params.errors) {
      let origin_keyword = origin_error.keyword;
      //  被ajv-errors捕獲的原生錯誤keyword
      if (!instancePath) {
        let key = AJV.FIELD_NAME.TOP;
        //  代表發生錯誤的keyword，JSON pointer級別高於validatedData
        let origin_param = AJV.ERROR_PARAMS[origin_keyword];
        //  高級別的錯誤，其keyword也是指向高級別，要找到此高級別keyword是校驗出validatedData的哪些key，
        //  ajv會將keys放入originError.params裡，而originError.params是kvPairs，
        //  kvPair的key是ajv預先對應originKeyword設定的，可參考 https://ajv.js.org/api.html#error-parameters
        //  field 是代表全局錯誤的常量
        fieldName = origin_error.params[origin_param];
        //  message 是實際發生問題的 field
        $F_log(
          `@ajv-errors自定義的validateErr：\n
            --JSON Pointer--\n
            keyword → ${origin_keyword}
            fieldName → ${fieldName}\n
            但因為${origin_keyword}是高於${fieldName}的keyword，所以這筆錯誤會放入代表全局field的『${key}』內`
        );
        if (!init.hasOwnProperty(key)) {
          init[key] = {};
        }
        if (!init[key].hasOwnProperty(origin_keyword)) {
          init[key][origin_keyword] = [];
        }
        init[key][origin_keyword].push(fieldName);
      }
      if (!init.hasOwnProperty(fieldName)) {
        init[fieldName] = {};
      }
      init[fieldName][origin_keyword] = message;
    }
    return init;
  }, {});
  //  { fieldName: { keyword1: message1,  keyword2: message2, ...}, ... }
  $F_log("@整理後的validateErrors => ", res);
  return res;
}
