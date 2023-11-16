/* -------------------- NPM MODULE -------------------- */
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import errors from "ajv-errors";
/* -------------------- Utils MODULE -------------------- */

import list_ajv_keyword from "./keyword";
import { ajv_custom_keyword } from "./keyword";
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

  static parseErrorsToForm = parseErrorsToForm;
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
    return init_errors(invalid_error.errors);
  }
}

function init_errors(invalid_errors) {
  $F_log("@整理前的validateErrors => ", invalid_errors);

  let res = invalid_errors.reduce((acc, invalid_error) => {
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
    } = invalid_error;
    if (keyword !== "errorMessage" && keyword !== "myKeyword") {
      console.log(`keyword: ${keyword} 沒有預定義錯誤訊息，故忽略`);
      return acc;
    }
    let key;
    let { errors } = params;
    if (!instancePath) {
      key = AJV.FIELD_NAME.TOP;
      if (!acc[key]) {
        acc[key] = [];
      }
      console.log("@errors => ", errors);
      errors.reduce((_acc, error) => {
        let { keyword: origin_keyword, params: origin_params } = error;
        let param = AJV.ERROR_PARAMS[origin_keyword];
        let field_name = origin_params[param];
        let item = _acc.find((item) => {
          return item.keyword === origin_keyword;
        });
        if (!item) {
          item = { keyword: origin_keyword, list: [field_name], message };
          _acc.push(item);
        } else {
          item.list.push(field_name);
        }
        return _acc;
      }, acc[key]);

      // acc[key].concat(top_errors);
    } else {
      let key = instancePath.split("/").pop();
      let { keyword: origin_keyword } = errors[0];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ keyword: origin_keyword, message });
    }
    return acc;
  }, {});
  $F_log("@整理後的validateErrors => ", res);
  return res;
}

function parseErrorsToForm(invalid_errors, data, ignore_list = []) {
  let valid_list = Object.keys(data);
  let invalid_list = [];
  if (invalid_errors) {
    let top_errors = invalid_errors[AJV.FIELD_NAME.TOP]
      ? invalid_errors[AJV.FIELD_NAME.TOP]
      : [];
    for (let error of top_errors) {
      let { keyword, message, list } = error;
      for (let field_name of list) {
        invalid_errors[field_name] = message;
      }
    }
    delete invalid_errors[AJV.FIELD_NAME.TOP];
    for (let field_name in invalid_errors) {
      valid_list = valid_list.filter((key) => key !== field_name);
    }
  }

  if (ignore_list.length) {
    for (let field_name of ignore_list) {
      delete data[field_name];
      valid_list = valid_list.filter((item) => item !== field_name);
      delete invalid_errors[field_name];
    }
    // let keys = Object.keys(data);
    // for (let field_name of keys) {
    //   let valid = !invalid_errors
    //     ? true
    //     : !invalid_errors.hasOwnProperty(field_name);
    //   if (valid) {
    //     valid_list.push(field_name);
    //   }
    // }
  }
  if (invalid_errors) {
    for (let field_name in invalid_errors) {
      if (ignore_list && ignore_list.includes(field_name)) {
        delete invalid_errors[field_name];
        continue;
      }
      let errors = invalid_errors[field_name];
      if (typeof errors === "string") {
        invalid_list.push({ field_name, message: errors });
        continue;
      }
      let error_message = errors.reduce((acc, { message }, index) => {
        if (!index) {
          return message;
        }
        acc += `,${message}`;
        if (index === errors.length - 1) {
          acc += "。";
        }
        return acc;
      }, "");
      invalid_list.push({ field_name, message: error_message });
    }
  }
  // valid_list = Object.keys(data);
  return { data, valid_list, invalid_list };

  for (let field_name of ignore_list) {
    //  data去掉ignore_list
    delete data[field_name];
    //  invalid_errors去掉ignore_list
    delete invalid_errors[field_name];
  }

  let res = {
    valid_list: [],
    invalid_list: [],
  };
  for (let field_name in data) {
    if (!invalid_errors[field_name]) {
      res.valid_list.push(field_name);
    } else {
      res.invalid_list.push(field_name);
    }
  }
  let valid = res.valid_list;
  let invalid = res.invalid_list.reduce((acc, field_name) => {
    let item = invalid_errors[field_name];
    let message = item;
    if (typeof item !== "string") {
      message = item.reduce((_acc, { keyword, message }, index) => {
        if (!_acc) {
          _acc = message;
        } else {
          _acc += `,${message}`;
        }
        if (item.length === index - 1) {
          _acc += "。";
        }
        return _acc;
      }, "");
    }
    acc.push({ field_name, message });
    return acc;
  }, []);
  console.log({ valid, invalid });
  return { valid, invalid };

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
