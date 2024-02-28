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
let BUILD = require("../build");
let SERVER_CONFIG = require("./config");
const { ErrRes, MyErr } = require("./model");
//  連接redis-session
const { store } = require("./db/redis");

//  設定環境變量，以 ~/.env 作為設定檔
// require("dotenv").config();
// const CONFIG = require("../build/config");
// const views = require('koa-views')

const Middleware = require("./middleware/api");

//  router - API
const apiUser = require("./routes/api/user");
const apiBlog = require("./routes/api/blog");
const apiNews = require("./routes/api/news");
const apiComment = require("./routes/api/comment");
const apiAlbum = require("./routes/api/album");
//  router - VIEW
const viewUser = require("./routes/views/user");
const viewBlog = require("./routes/views/blog");
const viewAlbum = require("./routes/views/album");
const viewSquare = require("./routes/views/square");
const viewErrPage = require("./routes/views/errPage");
const { irregular } = require("i/lib/inflections");

// const isDev = process.env.NODE_ENV === "development";

const app = new Koa();
//  加密 session
// const { REDIS_CONF } = require("./conf/constant");
// app.keys = [REDIS_SERVER_CONFIG.SESSION_KEY];
app.keys = [SERVER_CONFIG.SESSION.KEY];

//  Middleware - 錯誤處理
//  負責捕捉意外的錯誤（預期可能發生的邏輯問題，已預先以ErrModel處理）
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      //  待處理
      ctx.redirect(`/permission/${ErrRes.PAGE.NO_PAGE.errno}`);
      return;
    }
  } catch (error) {
    ctx.status = 500;
    ctx.app.emit("error", error, ctx);

    let myErr = undefined;
    if (!(error instanceof MyErr)) {
      myErr = new MyErr({ ...ErrRes.SERVER.ERR_500, error });
    } else {
      myErr = error;
    }

    if (SERVER_CONFIG.ENV.isProd) {
      myErr = myErr.model;
    } else if (myErr.serverError) {
      //  error property is enumerable，無法傳給前端，故需處理
      myErr.serverError = JSON.stringify(
        myErr.serverError,
        Object.getOwnPropertyNames(myErr.serverError)
      );
    } else {
      myErr.serverError = JSON.stringify({
        message: undefined,
        stack: myErr.stack,
      });
    }

    let isAPI = /^\/api\//.test(ctx.path);
    if (isAPI) {
      myErr.serverError = JSON.parse(myErr.serverError);
      ctx.body = myErr;
    } else {
      let url = "/serverError";
      if (!SERVER_CONFIG.ENV.isProd) {
        url += `?serverError=${encodeURIComponent(myErr.serverError)}`;
      }
      ctx.redirect(url);
    }
    return;
  }
});

app.use(json());
app.use(logger());

let viewRoot;
if (!SERVER_CONFIG.ENV.isProd) {
  // let webpackConfig = require("../build/webpack.dev.config");
  let compiler = webpack(BUILD.DEV);
  // 用 webpack-dev-middleware 启动 webpack 编译
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: BUILD.DEV.output.publicPath,
      stats: {
        colors: true,
      },
      //  webpack-dev-middleware時，針對靜態資源傳遞max-age
      headers: (req, res, context) => {
        if (/^\/public\//.test(req.url)) {
          res.setHeader({
            "cache-control": "max-age=" + 300, //sec
          });
        }
      },
    })
  );
  // 使用 webpack-hot-middleware 支持热更新
  app.use(
    koaConvert(
      webpackHotMiddleware(compiler, {
        publicPath: BUILD.DEV.output.publicPath,
        noInfo: true,
        reload: true,
      })
    )
  );
  // 指定开发环境下的静态资源目录
  viewRoot = resolve(__dirname, `../${BUILD.CONFIG.BUILD.DIST}`);
} else {
  viewRoot = resolve(__dirname, `./${BUILD.CONFIG.BUILD.VIEW}`);
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
    BUILD.CONFIG.PUBLIC_PATH,
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
app.use(Middleware.SEQ_TRANSACTION);

// app.use(views(__dirname + '/views', {
//     extension: 'ejs'
// }))

// Router - API
app.use(apiUser.routes(), apiUser.allowedMethods());
app.use(apiBlog.routes(), apiBlog.allowedMethods());
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
  let isMyErr = error instanceof MyErr;
  console.log(`@ emit app.onerror => \n is MyErr: ${isMyErr}`);
  if (isMyErr) {
    console.log("model: \n", error.model);
  }
  if (error.serverError) {
    console.log("serverError: \n", error.serverError);
  } else {
    console.log("error message: \n", error.message);
    console.log("error stack: \n", error.stack);
  }
  console.log("@------------------------------------------------------------@");
});

module.exports = app;
