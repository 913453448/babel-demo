## 前言

前面我们用了一篇很长的文章介绍了[@babel/preset-env](https://www.babeljs.cn/docs/babel-preset-env),感兴趣的可以去看我之前的一篇文章[babel源码解析之（@babel/preset-env）](https://vvbug.blog.csdn.net/article/details/107052867),今天我们要分析的是babel的一个插件，叫[@babel/plugin-transform-runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime).

## 简介

我们看一下官网对它的描述：

> A plugin that enables the re-use of Babel's injected helper code to save on codesize.

很简短的一个描述信息，翻译一下大概是：“抽离babel的一些公共工具类用来减少代码的大小”，虽然描述很少，但是理解起来好像比较抽象，下面我们一起结合demo一步步分析一下。

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

可以看到，自动帮我们引入了一个polyfill（_Promise），那小伙伴要疑问了，es6的语法没转换？是的！ 因为runtime不做这些语法的转换，它只能算是一个转换帮助类、一个自动添加polyfill的工具，es6语法转换我们上一节用了preset-env，所以我们把preset-env加上，然后把polyfill去掉,最后runtime配置还原到默认配置，

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

## 配置

### `corejs`

`false`, `2`, `3` or `{ version: 2 | 3, proposals: boolean }`, defaults to `false`.

比如：`['@babel/plugin-transform-runtime', { corejs: 3 }]`

corejs是可以让当前环境支持es的最新特性的api垫片（polyfill），在babel之前版本在用`@babel/polyfill`，从7.4.0版本后就用core-js代替了polyfill，比如我们之前在代码中加入全部的polyfill的是这样的：

```js
import "@babel/polyfill";
```

换成core-js后可以是这样的：

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

所以core-js是包含了polyfill的特性，更多的core-js内容大家可以看官网[https://github.com/zloirock/core-js](https://github.com/zloirock/core-js)

这里的corejs配置的就是我们将要使用的runtime-corejs的版本，有2跟3的版本，2版本是3之前的版本，所以3有一些es最新的一些特性，比如我们demo中的Array.prototy.includes方法，只有core-js3上才有：

```js
var c = [1, 2, 3].includes(1);
```

| 选用corejs的版本 | Install command                             |
| ---------------- | ------------------------------------------- |
| `false`          | `npm install --save @babel/runtime`         |
| `2`              | `npm install --save @babel/runtime-corejs2` |
| `3`              | `npm install --save @babel/runtime-corejs3` |

为了方便更好的分析，我们直接安装一下runtime-core2跟runtime-core3：

```js
npm install -D @babel/runtime-corejs2 && npm install -D @babel/runtime-corejs3
```

我们修改一下我们demo项目的配置文件，然后先把corejs改成2，

babel.config.js：

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
                "corejs": 2,
            }
        ]
    ]
};
```

然后我运行babel看效果：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.runtime.js -o ./lib/demo.runtime.js
```

lib/demo.runtime.js：

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _regeneratorRuntime2 = require("@babel/runtime-corejs2/regenerator");

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _marked = /*#__PURE__*/_regeneratorRuntime2.mark(helloWorldGenerator);

var fn = function fn() {};

new _promise.default(function () {});

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

可以看到，只帮我们加了一个_promise(Promise的polyfill)，我们并没看到Array.prototype.includes的垫片。

我们修改一下配置文件，把corejs的版本改成3，

babel.config.js：

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
                "corejs": 3,
            }
        ]
    ]
};
```

再次运行看结果，

lib/demo.runtime.js：

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _context;

var _marked = /*#__PURE__*/_regenerator.default.mark(helloWorldGenerator);

var fn = function fn() {};

new _promise.default(function () {});

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

var c = (0, _includes.default)(_context = [1, 2, 3]).call(_context, 1);
var a = 10;

function helloWorldGenerator() {
  return _regenerator.default.wrap(function helloWorldGenerator$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return 'hello';

        case 2:
          _context2.next = 4;
          return 'world';

        case 4:
          return _context2.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}

```

可以看到corejs3给我们添加了一个_includes方法当成了polyfill，如果看过之前preset-env那篇文章的同学可能会发现了，用transform-runtime插件添加的polyfill都是带有 "__"符号的变量（可以看成局部变量），是不会污染全局变量的，我们再来回顾一下preset-env，我们修改一下配置文件，把runtime插件去掉，然后开启preset-env的polyfill，preset-env的内容不懂的小伙伴可以看我之前的那篇文章哦，

babel.config.js:

```js
module.exports = {
    presets:[
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: "usage"
            }
        ]
    ],
    plugins: [
        // [
        //     "@babel/plugin-transform-runtime",
        //     {
        //         "corejs": 3,
        //     }
        // ]
    ]
};
```

运行看效果，

lib/demo.runtime.js：

```js
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("regenerator-runtime/runtime");

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

可以看到，首先的效果跟runtime插件是一样的，但是preset-env加的polyfill是直接导入corejs然后替换掉全局变量的，这样会造成全局变量的污染。

好啦，我们顺便把runtime插件跟preset-env的区别都给讲了，下面我们结合babel的源码具体分析一下transfrom-runtime插件是怎样结合@babel/runtime还有corejs对我们代码进行转换的。

packages/babel-plugin-transform-runtime/src/index.js:

```js
export default declare((api, options, dirname) => {
  api.assertVersion(7);

  const {
    corejs,
    helpers: useRuntimeHelpers = true,
    regenerator: useRuntimeRegenerator = true,
    useESModules = false,
    version: runtimeVersion = "7.0.0-beta.0",
    absoluteRuntime = false,
  } = options;
		let proposals = false;
  let rawVersion;
	
  //如果传递的是corejs: {version:3,proposals:true}对象类型的时候就拆分version跟proposals字段
  if (typeof corejs === "object" && corejs !== null) {
    rawVersion = corejs.version;
    proposals = Boolean(corejs.proposals);
  } else {
    rawVersion = corejs;
  }
	//获取corejs版本号
  const corejsVersion = rawVersion ? Number(rawVersion) : false;
  //校验版本号
  if (![false, 2, 3].includes(corejsVersion)) {
    throw new Error(
      `The \`core-js\` version must be false, 2 or 3, but got ${JSON.stringify(
        rawVersion,
      )}.`,
    );
  }
	//校验proposals参数只能出现在corejsVersion版本为3的情况
  if (proposals && (!corejsVersion || corejsVersion < 3)) {
    throw new Error(
      "The 'proposals' option is only supported when using 'corejs: 3'",
    );
  }
  ...
  
  /*
  	如果是core3版本的话就依赖“@babel/runtime-corejs3”
  	如果是core2版本的话就依赖“@babel/runtime-corejs2”
  	默认是依赖“@babel/runtime”
  */
   const moduleName = injectCoreJS3
    ? "@babel/runtime-corejs3"
    : injectCoreJS2
    ? "@babel/runtime-corejs2"
    : "@babel/runtime";
	/*
		如果是core3版本并且开启提案选项的时候就会把corejs的根目录设置为“core-js”（包含了最新提案的core-js）
		反之会将corejs的根目录设置为“core-js-stable”（稳定版本的core-js）
	*/
  const corejsRoot = injectCoreJS3 && !proposals ? "core-js-stable" : "core-js";
  ...
}
```

ok，我们看到这里：

```js
/*
		如果是core3版本并且开启提案选项的时候就会把corejs的根目录设置为“core-js”（包含了最新提案的core-js）
		反之会将corejs的根目录设置为“core-js-stable”（稳定版本的core-js）
	*/
  const corejsRoot = injectCoreJS3 && !proposals ? "core-js-stable" : "core-js";
```

我们没有将proposals设置为true的时候我们看一下编译结果，

babel.config.js：

```js
module.exports = {
    presets:[
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": 3,
            }
        ]
    ]
};
```

lib/demo.runtime.js:

```js
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));
...
```

可以看到，runtime插件帮我们安装的polyfill都是依赖的core-js-stable版本的corejs,如果我们将proposals设置为true我们看一下效果，

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": {version: 3, proposals: true},
            }
        ]
    ]
};
```

lib/demo.runtime.js：

```js
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
...
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
```

可以看到，当设置proposals为true的时候，runtime插件依赖的是core-js目录的polyfill，我们分别点开“core-js-stable”跟“core-js”的promise目录看一下有什么区别，

首先是“core-js-stable”的“@babel/runtime-corejs3/core-js-stable/promise”，

xxxbabel-demo/node_modules/@babel/runtime-corejs3/core-js-stable/promise.js:

```js
module.exports = require("core-js-pure/stable/promise");
```

然后是“core-js”的“@babel/runtime-corejs3/core-js/promise”，

xxx/babel-demo/node_modules/@babel/runtime-corejs3/core-js/promise.js:

```js
module.exports = require("core-js-pure/features/promise");
```

可以看到，都是引用了“core-js-pure”，那么“core-js-pure”又是啥呢？其实是core-js的另外一个版本，叫：“纯净的core-js”，也就是说不会污染全局变量的意思，具体小伙伴可以看[core-js的官网](https://github.com/zloirock/core-js)里面有详细说明的。

都是依赖的“core-js-pure”但是下级目录就不一样了，一个是“stable”一个是“features”，我们继续往下看，找到这两个文件，

node_modules/core-js-pure/features/promise/index.js：

```js
var parent = require('../../es/promise');
require('../../modules/esnext.aggregate-error');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.promise.all-settled');
require('../../modules/esnext.promise.try');
require('../../modules/esnext.promise.any');

module.exports = parent;

```

node_modules/core-js-pure/es/promise/index.js:

```js
require('../../modules/es.object.to-string');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');
require('../../modules/es.promise');
require('../../modules/es.promise.all-settled');
require('../../modules/es.promise.finally');
var path = require('../../internals/path');

module.exports = path.Promise;

```

可以看到，feature的少了很多内容，然后还有依赖了一些“esnext”打头的模块，“esnext”打头的也就是说下一个es版本中可能会出现的一些内容（处于stage阶段，还不怎么稳定）。

ok！我们了解corejs2跟3的区别，然后还分析了proposals参数，当runtime插件拿到了我们的corejs之后又是怎样动态的注入到我们的代码中的呢？

比如我们“src/demo.runtime.js”文件中有一个Promise，那么runtime是怎么注入的呢？看过前面preset-env文章的童鞋应该是多多少少有点感觉了，其实就是遍历ast的节点，然后遍历到Promise的时候动态的添加上polyfill代码，也就是一下代码：

```js
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));
```

我们看一下源码，

Xxxx/babel-demo/node_modules/@babel/plugin-transform-runtime/lib/index.js:

```js
... 
visitor: {
      ReferencedIdentifier(path) {
        const {
          node,
          parent,
          scope
        } = path;
        const {
          name
        } = node;

        if (name === "regeneratorRuntime" && useRuntimeRegenerator) {
          path.replaceWith(this.addDefaultImport(`${modulePath}/regenerator`, "regeneratorRuntime"));
          return;
        }

        if (!injectCoreJS) return;
        if (_core.types.isMemberExpression(parent)) return;
        if (!hasMapping(BuiltIns, name)) return;
        if (scope.getBindingIdentifier(name)) return;
        path.replaceWith(this.addDefaultImport(`${modulePath}/${corejsRoot}/${BuiltIns[name].path}`, name));
      ...
      
```

之前写过一篇文章介绍过babel的源码，然后最后还自定义了一个插件，[babel源码解析一](https://vvbug.blog.csdn.net/article/details/103823257)，插件返回的就是一个ast节点遍历的钩子函数，也就是说babel在遍历每一个节点的时候会触发对应插件的钩子函数，也就是说当解析到"src/demo.runtime.js"中的这段代码的时候：

```js
new Promise(function () {});
```

会走上面runtime插件的ReferencedIdentifier方法，然后把当前节点传过来，

```js
... 
visitor: {
      ReferencedIdentifier(path) {
        const {
          node,
          parent,
          scope
        } = path;
        const {
          name
        } = node;
				//如果有generator函数并且useRuntimeRegenerator设置为true的时候就添加generatorRuntime的polyfill，
        if (name === "regeneratorRuntime" && useRuntimeRegenerator) {
          path.replaceWith(this.addDefaultImport(`${modulePath}/regenerator`, "regeneratorRuntime"));
          return;
        }
				//corejs为false就不添加polyfill直接返回
        if (!injectCoreJS) return
        if (_core.types.isMemberExpression(parent)) return;
        //看当前corejs中有没有“Promise”的垫片polyfill
        if (!hasMapping(BuiltIns, name)) return;
        if (scope.getBindingIdentifier(name)) return;
	//添加promise polyfill路径为
  //"@babel/runtime-corejs3/core-js-stable/promise"       
                path.replaceWith(this.addDefaultImport(`${modulePath}/${corejsRoot}/${BuiltIns[name].path}`, name));
      ...
      
```

可以看到，如果有generator函数并且“useRuntimeRegenerator”设置为“true”的时候就添加generatorRuntime的polyfill，“useRuntimeRegenerator”选项我们下面再说，然后当corejs选项不为false的时候就按照前面说的路径去添加“Promise”的polyfill代码。

### `helpers`& useESModules

`helpers: boolean`, defaults to `true`.

是否运行runtime插件添加babel的helpers函数，比如我们的classCallCheck、extends方法等等，默认是开启的。

useESModules:  boolean`, defaults to `true`.

是否在添加esm方式的helpers函数的时候，默认是根据babel的配置来选择。

我们测试一下这两个参数，

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

babel.config.js: 

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: {version: 3, proposals: true},
                helpers: true,
                useESModules: false
            }
        ]
    ]
};
```

运行看结果，

lib/demo.runtime.js：

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

...

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));
...

```

可以看到，当helpers为true然后useESModules为false的时候会添加一些helper函数，比如我们的createClass跟classCallCheck等等，都是从corejs3的helpers目录下直接取模块，如果我们把useESModules设置为true，我们看一下效果，

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: {version: 3, proposals: true},
                helpers: true,
                useESModules: true
            }
        ]
    ]
};
```

运行代码看效果，

lib/demo.runtime.js：

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/esm/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/esm/createClass"));

...
```

可以看到，useESModules设置为true的时候会从helpers的esm目录加载对应的模块，这就是useESModules配置的作用。

下面我们分析一下源码，

packages/babel-plugin-transform-runtime/src/index.js：

```js
 return {
    name: "transform-runtime",

    pre(file) {
      //是否开启了helpers选项
      if (useRuntimeHelpers) {
        file.set("helperGenerator", name => {
     			//看当前helper是否在可用
          if (
            file.availableHelper &&
            !file.availableHelper(name, runtimeVersion)
          ) {
            return;
          }
			
          const isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;

          
          const blockHoist =
            isInteropHelper && !isModule(file.path) ? 4 : undefined;
					//根据useESModules配置选择加载helper的目录
          //useESModules： false（默认为helpers）
          //useESModules： true（helpers/esm）
          const helpersDir =
            esModules && file.path.node.sourceType === "module"
              ? "helpers/esm"
              : "helpers";

          return this.addDefaultImport(
            `${modulePath}/${helpersDir}/${name}`,
            name,
            blockHoist,
          );
        });
      }

      const cache = new Map();

      this.addDefaultImport = (source, nameHint, blockHoist) => {
        // If something on the page adds a helper when the file is an ES6
        // file, we can't reused the cached helper name after things have been
        // transformed because it has almost certainly been renamed.
        const cacheKey = isModule(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ""}`;

        let cached = cache.get(key);
        if (cached) {
          cached = t.cloneNode(cached);
        } else {
          cached = addDefault(file.path, source, {
            importedInterop: "uncompiled",
            nameHint,
            blockHoist,
          });

          cache.set(key, cached);
        }
        return cached;
      };
    },

```

OK！代码中有注释，我就不详细说明了。

### `regenerator`

`boolean`, defaults to `true`.

是否开启添加`regenerator`函数的polyfill防止全局污染。

描述不是很好理解哈，别怕，我们结合demo跟源码来分析，首先我们把`regenerator`选项关闭（false），然后看一下我们demo中的编译情况，

src/demo.runtime.js:

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

可以看到，我们源代码中有一个generator函数叫“helloWorldGenerator”,然后我关闭`regenerator`

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: {version: 3, proposals: true},
                helpers: true,
                useESModules: true,
                regenerator: false
            }
        ]
    ]
};
```

运行看结果，

lib/demo.runtime.js：

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/esm/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/esm/createClass"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _context;

var _marked = /*#__PURE__*/regeneratorRuntime.mark(helloWorldGenerator);

var fn = function fn() {};

new _promise.default(function () {});

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

var c = (0, _includes.default)(_context = [1, 2, 3]).call(_context, 1);
var a = 10;

function helloWorldGenerator() {
  return regeneratorRuntime.wrap(function helloWorldGenerator$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return 'hello';

        case 2:
          _context2.next = 4;
          return 'world';

        case 4:
          return _context2.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}

```

可以看到，我们的helloWorldGenerator函数被preset-env改造过后变成了：

```js

var _marked = /*#__PURE__*/regeneratorRuntime.mark(helloWorldGenerator);
function helloWorldGenerator() {
  return regeneratorRuntime.wrap(function helloWorldGenerator$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return 'hello';

        case 2:
          _context2.next = 4;
          return 'world';

        case 4:
          return _context2.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}

```

由于preset-env没有开启polyfill选项，然后runtime插件又关闭了regenerator选项，所以我们的regeneratorRuntime对象并没有被注入，所以我们打开我们的regenerator选项再试试，

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: {version: 3, proposals: true},
                helpers: true,
                useESModules: true,
                regenerator: true
            }
        ]
    ]
};
```

运行看效果，

demo.runtime.js：

```js
...
var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));
var _marked = /*#__PURE__*/_regenerator.default.mark(helloWorldGenerator);
function helloWorldGenerator() {
  return _regenerator.default.wrap(function helloWorldGenerator$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return 'hello';

        case 2:
          _context2.next = 4;
          return 'world';

        case 4:
          return _context2.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}
...

```

可以看到，当开启了regenerator选项的时候，runtime会自动的注入一个_regenerator对象，用来替换我们之前的regeneratorRuntime对象，并且不会像preset-env一样会污染全局，

以下是“preset-env”添加的regenerator polyfill

```js
require("regenerator-runtime/runtime");

var _marked = /*#__PURE__*/regeneratorRuntime.mark(helloWorldGenerator);
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

ok！我们的regenerator参数就讲到这里了，下面我们看一下源码中的操作，

packages/babel-plugin-transform-runtime/src/index.js：

```js
visitor: {
      ReferencedIdentifier(path) {
        const { node, parent, scope } = path;
        const { name } = node;

        // transform `regeneratorRuntime`
        if (name === "regeneratorRuntime" && useRuntimeRegenerator) {
          path.replaceWith(
            this.addDefaultImport(
              `${modulePath}/regenerator`,
              "regeneratorRuntime",
            ),
          );
          return;
        }

```

可以看到，源码中当读到"regeneratorRuntime"变量的时候，就替换掉"regeneratorRuntime"变量改为以下代码：

```js
var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));
var _marked = /*#__PURE__*/_regenerator.default.mark(helloWorldGenerator);
```

### `absoluteRuntime`

`boolean` or `string`, defaults to `false`.

设置runtime插件从哪个目录导入helpers跟polyfill，默认是：@babel/runtime-corejs3、@babel/runtime-corejs2或者@babel/runtime，你也可以设置其它的路径，我们用一下看效果：

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
        ]
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: {version: 3, proposals: true},
                helpers: true,
                useESModules: true,
                regenerator: true,
                absoluteRuntime: "./node_modules"
            }
        ]
    ]
};
```

运行看效果：

lib/demo.runtime.js

```js
"use strict";

var _interopRequireDefault = require("xxx/babel-demo/node_modules/@babel/runtime-corejs3/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("xxx/babel-demo/node_modules/@babel/runtime-corejs3/regenerator"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _classCallCheck2 = _interopRequireDefault(require("xxx/babel-demo/node_modules/@babel/runtime-corejs3/helpers/esm/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("xxx/babel-demo/node_modules/@babel/runtime-corejs3/helpers/esm/createClass"));

var _promise = _interopRequireDefault(require("xxx/babel-demo/node_modules/@babel/runtime-corejs3/core-js/promise"));

var _context;

var _marked = /*#__PURE__*/_regenerator.default.mark(helloWorldGenerator);

var fn = function fn() {};

new _promise.default(function () {});

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

var c = (0, _includes.default)(_context = [1, 2, 3]).call(_context, 1);
var a = 10;

function helloWorldGenerator() {
  return _regenerator.default.wrap(function helloWorldGenerator$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return 'hello';

        case 2:
          _context2.next = 4;
          return 'world';

        case 4:
          return _context2.abrupt("return", 'ending');

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}

```

可以看到，大部分的polyfill跟helpers函数都变成“xxx/babel-demo/node_modules/@babel/runtime-corejs3/xxx”，也就是说runtime插件可以让用户指定truntime依赖的位置，转换过后就变成一个绝对路径了。

### `version`

runtime中corejs的版本，比如现在我们的@babel/runtime-corejs2的7.0.1之前是没有Math的一些方法的，那么如果你的version值设置的是<=7.0.0的时候runtime插件就不会Math的一些方法给加进来的。

packages/babel-plugin-transform-runtime/src/index.js：

```js
  const { BuiltIns, StaticProperties, InstanceProperties } = (injectCoreJS2
    ? getCoreJS2Definitions
    : getCoreJS3Definitions)(runtimeVersion);
```

packages/babel-plugin-transform-runtime/src/runtime-corejs2-definitions.js:

```js
export default runtimeVersion => {
  // Conditionally include 'Math' because it was not included in the 7.0.0
  // release of '@babel/runtime'. See issue https://github.com/babel/babel/pull/8616.
  ...
  const includeMathModule = hasMinVersion("7.0.1", runtimeVersion);
	 ...(includeMathModule
        ? {
            Math: {
              acosh: { stable: true, path: "math/acosh" },
              asinh: { stable: true, path: "math/asinh" },
              atanh: { stable: true, path: "math/atanh" },
              cbrt: { stable: true, path: "math/cbrt" },
              clz32: { stable: true, path: "math/clz32" },
              cosh: { stable: true, path: "math/cosh" },
              expm1: { stable: true, path: "math/expm1" },
              fround: { stable: true, path: "math/fround" },
              hypot: { stable: true, path: "math/hypot" },
              imul: { stable: true, path: "math/imul" },
              log10: { stable: true, path: "math/log10" },
              log1p: { stable: true, path: "math/log1p" },
              log2: { stable: true, path: "math/log2" },
              sign: { stable: true, path: "math/sign" },
              sinh: { stable: true, path: "math/sinh" },
              tanh: { stable: true, path: "math/tanh" },
              trunc: { stable: true, path: "math/trunc" },
            },
          }
        : {}),  
     ...
}
```

OK，我们的@babel/plugin-transform-runtime全部内容就已经解析完毕了。

[demo项目](https://github.com/913453448/babel-demo.git)