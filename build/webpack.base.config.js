////  NODE MODULE
const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");
////  NPM MODULE
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
////  MY MODULE
const SERVER_CONFIG = require("../server/config");
const CONFIG = require("./config");
const EJS = require("./init_ejs");
// const CONS = require("../config/constant");
const entry = createEntry();
const HtmlWebpackPlugins = createHtmlWebpackPlugins();

module.exports = {
  context: resolve(__dirname),
  entry,
  output: {
    path: resolve(__dirname, `../${CONFIG.BUILD.DIST}`),
    publicPath: `${CONFIG.PUBLIC_PATH}/`,
    filename: `${CONFIG.BUILD.SCRIPT}/[name].bundle.js`,
    chunkFilename: `${CONFIG.BUILD.SCRIPT}/[name].[contenthash:5].js`,
    clean: true,
  },

  resolve: {
    alias: {
      "~": resolve(__dirname, "../"),
      "@": resolve(__dirname, "../src"),
      js: resolve(__dirname, "../src/js"),
      css: resolve(__dirname, "../src/css"),
      less: resolve(__dirname, "../src/less"),
    },
    fallback: {
      path: require.resolve("path-browserify"),
      fs: require.resolve("browserify-fs"),
      // util: require.resolve("util"),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /(node_modules|lib|libs)/,
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: "asset",
        generator: {
          filename: `${CONFIG.BUILD.IMAGE}/[name].[contenthash:5][ext]`,
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              // disable: process.env.NODE_ENV !== "production",
              disable: !SERVER_CONFIG.ENV.isProd,
              pngquant: {
                quality: [0.3, 0.5],
              },
            },
          },
        ],
      },
      {
        test: /\.(eot|woff2|woff|ttf|svg|otf)$/,
        type: "asset/resource",
        generator: {
          filename: `${CONFIG.BUILD.FONT}/[name].[contenthash:5][ext]`,
        },
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: "html-loader",
            options: {
              sources: {
                list: [
                  { tag: "img", attribute: "src", type: "src" },
                  { tag: "img", attribute: "data-src", type: "srcset" },
                  { attribute: "data-background", type: "srcset" },
                ],
              },
            },
          },
          {
            loader: "template-ejs-loader",
            //	認得<%-
            //	<%= 必須寫成 <%%=
            options: {
              // production: process.env.ENV === "production",
              production: SERVER_CONFIG.ENV.isProd,
              data: {
                CONST: EJS,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 打包文件
    ...HtmlWebpackPlugins,
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
  ],
};

function createEntry() {
  ////  列出 要打包的js檔
  const js_dir = resolve(__dirname, "../src/js/*.js");
  ////  entry: [ { [js檔名]: js路徑位置 | [路徑位置, webpack熱重載參數] }, ... ]
  const entry = ((filepathList) => {
    let res = {};
    filepathList.forEach((filepath) => {
      const list = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
      const chunkName = list[list.length - 1].replace(/\.js/g, "");
      // 如果是开发环境，才需要引入 hot module
      // res[key] = filepath
      res[chunkName] = SERVER_CONFIG.ENV.isDev
        ? // filepath
          [filepath, "webpack-hot-middleware/client?reload=true"]
        : filepath;
    });
    return res;
  })(glob.sync(js_dir));
  return entry;
}
function createHtmlWebpackPlugins() {
  /*  每個 entry point 的 template */
  //  存放 html template
  const HtmlWebpackPlugins = [];
  ////  生成 html template 的階段，需將template內的 --CONS-- 替換為擬定好的常量
  //  緩存替換過的常量
  let cache_ejs_args = new Map();
  //  尚未替換--CONS--的template的位置
  let template_dir = resolve(__dirname, "../src/__views/**/*.ejs");
  glob.sync(template_dir).forEach((filepath) => {
    /**
     * ~/.../__views/pages/*.ejs ------------------------ 無
     * ~/.../__views/pages/[ejsName]/components/*.ejs --- 被 ~/.../__views/pages/[ejsName]/index.ejs 使用
     * ~/.../__views/pages/[ejsName]/template/*.ejs ----- 在後端生成view時，被拿來當作生成 ejs.render 的參數(key:ejs_template)使用
     * -------------------------------------------------- ejs_template 可能出現在 views/pages/[ejsName]/index.ejs 或是 views/pages/[ejsName]/components/index.ejs 作為參數使用
     * ~/.../__views/wedgets/*.ejs ----------------------
     */
    // let tempList = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    let array_filepath = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    let filename = `${array_filepath[array_filepath.length - 1]}`; //	檔名(含ext)
    let index_views = array_filepath.findIndex((item) => item === "__views");
    //  將array_filepath內的__views，改為最後要放入的資料夾名 "views"
    // tempList[index_views] = 'views';
    array_filepath[index_views] = CONFIG.BUILD.VIEW;
    //  移除檔名的部分
    array_filepath.pop();
    // let dir = "";
    //  要存放的完整位置
    let target_dir = "";
    for (let [index, folder] of array_filepath.entries()) {
      target_dir += `${folder}/`;
      if (index < index_views) {
        continue;
      }
      if (!fs.existsSync(target_dir)) {
        //  若 dirPath 不存在，則新建
        fs.mkdirSync(target_dir);
      }
    }
    let ejs_string = fs.readFileSync(filepath, "utf-8"); //	取得檔案內容
    //  替換所有 ejs 預先設置的常數
    ejs_string = ejs_string.replace(EJS.REG.REPLACE, (match, target_string) => {
      if (cache_ejs_args.has(match)) {
        return cache_ejs_args.get(match);
      }
      let target_list = target_string.split(".");
      //  移除掉固定的前綴
      target_list.shift();
      let last_index = target_list.length - 1;
      let ejs_arg;
      for (let [index, item] of target_list.entries()) {
        if (index === 0) {
          ejs_arg = EJS[item];
          continue;
        }
        ejs_arg = ejs_arg[item];
        if (index !== last_index) {
          continue;
        }
        if (typeof ejs_arg === "string") {
          //  因為 ejs 的 --CONS.xxx.xxx-- 沒有被 "" 包覆，故這裡要在 `` 內部補上 ""
          ejs_arg = `"${ejs_arg}"`;
        } else if (typeof ejs_arg === "object") {
          ejs_arg = `'${JSON.stringify(ejs_arg)}'`;
        }
      }
      // let res;
      // if (typeof ejs_arg === "string") {
      //   res = `"${constant}"`;
      // } else if (typeof constant === "object") {
      //   res = `'${JSON.stringify(constant)}'`;
      // }
      cache_ejs_args.set(match, ejs_arg);
      // cache_ejs_args.set(match, res);
      return ejs_arg;
    });
    console.log(`--------${array_filepath.join("/")}/${filename}`);
    ////  針對 template 類型的 ejs 做處理
    if (array_filepath[array_filepath.length - 1] === "template") {
      let dir_server_views = resolve(__dirname, "../server/views/template");
      let dir_server_views_list = dir_server_views.split(/[\/|\/\/|\\|\\\\]/g);
      // let n = dir_server_views_list.length - 2;
      let index_views = dir_server_views_list.length - 2;
      let server_dir = "";
      for (let [index, item] of dir_server_views_list.entries()) {
        server_dir += `${item}/`;
        if (index < index_views) {
          continue;
        }
        if (!fs.existsSync(server_dir)) {
          //  若 dirPath 不存在，則新建
          fs.mkdirSync(server_dir);
        }
      }
      let target_filename = `${server_dir}${filename}`;
      // fs.copyFileSync(filepath, target_filename);
      // 因為server進行ctx.render需要用到，所以先存一份至 dir_server_views
      fs.writeFileSync(target_filename, ejs_string);
      console.warn(`!!!!!!新增檔案${target_filename}!!!!!!!!!!`);
    }
    //  針對 ejs 要帶入參數的部分，除了 include 與 CONS 以外的 <% 標記，都轉換成 <%%
    //  * include 會在 webpack 打包時，將指定路徑的 ejs 傳入
    //  * CONS 則是已經在前面就準備好了，編譯時會直接放入
    ejs_string = ejs_string.replace(EJS.REG.IGNORE, "<%%");
    //	最終要存放的檔案路徑
    let template = target_dir + filename;
    // let template = dir + filename; //	添入原檔名
    fs.writeFileSync(template, ejs_string); //	在目標資料夾創建新檔

    //////////////////////////////////////////////////////////////////////////////////
    let insert =
      array_filepath[index_views + 1] === "pages" &&
      array_filepath.length === index_views + 3;
    if (
      insert
      // array_filepath[index_views + 1] === "pages" &&
      // array_filepath.length === index_views + 2

      // array_filepath[index_views + 1] !== "wedgets" &&
      // array_filepath[index_views + 3] !== "components" &&
      // array_filepath[index_views + 3] !== "template"
    ) {
      //  取 page/[ejs_name]/index.js 的 ejs_name，恰好可以匹配到 entry[chunkName]
      const fileChunk = array_filepath[index_views + 2];
      const chunks = SERVER_CONFIG.ENV.isDev
        ? [fileChunk]
        : ["manifest", "vendors", fileChunk];
      let item = new HtmlWebpackPlugin({
        filename: `${fileChunk}.ejs`,
        template,
        chunks,
        alwaysWriteToDisk: true,
      });
      HtmlWebpackPlugins.push(item);
    }
    console.log(
      `。。。。。告一段落${insert ? "，作為HtmlWebpackPlugin item" : "。"}`
    );
  });
  return HtmlWebpackPlugins;
}
