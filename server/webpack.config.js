var webpack = require("webpack");
var nodeExternals = require("webpack-node-externals");

export default {
  target: "node",
  entry: {
    index: "./src/index.js",
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/env"],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'webpackBuildProcess.BUILD_ENV': JSON.stringify(process.env.BUILD_ENV),
    })
  ],
  node: {
    __dirname: false,
  },
  output: {
    path: __dirname + "/build",
    filename: "[name].js",
    library: "oauth2",
    libraryTarget: "umd",
  },
};
