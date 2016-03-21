module.exports = {
  dev: [
    'underscore',
    'webpack',
    'webpack-stream',
    'requirejs',
    'gulp',
    'gulp-eslint',
    'gulp-exclude-gitignore',
    'eslint',
    'eslint-config-xo',
    'eslint-config-xo-space',
    // Karma 0.13.19 - 0.13.22,
    // Issue 1788, Karma 0.13.19 taking long time to complete when run via gulp
    // https://github.com/karma-runner/karma/issues/1788
    'karma@0.13.18',
    'karma-mocha',
    'karma-mocha-reporter',
    'karma-coverage',
    'karma-webpack',
    'karma-sourcemap-loader',
    'karma-phantomjs-launcher',
    'karma-chrome-launcher',
    'phantomjs-prebuilt',
    'mocha',
    'chai',
    'istanbul-instrumenter-loader',
  ],
};
