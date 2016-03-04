module.exports = {
  entry: {
    index: './src/index.js',
    'dev-index': './src-dev/dev/dev-index.jsx'
  },
  output: {
    path: './build-dev',
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devtool: 'source-map'
};
