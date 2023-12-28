const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const miniSVGDataURI = require("mini-svg-data-uri");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const path = require('path');


const config = {
  mode: 'production',
//  起点或是应用程序的起点入口
  entry:  path.resolve(__dirname, "src/index.js"),
  output: {
      // 编译后的输出路径
      // 注意此处必须是绝对路径，不然 webpack 将会抛错（使用 Node.js 的 path 模块）
      path: path.resolve(__dirname, "dist"),

      // 输出 bundle 的名称
      filename: "index.js",
      clean: true,
  },
  plugins: [
      new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'src/main.html'),
          filename: path.resolve(__dirname, 'dist/main.html'),
          favicon: './src/assets/images/favicon.ico',
          useCdn: process.env.NODE_ENV === 'production',
      }),
      new MiniCssExtractPlugin(),
      new BundleAnalyzerPlugin(),
  ],
  module: {
      rules: [
          {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
          {
            test: /\.(png|jpg|jpeg)$/i,
            type: "asset",
            generator: {
                filename: 'assets/[hash][ext]'
            },
          },
          {
            test: /\.svg$/i,
            type: "asset/inline",
            generator: {
              dataUrl(content) {
                content = content.toString();
                return miniSVGDataURI(content);
              },
            },
          },
      ],
  },
  performance: {
      hints: false
  },
  optimization: {
      minimizer: [
        // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
        `...`,
        new CssMinimizerPlugin(),
      ],
      concatenateModules: true,
  },
}

if (process.env.NODE_ENV === 'development'){
  config.devtool = 'eval-cheap-module-source-map'
}

if (process.env.NODE_ENV === 'production'){
  config.externals = {
    'echarts': 'echarts'
  }
  config.devtool = 'cheap-module-source-map'
}

module.exports = config