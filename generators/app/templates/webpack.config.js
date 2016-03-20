var _ = require('underscore');
var path = require('path');
var pkg = require('./package');

module.exports = {
  entry: path.resolve(pkg.main),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '<%= name %>.js',
    library: '<%= name %>',
    libraryTarget: 'umd',
    umdNamedDefine: false,
    devtoolModuleFilenameTemplate: 'webpack:///<%= name %>/[resource-path]',
  },
  externals: _.keys(pkg.peerDependencies),
  resolve: {
    alias: pkg.webpackAlias || {},
  },
  devtool: 'source-map',
};
