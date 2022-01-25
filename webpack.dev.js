const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const config = {
  mode: 'development',
  entry: './src/index.ts',
};

module.exports = merge(common, config);
