const glob = require("glob")
, path = require("path")

, lambdaConfig = {
  entry: () => {
    fs = glob.sync("./lib/lam/**/*.ts")
    let y = {}
    fs.forEach(f => {
      y = Object.assign(y, { [path.parse(f).name]: f })
    })
    return y
  },
  target: "node",
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [{
      exclude: /node_modules/,
      use: {
        loader: "ts-loader",
        options: {
          onlyCompileBundledFiles: true
        }}}]},
  resolve: {
    extensions: [".ts", ".js"]
  },
  externals: ["aws-sdk"],
  output: {
    path: `${__dirname}/dist/lam/`,
    filename: "[name]-bundle.js",
    libraryTarget: "umd"
  }
}

module.exports = [lambdaConfig]
