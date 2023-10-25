const white_list = ["blogs", "currentUser", "relationShip", "blog", "album"];

exports.ejs_data_list = function (type) {
  return white_list.some((item) => type === item);
};
