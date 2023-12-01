module.exports = {
  API: {
    NEWS: `/api/news`,
  },
  REG: {
    IGNORE_PAGES: /^\/(login)|(register)|(errPage)/,
  },
  LOAD_NEWS: {
    //  5 min
    ms: 5 * 1000 * 60,
  },
};
