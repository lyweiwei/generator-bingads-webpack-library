'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var _ = require('lodash');
var walk = require('walk');
var path = require('path');
var Promise = require('bluebird');
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
  constructor: function () {
    yeoman.generators.Base.prototype.constructor.apply(this, arguments);

    _.defaults(this.options, {
      npmInstall: true,
    });
  },

  prompting: function () {
    var done = this.async();
    var pkgDest = this.pkgDest = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the evolving ' + chalk.red('BingAds Webpack Library') + ' generator!'
    ));

    this.props = {};

    var prompt = function (questions) {
      return new Promise(function (resolve/* , reject */) {
        this.prompt(questions, function (props) {
          _.assignIn(this.props, props);
          resolve();
        }.bind(this));
      }.bind(this));
    }.bind(this);

    prompt([{
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
    }, {
      type: 'confirm',
      name: 'usesJade',
      message: 'Use Jade template',
      default: true,
    }, {
      type: 'confirm',
      name: 'usesES2015',
      message: 'Use ES2015',
      default: true,
    }, {
      type: 'confirm',
      name: 'usesReact',
      message: 'Use React',
      default: false,
    }, {
      type: 'confirm',
      name: 'isOpenSource',
      message: 'Is Open Source',
      default: false,
    }]).then(function () {
      return this.props.isOpenSource && prompt([{
        type: 'input',
        name: 'githubOrg',
        message: 'GitHub Org/User',
        default: 'Microsoft',
      }]);
    }.bind(this)).then(function () {
      this.props.nameCamel = _.chain(this.props.name)
        .split('-')
        .map(function (word, index) {
          return index ? word[0].toUpperCase() + word.slice(1) : word;
        })
        .join('')
        .value();
      console.log(this.props.nameCamel);
    }.bind(this)).then(done);
  },

  writing: function () {
    var done = this.async();
    var pathTemplateRoot = this.templatePath();

    _.defaults(this.pkgDest, {
      main: 'dist/' + this.props.name + '.js',
    }, pkgStaticSrc);

    _.assignIn(this.pkgDest, {
      name: this.props.name,
      description: this.props.description,
      keywords: _.chain(this.props.keywords).split(',').compact().uniq().value(),
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail || undefined,
        url: this.props.authorURL || undefined,
      },
    });

    if (this.props.isOpenSource) {
      _.assignIn(this.pkgDest, {
        repository: {
          type: 'git',
          url: 'https://github.com/Microsoft/' + this.props.name + '.git',
        },
      });
      this.pkgDest.scripts.test = 'gulp test coveralls';
    }

    this.fs.writeJSON(this.destinationPath('package.json'), this.pkgDest);

    walk.walk(pathTemplateRoot, {
      listeners: {
        file: function (root, fileStats, next) {
          var rootRel = path.relative(pathTemplateRoot, root);
          var pathRelSrc = path.join(rootRel, fileStats.name);
          var pathRelDst = path.join(rootRel, fileStats.name.replace(/^_/, '.'));

          this.fs.copyTpl(
            this.templatePath(pathRelSrc),
            this.destinationPath(pathRelDst),
            this.props
          );
          next();
        }.bind(this),
        end: done,
      },
    });
  },

  install: function () {
    const depDev = dependencies.dev;

    this.props.usesJade &&
      depDev.push('jade', 'jade-loader');
    (this.props.usesES2015 || this.props.usesReact) &&
      depDev.push('babel-core', 'babel-loader');
    this.props.usesES2015 &&
      depDev.push('babel-preset-es2015');
    this.props.usesReact &&
      depDev.push('babel-preset-react');
    this.props.isOpenSource &&
      depDev.push('gulp-coveralls');

    if (this.options.npmInstall) {
      this.npmInstall(depDev, { saveDev: true, link: true });
    }
  },
});
