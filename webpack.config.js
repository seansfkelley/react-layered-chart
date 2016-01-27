var path = require('path');

module.exports = {
    entry: {
        index: './src/index.js',
        'dev-index': './src-dev/dev/dev-index.jsx'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        sourceMapFilename: '[file].map',
        library: 'LayeredChart',
        libraryTarget: 'umd'
    },
    externals: {
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom'
        }
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
