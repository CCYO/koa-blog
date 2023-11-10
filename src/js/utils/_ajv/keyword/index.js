import diff from "./diff";
import noSpace from "./noSpace";
import _required from "./_required";

import isEmailExist from "./isEmailExist";
import confirmPassword from "./confirmPassword";

const list = [confirmPassword, isEmailExist, diff, noSpace, _required];
const ajv_custom_keyword = list.reduce((acc, item) => {
  let { keyword } = item;
  acc[keyword] = keyword;
  return acc;
}, {});

export default list;
export { ajv_custom_keyword };
