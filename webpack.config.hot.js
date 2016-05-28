const _ = require('lodash');
const webpack = require('webpack');

const config = require('./webpack.config.js');

if (!_.get(config, 'entry.index')) {
  throw new Error('root config seems to have changed and is missing an index entry');
}

config.plugins.push(new webpack.DefinePlugin({
  'process.env.NODE_ENV': 'null'
}));

config.entry.index = _.flatten([
  'webpack/hot/only-dev-server',
  config.entry.index
]);

config.module.loaders.forEach(loaderConf => {
  if (loaderConf.loader.slice(0, 2) === 'ts') {
    loaderConf.loader = 'react-hot!' + loaderConf.loader;
  }
});

config.devServer = {
  historyApiFallback: true
};

module.exports = config;
