## 前言

还记得之前写过一篇文章:[babel源码解析一](https://vvbug.blog.csdn.net/article/details/103823257),里面把babel的整个流程跑了一遍，最后还自定义了一个插件用来转换“箭头函数”，通过前面的源码解析我们知道，preset其实就是一些插件的集合，这一节我们来介绍一个babel中比较重要的preset“@babel/preset-env”，可能有些小伙伴已经用过了，没用过的话至少也应该见过，废话不多说，我们直接盘它。

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

可以看到，这一次运行过后，es6的语法都变成了es5，那么preset-env是怎样把我们的es6代码变成es5的呢？ 我们下面结合demo一步一步分析一下。

我们按照[babel-preset-env](https://www.babeljs.cn/docs/babel-preset-env)官网的顺序来,

`@babel/preset-env` is a smart preset that allows you to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills) are needed by your target environment(s). This both makes your life easier and JavaScript bundles smaller!

 翻译一下大概就是：

*有了`@babel/preset-env`后，你无需关心你所运行的环境需要的语法，因为会自动的根据当前环境对js语法做转换。*

我们在没有@babel/preset-env之前如果需要转换es语法的话，是需要我们自己去配置一些插件或者内置的stage，所以之前babel内置了state0、state1、state2、state3供你选择，还是处于手动配置状态，babel7.0后添加了preset-env，它会根据你所配置的浏览器的列表，自动的去加载当前浏览器所需要的插件，然后对es语法做转换。



### `targets`

描述你项目所支持的环境，因为内置了[browserslist](https://github.com/browserslist/browserslist)，最后会把`targets`传递给它，所以可以参考[browserslist](https://github.com/browserslist/browserslist)的配置

比如：

字符串：

```json
{
  "targets": "> 0.25%, not dead"
}
```

或者对象：

```json
{
  "targets": {
    "chrome": "58",
    "ie": "11"
  }
}
```

也可以通过配置文件去配置，我们demo中选用配置文件去配置，因为[browserslist](https://github.com/browserslist/browserslist)在大部分项目中是会被很多其它框架插件所依赖的，比如："postcss"、"[stylelint](https://stylelint.io/)"等等，

我们直接在根目录创建一个`.browserslistrc`文件,

.browserslistrc:

```js
> 0.25%, not dead
```

可以看到，我们配置一个“> 0.25%, not dead”字符串（browserslist默认配置），那么这代表了哪些浏览器呢？

browserslist提供了一个命令供我们查看，我们直接在根目录运行这个命令：

```js
➜  babel-demo git:(v0.0.1) ✗ npx browserslist "> 0.25%, not dead"
and_chr 81
and_uc 12.12
chrome 83
chrome 81
chrome 80
chrome 79
chrome 49
edge 18
firefox 76
firefox 75
ie 11
ios_saf 13.4-13.5
ios_saf 13.3
ios_saf 13.0-13.1
ios_saf 12.2-12.4
op_mini all
opera 68
safari 13.1
safari 13
safari 12.1
samsung 11.1-11.2
➜  babel-demo git:(v0.0.1) ✗ 

```

可以看到，browserslist命令列出了我们字符串所代表的浏览器集合，大家可以根据自己项目需求做配置即可。

我们再次运行babel命令：

```
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo1.js -o ./lib/demo1.js
```

然后看一下编译过后的文件：

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

可以看到，跟之前的配置没有什么区别，这又是为什么呢？ 因为我们用的是默认的browserslist配置，我们试着改一下browserslist的配置，这次我们把浏览器配置配高一点，

.browserslistrc:

```js
chrome 79
```

我们再次运行babel命令：

```
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo1.js -o ./lib/demo1.js
```

然后看一下结果

lib/demo1.js：

```js
"use strict";

const fn = () => {};

new Promise(() => {});

class Test {}

const c = [1, 2, 3].includes(1);
var a = 10;

```

可以看到，这次babel没有对代码做任何语法转换，因为我们的“chrome 79”浏览器是支持这些语法的，preset-env认为是不需要转换。

我们还是把浏览器配置列表文件换成默认配置，看一下默认情况下preset-env对我们代码做的转换：

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

我们看一下[babel-preset-env](https://github.com/babel/babel.git)的源码(可以自己去clone一份)，demo用的是“7.7.7”版本

packages/babel-preset-env/src/index.js：

```js
...
export default declare((api, opts) => {
  ...
  const pluginNames = filterItems(
    shippedProposals ? pluginList : pluginListWithoutProposals,
    include.plugins,
    exclude.plugins,
    transformTargets,
    modulesPluginNames,
    getOptionSpecificExcludesFor({ loose }),
    pluginSyntaxMap,
  );
  ...

  return { plugins };
});

```

我们先撇开其它的配置信息（后面我们会讲到），我们之前就说过preset其实就是一些plugin的集合，那么默认preset-env获取哪些插件呢？我们看到这么一行代码：

```js
shippedProposals ? pluginList : pluginListWithoutProposals,
```

shippedProposals配置稍后再讲，可以看到我们会获取一个pluginList对象，pluginList是一个模块导出来的，

```js
import pluginList from "../data/plugins.json";
```

packages/babel-preset-env/data/plugins.json:

```json
{
  //...
  "transform-classes": {
    "chrome": "46",
    "edge": "13",
    "firefox": "45",
    "safari": "10",
    "node": "5",
    "ios": "10",
    "samsung": "5",
    "opera": "33",
    "electron": "0.36"
  },
  //...
}
```

代码有点多，我们直接看一个就可以了，比如“transform-classes”，这个就是给我们的class加上_classCallCheck方法的插件：

```js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
```

preset-env会根据我们配置的browserlist去plugins.json找看有没有浏览器是需要这个插件的，需要就加入,

我们再重新梳理一遍逻辑

首先看一下我们的浏览器列表：

```js
➜  babel-demo git:(v0.0.1) ✗ npx browserslist "> 0.25%, not dead"
and_chr 81
and_uc 12.12
chrome 83
chrome 81
chrome 80
chrome 79
chrome 49
edge 18
firefox 76
firefox 75
ie 11
ios_saf 13.4-13.5
ios_saf 13.3
ios_saf 13.0-13.1
ios_saf 12.2-12.4
op_mini all
opera 68
safari 13.1
safari 13
safari 12.1
samsung 11.1-11.2

```

然后preset-env会通过filterItems筛选出我们需要的插件，

packages/babel-preset-env/src/index.js：

```js
...
export default declare((api, opts) => {
  ...
  const pluginNames = filterItems(
    shippedProposals ? pluginList : pluginListWithoutProposals,
    include.plugins,
    exclude.plugins,
    transformTargets,
    modulesPluginNames,
    getOptionSpecificExcludesFor({ loose }),
    pluginSyntaxMap,
  );
  ...

  return { plugins };
});

```

packages/babel-preset-env/src/filter-items.js：

```js
export default function(
  list: { [feature: string]: Targets },
  includes: Set<string>,
  excludes: Set<string>,
  targets: Targets,
  defaultIncludes: Array<string> | null,
  defaultExcludes?: Array<string> | null,
  pluginSyntaxMap?: Map<string, string | null>,
) {
  const result = new Set<string>();

  for (const item in list) {
    if (
      !excludes.has(item) &&
      (isPluginRequired(targets, list[item]) || includes.has(item))
    ) {
      result.add(item);
    }
  }
...

  return result;
}
```

然后filterItems方法会调用一个叫isPluginRequired的方法，

packages/babel-preset-env/src/filter-items.js：

```js
import semver from "semver";
import { semverify, isUnreleasedVersion } from "./utils";

import type { Targets } from "./types";

export function isPluginRequired(
  supportedEnvironments: Targets,
  plugin: Targets,
) {
  const targetEnvironments = Object.keys(supportedEnvironments);

  if (targetEnvironments.length === 0) {
    return true;
  }

  const isRequiredForEnvironments = targetEnvironments.filter(environment => {
    // Feature is not implemented in that environment
    if (!plugin[environment]) {
      return true;
    }

    const lowestImplementedVersion = plugin[environment];
    const lowestTargetedVersion = supportedEnvironments[environment];

    // If targets has unreleased value as a lowest version, then don't require a plugin.
    if (isUnreleasedVersion(lowestTargetedVersion, environment)) {
      return false;
    }

    // Include plugin if it is supported in the unreleased environment, which wasn't specified in targets
    if (isUnreleasedVersion(lowestImplementedVersion, environment)) {
      return true;
    }

    if (!semver.valid(lowestTargetedVersion.toString())) {
      throw new Error(
        `Invalid version passed for target "${environment}": "${lowestTargetedVersion}". ` +
          "Versions must be in semver format (major.minor.patch)",
      );
    }
		
    return semver.gt(
      semverify(lowestImplementedVersion),
      lowestTargetedVersion.toString(),
    );
  });

  return isRequiredForEnvironments.length > 0;
}
```

isPluginRequired方法会去获取plugins.json中插件所支持的环境，然后跟当前配置的浏览器环境做比较，如果当前浏览器的环境小于插件所需要的浏览器环境，那么就返回true，否则返回false。

在我们demo中，是需要"transform-classes"插件的，所以"preset-env"的"plugins"里面会有一个"transform-classes"插件，那么"transform-classes"插件的源码在哪呢？

packages/babel-plugin-transform-classes/src/index.js：

```js
// @flow
...
import transformClass from "./transformClass";
...
export default declare((api, options) => {
  ...
  return {
    name: "transform-classes",

    visitor: {
      ExportDefaultDeclaration(path: NodePath) {
        if (!path.get("declaration").isClassDeclaration()) return;
        splitExportDeclaration(path);
      },

      ClassDeclaration(path: NodePath) {
        const { node } = path;

        const ref = node.id || path.scope.generateUidIdentifier("class");

        path.replaceWith(
          t.variableDeclaration("let", [
            t.variableDeclarator(ref, t.toExpression(node)),
          ]),
        );
      },

      ClassExpression(path: NodePath, state: any) {
       ...
        path.replaceWith(
          transformClass(path, state.file, builtinClasses, loose),
        );
			...
      },
    },
  };
});
.....
```

可以看到，当读到我们的ClassExpression节点的时候就开始执行transformClass方法，

我们打开我们的demo1.js,

src/demo1.js:

```js
const fn = () => {};

new Promise(() => {});

class Test {}

const c = [1, 2, 3].includes(1);
var a = 10;

```

当读到"class Test {}"这一句的时候，就会执行"babel-plugin-transform-classes"的"transformClass"方法，

packages/babel-plugin-transform-classes/src/transformClass.js：

```js
 import type { NodePath } from "@babel/traverse";
import nameFunction from "@babel/helper-function-name";
import ReplaceSupers, {
  environmentVisitor,
} from "@babel/helper-replace-supers";
import optimiseCall from "@babel/helper-optimise-call-expression";
import * as defineMap from "@babel/helper-define-map";
import { traverse, template, types as t } from "@babel/core";

type ReadonlySet<T> = Set<T> | { has(val: T): boolean };

function buildConstructor(classRef, constructorBody, node) {
  const func = t.functionDeclaration(
    t.cloneNode(classRef),
    [],
    constructorBody,
  );
  t.inherits(func, node);
  return func;
}

export default function transformClass(
  path: NodePath,
  file: any,
  builtinClasses: ReadonlySet<string>,
  isLoose: boolean,
) {
  ...

  return classTransformer(path, file, builtinClasses, isLoose);
}

```

代码太多了，我们直接看重点，我们会发现最后调用了一个叫"classTransformer"的方法

```js
function classTransformer(
    path: NodePath,
    file,
    builtinClasses: ReadonlySet<string>,
    isLoose: boolean,
  ) {
   ...
    // make sure this class isn't directly called (with A() instead new A())
    if (!classState.isLoose) {
      constructorBody.body.unshift(
        t.expressionStatement(
          t.callExpression(classState.file.addHelper("classCallCheck"), [
            t.thisExpression(),
            t.cloneNode(classState.classRef),
          ]),
        ),
      );
    }
...
    return t.callExpression(container, closureArgs);
  }
```

我们可以看到，classTransformer方法中添加了一个helper：

```js
t.callExpression(classState.file.addHelper("classCallCheck"),
```

那么我们这个helper到底是什么呢？

packages/babel-helpers/src/helpers.js：

```js
...
helpers.classCallCheck = helper("7.0.0-beta.0")`
  export default function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
`;
...
```

可以看到，在babel-helpers中我们找到了这么一段代码，是不是很熟悉呢？

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

ok!  通过上面的分析我们可以知道，当我们设置了targets（也可以是.browserslistrc文件）我们运行浏览器的列表后，preset-env会根据targets获取对应的插件，比如我们demo中需要的“transform-arrow-functions”、“transform-classes”等等。

#### `targets.esmodules`

当我们设置了`targets.esmodules`属性后，preset-env就会忽略`targets.browsers`（所支持的浏览器）属性跟.browserslistrc文件，然后直接把浏览器的支持改为支持“es6.module”语法的浏览器，

比如我们修改一下我们的配置文件

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "esmodules": true
                }
            }
        ]
    ]
};
```

然后运行babel看效果:

```
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo1.js -o ./lib/demo1.js
```

lib/demo1.js:

```js
"use strict";

var fn = () => {};

new Promise(() => {});

class Test {}

var c = [1, 2, 3].includes(1);
var a = 10;

```

可以看到，对我们的源代码没做改变，因为支持“es6.module”语法的浏览器有这些：

packages/babel-preset-env/data/built-in-modules.json：

```json
{
  "es6.module": {
    "edge": "16",
    "firefox": "60",
    "chrome": "61",
    "safari": "10.1",
    "opera": "48",
    "ios_saf": "10.3",
    "and_chr": "71",
    "and_ff": "64"
  }
}

```

而这些浏览器是可以支持我们的demo1.js的代码的，所以preset-env认为不需要做转换。

#### `targets.node`

`string | "current" | true`.

声明当前运行的node的版本号，可以为：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "esmodules": true,
                  	"node": "current",
                  	"node": true,
                  	"node": "13.12.0"
                }
            }
        ]
    ]
};
```

代码在packages/babel-preset-env/src/targets-parser.js：

```js
 node: (target, value) => {
    const parsed =
      value === true || value === "current"
        ? process.versions.node
        : semverifyTarget(target, value); //输出 13.12.0
    return [target, parsed];
  },
```

#### `targets.safari`

`string | "tp"`.

指定safari浏览器的版本，可以为“tp”或者自定义版本号。

#### `targets.browsers`

`string | Array<string>`.

跟直接指定targets为字符串或者[browserslist](https://github.com/ai/browserslist)配置文件的方式一样。

### `spec`

`boolean`, 默认 为 `false`.

主要是给其它插件用的参数，在preset-env的源码中可以看到

packages/babel-preset-env/src/index.js：

```js
　 const plugins = Array.from(pluginNames)
    .map(pluginName => [
      getPlugin(pluginName),
      { spec, loose, useBuiltIns: pluginUseBuiltIns },
    ])
    .concat(polyfillPlugins);
```

可以看到，直接给了插件，其中还有‘loose’、‘useBuiltIns’字段。

### `loose`

`boolean`, 默认： `false`.

也是给插件用的参数，跟`spec`一样，比如我们修改一下我们的demo1.js的代码，

src/demo1.js：

```js
const fn = () => {};

new Promise(() => {});

class Test {
    say(){}
}

const c = [1, 2, 3].includes(1);
var a = 10;

```

我们给Test类加了一个say方法，我们先看一下不加`loose`参数的结果：

babel.config.js

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                loose: false
            }
        ]
    ]
};
```

lib/demo1.js：

```js
"use strict";

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

```

可以看到，当loose：false（默认）的时候：

packages/babel-plugin-transform-classes插件直接利用Object.defineProperty方法在Test的原型对象上面添加属性的方式实现，

我们现在修改一下配置文件，把loose改为true

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                loose: true
            }
        ]
    ]
};
```

然后运行babel看结果

lib/demo1.js：

```js
"use strict";

var fn = function fn() {};

new Promise(function () {});

var Test = /*#__PURE__*/function () {
  function Test() {}

  var _proto = Test.prototype;

  _proto.say = function say() {};

  return Test;
}();

var c = [1, 2, 3].includes(1);
var a = 10;

```

可以看到，当loose：true的时候：

packages/babel-plugin-transform-classes插件直接在Test的原型对象上面添加了一个say属性。

### `modules`

`"amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false`, 默认为 `"auto"`.

是否允许把 ES6 module 语法 转换成其它类型

如果是false的话就不做转换

`cjs` 就是 commonjs

比如我们在src中创建一个demo.module.js文件测试，

demo.module.js：

```js
import demo1 from "./demo1";
function test() {

}
export default test;
```

可以看到，在我们的测试代码中，我们导入一个demo1，然后输出一个test函数，

我们把modules设置成“auto”（默认）

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                loose: true,
                modules: "auto"
            }
        ]
    ]
};
```

然后我们直接运行babel：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.module.js
"use strict";

exports.__esModule = true;
exports.default = void 0;

var _demo = _interopRequireDefault(require("./demo1"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function test() {}

var _default = test;
exports.default = _default;

➜  babel-demo git:(v0.0.1) ✗ 


```

可以看到，默认以commonjs的方式输出es6的模块。

我们修改成false，

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                loose: true,
                modules: false
            }
        ]
    ]
};
```

然后我们运行babel看效果：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.module.js
import demo1 from "./demo1";

function test() {}

export default test;

➜  babel-demo git:(v0.0.1) ✗ 


```

可以看到，es6的模块代码没有做任何改变。

### `debug`

`boolean`, 默认 `false`.

是否打印prese-env争对当前配置所加载的所有插件信息、所有浏览器列表，

我们来用用，我们直接加上debug为true参数，

babel.config.js:

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                loose: true,
                modules: false,
                debug: true,
            }
        ]
    ]
};
```

然后我们运行babel：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo.module.js
@babel/preset-env: `DEBUG` option

Using targets:
{
  "chrome": "49",
  "edge": "18",
  "firefox": "75",
  "ie": "11",
  "ios": "12.2",
  "opera": "68",
  "safari": "12.1",
  "samsung": "11.1"
}

Using modules transform: false

Using plugins:
  proposal-nullish-coalescing-operator { "chrome":"49", "edge":"18", "ie":"11", "ios":"12.2", "safari":"12.1", "samsung":"11.1" }
  proposal-optional-chaining { "chrome":"49", "edge":"18", "ie":"11", "ios":"12.2", "safari":"12.1", "samsung":"11.1" }
  proposal-json-strings { "chrome":"49", "edge":"18", "ie":"11" }
  proposal-optional-catch-binding { "chrome":"49", "edge":"18", "ie":"11" }
  transform-parameters { "ie":"11" }
  proposal-async-generator-functions { "chrome":"49", "edge":"18", "ie":"11" }
  proposal-object-rest-spread { "chrome":"49", "edge":"18", "ie":"11" }
  transform-dotall-regex { "chrome":"49", "edge":"18", "firefox":"75", "ie":"11" }
  proposal-unicode-property-regex { "chrome":"49", "edge":"18", "firefox":"75", "ie":"11" }
  transform-named-capturing-groups-regex { "chrome":"49", "edge":"18", "firefox":"75", "ie":"11" }
  transform-async-to-generator { "chrome":"49", "ie":"11" }
  transform-exponentiation-operator { "chrome":"49", "ie":"11" }
  transform-template-literals { "ie":"11", "ios":"12.2", "safari":"12.1" }
  transform-literals { "ie":"11" }
  transform-function-name { "chrome":"49", "edge":"18", "ie":"11" }
  transform-arrow-functions { "ie":"11" }
  transform-classes { "ie":"11" }
  transform-object-super { "ie":"11" }
  transform-shorthand-properties { "ie":"11" }
  transform-duplicate-keys { "ie":"11" }
  transform-computed-properties { "ie":"11" }
  transform-for-of { "chrome":"49", "ie":"11" }
  transform-sticky-regex { "ie":"11" }
  transform-unicode-escapes { "ie":"11" }
  transform-unicode-regex { "chrome":"49", "ie":"11" }
  transform-spread { "ie":"11" }
  transform-destructuring { "chrome":"49", "ie":"11" }
  transform-block-scoping { "ie":"11" }
  transform-new-target { "ie":"11" }
  transform-regenerator { "chrome":"49", "ie":"11" }
  syntax-dynamic-import { "chrome":"49", "edge":"18", "firefox":"75", "ie":"11", "ios":"12.2", "opera":"68", "safari":"12.1", "samsung":"11.1" }

Using polyfills: No polyfills were added, since the `useBuiltIns` option was not set.
import demo1 from "./demo1";

function test() {}

export default test;

➜  babel-demo git:(v0.0.1) ✗ 

```

可以一目了然的看到preset-env用了哪些插件，以及我们所支持的浏览器集合。

### `include`

`Array<string|RegExp>`, 默认为 `[]`.

数组每个item可以为下面两种形式:

- [Babel plugins](https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/plugin-features.js) - 可以为插件的全路径 (`@babel/plugin-transform-spread`) 或者省略前缀 (`plugin-transform-spread`).
- Built-ins (在 [core-js@2](https://github.com/babel/babel/blob/master/packages/babel-preset-env/src/polyfills/corejs2/built-in-definitions.js) 跟 [core-js@3](https://github.com/babel/babel/blob/master/packages/babel-preset-env/src/polyfills/corejs3/built-in-definitions.js)中， 可以为 `es.map`, `es.set`, 或者 `es.object.assign`，这样两个版本都会识别

通过上面的例子我们知道，如果浏览器版本支持当前语法的话，preset-env是不会加载相应的插件的，但是如果用户强制需要加载某些插件的话，我们可以用include参数，比如“es.promise”、“es.promise.finally”等等。

我们修改一下配置文件，

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: 'usage',
              	debug： true，
                include: [
                ]
            }
        ]
    ]
};
```

我们添加了一个指定了corejs的版本（后面会讲到），然后把polyfill的注入方式改为‘usage’（后面会讲到），然后设置了include为一个空数组，

然后我们修改一下我们的浏览器列表文件，我们把浏览器的版本提高，使它能兼容我们的demo1.js的代码：

.browserslistrc

```js
chrome 73
```

我们运行babel看一下效果（为了更直观的看效果，我们开启debug）：

```js
➜  babel-demo git:(v0.0.1) ✗ npx babel ./src/demo1.js -o ./lib/demo1.js
@babel/preset-env: `DEBUG` option

Using targets:
{
  "chrome": "73"
}

Using modules transform: auto

Using plugins:
  proposal-nullish-coalescing-operator { "chrome":"73" }
  proposal-optional-chaining { "chrome":"73" }
  syntax-json-strings { "chrome":"73" }
  syntax-optional-catch-binding { "chrome":"73" }
  syntax-async-generators { "chrome":"73" }
  syntax-object-rest-spread { "chrome":"73" }
  transform-modules-commonjs { "chrome":"73" }
  proposal-dynamic-import { "chrome":"73" }

Using polyfills with `usage` option:
➜  babel-demo git:(v0.0.1) ✗ 


```

因为当前浏览器支持我们的demo1.js的代码，只有一些默认的不支持的插件。

接下来我们修改一下我们的配置文件，添加一些默认的插件在include属性中：

babel.config.js

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: 'usage',
                debug: true,
                include: [
                    '@babel/plugin-transform-classes',
                    // promise polyfill alone doesn't work in IE,
                    // needs this as well. see: #1642
                    'es.array.iterator',
                    'es.array.includes',
                    // this is required for webpack code splitting, vuex etc.
                    'es.promise',
                    // this is needed for object rest spread support in templates
                    // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
                    'es.object.assign',
                    // #2012 es6.promise replaces native Promise in FF and causes missing finally
                    'es.promise.finally'
                ]
            }
        ]
    ]
};
```

可以看到，我们加了一些默认的插件在里面，

我们再次运行babel看结果：



```js
 babel-demo git:(v0.0.1) ✗ npx babel ./src/demo1.js -o ./lib/demo1.js
@babel/preset-env: `DEBUG` option

Using targets:
{
  "chrome": "73"
}

Using modules transform: auto

Using plugins:
  proposal-nullish-coalescing-operator { "chrome":"73" }
  proposal-optional-chaining { "chrome":"73" }
  syntax-json-strings { "chrome":"73" }
  syntax-optional-catch-binding { "chrome":"73" }
  syntax-async-generators { "chrome":"73" }
  syntax-object-rest-spread { "chrome":"73" }
  transform-classes {}
  transform-modules-commonjs { "chrome":"73" }
  proposal-dynamic-import { "chrome":"73" }


```

lib/demo1.js:

```js
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.promise");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

const fn = () => {};

new Promise(() => {});

let Test = /*#__PURE__*/function () {
  function Test() {
    _classCallCheck(this, Test);
  }

  _createClass(Test, [{
    key: "say",
    value: function say() {}
  }]);

  return Test;
}();

const c = [1, 2, 3].includes(1);
var a = 10;

```

可以看到，比之前编译的多了很多插件信息，也就是我们的include里面默认的插件。

### `exclude`

`Array<string|RegExp>`, 默认 `[]`.

不需要依赖的插件集合，跟include用法一样，但是作用跟include相反。

### `useBuiltIns`

@babel/preset-env使用polyfill的配置，那么什么是polyfill呢？我们都知道，preset-env会根据浏览器的配置做es的语法转换，但是在实际运行环境中，除了es的语法外，还有一些其它的api，比如我们需要用到Promise对象，比如我们需要用到Array.prototype.includes方法等等，所以需要我们在当前运行环境中添加Promise和Array.prototype.includes方法，让当前的js代码能够运行在当前环境。

当`useBuiltIns`的值为entry或者usage的时候，@babel-preset-env会直接依赖core-js当作polyfill使用。

自从babel在7.4.0版本后弃用了@babel/polyfill后，babel建议我们直接使用core-js并且设置corejs的版本来替换polyfill。

#### `useBuiltIns: 'entry'`

当我们使用entry的时候，会根据当前浏览器的配置信息来加载core-js的插件，最后动态替换掉源码中两种形式的代码块。

- ```
  import "core-js";
  ```

- ```
  import "@babel/polyfill";
  ```

比如我们demo中，我们修改一下配置文件：

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: 'entry',

            }
        ]
    ]
};
```

然后我们修改一下浏览器配置信息为默认：

.browserslistrc

```js
> 0.25%, not dead
```

然后我们在src中创建一个叫demo-entry.js的文件测试：

src/demo-entry.js：

```js
const fn = () => {};

new Promise(() => {});

class Test {
    say(){}
}

const c = [1, 2, 3].includes(1);
var a = 10;

```

我们直接运行babel命令：

```js
npx babel ./src/demo-entry.js -o lib/demo-entry.js
```

lib/demo-entry.js:

```js
"use strict";

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

```

可以看到，除了转换了一些语法类的东西外并没有添加polyfill（Promise、includes等等）

那么我们设置了usage后，怎样才会起作用呢？我们改一下demo-entry.js文件的代码，

demo-entry.js：

```js
//如果用了usage，preset-env会替换以下代码
import "core-js";
const fn = () => {};

new Promise(() => {});

class Test {
    say(){}
}

const c = [1, 2, 3].includes(1);
var a = 10;

```

然后我们再次运行babel看结果：

```js
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.async-iterator");

require("core-js/modules/es.symbol.has-instance");

require("core-js/modules/es.symbol.is-concat-spreadable");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.symbol.match");

require("core-js/modules/es.symbol.replace");

require("core-js/modules/es.symbol.search");

require("core-js/modules/es.symbol.species");

require("core-js/modules/es.symbol.split");

require("core-js/modules/es.symbol.to-primitive");

require("core-js/modules/es.symbol.to-string-tag");

require("core-js/modules/es.symbol.unscopables");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.copy-within");

require("core-js/modules/es.array.every");

require("core-js/modules/es.array.fill");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.find");

require("core-js/modules/es.array.find-index");

require("core-js/modules/es.array.flat");

require("core-js/modules/es.array.flat-map");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.join");

require("core-js/modules/es.array.last-index-of");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.of");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.array.reduce-right");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.some");

require("core-js/modules/es.array.sort");

require("core-js/modules/es.array.species");

require("core-js/modules/es.array.splice");

require("core-js/modules/es.array.unscopables.flat");

require("core-js/modules/es.array.unscopables.flat-map");

require("core-js/modules/es.array-buffer.constructor");

require("core-js/modules/es.date.to-primitive");

require("core-js/modules/es.function.has-instance");

require("core-js/modules/es.function.name");

require("core-js/modules/es.json.to-string-tag");

require("core-js/modules/es.map");

require("core-js/modules/es.math.acosh");

require("core-js/modules/es.math.asinh");

require("core-js/modules/es.math.atanh");

require("core-js/modules/es.math.cbrt");

require("core-js/modules/es.math.clz32");

require("core-js/modules/es.math.cosh");

require("core-js/modules/es.math.expm1");

require("core-js/modules/es.math.fround");

require("core-js/modules/es.math.hypot");

require("core-js/modules/es.math.imul");

require("core-js/modules/es.math.log10");

require("core-js/modules/es.math.log1p");

require("core-js/modules/es.math.log2");

require("core-js/modules/es.math.sign");

require("core-js/modules/es.math.sinh");

require("core-js/modules/es.math.tanh");

require("core-js/modules/es.math.to-string-tag");

require("core-js/modules/es.math.trunc");

require("core-js/modules/es.number.constructor");

require("core-js/modules/es.number.epsilon");

require("core-js/modules/es.number.is-finite");

require("core-js/modules/es.number.is-integer");

require("core-js/modules/es.number.is-nan");

require("core-js/modules/es.number.is-safe-integer");

require("core-js/modules/es.number.max-safe-integer");

require("core-js/modules/es.number.min-safe-integer");

require("core-js/modules/es.number.parse-float");

require("core-js/modules/es.number.parse-int");

require("core-js/modules/es.number.to-fixed");

require("core-js/modules/es.object.assign");

require("core-js/modules/es.object.define-getter");

require("core-js/modules/es.object.define-setter");

require("core-js/modules/es.object.entries");

require("core-js/modules/es.object.freeze");

require("core-js/modules/es.object.from-entries");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.get-own-property-names");

require("core-js/modules/es.object.get-prototype-of");

require("core-js/modules/es.object.is");

require("core-js/modules/es.object.is-extensible");

require("core-js/modules/es.object.is-frozen");

require("core-js/modules/es.object.is-sealed");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.lookup-getter");

require("core-js/modules/es.object.lookup-setter");

require("core-js/modules/es.object.prevent-extensions");

require("core-js/modules/es.object.seal");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.object.values");

require("core-js/modules/es.promise");

require("core-js/modules/es.promise.finally");

require("core-js/modules/es.reflect.apply");

require("core-js/modules/es.reflect.construct");

require("core-js/modules/es.reflect.define-property");

require("core-js/modules/es.reflect.delete-property");

require("core-js/modules/es.reflect.get");

require("core-js/modules/es.reflect.get-own-property-descriptor");

require("core-js/modules/es.reflect.get-prototype-of");

require("core-js/modules/es.reflect.has");

require("core-js/modules/es.reflect.is-extensible");

require("core-js/modules/es.reflect.own-keys");

require("core-js/modules/es.reflect.prevent-extensions");

require("core-js/modules/es.reflect.set");

require("core-js/modules/es.reflect.set-prototype-of");

require("core-js/modules/es.regexp.constructor");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.flags");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.set");

require("core-js/modules/es.string.code-point-at");

require("core-js/modules/es.string.ends-with");

require("core-js/modules/es.string.from-code-point");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.pad-end");

require("core-js/modules/es.string.pad-start");

require("core-js/modules/es.string.raw");

require("core-js/modules/es.string.repeat");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.search");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.starts-with");

require("core-js/modules/es.string.trim");

require("core-js/modules/es.string.trim-end");

require("core-js/modules/es.string.trim-start");

require("core-js/modules/es.string.anchor");

require("core-js/modules/es.string.big");

require("core-js/modules/es.string.blink");

require("core-js/modules/es.string.bold");

require("core-js/modules/es.string.fixed");

require("core-js/modules/es.string.fontcolor");

require("core-js/modules/es.string.fontsize");

require("core-js/modules/es.string.italics");

require("core-js/modules/es.string.link");

require("core-js/modules/es.string.small");

require("core-js/modules/es.string.strike");

require("core-js/modules/es.string.sub");

require("core-js/modules/es.string.sup");

require("core-js/modules/es.typed-array.float32-array");

require("core-js/modules/es.typed-array.float64-array");

require("core-js/modules/es.typed-array.int8-array");

require("core-js/modules/es.typed-array.int16-array");

require("core-js/modules/es.typed-array.int32-array");

require("core-js/modules/es.typed-array.uint8-array");

require("core-js/modules/es.typed-array.uint8-clamped-array");

require("core-js/modules/es.typed-array.uint16-array");

require("core-js/modules/es.typed-array.uint32-array");

require("core-js/modules/es.typed-array.copy-within");

require("core-js/modules/es.typed-array.every");

require("core-js/modules/es.typed-array.fill");

require("core-js/modules/es.typed-array.filter");

require("core-js/modules/es.typed-array.find");

require("core-js/modules/es.typed-array.find-index");

require("core-js/modules/es.typed-array.for-each");

require("core-js/modules/es.typed-array.from");

require("core-js/modules/es.typed-array.includes");

require("core-js/modules/es.typed-array.index-of");

require("core-js/modules/es.typed-array.iterator");

require("core-js/modules/es.typed-array.join");

require("core-js/modules/es.typed-array.last-index-of");

require("core-js/modules/es.typed-array.map");

require("core-js/modules/es.typed-array.of");

require("core-js/modules/es.typed-array.reduce");

require("core-js/modules/es.typed-array.reduce-right");

require("core-js/modules/es.typed-array.reverse");

require("core-js/modules/es.typed-array.set");

require("core-js/modules/es.typed-array.slice");

require("core-js/modules/es.typed-array.some");

require("core-js/modules/es.typed-array.sort");

require("core-js/modules/es.typed-array.subarray");

require("core-js/modules/es.typed-array.to-locale-string");

require("core-js/modules/es.typed-array.to-string");

require("core-js/modules/es.weak-map");

require("core-js/modules/es.weak-set");

require("core-js/modules/esnext.aggregate-error");

require("core-js/modules/esnext.array.last-index");

require("core-js/modules/esnext.array.last-item");

require("core-js/modules/esnext.composite-key");

require("core-js/modules/esnext.composite-symbol");

require("core-js/modules/esnext.global-this");

require("core-js/modules/esnext.map.delete-all");

require("core-js/modules/esnext.map.every");

require("core-js/modules/esnext.map.filter");

require("core-js/modules/esnext.map.find");

require("core-js/modules/esnext.map.find-key");

require("core-js/modules/esnext.map.from");

require("core-js/modules/esnext.map.group-by");

require("core-js/modules/esnext.map.includes");

require("core-js/modules/esnext.map.key-by");

require("core-js/modules/esnext.map.key-of");

require("core-js/modules/esnext.map.map-keys");

require("core-js/modules/esnext.map.map-values");

require("core-js/modules/esnext.map.merge");

require("core-js/modules/esnext.map.of");

require("core-js/modules/esnext.map.reduce");

require("core-js/modules/esnext.map.some");

require("core-js/modules/esnext.map.update");

require("core-js/modules/esnext.math.clamp");

require("core-js/modules/esnext.math.deg-per-rad");

require("core-js/modules/esnext.math.degrees");

require("core-js/modules/esnext.math.fscale");

require("core-js/modules/esnext.math.iaddh");

require("core-js/modules/esnext.math.imulh");

require("core-js/modules/esnext.math.isubh");

require("core-js/modules/esnext.math.rad-per-deg");

require("core-js/modules/esnext.math.radians");

require("core-js/modules/esnext.math.scale");

require("core-js/modules/esnext.math.seeded-prng");

require("core-js/modules/esnext.math.signbit");

require("core-js/modules/esnext.math.umulh");

require("core-js/modules/esnext.number.from-string");

require("core-js/modules/esnext.observable");

require("core-js/modules/esnext.promise.all-settled");

require("core-js/modules/esnext.promise.any");

require("core-js/modules/esnext.promise.try");

require("core-js/modules/esnext.reflect.define-metadata");

require("core-js/modules/esnext.reflect.delete-metadata");

require("core-js/modules/esnext.reflect.get-metadata");

require("core-js/modules/esnext.reflect.get-metadata-keys");

require("core-js/modules/esnext.reflect.get-own-metadata");

require("core-js/modules/esnext.reflect.get-own-metadata-keys");

require("core-js/modules/esnext.reflect.has-metadata");

require("core-js/modules/esnext.reflect.has-own-metadata");

require("core-js/modules/esnext.reflect.metadata");

require("core-js/modules/esnext.set.add-all");

require("core-js/modules/esnext.set.delete-all");

require("core-js/modules/esnext.set.difference");

require("core-js/modules/esnext.set.every");

require("core-js/modules/esnext.set.filter");

require("core-js/modules/esnext.set.find");

require("core-js/modules/esnext.set.from");

require("core-js/modules/esnext.set.intersection");

require("core-js/modules/esnext.set.is-disjoint-from");

require("core-js/modules/esnext.set.is-subset-of");

require("core-js/modules/esnext.set.is-superset-of");

require("core-js/modules/esnext.set.join");

require("core-js/modules/esnext.set.map");

require("core-js/modules/esnext.set.of");

require("core-js/modules/esnext.set.reduce");

require("core-js/modules/esnext.set.some");

require("core-js/modules/esnext.set.symmetric-difference");

require("core-js/modules/esnext.set.union");

require("core-js/modules/esnext.string.at");

require("core-js/modules/esnext.string.code-points");

require("core-js/modules/esnext.string.match-all");

require("core-js/modules/esnext.string.replace-all");

require("core-js/modules/esnext.symbol.dispose");

require("core-js/modules/esnext.symbol.observable");

require("core-js/modules/esnext.symbol.pattern-match");

require("core-js/modules/esnext.weak-map.delete-all");

require("core-js/modules/esnext.weak-map.from");

require("core-js/modules/esnext.weak-map.of");

require("core-js/modules/esnext.weak-set.add-all");

require("core-js/modules/esnext.weak-set.delete-all");

require("core-js/modules/esnext.weak-set.from");

require("core-js/modules/esnext.weak-set.of");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

require("core-js/modules/web.immediate");

require("core-js/modules/web.queue-microtask");

require("core-js/modules/web.url");

require("core-js/modules/web.url.to-json");

require("core-js/modules/web.url-search-params");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//如果用了usage，preset-env会替换以下代码
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

```

可以看到，我们编译过后的代码中添加了很多polyfill。

#### `useBuiltIns: 'usage'`

使用了usage后，preset-env会自动检测代码，如果需要依赖某个插件的时候，preset-env就会直接依赖，不像使用“entry”一样，不管用不用，一股脑全部加载。

我们修改一下配置文件为"usage"：

babel.config.js

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: 'usage',

            }
        ]
    ]
}
```

然后我们重新创建一个demo-usage.js文件用来测试，

src/demo-usage.js：

```js
const fn = () => {};

new Promise(() => {});

class Test {
    say(){}
}

const c = [1, 2, 3].includes(1);
var a = 10;

```

我们运行babel看结果：

```js
npx babel ./src/demo-usage.js -o lib/demo-usage.js
```

lib/demo-usage.js:

```js
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

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

```

可以看到，相比entry，preset-env只帮我们导入了我们需要的插件：

```js
require("core-js/modules/es.array.includes");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");
```

#### `useBuiltIns: false`

默认行为，不会使用polyfill。

### `corejs`

`2`, `3` 或者 `{ version: 2 | 3, proposals: boolean }`, 默认 `2`.

前面说了，`useBuiltIns`设置usage或者entry的时候需要依赖core-js做插件注入，`corejs`是设置corejs的版本号。

我们看一下源码，看preset-env是怎样使用`useBuiltIns`做到buildins插件注入的，

packages/babel-preset-env/src/index.js：

```js
...
export default declare((api, opts) => {
 
  const {
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    loose,
    modules,
    shippedProposals,
    spec,
    targets: optionsTargets,
    useBuiltIns,
    corejs: { version: corejs, proposals },
  } = normalizeOptions(opts);
  	//获取buildins插件
  	const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns,
    corejs,
    polyfillTargets: targets,
    include: include.builtIns,
    exclude: exclude.builtIns,
    proposals,
    shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"),
    debug,
  });
}
```

```js
export const getPolyfillPlugins = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug,
}: {
  useBuiltIns: BuiltInsOption,
  corejs: typeof SemVer | null | false,
  polyfillTargets: Targets,
  include: Set<string>,
  exclude: Set<string>,
  proposals: boolean,
  shippedProposals: boolean,
  regenerator: boolean,
  debug: boolean,
}) => {
  const polyfillPlugins = [];
  //当useBuiltIns设置usage或者entry的时候
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = {
      corejs,
      polyfillTargets,
      include,
      exclude,
      proposals,
      shippedProposals,
      regenerator,
      debug,
    };
    if (corejs) {
      //如果是usage的时候
      if (useBuiltIns === "usage") {
        //corejs的版本为2的时候
        if (corejs.major === 2) {
          //添加addCoreJS2UsagePlugin插件到preset-env的presets
          polyfillPlugins.push([addCoreJS2UsagePlugin, pluginOptions]);
        } else {
           //添加addCoreJS3UsagePlugin插件到preset-env的presets
          polyfillPlugins.push([addCoreJS3UsagePlugin, pluginOptions]);
        }
        //代码中是否有generator语法，有就添加addRegeneratorUsagePlugin插件
        if (regenerator) {
          polyfillPlugins.push([addRegeneratorUsagePlugin, pluginOptions]);
        }
      } else {//如果是entry的时候
        //corejs的版本为2的时候
        if (corejs.major === 2) {
          //添加replaceCoreJS2EntryPlugin插件到preset-env的presets
          polyfillPlugins.push([replaceCoreJS2EntryPlugin, pluginOptions]);
        } else {
           //添加replaceCoreJS3EntryPlugin插件到preset-env的presets
          polyfillPlugins.push([replaceCoreJS3EntryPlugin, pluginOptions]);
          if (!regenerator) {
            polyfillPlugins.push([removeRegeneratorEntryPlugin, pluginOptions]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
};
```

代码中都有注释，getPolyfillPlugins会根据useBuiltIns的配置加载不同的插件，比如我们的配置文件，

babel.config.js：

```js
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: 3,
                useBuiltIns: 'usage',
            }
        ]
    ]
};
```

getPolyfillPlugins方法会走以下代码：

```js
 //添加addCoreJS3UsagePlugin插件到preset-env的presets
          polyfillPlugins.push([addCoreJS3UsagePlugin, pluginOptions]);
```

我们看一下addCoreJS3UsagePlugin是什么，

packages/babel-preset-env/src/polyfills/corejs3/usage-plugin.js：

```js
import corejs3Polyfills from "core-js-compat/data";
import corejs3ShippedProposalsList from "./shipped-proposals";
import getModulesListForTargetVersion from "core-js-compat/get-modules-list-for-target-version";
import filterItems from "../../filter-items";
import {
  BuiltIns,
  StaticProperties,
  InstanceProperties,
  CommonIterators,
  CommonInstanceDependencies,
  PromiseDependencies,
  PossibleGlobalObjects,
} from "./built-in-definitions";
import {
  createImport,
  getType,
  has,
  intersection,
  isPolyfillSource,
  getImportSource,
  getRequireSource,
  isNamespaced,
} from "../../utils";
import { logUsagePolyfills } from "../../debug";

import type { InternalPluginOptions } from "../../types";
import type { NodePath } from "@babel/traverse";

const NO_DIRECT_POLYFILL_IMPORT = `
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the direct import of \`core-js\` or use \`useBuiltIns: 'entry'\` instead.`;

const corejs3PolyfillsWithoutProposals = Object.keys(corejs3Polyfills)
  .filter(name => !name.startsWith("esnext."))
  .reduce((memo, key) => {
    memo[key] = corejs3Polyfills[key];
    return memo;
  }, {});

const corejs3PolyfillsWithShippedProposals = corejs3ShippedProposalsList.reduce(
  (memo, key) => {
    memo[key] = corejs3Polyfills[key];
    return memo;
  },
  { ...corejs3PolyfillsWithoutProposals },
);

export default function(
  _: any,
  {
    corejs,
    include,
    exclude,
    polyfillTargets,
    proposals,
    shippedProposals,
    debug,
  }: InternalPluginOptions,
) {
  const polyfills = filterItems(
    proposals
      ? corejs3Polyfills
      : shippedProposals
      ? corejs3PolyfillsWithShippedProposals
      : corejs3PolyfillsWithoutProposals,
    include,
    exclude,
    polyfillTargets,
    null,
  );
	...
}
```

我们看到，首先是获取所有的polyfills，我们顺便把`corejs`的proposal参数跟`shippedProposals`参数一起讲了，

### `corejs`（proposal）& `shippedProposals`

我们可以看到代码：

```js
const polyfills = filterItems(
    proposals
      ? corejs3Polyfills
      : shippedProposals
      ? corejs3PolyfillsWithShippedProposals
      : corejs3PolyfillsWithoutProposals,
    include,
    exclude,
    polyfillTargets,
    null,
  );
```

proposals默认为false，我们demo中也是默认设置false，所以会走：

```js
shippedProposals
      ? corejs3PolyfillsWithShippedProposals
      : corejs3PolyfillsWithoutProposals
```

我们demo中shippedProposals也是false，所以直接返回一个corejs3PolyfillsWithoutProposals数组，我们看一下corejs3PolyfillsWithoutProposals，

packages/babel-preset-env/src/polyfills/corejs3/usage-plugin.js：

```js
const corejs3PolyfillsWithoutProposals = Object.keys(corejs3Polyfills)
  .filter(name => !name.startsWith("esnext."))
  .reduce((memo, key) => {
    memo[key] = corejs3Polyfills[key];
    return memo;
  }, {});
```

会遍历corejs3Polyfills集合，然后过滤掉“esnext.”打头的插件，

```js
import corejs3Polyfills from "core-js-compat/data";
```

node_modules/core-js-compat/data.json:

```js
{
  ...
  "es.promise": {
    "chrome": "67",
    "edge": "74",
    "electron": "4.0",
    "firefox": "69",
    "ios": "11.0",
    "node": "10.4",
    "opera": "54",
    "opera_mobile": "48",
    "safari": "11.0",
    "samsung": "9.0"
  }
  ...
}
```

内容有点多，我就只截取了一个，比如我们的promise，那如果设置了proposals为true的话，会直接使用corejs3Polyfills集合，如果proposals为false并且shippedProposals为true的时候，polyfills返回的就是corejs3PolyfillsWithShippedProposals集合，corejs3PolyfillsWithShippedProposals集合是corejs3PolyfillsWithoutProposals跟corejs3ShippedProposalsList集合的并集，

```js
const corejs3PolyfillsWithShippedProposals = corejs3ShippedProposalsList.reduce(
  (memo, key) => {
    memo[key] = corejs3Polyfills[key];
    return memo;
  },
  { ...corejs3PolyfillsWithoutProposals },
);
```

那么corejs3ShippedProposalsList里面默认有哪些插件呢？

packages/babel-preset-env/src/polyfills/corejs3/shipped-proposals.js：

```js
// @flow

export default (["esnext.global-this", "esnext.string.match-all"]: string[]);

```

其实就两个，一个是global对象，还有一个就是string的matchAll方法.所以只有当corejs的proposals的时候这里的`shippedProposals`配置才会起作用。

我们已经根据浏览器配置和corejs的参数还有`shippedProposals`参数获取到了我们当前环境所需要的所有插件，那么当使用usage的时候，usage-plugin.js是怎样根据代码加载对应的插件的呢？

比如我们demo-usage.js代码中的：

```js
new Promise(() => {});
```

也就是说当usage-plugin插件加载到Promise的时候，这个时候就需要判断当前环境是不是需要添"Promise"的polyfill了

packages/babel-preset-env/src/polyfills/corejs3/usage-plugin.js：

```js
   // Symbol(), new Promise
    ReferencedIdentifier({ node: { name }, scope }: NodePath) {
      if (scope.getBindingIdentifier(name)) return;

      this.addBuiltInDependencies(name);
    },
```

代码中添加了ast节点钩子函数，也就是当读到new Promise(() => {});的时候会触发这个钩子函数，name就是Promise,然后会调用addBuiltInDependencies方法：

```js
 this.addBuiltInDependencies = function(builtIn) {
   	//判断BuiltIns集合中有没有“Promise”
        if (has(BuiltIns, builtIn)) {
          //有的话就去BuiltIns中获取“Promise”
          const BuiltInDependencies = BuiltIns[builtIn];
          this.addUnsupported(BuiltInDependencies);
        }
      };

```

我们看一下BuiltIns集合，

```js
export const BuiltIns: ObjectMap<string[]> = {
  AggregateError: ["esnext.aggregate-error", ...CommonIterators],
  ArrayBuffer: [
    "es.array-buffer.constructor",
    "es.array-buffer.slice",
    "es.object.to-string",
  ],
  DataView: ["es.data-view", "es.array-buffer.slice", "es.object.to-string"],
  Date: ["es.date.to-string"],
  Float32Array: ["es.typed-array.float32-array", ...TypedArrayDependencies],
  Float64Array: ["es.typed-array.float64-array", ...TypedArrayDependencies],
  Int8Array: ["es.typed-array.int8-array", ...TypedArrayDependencies],
  Int16Array: ["es.typed-array.int16-array", ...TypedArrayDependencies],
  Int32Array: ["es.typed-array.int32-array", ...TypedArrayDependencies],
  Uint8Array: ["es.typed-array.uint8-array", ...TypedArrayDependencies],
  Uint8ClampedArray: [
    "es.typed-array.uint8-clamped-array",
    ...TypedArrayDependencies,
  ],
  Uint16Array: ["es.typed-array.uint16-array", ...TypedArrayDependencies],
  Uint32Array: ["es.typed-array.uint32-array", ...TypedArrayDependencies],
  Map: MapDependencies,
  Number: ["es.number.constructor"],
  Observable: [
    "esnext.observable",
    "esnext.symbol.observable",
    "es.object.to-string",
    ...CommonIteratorsWithTag,
  ],
  Promise: PromiseDependencies,
  RegExp: ["es.regexp.constructor", "es.regexp.exec", "es.regexp.to-string"],
  Set: SetDependencies,
  Symbol: SymbolDependencies,
  URL: ["web.url", ...URLSearchParamsDependencies],
  URLSearchParams: URLSearchParamsDependencies,
  WeakMap: WeakMapDependencies,
  WeakSet: WeakSetDependencies,
  clearImmediate: ["web.immediate"],
  compositeKey: ["esnext.composite-key"],
  compositeSymbol: ["esnext.composite-symbol", ...SymbolDependencies],
  fetch: PromiseDependencies,
  globalThis: ["esnext.global-this"],
  parseFloat: ["es.parse-float"],
  parseInt: ["es.parse-int"],
  queueMicrotask: ["web.queue-microtask"],
  setTimeout: ["web.timers"],
  setInterval: ["web.timers"],
  setImmediate: ["web.immediate"],
};
```

我们找到Promise:

```js
export const PromiseDependencies = ["es.promise", "es.object.to-string"];
export const BuiltIns: ObjectMap<string[]> = {
  ...
	Promise: PromiseDependencies,
  ...
}
```

可以看到，Promise依赖了两个插件：“es.promise”跟“es.object.to-string”，就是这样我们的demo-usage.js编译完毕后会自动导入这两个插件：

lib/demo-usage.js

```js
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

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

```

useBuildIns的entry我就不带着看源码了，跟usage差不多，也就是当遍历到“import corejs”节点的时候使用corejs3Polyfills替换掉它，小伙伴自己去看源码哦。

### `configPath`

告诉preset-env从哪里开始寻找browserslist的配置，一直往上一级递归直到找到配置文件，默认是根目录。

### `ignoreBrowserslistConfig`

是否禁止寻找 [browserslist](https://github.com/ai/browserslist#queries)配置文件，默认是false

OK～ 我们用了一篇很长的文章介绍了babel的preset-env，是真的很长啊，有些地方可能不太好理解，因为源码实在是太多了，我也没法把所有的源码都贴过来，小伙伴一定要结合文章demo然后去看源码，相信我，你会有不一样的收获的，下节我们介绍babel-plugin-transfrom-runtime跟babel-runtime，然后对比preset-env，大家敬请期待！！

demo源码](https://github.com/913453448/babel-demo.git)

