/**
 * @description redis methods: set & get
 */
const redis = require("redis");
const crypto = require("../../utils/crypto");
const {
  DEFAULT: {
    CACHE: { TYPE },
  },
  DB,
} = require("../../config");

const client = redis.createClient(DB.REDIS_CONF.port, DB.REDIS_CONF.host);
client
  .on("connect", () => {
    console.log("@ Redis cache connect");
  })
  .on("ready", () => console.log("@ Redis cache ready"))
  .on("error", (e) => console.error("@ Redis cache error ==> \n", e));
client.connect();

//  處理 set 格式的緩存(此專案中，拿來系統紀錄user有無新通知)
function _set(type) {
  const KEY = type;
  return { del, add, get, has };
  async function has(id) {
    let set = await get();
    return set.has(id);
  }
  async function del(list) {
    let set = await get();
    for (let item of list) {
      set.delete(item);
    }
    let arr = [...set];
    await Redis.set(KEY, arr);
    return set;
  }
  async function add(list) {
    let set = await get();
    for (let item of list) {
      set.add(item);
    }
    let arr = [...set];
    await Redis.set(KEY, arr);
    return set;
  }
  async function get() {
    let arr = await Redis.get(KEY);
    return new Set(arr);
  }
}
//  處理 obj 格式的緩存(此專案中，拿來記錄user與blog的頁面數據)
function _obj(type) {
  return { get, set, has, del };
  async function del(list) {
    for (let item of list) {
      const KEY = `${type}:${item}`;
      await Redis.del(KEY);
    }
  }
  async function has(id) {
    let obj = await get(id);
    return !!obj;
  }
  async function set(id, data) {
    const KEY = `${type}:${id}`;
    const etag = crypto.hash_obj(data);
    let obj = { [etag]: data };
    await Redis.set(KEY, obj);
    console.log(`系統緩存數據 ${KEY} 的 etag: ${etag}`);
    return etag;
  }
  async function get(id) {
    const KEY = `${type}:${id}`;
    return await Redis.get(KEY);
  }
}
//  輔助 redis 存取數據
const Redis = {
  async get(key) {
    let val = await client.get(key);
    if (val === null) {
      return null;
    }
    try {
      return JSON.parse(val);
    } catch (err) {
      return val;
    }
  },
  async set(key, val, timeout = 60 * 60) {
    try {
      if (typeof val === "object") {
        val = JSON.stringify(val);
      }
      await client.set(key, val);
      await client.expire(key, timeout);
      console.log(`@ 設置系統緩存 --> cache/${key}`);
    } catch (err) {
      throw err;
    }
  },
  async del(key) {
    await client.del(key);
    console.log(`@ 清除系統緩存 --> cache/${key}`);
    return true;
  },
};
/**
 * @description 生成一個obj，具有可以直接針對Redis，進行指定緩存類型的存取方法
 */
function getCache(type) {
  if (type === TYPE.NEWS) {
    return _set(type);
  } else {
    return _obj(type);
  }
}

module.exports = getCache;
