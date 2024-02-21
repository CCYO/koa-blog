const {
  filterEmptyAndFranferFns,
  filterEmptyAndFranferFnsForArray,
} = require("../filterEmpty"); //  0411
const date = require("date-and-time"); //  0411
const {
  DEFAULT: {
    COMMENT: { CHECK_IS_DELETED, TIME_FORMAT, SORT_BY },
  },
} = require("../../config"); //  0411
//  0404
function initListForBrowser(data) {
  //  嵌套 + 排序
  let comments = filterEmptyAndFranferFnsForArray(data, nestAndSort);
  //  序列化 時間數據
  filterEmptyAndFranferFns(data, initTime);
  return comments;
}
//  0411
//  時間序列化
function initTime(item) {
  item[CHECK_IS_DELETED] = item.deletedAt ? true : false;
  if (item[CHECK_IS_DELETED]) {
    item.time = date.format(item.deletedAt, TIME_FORMAT);
  } else {
    item.time = date.format(item.createdAt, TIME_FORMAT);
  }
  delete item.createdAt;
  delete item.deletedAt;
  return item;
}
//  0404
function nestAndSort(comments) {
  let list;
  if (Array.isArray(comments)) {
    //  存放 nest 結果的數據
    let commentList = [];
    for (let comment of comments) {
      //  每個 comment 都新增 reply 屬性，用來 nest commentChildren
      comment.reply = [];
      //  屬於 commentParent || 只有一條 comment 數據
      if (!comment.pid || comments.length === 1) {
        //  存入 nest 結果
        commentList.push(comment);
      } else {
        //  執行 nest
        nestComments(commentList, comment);
      }
    }
    //  排序
    list = sort(commentList);
    //  非數組，直接返回
  } else {
    list = comments;
  }
  return list;
  //  nest
  function nestComments(commentList, item) {
    //  迭代處理 存放在 nest 結果的數據，
    for (let comment of commentList) {
      //  要處理的數據pid === 當前迭代數據的id
      if (item.pid === comment.id) {
        //  將要處理的數據，存放進當前迭代數據的reply
        comment.reply.push(item);
        break;
        //  若當前迭代數據的reply內仍有數據，則向內執行 nest
      } else if (comment.reply.length) {
        nestComments(comment.reply, item);
      }
    }
  }
  function sort(list) {
    return list.sort(function (a, b) {
      return b[SORT_BY] - a[SORT_BY];
    });
  }
}
module.exports = {
  initTime,
  //  --------------------------------------------------------------
  //  0411
  initListForBrowser,
};
