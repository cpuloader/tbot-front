const fs = require('fs');
var glob = require('glob');

const prodJsPath = '../../backend/staticfiles/main/';
const prodCssPath = '../../backend/staticfiles/css/';

const distPath = './dist/ng-tbot/';


console.log('Collect and rename generated files:');
var mainjs = glob.sync(distPath + 'main\.+([a-z0-9]).js')[0];
console.log('Found main.js:', mainjs);
mainjs = mainjs.slice(distPath.length, mainjs.length);

var runtimejs = glob.sync(distPath + 'runtime\.+([a-z0-9]).js')[0];
console.log('Found runtime.js:', runtimejs);
runtimejs = runtimejs.slice(distPath.length, runtimejs.length);

var polyfillsjs = glob.sync(distPath + 'polyfills\.+([a-z0-9]).js')[0];
console.log('Found polyfills.js:', polyfillsjs);
polyfillsjs = polyfillsjs.slice(distPath.length, polyfillsjs.length);

var styles = glob.sync(distPath + 'styles\.+([a-z0-9]).css')[0];
console.log('Found styles.js:', styles);
styles = styles.slice(distPath.length, styles.length);


console.log('Deleting old files...');
var oldJsFiles = glob.sync(prodJsPath + '*.js');
for (let file of oldJsFiles) {
  fs.unlinkSync(file);
}
var oldCssFiles = glob.sync(prodCssPath + '*.css');
for (let file of oldCssFiles) {
  fs.unlinkSync(file);
}

console.log('Copy and rename generated files:');
fs.copyFileSync(distPath + mainjs, prodJsPath + mainjs);
mainjs = glob.sync(prodJsPath + 'main\.+([a-z0-9]).js')[0];
var new_mainjs = mainjs.slice(0, mainjs.length-24) + '.js';
fs.renameSync(mainjs, new_mainjs);
console.log('New main.js:', new_mainjs);

fs.copyFileSync(distPath + runtimejs, prodJsPath + runtimejs);
runtimejs = glob.sync(prodJsPath + 'runtime\.+([a-z0-9]).js')[0];
var new_runtimejs = runtimejs.slice(0, runtimejs.length-24) + '.js';
fs.renameSync(runtimejs, new_runtimejs);
console.log('New main.js:', new_runtimejs);

fs.copyFileSync(distPath + polyfillsjs, prodJsPath + polyfillsjs);
polyfillsjs = glob.sync(prodJsPath + 'polyfills\.+([a-z0-9]).js')[0];
var new_polyfillsjs = polyfillsjs.slice(0, polyfillsjs.length-24) + '.js';
fs.renameSync(polyfillsjs, new_polyfillsjs);
console.log('New polyfills.js:', new_polyfillsjs);

fs.copyFileSync(distPath + styles, prodCssPath + styles);
styles = glob.sync(prodCssPath + 'styles\.+([a-z0-9]).css')[0];
var new_styles = styles.slice(0, styles.length-25) + '.css';
fs.renameSync(styles, new_styles);
console.log('New styles.css:', new_styles);

console.log('Finished!');
