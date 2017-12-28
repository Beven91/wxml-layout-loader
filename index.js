/**
 * 名称：微信小程序wxml母版页loader
 * 日期：2017-12-28
 * 描述：用于使小程序wxml文件模板页支持
 */
var fs = require('fs-extra');
var path = require('path');
var loaderUtils = require("loader-utils");

var lastModifyTime = null;
var cachePages = null;

module.exports = function (content) {
  this.cacheable && this.cacheable();
  var resourcePath = this.resourcePath;
  var segments = path.parse(resourcePath);
  var pageName = (segments.dir +'/'+ segments.name).replace(/\\/g, '/');
  var options = loaderUtils.getOptions(this) || {};
  var layout = options.layout;
  var pages = getAppPages(options.app);
  var holder = options.holder || '$slot$';
  var isPage = pages.indexOf(pageName) > -1;
  var template = "";
  if (!isPage) {
    return content;
  }
  if (typeof layout === 'function') {
    layout = layout(this.resourcePath);
  }
  if (fs.existsSync(layout)) {
    template = String(fs.readFileSync(layout));
  }
  return template ? template.replace(holder, content) : content;
};

function getAppPages(app) {
  if (!fs.existsSync(app)) {
    return [];
  }
  var stat = fs.statSync(app);
  var appRoot = path.dirname(app)
  if (lastModifyTime != stat.mtime || !cachePages) {
    lastModifyTime = stat.mtime;
    var appConfig = JSON.parse(fs.readFileSync(app));
    cachePages = searchPages(appConfig, appRoot);
  }
  return cachePages;
}

function searchPages(appConfig, appRoot) {
  var pages = [];
  var subPackages = appConfig.subPackages || {};
  pages = pages.concat(appConfig.pages || []);
  subPackages.forEach(function (package) {
    pages = pages.concat(package.pages || [])
  })
  return pages.map(function (file) {
    return path.join(appRoot, file).replace(/\\/g, '/');
  })
}