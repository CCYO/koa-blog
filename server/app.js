////  NODE.JS MODULE
const { resolve } = require("path");
////  NPM MODULE
const webpack = require("webpack");
const webpackHotMiddleware = require("koa-webpack-hot-middleware"); //  警告：沒有TS檔
const Koa = require("koa");
const koaMount = require("koa-mount");
const koaConvert = require("koa-convert");
const koaViews = require("@ladjs/koa-views");
const session = require("koa-generic-session");
//  解析前端傳來的POST數據（存入ctx.request.body）
const koaStatic = require("koa-static");
//  打印請求跟響應的url
const bodyparser = require("koa-bodyparser");
//  提高終端顯示數據的可讀性
const logger = require("koa-logger");
const json = require("koa-json");

////  MY MODULE
const webpackDevMiddleware = require("./middleware/_webpackDev");
let { WEBPACK } = require("../config");
let SERVER = require("./config");
const { ErrRes } = require("./model");
//  連接redis-session
const store = require("./db/cache/redis/sessionStore");

//  設定環境變量，以 ~/.env 作為設定檔
// require("dotenv").config();
// const CONFIG = require("../build/config");
// const views = require('koa-views')

const Middleware = require("./middleware/api");

//  router - API
const apiUser = require("./routes/api/user");
const apiEditor = require("./routes/api/editor");
const apiNews = require("./routes/api/news");
const apiComment = require("./routes/api/comment");
const apiAlbum = require("./routes/api/album");
//  router - VIEW
const viewUser = require("./routes/views/user");
const viewBlog = require("./routes/views/blog");
const viewAlbum = require("./routes/views/album");
const viewSquare = require("./routes/views/square");
const viewErrPage = require("./routes/views/errPage");

// const isDev = process.env.NODE_ENV === "development";

const app = new Koa();
//  加密 session
// const { REDIS_CONF } = require("./conf/constant");
// app.keys = [REDIS_SERVER.SESSION_KEY];
app.keys = [SERVER.SESSION.KEY];

//  Middleware - 錯誤處理
//  負責捕捉意外的錯誤（預期可能發生的邏輯問題，已預先以ErrModel處理）
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      //  待處理
      return ctx.render("page404", ErrRes.NOT_FIND);
    }
  } catch (error) {
    ctx.status = 500;
    let isAPI = /^\/api\//.test(ctx.path);
    // let isMyErr = error.isMyErr;
    let responseErr = error;
    // if (!isMyErr || error.err) {
    /* 完全無預期的錯誤，或是捕捉到第三方模塊生成的錯誤 */
    ctx.app.emit("error", error, ctx);
    responseErr = ErrRes.SERVER_ERR;
    //  公版錯誤提醒
    // }
    if (SERVER.ENV.isProd) {
    }
    if (isAPI) {
      ctx.body = responseErr;
    } else {
      if (!responseErr.title) {
        responseErr.title = "伺服器錯誤";
      }
      await ctx.render("page404", responseErr);
    }
    return;
  }
});

app.use(json());
app.use(logger());

let viewRoot;
if (!SERVER.ENV.isProd) {
  // let webpackConfig = require("../build/webpack.dev.config");
  let compiler = webpack(WEBPACK.DEV);
  // 用 webpack-dev-middleware 启动 webpack 编译
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: WEBPACK.DEV.output.publicPath,
      stats: {
        colors: true,
      },
    })
  );
  // 使用 webpack-hot-middleware 支持热更新
  app.use(
    koaConvert(
      webpackHotMiddleware(compiler, {
        publicPath: WEBPACK.DEV.output.publicPath,
        noInfo: true,
        reload: true,
      })
    )
  );
  // 指定开发环境下的静态资源目录
  // app.use(koaMount(
  // 	SERVER.PUBLIC_PATH,
  // 	koaStatic(resolve(__dirname, '../src'), { maxage: 60 * 60 * 1000 })
  // ))
  viewRoot = resolve(__dirname, `../${WEBPACK.CONST.BUILD.DIST}`);
} else {
  viewRoot = resolve(__dirname, `./${WEBPACK.CONST.BUILD.VIEW}`);
}
//  view
app.use(
  koaViews(viewRoot, {
    extension: "ejs",
    map: { ejs: "ejs" },
    viewExt: "ejs",
    partials: {
      ss: resolve(__dirname, ".ss"),
    },
  })
);
//  靜態檔案
app.use(
  koaMount(
    WEBPACK.CONST.PUBLIC_PATH,
    koaStatic(resolve(__dirname, `./assets`), { maxage: 60 * 60 * 1000 })
  )
);

// 串連redis，實現session
app.use(
  session({
    key: "blog.sid", //cookie name前綴
    prefix: "blog.sess", //redis key前綴
    store,
  })
);

app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
//  處理 mysql transaction
app.use(Middleware.need_manual_transaction);

// app.use(views(__dirname + '/views', {
//     extension: 'ejs'
// }))

// Router - API
app.use(apiUser.routes(), apiUser.allowedMethods());
app.use(apiEditor.routes(), apiEditor.allowedMethods());
app.use(apiNews.routes(), apiNews.allowedMethods());
app.use(apiComment.routes(), apiComment.allowedMethods());
app.use(apiAlbum.routes(), apiAlbum.allowedMethods());

// Router - VIEW
app.use(viewUser.routes(), viewUser.allowedMethods());
app.use(viewBlog.routes(), viewBlog.allowedMethods());
app.use(viewAlbum.routes(), viewAlbum.allowedMethods());
app.use(viewSquare.routes(), viewSquare.allowedMethods());
app.use(viewErrPage.routes(), viewErrPage.allowedMethods());

app.on("error", (error, ctx) => {
  if (error.isMyErr) {
    console.log("@isMyErr => ", error.isMyErr);
    console.log("@errno => ", error.errno);
    console.log("@msg => ", error.msg);
  }
  if (error.err) {
    console.log("@第三方模塊包裝後的Error message: \n", error.message);
    console.log("@entries => \n ", Object.entries(error.err));
    console.log(
      "@原生錯誤 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n",
      error.err
    );
  }
  if (!error.isMyErr) {
    console.log("@ 未被預先機制捕捉的錯誤: \n", error);
  }
});

module.exports = app;
