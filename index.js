/**
 * 名称：微信小程序wxml母版页loader
 * 日期：2017-12-28
 * 描述：用于使小程序wxml文件母版页支持
 */
var fs = require('fs-extra');
var path = require('path');
var sax = require('sax');
var loaderUtils = require("loader-utils");

var lastModifyTime = null;
var cachePages = null;

module.exports = function (content) {
  this.cacheable && this.cacheable();
  var resourcePath = this.resourcePath;
  var segments = path.parse(resourcePath);
  var pageName = (segments.dir + '/' + segments.name).replace(/\\/g, '/');
  var options = loaderUtils.getOptions(this) || {};
  var layout = options.layout;
  var pages = getAppPages(options.app);
  var isPage = pages.indexOf(pageName) > -1;
  if (typeof layout === 'function') {
    layout = layout(this.resourcePath);
  }
  if (!isPage || !fs.existsSync(layout)) {
    return content;
  }
  return templateLayout.apply(this, [layout, options, content])
};

/**
 * 已缓存模式--根据app.json文件获取小程序正在使用的所有的页面
 * @param {String} app app.json文件路径 
 */
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

/**
 * 根据appConfig搜索当前小程序引用了哪些页面
 * @param {*} appConfig app.json配置
 * @param {*} appRoot app.json所在目录
 */
function searchPages(appConfig, appRoot) {
  var pages = [];
  var subPackages = appConfig.subPackages || {};
  pages = pages.concat(appConfig.pages || []);
  subPackages.forEach(function (package) {
    const subPages = (package.pages || []).map((page) => {
      return package.root + '/' + page;
    })
    pages = pages.concat(subPages)
  })
  return pages.map(function (file) {
    return path.join(appRoot, file).replace(/\\/g, '/');
  })
}

/**
 * 渲染母版页资源引用支持
 * @param {String} layout 母版页文件绝对路径
 * @param {String} options loader的配置数据
 * @param {String} content 文件内容
 */
function templateLayout(layout, options, content) {
  var callback = this.async();
  try {
    var holder = options.holder || '$slot$';
    var template = new String(fs.readFileSync(layout));
    var parser = sax.parser(false, { lowercase: true });
    var issuer = this._module.issuer;
    var issuerContext = issuer && issuer.context || options.context;
    var moduleRoot = path.dirname(this.resourcePath);
    var templateRoot = path.dirname(layout);
    var requests = [];
    parser.onattribute = function (attr) {
      requestAttribute(parser, attr, requests, templateRoot);
    };
    parser.onend = function () {
      try {
        template = templateLayoutReplace(requests, templateRoot, moduleRoot, template);
        callback(null, template.replace(holder, content));
      } catch (ex) {
        callback(ex, content);
      }
    }
    parser.write(template).close();
  } catch (ex) {
    callback(ex, content);
  }
}

/**
 * 搜索母版页引用的模块
 * @param {*} parser 文档解析对象
 * @param {*} attr 当前解析到的属性
 * @param {*} requests 解析的模块存放数组
 * @param {*} templateRoot 母版页所在目录
 */
function requestAttribute(parser, attr, requests, templateRoot) {
  var name = attr.name;
  var value = attr.value;
  if (name !== "src" || /\{\{/.test(value) || !loaderUtils.isUrlRequest(value, templateRoot)) {
    return;
  }
  var endIndex = parser.position - 1;
  var startIndex = endIndex - value.length;
  var request = loaderUtils.urlToRequest(value, templateRoot);
  requests.unshift({ request: request, startIndex: startIndex, endIndex: endIndex });
}

/**
 * 替换母版页相对路径模块引用到当前套用模板页的wxml路径下
 * @param {*} requests 母版页所有引用的模块
 * @param {*} templateRoot 母版页所在的目录
 * @param {*} moduleRoot 当前套用母版页的wxml所在目录
 * @param {*} template 母版页内容
 */
function templateLayoutReplace(requests, templateRoot, moduleRoot, template) {
  requests.forEach(function (request) {
    var absPath = path.join(templateRoot, request.request);
    var relative = path.relative(moduleRoot, absPath);
    template = replaceAt(template, request.startIndex, request.endIndex, relative)
  })
  return template;
}

function replaceAt(str, start, end, replacement) {
  return str.slice(0, start) + replacement + str.slice(end)
}