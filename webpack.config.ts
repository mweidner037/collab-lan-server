import * as path from "path";
import * as webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";

const config: webpack.Configuration = {
  mode: "development",
  devtool: "inline-source-map",
  optimization: {
    usedExports: true,
    innerGraph: true,
    sideEffects: true,
  },
  entry: "./src/site/index.ts",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist/site"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Copy index.html.
        {
          from: "./src/site/index.html",
          to: "./[base]",
        },
        // Copy container.
        {
          from: "./src/site/container/*",
          to: "./container/[base]",
        },
      ],
    }),
  ],
};

export default config;
