# <%= name %>
<% if (isOpenSource) { %>
  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
<% } %>
<%= description %>

## Usage
```bash
npm install --save <%= name %>
```

In your JavaScript code
### As AMD
```javascript
require(['<%= name %>'], function (<%= nameCamel %>) {
  // use the <%= nameCamel %>
});
```

### As CMD
```javascript
var <%= nameCamel %> = require('<%= name %>');

// use the <%= nameCamel %>
```

<% if (isOpenSource) { %>
[npm-image]: https://badge.fury.io/js/<%= name %>.svg
[npm-url]: https://npmjs.org/package/<%= name %>
[travis-image]: https://travis-ci.org/<%= githubOrg %>/<%= name %>.svg?branch=master
[travis-url]: https://travis-ci.org/<%= githubOrg %>/<%= name %>
[daviddm-image]: https://david-dm.org/<%= githubOrg %>/<%= name %>.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/<%= githubOrg %>/<%= name %>
[coveralls-image]: https://coveralls.io/repos/<%= githubOrg %>/<%= name %>/badge.svg
[coveralls-url]: https://coveralls.io/r/<%= githubOrg %>/<%= name %>
<% } %>
