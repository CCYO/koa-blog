/**
 * @description redis methods: set & get
 */
//  0504
const { ErrRes, MyErr } = require("../../../model");
//  0501
const crypto = require("../../../utils/crypto");
//  0501
//  0501
const {
  DEFAULT: {
    CACHE: { TYPE },
  },
  DB,
} = require("../../../config");
//  0501
const redis = require("redis");
const cli = redis.createClient(DB.REDIS_CONF.port, DB.REDIS_CONF.host);
cli.on("error", (e) => console.log("@Redis Error --> ", e));
cli.on("connect", () => console.log("@ => Redis cache init -- ok"));
async function getSet(type) {
  let arr = await Redis.get(type);
  let set = new Set(arr);
  return {
    get() {
      return [...cache];
    },
    has(id) {
      return set.has(id);
    },
    async add(list) {
      for (let id of list) {
        set.add(id);
      }
      await Redis.set(type, [...set]);
      return [...set];
    },
    async del(list) {
      for (let id of list) {
        set.delete(id);
      }
      await Redis.set(type, [...set]);
      return [...set];
    },
  };
}
//  0501
async function getMap(type) {
  let arr = await Redis.get(type);
  let map = new Map(arr);
  return {
    async get(id) {
      if (!id) {
        throw new MyErr(ErrRes.CACHE.READ.NO_DATA(type));
      }
      //  { etag: data }
      return map.get(id);
    },
    async set(id, data) {
      //  [ [blog_id, { etag: SuccModel }], ... ]
      if (!id || !data) {
        throw new MyErr(ErrRes.CACHE.UPDATE.NO_DATA(type));
      }
      let etag = crypto.hash_obj(data);
      console.log(`@ 系統緩存 ${type}/${id} 生成 etag => `, etag);
      let cache = { [etag]: data };
      map.set(id, cache);
      let newCache = [...map.entries()];
      await Redis.set(type, newCache);
      console.log(`@ 系統緩存 ${type}/${id} 完成緩存`);
      return etag;
    },
    async clear(list) {
      for (let id of list) {
        console.log(`${type} --- #clear --- id:${id}`);
        map.delete(id);
      }
      await Redis.set(type, [...map.entries()]);
      console.log("res => ", await Redis.get(type));
      return true;
    },
  };
}
//  0501
const Redis = {
  //  0501
  async get(key) {
    let val = await cli.get(key);
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
      await cli.set(key, val);
      await cli.expire(key, timeout);
    } catch (err) {
      throw err;
    }
  },
  //  0501
  async clear(key) {
    await cli.del(key);
    console.log(`@ 清除系統緩存 --> cache/${key}`);
    return true;
  },
};
//  0501
const NEWS = {
  //  0501
  async init() {
    let KEY = NEWS.KEY;
    let news = await Redis.get(KEY);
    if (!news) {
      await Redis.set(KEY, []);
    }
    return;
  },
  KEY: TYPE.NEWS,
};
//  0501
async function init() {
  try {
    await cli.connect();
    await NEWS.init();
  } catch (e) {
    console.log("@ redis cache init ERR");
    throw new Error(e);
  }
}

module.exports = {
  //  0504
  getSet,
  //  0504
  getMap,
  Redis,
  init,
};
