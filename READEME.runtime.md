## 前言

前面我们了一篇很长的文章介绍了[@babel/preset-env](https://www.babeljs.cn/docs/babel-preset-env),感兴趣的可以去看我之前的一篇文章[babel源码解析之（@babel/preset-env）](https://vvbug.blog.csdn.net/article/details/107052867),今天我们要分析的是babel的一个插件，叫[@babel/plugin-transform-runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime).

## 简介

我们看一下官网对它的描述：

> A plugin that enables the re-use of Babel's injected helper code to save on codesize.

很简短的一个描述信息，翻译一下大概是：“一个用于重新添加babel的一些工具类代码用来减少代码的大小”，虽然描述很少，但是理解起来好像比较抽象，下面我们一起结合demo一步步分析一下。

## 开始

我们还是继续使用我们前面的[demo项目](https://github.com/913453448/babel-demo.git)

我们先安装一下[@babel/plugin-transform-runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime)插件，

```js
npm install -D @babel/plugin-transform-runtime
```

然后我们在src目录底下创建一个demo.runtime.js用来测试，

src/demo.runtime.js：

```js
const fn = () => {};

new Promise(() => {});

class Test {
    say(){}
}

const c = [1, 2, 3].includes(1);
var a = 10;

function* helloWorldGenerator() {
    yield 'hello';
    yield 'world';
    return 'ending';
}
```

可以看到，除了之前的一些代码外，我们还加入了一个es6的generator函数，我们直接用一下[@babel/plugin-transform-runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime)插件，然后用它的默认设置，

babel.config.js：

```js
module.exports = {
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                "absoluteRuntime": false,
                "corejs": 2,
                "helpers": true,
                "regenerator": true,
                "useESModules": false,
                "version": "7.0.0-beta.0"
            }
        ]
    ]
};
```

我们运行babel编译看结果：

```
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.runtime.js -o ./lib/demo.runtime.js
```

lib/demo.runtime.js:

```js
const fn = () => {};

new Promise(() => {});

class Test {
  say() {}

}

const c = [1, 2, 3].includes(1);
var a = 10;

function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

```

可以看到，经过runtime插件处理后代码并没有改变，这是为什么呢？因为在我们runtime插件的配置中我们默认是关闭掉一些功能的，比如我们把runtime的corejs打开，

babel.config.js：

```js
module.exports = {
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                "absoluteRuntime": false,
                "corejs": 2,
                "helpers": true,
                "regenerator": true,
                "useESModules": false,
                "version": "7.0.0-beta.0"
            }
        ]
    ]
};
```

再次运行看结果：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.runtime.js                         
import _Promise from "@babel/runtime-corejs2/core-js/promise";

const fn = () => {};

new _Promise(() => {});

class Test {
  say() {}

}

const c = [1, 2, 3].includes(1);
var a = 10;

function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

➜  babel-demo git:(v0.0.1) ✗ 

```

可以看到，自动帮我们引入了一个polyfill（_Promise），那小伙伴要疑问了，es6的语法没转换？是的！ 因为runtime不做这些语法的转换，它只能算是一个转换帮助工具、一个自动添加polyfill的工具，es6语法转换我们上一节用了preset-env，所以我们把preset-env的语法转换模块加上，把polyfill去掉,runtime配置还原到默认配置，

babel.config.js:

```js
module.exports = {
    presets:[
        [
            "@babel/preset-env"
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                "absoluteRuntime": false,
                "corejs": false,
                "helpers": true,
                "regenerator": true,
                "useESModules": false,
                "version": "7.0.0-beta.0"
            }
        ]
    ]
};
```

再次运行babel看效果：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.runtime.js -o ./lib/demo.runtime.js
```

lib/demo.runtime.js:

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regeneratorRuntime2 = require("@babel/runtime/regenerator");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _marked = /*#__PURE__*/_regeneratorRuntime2.mark(helloWorldGenerator);

var fn = function fn() {};

new Promise(function () {});

var Test = /*#__PURE__*/function () {
  function Test() {
    (0, _classCallCheck2.default)(this, Test);
  }

  (0, _createClass2.default)(Test, [{
    key: "say",
    value: function say() {}
  }]);
  return Test;
}();

var c = [1, 2, 3].includes(1);
var a = 10;

function helloWorldGenerator() {
  return _regenerator.default.wrap(function helloWorldGenerator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'hello';

        case 2:
          _context.next = 4;
          return 'world';

        case 4:
          return _context.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

```

看结果也看不出什么，那runtime到底为我们做了什么呢？我们试一下如果我们不使用runtime插件，直接使用preset-env看结果：

babel.config.js

```js
module.exports = {
    presets:[
        [
            "@babel/preset-env"
        ]
    ],
    plugins: [
        // [
        //     "@babel/plugin-transform-runtime",
        //     {
        //         "absoluteRuntime": false,
        //         "corejs": false,
        //         "helpers": true,
        //         "regenerator": true,
        //         "useESModules": false,
        //         "version": "7.0.0-beta.0"
        //     }
        // ]
    ]
};
```

运行babel看结果：

```js
"use strict";

var _marked = /*#__PURE__*/regeneratorRuntime.mark(helloWorldGenerator);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var fn = function fn() {};

new Promise(function () {});

var Test = /*#__PURE__*/function () {
  function Test() {
    _classCallCheck(this, Test);
  }

  _createClass(Test, [{
    key: "say",
    value: function say() {}
  }]);

  return Test;
}();

var c = [1, 2, 3].includes(1);
var a = 10;

function helloWorldGenerator() {
  return regeneratorRuntime.wrap(function helloWorldGenerator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'hello';

        case 2:
          _context.next = 4;
          return 'world';

        case 4:
          return _context.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

```

ok！ 可以看到，在没有使用runtime的时候，我们的_classCallCheck、_defineProperties、_createClass都是在当前代码中，如果使用了runtime后，这些方法都会直接从@babel/runtime/helpers中导入：

```js
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regeneratorRuntime2 = require("@babel/runtime/regenerator");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _marked = /*#__PURE__*/_regeneratorRuntime2.mark(helloWorldGenerator);
```

所以，如果当我们有很多需要编译的文件的时候，每个文件中都会有这些方法的定义，这样整个包就会很大，runtime把这些方法抽离到一个公共的地方，所以可以让我们打包出来的源码变小。