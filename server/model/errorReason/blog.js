const CREATE = {
  ERR: { errno: 10004, msg: "BLOG 創建失敗" },
};
//  --------------------------------------------------------
const REMOVE = {
  ROW: { errno: 40003, msg: "刪除 BLOG 的數量不完全" },
  NO_DATA: { errno: 1002, msg: "刪除BLOG時，沒有提供blogList數據" },
  // ERR_REMOVE_BLOG_IMG: { errno: 1001, msg: "移除Blog內文的圖片時發生錯誤" },
};
const UPDATE = {
  ERR: { errno: 30004, msg: "BLOG資料更新失敗" },
};
const READ = {
  ERR: { errno: 1006, msg: "BLOG READ 發生錯誤" },
  NOT_AUTHOR: { errno: 1005, msg: "非作者本人" },
  NOT_EXIST: { errno: 1005, msg: "該文章不存在" },
  NO_LIST: { errno: 1005, msg: "沒有文章" },
  NO_ALBUM: { errno: 1005, msg: "此相本不存在" },
  NO_PERMISSION: { errno: 1005, msg: "沒有權限查看" },
};
module.exports = {
  UPDATE,
  REMOVE,
  CREATE,
  READ,
  //    ----------------------------------------------------
};
