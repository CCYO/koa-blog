const API = {
  NEWS: `/api/news`,
};
const REG = {
  IGNORE_PAGES: /^\/(login)|(register)|(errPage)/,
};
const LOAD_NEWS = {
  //  5 min
  ms: 5 * 1000 * 60,
};
export { API, REG, LOAD_NEWS };
export default { API, REG, LOAD_NEWS };
