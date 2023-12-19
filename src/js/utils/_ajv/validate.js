import Ajv2019 from "ajv/dist/2019";

import $M_log from "../log";
import { AJV } from "../../../../config/constant";

export default async function (data, ignore_list = []) {
  let validated_errors = {};
  try {
    let validate = this;
    if (validate.$async) {
      await validate(data);
    } else {
      let valid = validate(data);
      if (!valid) {
        throw new Ajv2019.ValidationError(validate.errors);
      }
    }
  } catch (invalid_errors) {
    if (invalid_errors instanceof Ajv2019.ValidationError) {
      validated_errors = _init_errors(invalid_errors.errors);
    } else {
      throw invalid_errors;
    }
  }
  return _parseErrorsToForm(validated_errors, data, ignore_list);
}
//  將校驗錯誤初始化為
//  {
//    all: { [keyword]: { list, message } },
//    [property]: [ { [keyword], [message] }, ... ], ...
//  }
function _init_errors(invalid_errors) {
  $M_log.dev("@整理前的validateErrors => ", invalid_errors);

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
    //  ↓ 忽略未自定義message的校驗錯誤
    if (keyword !== "errorMessage" && keyword !== "myKeyword") {
      $M_log.dev(`@keyword: ${keyword} 沒有預定義錯誤訊息，故忽略`);
      return acc;
    }
    let key;
    let { errors } = params;
    //  ↓ 處理 JSON Pointer 一級 object 角度來說，(properties之上)最高級別的校驗錯誤
    if (!instancePath) {
      key = AJV.FIELD_NAME.TOP;
      if (!acc[key]) {
        acc[key] = [];
      }
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
      //  ↓ 處理 JSON Pointer 一級 object 角度來說，properties級別的校驗錯誤
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
  $M_log.dev("@整理後的validateErrors => ", res);
  return res;
}
//  將轉化後的校驗錯誤再轉化為
//  [
//    { field_name, valid: boolean, <message|value>, }, ...
//  ]
function _parseErrorsToForm(invalid_errors, data, ignore_list = []) {
  let res_list = [];
  //  先將傳入的 data properties 皆視為 valid，待會進行過濾
  let valid_list = Object.keys(data);
  if (Object.getOwnPropertyNames(invalid_errors).length) {
    //  ↓ 處理 JSON Pointer 一級 object 角度來說，(properties之上)最高級別的校驗錯誤
    let top_errors = invalid_errors[AJV.FIELD_NAME.TOP]
      ? invalid_errors[AJV.FIELD_NAME.TOP]
      : [];
    for (let error of top_errors) {
      let { keyword, message, list } = error;
      for (let field_name of list) {
        if (!invalid_errors[field_name] || !invalid_errors[field_name].top) {
          invalid_errors[field_name] = {
            message,
            top: true,
            keyword: [keyword],
          };
        } else {
          invalid_errors[field_name].message += `,${message}`;
          invalid_errors[field_name].keyword.push(keyword);
        }
      }
    }
    delete invalid_errors[AJV.FIELD_NAME.TOP];
    //  ↓ 將校驗錯誤的property從valid_list過濾出來
    for (let field_name in invalid_errors) {
      valid_list = valid_list.filter((key) => key !== field_name);
    }
  }
  //  ↓ 從 invalid_errors 與 valid_list 過濾掉 ignore_list
  if (ignore_list.length) {
    for (let field_name of ignore_list) {
      valid_list = valid_list.filter((item) => item !== field_name);
      delete invalid_errors[field_name];
    }
  }

  let valid;
  //  ↓ 從 valid_errors 整理出校驗錯誤的各別結果給 res_list
  if (Object.getOwnPropertyNames(invalid_errors).length) {
    valid = false;
    for (let field_name in invalid_errors) {
      let errors = invalid_errors[field_name];
      //  ↓ 若是 JSON Pointer 一級 object 定義的最高級別錯誤，在先前已被處理為錯誤 string
      // if (typeof errors === "string") {
      if (errors.top) {
        res_list.push({
          valid,
          field_name,
          message: errors.message,
          keyword: errors.keyword,
        });
        continue;
      }
      //  處理 JSON Pointer 一級 object 最高級別以下各個property的錯誤訊息
      let error = errors.reduce(
        (acc, { message, keyword }, index) => {
          acc.keyword.push(keyword);
          if (!index) {
            acc.message += message;
            return acc;
          }
          acc.message += `,${message}`;
          if (index === errors.length - 1) {
            acc.message += "。";
          }
          return acc;
          // }, "");
        },
        { keyword: [], message: "" }
      );
      res_list.push({ valid, field_name, ...error });
    }
  }
  if (valid_list.length) {
    valid = true;
    for (let field_name of valid_list) {
      let value = data[field_name];
      res_list.push({ field_name, valid, value });
    }
  }
  $M_log.dev("整理後的驗證結果 res_list => ", res_list);
  return res_list;
}
