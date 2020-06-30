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