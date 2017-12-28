# wxml-layout-loader

[![NPM version][npm-image]][npm-url]

## 一、简介

微信小程序wxml页面文件母版页支持loader

通过定义一个`$slot$`占位符来设置`body`内容

当然可以通过设置`loader.options.holder`参数自定义占位符

## 二、安装

    npm install wxml-layout-loader --save

## 三、Webpack使用

```xml
  <view class="layout">
      $slot$
  </view>
```

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