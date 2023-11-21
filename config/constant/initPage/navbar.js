module.exports = {
  API: {
    NEWS: `/api/news`,
  },
  REG: {
    IGNORE_PAGES: /^\/(login)|(register)|(errPage)/,
  },
  LOAD_NEWS: {
    auto: true,
    ms: 300 * 1000,
  },
};
