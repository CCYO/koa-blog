const redisStore = require("koa-redis");
const { DB } = require("../../config");

const store = redisStore({
  port: DB.REDIS_CONF.port,
  host: DB.REDIS_CONF.host,
  cookie: {
    path: "/",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, //ms
  },
});
store.client
  .on("connect", () => {
    console.log("@ Redis session connect");
  })
  .on("ready", () => console.log("@ Redis session ready"))
  .on("error", (e) => console.error("@ Redis session error ==> \n", e));

module.exports = store;
