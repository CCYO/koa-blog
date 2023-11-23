import _notRepeat from "./_notRepeat";
import _noSpace from "./_noSpace";
import _notEmpty from "./_notEmpty";

import _isEmailExist from "./_isEmailExist";
import confirmPassword from "./confirmPassword";

const list = [confirmPassword, _isEmailExist, _notRepeat, _noSpace, _notEmpty];
const ajv_custom_keyword = list.reduce((acc, item) => {
  let { keyword } = item;
  acc[keyword] = keyword;
  return acc;
}, {});

export default list;
export { ajv_custom_keyword };
