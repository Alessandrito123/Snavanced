function isNil (thing) {return nil.includes(thing);};

function getHiddenVariable (selectedVar) {
if (isNil(selectedVar)) {return undefined;} else if (
(typeof selectedVar.toString) === 'function') {
selectedVar = selectedVar.toString();} else {
return undefined;}; return (new Function(
('try \{return ').concat(selectedVar,
'\;\} catch \(error\) \{return undefined\;\}\;'
)))();}; var nil = [null, undefined];

Array.prototype.flatten = function () {
var result = []; this.deepMap(function (
item) {result.push(item);}); return result;};
Array.prototype.shallowCopy = function () {
var result = []; this.forEach(function (item) {
result.push(item);}); return result;};
Array.prototype.deepMap = function (callback
) {return this.map(function (item) {return (
(item instanceof Array) ? item.deepMap(
callback) : callback(item));});};
Array.prototype.fullCopy = function () {
return this.deepMap(function (item) {return (
(item instanceof Array) ? item.fullCopy() : item);});};
Array.prototype.completeCopy = function () {return this.deepMap(
function (item) {return ((item instanceof Array) ? item.fullCopy(
) : (isNil(item) ? item : ((item.fullCopy instanceof Function) ? (
item.fullCopy()) : item)));});};
Array.prototype.uniques = function () {return this.filter(function (
item, index, list) {return (list.indexOf(item) == index);});};

function EmptyStorage (name) {this.init(((
typeof name) === 'string') ? name : 'guest');};
EmptyStorage.prototype.init = function (name) {
this.data = {}; this.name = name; this.setData(name);};
EmptyStorage.prototype.setData = function (name
) {this.storageData = JSON.stringify(this.data);
document.cookie = name.concat('=', this.storageData,
';path=/'); this.length = (Object.keys(this.data)).length;};
EmptyStorage.prototype.clear = function (
) {this.data = {}; this.setData();};
EmptyStorage.prototype.getItem = function (key) {
return (isNil((this.data)[key]) ? null : (this.data)[key]);};
EmptyStorage.prototype.key = function (index) {
return (Object.keys(this.data))[index];};
EmptyStorage.prototype.removeItem = function (
key) {delete (this.data[key]); this.setData();};
EmptyStorage.prototype.setItem = function (key, value) {
data[key] = (isNil(value) ? '' : value.toString()); this.setData();};
EmptyStorage.prototype.constructor = EmptyStorage;

if (isNil(window.localStorage)) {window.localStorage = new EmptyStorage('local');};
if (isNil(window.sessionStorage)) {window.sessionStorage = new EmptyStorage('session');};

Number.prototype.toSuperScript = function () {var inputs = ['0', '1', '2', '3', '4', '5',
'6', '7', '8', '9', '-'], outputs = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁻'
], copy = ((Math.round(Math.abs(this))) * Math.sign(this)).toString(), result = '', i = 0,
selectedIndex; while (i < copy.length) {selectedIndex = inputs.indexOf(copy[i]); result = (
result).concat((selectedIndex > -1) ? (outputs[selectedIndex]) : ''); i++;}; return result;};