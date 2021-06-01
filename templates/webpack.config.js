const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: 'development',
  entry: {
    examples: path.resolve(__dirname, './examples/src/index.js'),
    'text-box': path.resolve(__dirname, './src/text-box/text-box.js')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [devMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpack Examples',
      template: path.resolve(__dirname, './examples/src/index.html'),
      filename: 'index.html'
    }),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, './examples/src/fixtures'), to: 'fixtures' }]
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    port: 3003
  }
};
