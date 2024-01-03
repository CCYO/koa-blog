////  NODE MODULE
const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");
////  NPM MODULE
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
////  MY MODULE
const { isDev, isProd } = require("../config/env");
const CONFIG = require("./config.js");
const CONS = require("../config/constant");

// ejsLoader()
const entry = ((filepathList) => {
  let res = {};
  filepathList.forEach((filepath) => {
    const list = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    const key = list[list.length - 1].replace(/\.js/g, "");
    // 如果是开发环境，才需要引入 hot module
    // res[key] = filepath
    res[key] = isDev
      ? // filepath
        [filepath, "webpack-hot-middleware/client?reload=true"]
      : filepath;
  });
  return res;
})(glob.sync(resolve(__dirname, "../src/js/*.js")));

/*  每個 entry point 的 template */
const HtmlWebpackPlugins = [];
//  存放 template
let map_CONS = new Map();
//  關於 CONS 的 KEY 與 VAL 的 map
glob
  .sync(resolve(__dirname, "../src/__views/**/*.ejs"))
  .forEach((filepath, i) => {
    /**
     * ~/.../__views/pages/*.ejs
     * ~/.../__views/pages/[ejsName]/components/*.ejs
     * ~/.../__views/wedgets/*.ejs
     *
     * ~/.../__views/pages/[ejsName]/template/*.ejs
     */
    let tempList = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    let filename = `${tempList[tempList.length - 1]}`; //	檔名
    let n = tempList.findIndex((item) => item === "__views");
    tempList[n] = "views";
    tempList.pop();
    let dir = "";
    for (let [index, dirname] of tempList.entries()) {
      dir += `${dirname}/`;
      if (index < n) {
        continue;
      }
      if (!fs.existsSync(dir)) {
        //  若 dirPath 不存在，則新建
        fs.mkdirSync(dir);
      }
    }
    let data = fs.readFileSync(filepath, "utf-8"); //	取得檔案內容
    data = data.replace(/[-]{2}(CONS\.\S+?)[-]{2}/g, (match, target) => {
      if (map_CONS.has(match)) {
        return map_CONS.get(match);
      }
      let arr = target.split(".");
      arr.shift();
      let constant;
      for (let [index, item] of arr.entries()) {
        if (index === 0) {
          constant = CONS[item];
          continue;
        }
        constant = constant[item];
      }
      let res;
      if (typeof constant === "string") {
        res = `"${constant}"`;
      } else if (typeof constant === "object") {
        res = `'${JSON.stringify(constant)}'`;
      }
      map_CONS.set(match, res);
      return res;
    });

    if (tempList[tempList.length - 1] === "template") {
      let server_views = resolve(__dirname, "../server/views/template");
      let path_list = server_views.split(/[\/|\/\/|\\|\\\\]/g);
      let n = path_list.length - 2;
      let server_dir = "";
      for (let [index, dirname] of path_list.entries()) {
        server_dir += `${dirname}/`;
        if (index < n) {
          continue;
        }
        if (!fs.existsSync(server_dir)) {
          //  若 dirPath 不存在，則新建
          fs.mkdirSync(server_dir);
        }
      }
      let target_filename = `${server_dir}${filename}`;
      // fs.copyFileSync(filepath, target_filename);
      fs.writeFileSync(target_filename, data);
    }
    console.log(`--------${tempList[tempList.length - 1]}/${filename}`);

    data = data.replace(/\<%(?!(-\s+include)|([=\-]?\s+.*?CONS\.))/g, "<%%"); //	修改檔案內容
    //	修改檔案內容
    let template = dir + filename; //	添入原檔名
    fs.writeFileSync(template, data); //	在目標資料夾創建新檔

    if (
      tempList[n + 1] !== "wedgets" &&
      tempList[n + 3] !== "components" &&
      tempList[n + 3] !== "template"
    ) {
      const fileChunk = tempList[n + 2];
      const chunks = isDev ? [fileChunk] : ["manifest", "vendors", fileChunk];
      let item = new HtmlWebpackPlugin({
        filename: `${fileChunk}.ejs`,
        template,
        chunks,
        alwaysWriteToDisk: true,
      });
      HtmlWebpackPlugins.push(item);
    }
  });

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
              disable: !isProd,
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
              production: isProd,
              data: {
                // example, too.
                CONS,
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
