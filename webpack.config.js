const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

const config = {
  mode: process.env.NODE_ENV || 'development',
  experiments: {
    outputModule: true,
  },
  entry: {
    index: './src/index.ts',
    runApp: './src/runApp.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'module',
  },
};

module.exports = merge(common, config);
