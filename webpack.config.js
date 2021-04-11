const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack"); //增加导入webpack

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    host: "0.0.0.0",
    port: process.env.PORT || 3000,
    hot: true, //在devServer中增加hot字段
  },
  entry: {
    gui: ["./src/index.jsx","./src/dev.js"],
    'lib.min': ['react', 'react-dom'],
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "build"),
    chunkFilename: 'chunks/[name].js'
  },
  resolve: {
    symlinks: false
  },
  optimization: {
    splitChunks: {
        chunks: 'all',
        name: 'lib.min'
    },
    runtimeChunk: {
        name: 'lib.min'
    }
},
  module: {
    rules: [
      {
        test: /\.jsx?$/, // jsx/js文件的正则
        exclude: /node_modules/, // 排除 node_modules 文件夹
        use: {
          // loader 是 babel
          loader: "babel-loader",
          options: {
            // babel 转义的配置选项
            babelrc: false,
            presets: [
              // 添加 preset-react
              require.resolve("@babel/preset-react"),
              [require.resolve("@babel/preset-env"), { modules: false }],
            ],
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      chunks: ["lib.min", "gui"],
      template: "public/index.html",
      filename: "index.html",
    }),
  ],
};
