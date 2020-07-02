## 前言

前面我们写了几篇很长的文章去介绍babel源码、preset-env、runtime，

- [babel源码解析一](https://vvbug.blog.csdn.net/article/details/103823257)
- [babel源码解析之（@babel/preset-env）](https://vvbug.blog.csdn.net/article/details/107052867)
- [babel源码解析之（@babel/plugin-transform-runtime）](https://vvbug.blog.csdn.net/article/details/107082649)

在babel配置中我们可能用过@babel/polyfill、core-js、core-js-pure、@babel/runtime、@babel/runtime-corejs2、@babel/runtime-corejs3、@babel/plugin-transform-runtime、@babel/preset-env，当然这些都有出现在我们的文章中的，并且很详情的说了每个应用场景，所以强烈推荐小伙伴去看一下这几篇文章。

## 总结

好啦～ 我们今天就总结一下这些babel配置之前的联系，然后最后说一下在实战项目中的一些配置建议。

## @babel/polyfill

> As of Babel 7.4.0, this package has been deprecated in favor of directly including `core-js/stable` (to polyfill ECMAScript features) and `regenerator-runtime/runtime` (needed to use transpiled generator functions):

也就是说在babel7.4.0之后是弃用掉的，然后现在由core-js替换，core-js可以用以下代码来替换之前的@babel/polyfill：

```js
//import "@babel/polyfill"; //之前的写法
import "core-js/stable";
import "regenerator-runtime/runtime";
```

## core-js&core-js-pure

core-js出现其实就是为了能让你代码中的一些api（比如：Array.prototype.include）能够运行，等于是在你的代码跟浏览器中加入了一个垫片，所以在babel7.4.0之后所有的polyfill操作都依赖core-js，core-js-pure是core-js的另外一个版本，可以不污染全局变量，比如我们的@babel/plugin-transform-runtime插件就是依赖的core-js-pure，core-js的更多用法跟介绍大家可以看官网[https://github.com/zloirock/core-js](https://github.com/zloirock/core-js)

## @babel/runtime

@babel/runtime、@babel/runtime-corejs2、@babel/runtime-corejs3这几个都叫“@babel/runtime”，只是每一个对应的实现不一样，都是提供给@babel/plugin-transform-runtime插件做依赖，@babel/plugin-transform-runtime插件会根据corejs的配置做不通的runtime依赖，具体用法大家可以参考之前的几篇文章。

## @babel/plugin-transform-runtime 和 @babel/preset-env

@babel/preset-env

