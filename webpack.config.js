const { resolve } = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
module.exports = {
  devtool: "source-map",
  entry: "./firebase/index.js",
  output: {
    filename: "[hash:5].[name].js",
    path: resolve(__dirname, "dist"),
  },
  plugins: [
      new HTMLWebpackPlugin({
        template: resolve(__dirname, './index.html')
      }),
      new CleanWebpackPlugin()
  ],
  mode: "development"
};