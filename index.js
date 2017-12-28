/**
 * 名称：微信小程序wxml母版页loader
 * 日期：2017-12-28
 * 描述：用于使小程序wxml文件模板页支持
 */
var fs = require('fs');
var loaderUtils = require("loader-utils");

module.exports = function (content) {
  this.cacheable && this.cacheable();
  var resourcePath = this.resourcePath;
  var options = loaderUtils.getOptions(this) || {};
  var layout = options.layout;
  var template = "";
  if (typeof layout === 'function') {
    layout = layout(this.resourcePath);
  }
  if (fs.existsSync(layout)) {
    template = fs.readFileSync(layout);
  }
  return template ? template.replace('<slot />', content) : content;
};