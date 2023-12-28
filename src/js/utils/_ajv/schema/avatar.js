import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.AVATAR.ref,
  type: "object",
  properties: {
    hash: {
      type: "string",
      errorMessage: {
        type: "必須是字符串",
      },
    },
    url: {
      type: "string",
      format: "uri",
      errorMessage: {
        type: "必須是字符串",
        format: "必須是url",
      },
    },
    size: {
      type: "number",
      maximum: 1 * 1024 * 1024,
    },
    ext: {
      type: "string",
      pattern: "^(EXT)$|^(JPG)$",
    },
    data_url: {
      type: "string",
      format: "byte",
      errorMessage: {
        type: "必須是string",
        format: "預覽網址必須符合base64編碼",
      },
    },
  },
  required: ["hash", "url", "size", "ext", "data_url"],
  _notEmpty: ["hash", "url", "size", "ext", "data_url"],
  _notRepeat: ["hash"],
};
