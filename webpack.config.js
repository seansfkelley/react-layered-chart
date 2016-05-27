module.exports = {
  entry: {
    index: './dev/index.tsx'
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
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js']
  },
  devtool: 'source-map'
};
