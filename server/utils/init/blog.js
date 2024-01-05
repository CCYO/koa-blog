//  0404
const date = require("date-and-time");
//  0404
const {
  filterEmptyAndFranferFns,
  filterEmptyAndFranferFnsForArray,
} = require("../filterEmpty");
//  0404
const {
  DEFAULT: {
    BLOG: {
      PAGINATION,
      TIME_FORMAT,
      ORGANIZED: { TARGET_PROP, TYPE, TIME },
    },
  },
} = require("../../config");

//  分類 + 排序 + 分頁 + 時間序列化
function pageTable(list, options) {
  let opts = resetOptions(options);
  let organize = organizeByTargetProp(list, opts);
  for (let type in organize) {
    //  取出其中一種分類
    let items = organize[type];
    //  分類中若有內容
    if (items.length) {
      //  排序
      let _sort = (blogs) => sort(blogs, opts);
      //  分頁
      let _pagination = (blogs) => pagination(blogs, opts);
      //  賦值
      organize[type] = filterEmptyAndFranferFnsForArray(
        items,
        _sort,
        _pagination
      );
    }
  }
  //  改變時間格式
  filterEmptyAndFranferFns(list, initTimeFormat);
  return organize;
}
//  0404
//  時間序列化
function initTimeFormat(item, options) {
  let opts = resetOptions(options);
  let { markProp, timeType, timeFormat } = opts;
  //  標記值為boolean
  let boo = item[markProp];
  let { POSITIVE, NEGATIVE } = timeType;
  //  藉標記值得知要序列化的目標時間數據
  let targetTime = boo ? POSITIVE : NEGATIVE;
  //  將目標時間數據做序列化
  item.time = date.format(item[targetTime], timeFormat);
  if (item.hasOwnProperty("createdAt")) {
    item.createdAt = date.format(item.createdAt, timeFormat);
  }
  if (item.hasOwnProperty(POSITIVE)) {
    delete item[POSITIVE];
  }
  if (item.hasOwnProperty(NEGATIVE)) {
    delete item[NEGATIVE];
  }
  return item;
}
//  0404
//  分頁
function pagination(list, options) {
  let opts = resetOptions(options);
  let { pagination } = opts;
  return list.reduce(
    (pageData, item) => {
      //  當前頁數
      let curPage = pageData.length - 1;
      //  當前頁數中的數據數
      let DataCountInCurPage = pageData[curPage].length;
      if (DataCountInCurPage < pagination) {
        pageData[curPage].push(item);
      } else {
        pageData.push([item]);
      }
      return pageData;
    },
    [[]]
  );
}
//  0404
//  排序
function sort(list, options) {
  let opts = resetOptions(options);
  let { markProp, timeType } = opts;
  let boo = list[0][markProp];
  let { POSITIVE, NEGATIVE } = timeType;
  let markTime = boo ? POSITIVE : NEGATIVE;
  //  判斷要以甚麼數據作排列
  return list.sort((A, B) => {
    //  從新到舊排序
    return new Date(B[markTime]) - new Date(A[markTime]);
  });
}
//  0404
//  分纇 { [PUBLIC]: blogs, [PRIVATE]: blogs }
function organizeByTargetProp(list, options) {
  let opts = resetOptions(options);
  let { markProp, organizeTypes } = opts;
  //  分類propName
  let { POSITIVE, NEGATIVE } = organizeTypes;
  //  分類結果的預設值
  let organize = { [POSITIVE]: [], [NEGATIVE]: [] };
  //  沒有數據，返回預設值
  if (!list.length) {
    return organize;
  }
  //  依標記屬性(markProp)的值做分纇
  return list.reduce((acc, item) => {
    //  標記值為 boolean
    let boo = item[markProp];
    //  依標記值分類
    let status = boo ? POSITIVE : NEGATIVE;
    //  依分類存放
    acc[status].push(item);
    return acc;
  }, organize);
}
//  0404
//  若有傳入 opts，則將相應的屬性覆蓋
function resetOptions(options) {
  let opts = {
    markProp: TARGET_PROP,
    organizeTypes: TYPE,
    timeType: TIME,
    timeFormat: TIME_FORMAT,
    pagination: PAGINATION,
  };
  if (!options) {
    return opts;
  }
  let pairs = Object.entries(options);
  if (pairs.length) {
    for (let [prop, val] of pairs) {
      if (!val) {
        continue;
      }
      opts[prop] = val;
    }
  }
  return opts;
}

module.exports = {
  //  0404
  pageTable,

  sortAndInitTimeFormat,
};

//  排序 + 序列化時間
function sortAndInitTimeFormat(datas, opts) {
  let _sort = (blogs) => sort(blogs, opts);
  let list = filterEmptyAndFranferFnsForArray(datas, _sort);
  filterEmptyAndFranferFns(list, initTimeFormat);
  return list;
}
