import { AJV } from "../../../../../config/constant";

const keyword = "_required";
const myKeyword = true;
const message = "必填";
let valid = true;
let errors = undefined;
function validate(schema, data, parentSchema, dataCtx) {
  let data_keys = Object.keys(data);
  let invalid_properties = schema.filter((property) => {
    return !data_keys.some((key) => key === property);
  });
  if (invalid_properties.length) {
    valid = false;
    errors = invalid_properties.map((property) => ({
      keyword: "required",
      params: { [AJV.ERROR_PARAMS._required]: property },
    }));
  }
  let invalid_entries = Object.entries(data).filter(([prorperty, value]) => {
    let ok = true;
    if (typeof value === "string") {
      ok = !!value.trim().length;
    }
    return !ok;
  });
  if (invalid_entries.length) {
    valid = false;
    errors = invalid_entries.map(([property, value]) => ({
      keyword,
      params: { [AJV.ERROR_PARAMS._required]: property },
    }));
  }
  if (errors) {
    validate.errors = [{ keyword, params: { errors }, message, myKeyword }];
  }
  return valid;
}

export default {
  keyword,
  type: "object",
  schemaType: "array",
  validate,
  errors: true,
};
