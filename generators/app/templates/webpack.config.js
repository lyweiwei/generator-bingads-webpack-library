var _ = require('underscore');
var path = require('path');
var pkg = require('./package');

var webpackAlias = pkg.webpackAlias || {};

try {
  webpackAlias = require('./webpack.alias');
} catch (e) { }

function getExternals() {
  var deps = _.keys(pkg.peerDependencies);
  var externals = _.object(deps, deps);

  return _.reduce(_.pairs(webpackAlias), function (exts, pair) {
    if (_.has(externals, pair[1])) {
      exts[pair[0]] = pair[1];
    }
    return exts;
  }, externals);
}

module.exports = {
  entry: path.resolve('./js/index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '<%= name %>.js',
    library: '<%= name %>',
    libraryTarget: 'umd',
    umdNamedDefine: false,
    devtoolModuleFilenameTemplate: function (info) {
      if (path.isAbsolute(info.absoluteResourcePath)) {
        return 'webpack-src:///<%= name %>-example/' + path.relative('.', info.absoluteResourcePath);
      }
      return info.absoluteResourcePath;
    },
  },
  module: {
    loaders: [
      // jade<% if (usesJade) { %>
      { test: /\.jade$/, loader: 'jade-loader' },
      // jade-end<% } %>
      // es2015<% if (usesES2015) { %>
      {
        test: /\.(js|es6?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: { presets: ['es2015'] },
      },
      // es2015-end<% } %>
      // react<% if (usesReact) { %>
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            'react',
            // react&es2015<% if (usesES2015) { %>
            'es2015',
            // react&es2015-end<% } %>
          ],
        },
      },
      // react-end<% } %>
    ],
  },
  externals: [getExternals()],
  resolve: { alias: webpackAlias },
  devtool: 'source-map',
};
