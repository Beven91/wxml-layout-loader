# wxml-layout-loader

[![NPM version][npm-image]][npm-url]

## 一、简介

微信小程序wxml页面文件母版页支持loader

通过定义一个`$slot$`占位符来设置`body`内容

当然可以通过设置`loader.options.holder`参数自定义占位符

#### 如何附加母版页?

- 尝试渲染`webpack`搜索的所有`wxml`文件进行渲染

- 根据`app.json`中配置的`pages`与`subPackages[N].pages`来套用`options.layout`指定的`wxml`母版页 从而过滤掉非页面的`wxml`文件

## 二、安装

    npm install wxml-layout-loader --save

## 三、Webpack使用

> layout.wxml

```xml
  <view class="layout">
      $slot$
  </view>
```

> webpack.config.js

```js
module.exports = {
    module:{
        loaders:[
            {
                test: /\.wxml$/,
                loader: [
                    {
                        loader: 'wxml-layout-loader',
                        options: {
                            //自定义占位符
                            holder:'$custom-body$'
                            //母版页路劲
                            layout:path.resolve('app/layout.wxml')
                            //或者
                            // layout:function(file){
                            //   return path.resolve('app/layout.wxml');
                            // }
                        }
                    }
                ]
            }
        ]
    }
}
```

## 四、开源许可

基于 [MIT License](http://zh.wikipedia.org/wiki/MIT_License) 开源，使用代码只需说明来源，或者引用 [license.txt](https://github.com/sofish/typo.css/blob/master/license.txt) 即可。

[npm-url]: https://www.npmjs.com/package/wxml-layout-loader
[npm-image]: https://img.shields.io/npm/v/wxml-layout-loader.svg
