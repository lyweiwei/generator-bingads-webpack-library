'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var _ = require('lodash');
var walk = require('walk');
var path = require('path');
var pkgGenerator = require('../../package');
var pkgStaticSrc = require('./package.static');
var dependencies = require('./dependencies');

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
    var pkgDest = this.pkgDest = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the flawless ' + chalk.red('generator-bingads-webpack-library') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'Library name',
      default: pkgDest.name || getSuggestedModuleName(this.appname),
    }, {
      type: 'input',
      name: 'description',
      message: 'Description',
      default: pkgDest.description || '',
    }, {
      type: 'input',
      name: 'entry',
      message: 'Main entry',
      default: './js/index.js',
    }, {
      type: 'input',
      name: 'authorName',
      message: 'Author\'s Name',
      default: function () {
        return _.find([
          _.result(pkgDest, 'author.name'),
          _.isString(pkgDest.author) && pkgDest.author,
          this.user.git.name(),
        ]) || '';
      }.bind(this),
    }, {
      type: 'input',
      name: 'authorEmail',
      message: 'Author\'s Email',
      default: function (props) {
        if (props.authorName === _.result(pkgDest, 'author.name')) {
          return _.result(pkgDest, 'author.email', '');
        } else if (props.authorName === pkgDest.author) {
          return '';
        }
        return this.user.git.email() || '';
      }.bind(this),
    }, {
      type: 'input',
      name: 'authorURL',
      message: 'Author\'s URL',
      default: function (props) {
        if (props.authorName === _.result(pkgDest, 'author.name')) {
          return _.result(pkgDest, 'author.url', '');
        }
        return '';
      },
    }, {
      type: 'input',
      name: 'keywords',
      message: 'Keywords(comma to split)',
      default: pkgDest.keywords || '',
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

    _.extend(this.pkgDest, {
      name: this.props.name,
      description: this.props.description,
      keywords: _.chain(this.props.keywords).split(',').compact().uniq().value(),
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail || undefined,
        url: this.props.authorURL || undefined,
      },
    });

    _.defaults(this.pkgDest, {
      main: 'dist/' + this.props.name + '.js',
      eslintConfig: pkgGenerator.eslintConfig,
    }, pkgStaticSrc);

    this.fs.writeJSON(this.destinationPath('package.json'), this.pkgDest);

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
    this.npmInstall(dependencies.dev, {
      saveDev: true,
      link: true,
    });
  },
});
