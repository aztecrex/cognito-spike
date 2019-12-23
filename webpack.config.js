module.exports = {
  entry: "./src/main.tsx",
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            onlyCompileBundledFiles: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "main.js",
  }
}
