import DEFAULT from "./default";
import AVATAR from "./avatar";
import BLOG from "./blog";
import IS_EMAIL_EXIST from "./isEmailExist";
import PASSWORD from "./password";
import PASSWORD_AND_AGAIN from "./passwordAndAgain";
import IMG_ALT from "./imgAlt";
import LOGIN from "./login";

import REGISTER from "./register";
import SETTING from "./setting";

let list = [
  AVATAR,
  BLOG,
  IS_EMAIL_EXIST,
  PASSWORD,
  PASSWORD_AND_AGAIN,
  IMG_ALT,
  LOGIN,
  REGISTER,
  LOGIN,
  SETTING,
];

let schema = list.reduce(
  (acc, cur) => {
    if (cur.$async) {
      acc.async.push(cur);
    } else {
      acc.sync.push(cur);
    }
    return acc;
  },
  { sync: [], async: [] }
);

schema.default = DEFAULT;

export default schema;
