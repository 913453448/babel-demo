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

@babel/preset-env包含了一些基本es语法转换的插件（箭头函数、类转换等等），同时还支持polyfill，有usage跟entry模式，但是preset-env添加polyfill会像之前使用@babel/polyfill一样，会污染全局变量。

@babel/plugin-transform-runtime主要是利用@babel/runtime提取了一些公共的babel帮助函数，同时也支持polyfill的添加，添加的polyfill都是以一个局部变量的形式引入，不会污染全局变量。

如果你做的是一个二方库，然后需要被别人依赖，那么建议使用@babel/plugin-transform-runtime来引入polyfill，因为你要尽可能的专注于做自己的事，而不是说去影响别人，语法转换可以使用preset-env预设，比如以下配置：

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

如果你做的是一个普通的业务项目的话，可以用preset-env来转换语法和polyfill，然后再利用@babel/plugin-transform-runtime来引入helpers跟generator做到代码重复利用，比如以下配置：

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
    ],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: false,
                helpers: true,
                useESModules: false,
                regenerator: true,
                absoluteRuntime: "./node_modules"
            }
        ]
    ]
};
```

小伙伴思维也不要被某种方式定死，还是要根据自己项目需要灵活配置，找到自己项目最好的就可以了，说白了不管是runtime还是preset-env还是之前的@babel/polyfill，掌握原理后随意搭配都是可以的，比如我们接下来看一下vue-cli4.1.1中是怎么对babel配置的。

## @vue/cli-service@^4.1.1

大家可以安装一下@vue/cli-service@^4.1.1：

```js
npm install -D @vue/cli-service@^4.1.1
```

然后我们找到vue-cli中对babel的配置文件，

node_modules/@vue/babel-preset-app/index.js：

```js
const path = require('path')

const defaultPolyfills = [
  // promise polyfill alone doesn't work in IE,
  // needs this as well. see: #1642
  'es.array.iterator',
  // this is required for webpack code splitting, vuex etc.
  'es.promise',
  // this is needed for object rest spread support in templates
  // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
  'es.object.assign',
  // #2012 es6.promise replaces native Promise in FF and causes missing finally
  'es.promise.finally'
]

function getPolyfills (targets, includes, { ignoreBrowserslistConfig, configPath }) {
  const getTargets = require('@babel/helper-compilation-targets').default
  const builtInTargets = getTargets(targets, { ignoreBrowserslistConfig, configPath })

  // if no targets specified, include all default polyfills
  if (!targets && !Object.keys(builtInTargets).length) {
    return includes
  }

  const { list } = require('core-js-compat')({ targets: builtInTargets })
  return includes.filter(item => list.includes(item))
}

module.exports = (context, options = {}) => {
  const presets = []
  const plugins = []
  const defaultEntryFiles = JSON.parse(process.env.VUE_CLI_ENTRY_FILES || '[]')

  // Though in the vue-cli repo, we only use the two envrionment variables
  // for tests, users may have relied on them for some features,
  // dropping them may break some projects.
  // So in the following blocks we don't directly test the `NODE_ENV`.
  // Rather, we turn it into the two commonly used feature flags.
  if (process.env.NODE_ENV === 'test') {
    // Both Jest & Mocha set NODE_ENV to 'test'.
    // And both requires the `node` target.
    process.env.VUE_CLI_BABEL_TARGET_NODE = 'true'
    // Jest runs without bundling so it needs this.
    // With the node target, tree shaking is not a necessity,
    // so we set it for maximum compatibility.
    process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = 'true'
  }

  // JSX
  if (options.jsx !== false) {
    presets.push([require('@vue/babel-preset-jsx'), typeof options.jsx === 'object' ? options.jsx : {}])
  }

  const runtimePath = path.dirname(require.resolve('@babel/runtime/package.json'))
  const runtimeVersion = require('@babel/runtime/package.json').version
  const {
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    bugfixes = true,
    targets: rawTargets,
    spec,
    ignoreBrowserslistConfig = !!process.env.VUE_CLI_MODERN_BUILD,
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy,
    // entry file list
    entryFiles = defaultEntryFiles,

    // Undocumented option of @babel/plugin-transform-runtime.
    // When enabled, an absolute path is used when importing a runtime helper after transforming.
    // This ensures the transpiled file always use the runtime version required in this package.
    // However, this may cause hash inconsistency if the project is moved to another directory.
    // So here we allow user to explicit disable this option if hash consistency is a requirement
    // and the runtime version is sure to be correct.
    absoluteRuntime = runtimePath,

    // https://babeljs.io/docs/en/babel-plugin-transform-runtime#version
    // By default transform-runtime assumes that @babel/runtime@7.0.0-beta.0 is installed, which means helpers introduced later than 7.0.0-beta.0 will be inlined instead of imported.
    // See https://github.com/babel/babel/issues/10261
    // And https://github.com/facebook/docusaurus/pull/2111
    version = runtimeVersion
  } = options

  // resolve targets
  let targets
  if (process.env.VUE_CLI_BABEL_TARGET_NODE) {
    // running tests in Node.js
    targets = { node: 'current' }
  } else if (process.env.VUE_CLI_BUILD_TARGET === 'wc' || process.env.VUE_CLI_BUILD_TARGET === 'wc-async') {
    // targeting browsers that at least support ES2015 classes
    // https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/plugins.json#L52-L61
    targets = {
      browsers: [
        'Chrome >= 49',
        'Firefox >= 45',
        'Safari >= 10',
        'Edge >= 13',
        'iOS >= 10',
        'Electron >= 0.36'
      ]
    }
  } else if (process.env.VUE_CLI_MODERN_BUILD) {
    // targeting browsers that support <script type="module">
    targets = { esmodules: true }
  } else {
    targets = rawTargets
  }

  // included-by-default polyfills. These are common polyfills that 3rd party
  // dependencies may rely on (e.g. Vuex relies on Promise), but since with
  // useBuiltIns: 'usage' we won't be running Babel on these deps, they need to
  // be force-included.
  let polyfills
  const buildTarget = process.env.VUE_CLI_BUILD_TARGET || 'app'
  if (
    buildTarget === 'app' &&
    useBuiltIns === 'usage' &&
    !process.env.VUE_CLI_BABEL_TARGET_NODE &&
    !process.env.VUE_CLI_MODERN_BUILD
  ) {
    polyfills = getPolyfills(targets, userPolyfills || defaultPolyfills, {
      ignoreBrowserslistConfig,
      configPath
    })
    plugins.push([
      require('./polyfillsPlugin'),
      { polyfills, entryFiles, useAbsolutePath: !!absoluteRuntime }
    ])
  } else {
    polyfills = []
  }

  const envOptions = {
    bugfixes,
    corejs: useBuiltIns ? 3 : false,
    spec,
    loose,
    debug,
    modules,
    targets,
    useBuiltIns,
    ignoreBrowserslistConfig,
    configPath,
    include,
    exclude: polyfills.concat(exclude || []),
    shippedProposals,
    forceAllTransforms
  }

  // cli-plugin-jest sets this to true because Jest runs without bundling
  if (process.env.VUE_CLI_BABEL_TRANSPILE_MODULES) {
    envOptions.modules = 'commonjs'
    if (process.env.VUE_CLI_BABEL_TARGET_NODE) {
      // necessary for dynamic import to work in tests
      plugins.push(require('babel-plugin-dynamic-import-node'))
    }
  }

  // pass options along to babel-preset-env
  presets.unshift([require('@babel/preset-env'), envOptions])

  // additional <= stage-3 plugins
  // Babel 7 is removing stage presets altogether because people are using
  // too many unstable proposals. Let's be conservative in the defaults here.
  plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    }],
    [require('@babel/plugin-proposal-class-properties'), { loose }]
  )

  // transform runtime, but only for helpers
  plugins.push([require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',

    // polyfills are injected by preset-env & polyfillsPlugin, so no need to add them again
    corejs: false,

    helpers: useBuiltIns === 'usage',
    useESModules: !process.env.VUE_CLI_BABEL_TRANSPILE_MODULES,

    absoluteRuntime,

    version
  }])

  return {
    sourceType: 'unambiguous',
    overrides: [{
      exclude: [/@babel[\/|\\\\]runtime/, /core-js/],
      presets,
      plugins
    }, {
      // there are some untranspiled code in @babel/runtime
      // https://github.com/babel/babel/issues/9903
      include: [/@babel[\/|\\\\]runtime/],
      presets: [
        [require('@babel/preset-env'), {
          useBuiltIns,
          corejs: useBuiltIns ? 3 : false
        }]
      ]
    }]
  }
}

// a special flag to tell @vue/cli-plugin-babel to include @babel/runtime for transpilation
// otherwise the above `include` option won't take effect
process.env.VUE_CLI_TRANSPILE_BABEL_RUNTIME = true

```

如果小伙伴读过我们前面的文章的话，看这个配置应该没有一点问题的，我大概说一下里面的一些配置，

vue-cli在babel的配置中用到了preset-env和runtime，

preset-env的配置：

```js
...
 const {
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    bugfixes = true,
    targets: rawTargets,
    spec,
    ignoreBrowserslistConfig = !!process.env.VUE_CLI_MODERN_BUILD,
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy,
    // entry file list
    entryFiles = defaultEntryFiles,
      ...
const envOptions = {
    bugfixes,
    corejs: useBuiltIns ? 3 : false,
    spec,
    loose,
    debug,
    modules,
    targets,
    useBuiltIns,
    ignoreBrowserslistConfig,
    configPath,
    include,
    exclude: polyfills.concat(exclude || []),
    shippedProposals,
    forceAllTransforms
  }
presets.unshift([require('@babel/preset-env'), envOptions])
  ...
  
```

可以看到，默认useBuiltIns配置是“usage”，其它的也就没什么了，

我们继续看一下runtime的配置：

```js
 // transform runtime, but only for helpers
  plugins.push([require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',

    // polyfills are injected by preset-env & polyfillsPlugin, so no need to add them again
    corejs: false,

    helpers: useBuiltIns === 'usage',
    useESModules: !process.env.VUE_CLI_BABEL_TRANSPILE_MODULES,

    absoluteRuntime,

    version
  }])
```

可以看到，作为一个业务性项目，vue直接是禁掉了runtime的corejs功能，然后当useBuiltIns不为“usage”的时候开启regenerator属性，当useBuiltIns为“usage”的时候打开了helpers函数。

vue除了用了preset-env跟runtime外还默认添加了一些插件，比如：

```js
 plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    }],
    [require('@babel/plugin-proposal-class-properties'), { loose }]
  )
```

主要是为了支持装饰器、动态import、类属性功能，另外就是这几个插件太不稳定了，怕有些人不会配置或者版本号配置有问题引发的问题，所以vue干脆直接定死了这几个不太稳定又常用的插件。



ok！我们用四篇文章来介绍了babel，光看完就已经很费劲了，真佩服这些大牛是怎么写出来的😂，开源不易，写文章也不易，觉得写得不错的也点点赞或者推荐推荐，同时也欢迎志同道合的小伙伴一起学习一起交流。

