## 前言

还记得之前写过一篇文章:[babel源码解析一](https://vvbug.blog.csdn.net/article/details/103823257),里面把babel的整个流程跑了一遍，最后还自定义了一个插件用来转换“尖头函数”，通过前面的源码解析我们知道，preset其实就是一些插件的集合，这一节我们来介绍一个babel中比较重要的preset“@babel/preset-env”，可能有些小伙伴已经用过了，没用过的话至少也应该见过，废话不多说，我们直接盘它。

## 开始

我们从项目创建开始，首先我们创建一个叫babel-demo的项目用来测试babel，然后执行npm初始化

```
npm init 
```

然后我们创建一个src目录用来存放demo源码来做babel测试，我们直接在src中创建一个demo1.js，然后随便写一些代码，

src/demo1.js：

```js
const fn = () => {};

new Promise(() => {});

class Test {}

const c = [1, 2, 3].includes(1);
var a = 10;

```

代码很简单，我就不多解释了，然后我们安装@babel/cli、@babel/core、@babel/preset-env，

在项目根目录执行npm或者yarn：

```
yarn add -D @babel/cli && yarn add -D @babel/core && yarn add -D @babel/preset-env
```

或

```
npm install -D @babel/cli && npm install -D @babel/core && npm install -D @babel/preset-env
```

然后我们直接在根目录运行一下babel命令测试一下：

```js
npx babel ./src/demo1.js -o ./lib/demo1.js
```

可以看到，我们执行了babel命令，然后打开我们编译过后的文件，

lib/demo1.js：

```js
const fn = () => {};

new Promise(() => {});

class Test {}

const c = [1, 2, 3].includes(1);
var a = 10;

```

小伙伴可以发现，没有任何变化，是的！因为我们还没有任何babel的配置信息。

## 配置

我们在根目录创建一个babel.config.js文件(当然，babel的配置不止有babel.config.js一种，还有babel.config.cjs、.babelrc等等，大家可以看babel的官网)，作为babel的配置文件，

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env"
        ]
    ]
};
```

可以看到，我们在presets字段中配置了一个“preset-env”，然后我们在根目录运行一下babel命令：

```
npx babel ./src/demo1.js -o ./lib/demo1.js
```

lib/demo1.js：

```js
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fn = function fn() {};

new Promise(function () {});

var Test = function Test() {
  _classCallCheck(this, Test);
};

var c = [1, 2, 3].includes(1);
var a = 10;

```

可以看到，这一次运行过后，es6的语法都变成了es5，已经

