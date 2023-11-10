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
      throw new Ajv2019.ValidationError(validate.errors);
    }
    return null;
  } catch (invalid_error) {
    return handle_validate_errors(invalid_error.errors);
  }
}

function handle_validate_errors(invalid_errors) {
  $F_log("@整理前的validateErrors => ", invalid_errors);
  let ignore_properties = [];
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
      if (keyword === "errorMessage" || myKeyword) {
        let key = AJV.ERROR_PARAMS[keyword];
        let origin_errors = params.errors;
        let origin_keyword = origin_errors[0].keyword;
        let properties = origin_errors.map((error) => error.params[key]);
        ignore_properties.concat(properties);
        init[AJV.FIELD_NAME.TOP] = {
          [origin_keyword]: { list: properties, message },
        };
      } else {
        console.log(
          `全局錯誤${keyword}，因為ajv-errors未預先設定，所以忽略不不需處理`
        );
      }
      return init;
    }
    /* 局部錯誤 */
    let fieldName = instancePath.split("/").pop();
    let ignore = ignore_properties.some((property) => property === fieldName);
    if (ignore || (keyword !== "errorMessage" && !myKeyword)) {
      console.log(
        `${fieldName}發生局部錯誤${keyword}，因為未預先設定錯誤訊息，所以忽略不不需處理`
      );
      return init;
    }
    if (keyword === "errorMessage") {
      let origin_error = params.errors[0];
      keyword = origin_error.keyword;
    }
    if (!init.hasOwnProperty(fieldName)) {
      init[fieldName] = {};
    }
    init[fieldName][keyword] = message;
    return init;
  }, {});
  //  { fieldName: { keyword1: message1,  keyword2: message2, ...}, ... }
  $F_log("@整理後的validateErrors => ", res);
  return res;
}

function parseErrorsToForm(invalid_errors) {
  if (invalid_errors.hasOwnProperty(AJV.FIELD_NAME.TOP)) {
    let top = invalid_errors[AJV.FIELD_NAME.TOP];
    let res = Object.entries(top).reduce(
      (acc, [keyword, { list, message }]) => {
        if (keyword === ajv_custom_keyword._required) {
          for (let item of list) {
            acc[item] = { [keyword]: message };
          }
        } else {
          console.log(`忽略data發生的全局錯誤${keyword}`);
        }
        return acc;
      },
      {}
    );
    delete invalid_errors[AJV.FIELD_NAME.TOP];
    invalid_errors = { ...invalid_errors, ...res };
  }
  return Object.entries(invalid_errors).reduce((res, [fieldName, KVpairs]) => {
    let feedback_string = Object.entries(KVpairs).reduce(
      (all_message, [keyword, message], index) => {
        if (index > 0) {
          all_message += ",";
        }
        return (all_message += message);
      },
      ""
    );

    if (!res[fieldName]) {
      res[fieldName] = {};
    }
    let fieldName_tw = AJV.EN_TO_TW[fieldName]
      ? AJV.EN_TO_TW[fieldName]
      : fieldName;
    res[fieldName] = {
      get alert() {
        return `【${fieldName_tw}】欄位值${feedback_string}`;
      },
      get feedback() {
        return feedback_string;
      },
    };
    return res;
  }, {});
}
