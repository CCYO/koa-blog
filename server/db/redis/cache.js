/**
 * @description redis methods: set & get
 */
//  0501
const crypto = require("../../utils/crypto");
//  0501
//  0501
const {
  DEFAULT: {
    CACHE: { TYPE },
  },
  DB,
} = require("../../config");

//  0501
const redis = require("redis");
const client = redis.createClient(DB.REDIS_CONF.port, DB.REDIS_CONF.host);

client
  .on("connect", () => {
    console.log("@ Redis cache connect");
  })
  .on("ready", () => console.log("@ Redis cache ready"))
  .on("error", (e) => console.error("@ Redis cache error ==> \n", e));
client.connect();

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
//  0501
const Redis = {
  //  0501
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
  //  0501
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
  //  0501
  async del(key) {
    await client.del(key);
    console.log(`@ 清除系統緩存 --> cache/${key}`);
    return true;
  },
};

function getCache(type) {
  if (type === TYPE.NEWS) {
    return _set(type);
  } else {
    return _obj(type);
  }
}

module.exports = getCache;
