const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");
const CONFIG = require("./config.js");
const { isProd } = require("../server/utils/env");
const isDev = process.env.NODE_ENV === "development" || !isProd;

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

function removeDir(dir) {
  let files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    let newPath = resolve(dir, files[i]);
    let stat = fs.statSync(newPath);
    if (stat.isDirectory()) {
      //如果是文件夹就递归下去
      removeDir(newPath);
    } else {
      //删除文件
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
}
removeDir(resolve(__dirname, "../src/views"));

const HtmlWebpackPlugins = glob
  // .sync(resolve(__dirname, "../src/__views/*.ejs"))
  .sync(resolve(__dirname, "../src/__views/pages/*/index.ejs"))
  .map((filepath, i) => {
    let data = fs.readFileSync(filepath, "utf-8"); //	取得檔案內容

    data = data.replace(/\<%(?!-\s+include)/g, "<%%"); //	修改檔案內容

    let tempList = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    let fileName = `${tempList[tempList.length - 1]}`; //	新檔名
    let pageName = `${tempList[tempList.length - 2]}`;
    tempList.pop(); //	剔除舊檔名
    tempList.pop(); //  剔除page名
    tempList.pop(); //  剔除_views
    tempList = tempList.concat(["views", pageName]); //	添入新檔名

    let dirPath = tempList.join("/"); //	template 的路徑名
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    let template = dirPath + "/" + fileName; //	添入新檔名
    fs.writeFileSync(template, data); //	在新路徑創建新檔
    // 读取 CONFIG.EXT 文件自定义的文件后缀名，默认生成 ejs 文件，可以定义生成 html 文件
    // const filename = (name => `${name.split('.')[0]}.${CONFIG.EXT}`)(`${CONFIG.BUILD.VIEW}/${tempList[tempList.length - 1]}`)
    const filename = ((name) => `${name.split(".")[0]}.${CONFIG.EXT}`)(
      `${CONFIG.BUILD.VIEW}/${pageName}/${fileName}`
    );

    // const template = filepath
    const fileChunk = filename
      .split(".")[0]
      .split(/[\/|\/\/|\\|\\\\]/g)
      .pop(); // eslint-disable-line
    // const chunks = isDev ? [fileChunk] : ["manifest", "vendors", fileChunk];
    const chunks = isDev ? [pageName] : ["manifest", "vendors", pageName];
    return new HtmlWebpackPlugin({
      filename,
      template,
      chunks,
      alwaysWriteToDisk: true,
    });
  });

//	處理wedgets
glob
  .sync(resolve(__dirname, "../src/__views/wedgets/*.ejs"))
  .map((filepath) => {
    let data = fs.readFileSync(filepath, "utf-8"); //	取得檔案內容
    data = data.replace(/\<%(?!-\s+include)/g, "<%%"); //	修改檔案內容

    let tempList = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    let fileName = `${tempList[tempList.length - 1]}`; //	新檔名
    tempList.pop(); //	剔除舊檔名
    tempList.pop();
    tempList.pop();
    tempList = tempList.concat(["views", "wedgets"]); //	添入新檔名

    let dirPath = tempList.join("/"); //	template 的路徑名
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    let template = dirPath + "/" + fileName; //	添入新檔名
    fs.writeFileSync(template, data); //	在新路徑創建新檔
  });

glob
  .sync(resolve(__dirname, "../src/__views/wedgets/*/*.ejs"))
  .map((filepath) => {
    let tempList = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    let fileName = `${tempList[tempList.length - 1]}`; //	新檔名

    let data = fs.readFileSync(filepath, "utf-8"); //	取得檔案內容
    data = data.replace(/\<%(?!-\s+include)/g, "<%%%"); //	修改檔案內容
    let ind_parentDir = tempList.length - 4;
    tempList[ind_parentDir] = "views"; //	更換views層級的資料夾
    tempList.pop(); //  剔除檔名

    let dirPath = tempList.join("/"); //	template 的路徑名
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    let template = dirPath + "/" + fileName; //	添入新檔名
    fs.writeFileSync(template, data); //	在新路徑創建新檔
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
              disable: process.env.NODE_ENV !== "production",
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
              production: process.env.ENV === "production",
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
