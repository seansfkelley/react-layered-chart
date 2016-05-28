const _ = require('lodash');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const VENDOR_LIBS = _.keys(require('./package.json').dependencies);

module.exports = {
  entry: {
    index: './dev/index.tsx',
    vendor: VENDOR_LIBS
  },
  output: {
    path: './dev/build',
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts?configFileName=tsconfig-webpack.json' },
      { test: /node_modules.*\.js$/, loader: 'source-map-loader' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less/, loader: 'style!css?sourceMap!less?sourceMap' }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js']
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new HtmlWebpackPlugin({
      template: './dev/index-template.html',
      filename: 'index.html',
      chunks: ['index', 'vendor']
    }),
    new WebpackNotifierPlugin({
      title: 'react-layered-chart'
    })
  ]
};
