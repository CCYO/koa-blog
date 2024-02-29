const { ENV } = require("../config");
function log(msg) {
  if (!ENV.isProd) {
    console.log(`【DEV】${msg}`);
  }
}
module.exports = {
  log,
};
