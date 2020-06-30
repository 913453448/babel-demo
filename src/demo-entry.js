//如果用了usage，preset-env会替换以下代码
import "@babel/polyfill";
const fn = () => {};

new Promise(() => {});

class Test {
    say(){}
}

const c = [1, 2, 3].includes(1);
var a = 10;
