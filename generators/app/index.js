'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var _ = require('lodash');
var walk = require('walk');
var path = require('path');
var pkg = require('../../package');
var pkgStaticDest = require('./package.static');

function getSuggestedModuleName(originalName) {
  return _.chain(originalName)
    .replace(/\s+/g, '-')
    .replace(/([0-9])(?=[^0-9\-])/g, '$1-')
    .replace(/([a-z])(?=[^a-z\-])/g, '$1-')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .value().toLowerCase();
}

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the flawless ' + chalk.red('generator-bingads-webpack-library') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'Library name',
      default: getSuggestedModuleName(this.appname),
    }, {
      type: 'input',
      name: 'description',
      message: 'Description',
      default: '',
    }, {
      type: 'input',
      name: 'entry',
      message: 'Main entry',
      default: './js/index.js',
    }, {
      type: 'input',
      name: 'authorName',
      message: 'Author\'s Name',
      default: this.user.git.name(),
    }, {
      type: 'input',
      name: 'authorEmail',
      message: 'Author\'s Email',
      default: this.user.git.email(),
    }, {
      type: 'input',
      name: 'keywords',
      message: 'Keywords(comma to split)',
      default: '',
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;

      done();
    }.bind(this));
  },

  writing: function () {
    var done = this.async();
    var pathTemplateRoot = this.templatePath();

    this.fs.writeJSON(
      this.destinationPath('package.json'),
      _.defaults({
        name: this.props.name,
        description: this.props.description,
        main: 'dist/' + this.props.name + '.js',
        keywords: _.chain(this.props.keywords).split(',').compact().uniq().value(),
        eslintConfig: pkg.eslintConfig,
        author: {
          name: this.props.authorName,
          email: this.props.authorEmail,
        },
      }, pkgStaticDest)
    );

    walk.walk(pathTemplateRoot, {
      listeners: {
        names: function (root, nodeNamesArray) {
          var rootRel = path.relative(pathTemplateRoot, root);

          _.forEach(nodeNamesArray, function (name) {
            var pathRel = path.join(rootRel, name);

            this.fs.copyTpl(
              this.templatePath(pathRel),
              this.destinationPath(pathRel.replace(/^_/, '.')),
              this.props
            );
          }.bind(this));
        }.bind(this),
        end: done,
      },
    });
  },

  install: function () {
    this.npmInstall([
      'underscore',
      'webpack',
      'webpack-stream',
      'requirejs',
      'gulp',
      'eslint',
      'eslint-config-xo',
      'eslint-config-xo-space',
    ], {
      saveDev: true,
      link: true,
    });
  },
});
