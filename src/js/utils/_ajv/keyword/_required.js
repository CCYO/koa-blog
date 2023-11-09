import { isObjectLike } from "lodash";
import { AJV } from "../../../../../config/constant";

const keyword = "_required";
const myKeyword = true;
function validate(schema, data, parentSchema, dataCtx) {
  let { instancePath, schemaPath } = dataCtx;
  let myKeyword = true;
  let data_keys = Object.keys(data);
  let invalid_properties = schema.filter((property) => {
    return !data_keys.some((key) => key === property);
  });
  if (invalid_properties.length) {
    let params_errors = invalid_properties.map((property) => ({
      instancePath,
      keyword,
      [AJV.ERROR_PARAMS._required]: property,
    }));

    validate.errors = [
      {
        keyword: "required",
        instancePath,
        schemaPath,
        params: {
          errors: params_errors,
        },
        message: "必填",
        myKeyword,
      },
    ];
    return false;

    validate.errors = [
      {
        instancePath,
        keyword: "myKeyword",
        message: "必填",
        params: {
          errors: [
            {
              instancePath,
              schemaPath,
              keyword: "required",
              params: {},
            },
          ],
        },
      },
    ];
  }
  let invalid_entries = Object.entries(data).filter(([prorperty, value]) => {
    let valid = true;
    if (typeof value === "string") {
      valid = !!value.trim().length;
    }
    return !valid;
  });
  if (invalid_entries.length) {
    let params = invalid_entries.map(([property, value]) => ({
      [AJV.ERROR_PARAMS._required]: property,
    }));
    validate.errors = [
      { keyword, instancePath, schemaPath, params, message: "必填", myKeyword },
    ];
    return false;
  }
  return true;
}

export default {
  keyword,
  type: "object",
  schemaType: "array",
  validate,
  errors: true,
};
