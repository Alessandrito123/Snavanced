function canGetTheStringOf (thing) {return (isNil(thing) ? false : ((typeof thing.toString) === 'function'));
}; function applyingToExecuteOrToAcess (thing, that, args) {if (isNil(args)) {args = [];}; if (!isNil(thing)) {
thing = (canGetTheStringOf(thing) ? that[thing.toString()] : undefined);}; return (isNil(thing) ? undefined : (
((typeof thing) === 'function') ? thing.apply(that, args) : thing));}; function isNil (thing) {return nil.includes(
thing);}; function getHiddenVariable (selectedVar) {if (isNil(selectedVar)) {return undefined;} else if ((typeof (
selectedVar).toString) === 'function') {selectedVar = selectedVar.toString();} else {return undefined;}; return (
new Function(('try \{return ').concat(selectedVar, '\;\} catch \(error\) \{return undefined\;\}\;')))();}; var nil = [
null, undefined]; var _globalThis = this; if (!isNil(getHiddenVariable('globalThis'))) {_globalThis = globalThis;};

Number.prototype.infinities = ['Infinity', '-Infinity']; Number.isADigit = function (char) {return (Number.prototype
).originalDigits.includes(char);}; Number.containsNumbers = function (text) {return (text.split('')).some((Number
).isADigit);}; Number.isSecureForNumbers = function (text) {return (Number.prototype.infinities.includes(text) || (
text.split('')).every(Number.isADigit));}; Number.prototype.superScriptDigits = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶',
'⁷', '⁸', '⁹', '⁻']; Number.prototype.originalDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '.'];
Number.prototype.toSuperScript = function () {var copy = ((Math.round(Math.abs(this))) * Math.sign(this)).toString(),
result = '', i = 0, selectedIndex; while (i < copy.length) {selectedIndex = Number.prototype.originalDigits.indexOf(
copy[i]); result = result.concat((selectedIndex > -1) ? Number.prototype.superScriptDigits[selectedIndex] : ''); i++;
}; return result;};

Array.prototype.deepMap = function (callback) {return this.map(function (item, index, list) {
return (Array.isArray(item) ? item.deepMap(callback) : callback(item, index, list));});}; (Array
).prototype.flatten = function () {var result = []; this.deepMap(function (item) {result.push(
item);}); return result;}; Array.prototype.shallowCopy = function () {var result = []; (this
).forEach(function (item) {result.push(item);}); return result;}; Array.prototype.fullCopy = (
function () {return this.deepMap(function (item) {return (Array.isArray(item) ? item.fullCopy(
) : item);});}); Array.prototype.uniques = function () {return this.filter(function (item, index,
list) {return (list.indexOf(item) == index);});}; Array.prototype.completeCopy = function () {
return this.deepMap(function (item) {return (Array.isArray(item) ? item.fullCopy() : (isNil(
item) ? item : ((item.fullCopy instanceof Function) ? (item.fullCopy()) : item)));});};

function EmptyStorage (name) {if (this instanceof EmptyStorage) {this.init(((typeof (name)) === 'string') ? name : (
'guest')); return this;} else {return new EmptyStorage(name);};}; EmptyStorage.prototype.init = function (name) {(this
).data = {}; this.name = name; this.setData(name);}; EmptyStorage.prototype.setData = function (name) {(this.storageData
) = JSON.stringify(this.data); document.cookie = name.concat('=', this.storageData, ';path=/'); this.length = (Object.keys(
this.data)).length;}; EmptyStorage.prototype.clear = function () {this.data = {}; this.setData();}; (EmptyStorage.prototype
).getItem = function (key) {return (isNil((this.data)[key]) ? null : (this.data)[key]);}; EmptyStorage.prototype.key = (
function (index) {return (Object.keys(this.data))[index];}); EmptyStorage.prototype.removeItem = function (key) {delete (
this.data[key]); this.setData();}; EmptyStorage.prototype.setItem = function (key, value) {data[key] = (isNil(value) ? (
'') : value.toString()); this.setData();}; if (isNil(window.localStorage)) {window.localStorage = new EmptyStorage('local'
);}; if (isNil(window.sessionStorage)) {window.sessionStorage = new EmptyStorage('session');};

function DynamicTimer () {if (this instanceof DynamicTimer) {this.stopNow();
return this;} else {return new DynamicTimer;};}; DynamicTimer.prototype.startNow = function () {this.stopNow();
this.resumeNow();}; DynamicTimer.prototype.pauseNow = function () {if (this.state === 'running') {(this.pauseTime
) = Date.now(); this.state = 'paused';};}; DynamicTimer.prototype.resumeNow = function () {if (this.state === (
'paused')) {this.resumeTime = ((Date.now() - this.pauseTime) + this.resumeTime); this.state = 'running';};};
DynamicTimer.prototype.stopNow = function () {this.startTime = Date.now(); this.pauseTime = this.startTime; (this
).resumeTime = this.pauseTime; this.state = 'paused';}; DynamicTimer.prototype.getTime = function () {if ((this
).state === 'paused') {var result = (this.pauseTime - this.resumeTime);} else {var result = (Date.now() - (this
).resumeTime);}; return result;}; DynamicTimer.prototype.toString = function () {return ('DynamicTimer\(').concat((this.getTime() / 1000), '\)');};

DynamicTimer.prototype.toCronoString = function (optionalNumber) {if (isNil(optionalNumber)) {var currentTime = this.getTime() / 1000;} else {
var currentTime = +optionalNumber;}; return ''.concat(((((currentTime / 3600) % 24) < 10) ? '0' : ''), Math.trunc((currentTime / 3600) % 24).toString(),
'H ', ((((currentTime / 60) % 60) < 10) ? '0' : ''), Math.trunc((currentTime / 60) % 60).toString(), 'M ', (((currentTime % 60) < 10) ? '0' : ''),
Math.trunc(currentTime % 60).toString(), 'S ', ((((currentTime * 1000) % 1000) < 100) ? '0' : ''), ((((currentTime * 1000) % 1000) < 10) ? '0' : ''),
Math.trunc((currentTime * 1000) % 1000).toString(), 'MS' );}; /* Optional, but the numbers are now written with text to be complex like a real timer. */

function LinkedPair (head, tail
) {if (this instanceof LinkedPair) {this.tailLength = 0; this.super = undefined; this.head = head; if (isNil(
tail)) {this.tail = undefined;} else if (tail instanceof LinkedPair) {this.setTailTo(tail);} else {(this.tail
) = undefined;};} else {return new LinkedPair(head, tail);};};
LinkedPair.prototype.getItems = function (starter) {if (isNil(starter)) {starter = [];} else {if (!((Array
).isArray(starter))) {starter = [];};}; if (isNil(this.tail)) {if (!(this.head === undefined)) {(starter
).push(this.head);}; return starter;} else {starter.push(this.head); return this.tail.getItems(starter);
};}; LinkedPair.prototype.isEmpty = function () {return ((this.head === undefined) && isNil(this.tail));
}; LinkedPair.prototype.length = function () {return ((this.tailLength + 1) - (this.head === undefined));
}; LinkedPair.prototype.itemFromPlace = function (index) {index = Math.floor(index); if (this.isEmpty()) {
return null;} else {if (Math.abs(index) > this.length()) {return null;} else if (index < 0) {return (this
).itemFromPlace(this.length() + index + 1);} else if (index === 1) {return this.head;} else if (index > 1) {
return this.tail.itemFromPlace(index - 1);} else {return null;};};}; (LinkedPair.prototype.superLengthChange
) = function (increment) {increment = Math.floor(increment); this.tailLength += increment; if (!isNil((this
).super)) {this.super.superLengthChange(increment);};}; /* A "LinkedPair" object's "super" limit is up to 1. */
LinkedPair.prototype.getFirstIndexOf = function (item) {if (isNil(item)) {item = null;}; return (isNil((this
).tail) ? ((this.head === undefined) ? 0 : +(this.head === item)) : this.getFirstIndexOfHelper(item, 1));};
LinkedPair.prototype.getFirstIndexOfHelper = function (item, index) {if (isNil(this.tail)) {return (((this
).head === item) ? index : 0);} else {return ((this.head === item) ? index : this.tail.getFirstIndexOfHelper(
item, (index + 1)));};}; LinkedPair.prototype.setSuperTo = function (newSuper) {var oldSuper = this.super; if (
!isNil(oldSuper)) {oldSuper.superLengthChange(-(this.tailLength + 1)); oldSuper.tail = undefined;}; (this.super
) = newSuper; if (!isNil(this.super)) {this.super.superLengthChange((this.tailLength - newSuper.tailLength
) + 1); newSuper.tail = this;}; return this;}; LinkedPair.prototype.setTailTo = function (newTail) {var pass,
oldTail = this.tail; if (isNil(newTail)) {pass = false;} else {pass = (newTail instanceof LinkedPair);}; if (
pass) {if (newTail.head === undefined) {newTail.head = null;}; if (this.head === undefined) {this.head = (
null);}; newTail.setSuperTo(this);} else {this.superLengthChange(-(oldTail.tailLength + 1)); oldTail.super = (
undefined); this.tail = undefined;}; return this;}; LinkedPair.prototype.addItem = function (item, origin) {
if (isNil(origin)) {origin = this;} else if (!(origin instanceof LinkedPair)) {origin = this;}; if (isNil(
this.tail)) {if (this.head === undefined) {this.head = item;} else {if (isNil(item)) {item = null;}; (this
).setTailTo(LinkedPair(item));}; return origin;} else {return this.tail.addItem(item, origin);};}; (LinkedPair
).prototype.deleteIndex = function (index) {index = Math.floor(index); if ((index > 1) && !(index > (this
).length())) {return this.deleteIndexHelper(index, this);} else if (index === 1) {var selectedTail = (this
).tail; if (isNil(selectedTail)) {this.head = undefined;} else {this.head = selectedTail.head; this.setTailTo(
selectedTail.tail);};}; return this;}; LinkedPair.prototype.deleteIndexHelper = function (index, origin) {
if (index > 1) {return this.tail.deleteIndexHelper((index - 1), origin);} else {if (isNil(this.tail)) {(this
).setSuperTo();} else {var selectedTail = this.tail; selectedTail.setSuperTo(this.super);}; return origin;};};
LinkedPair.prototype.insertIndexWithItem = function (index, item) {index = Math.floor(index); if ((index > 0
) && !(index > this.length())) {return this.insertIndexWithItemHelper(index, item, this);} else if (index === (
this.length() + 1)) {this.addItem(item);}; return this;}; LinkedPair.prototype.insertIndexWithItemHelper = (
function (index, item, origin) {if (index > 1) {return this.tail.insertIndexWithItemHelper((index - 1), item,
origin);} else {this.setTailTo(this.deepMap()); this.head = (isNil(item) ? null : item); return origin;};});
LinkedPair.prototype.replaceIndexWithItemHelper = function (index, item, origin) {if (index > 1) {return (this
).tail.replaceIndexWithItemHelper((index - 1), item, origin);} else {this.head = (isNil(item) ? null : item);
return origin;};}; LinkedPair.prototype.replaceIndexWithItem = function (index, item) {index = Math.floor(index
); if ((index > 1) && !(index > this.length())) {return this.replaceIndexWithItemHelper(index, item, this);
} else if (index === 1) {this.head = (isNil(item) ? null : item);}; return this;}; (LinkedPair.prototype
).swapIndexes = function (index1, index2) {var item1 = this.itemFromPlace(index1), item2 = this.itemFromPlace(
index2); this.replaceIndexWithItem(index1, item2); this.replaceIndexWithItem(index2, item1); return this;};
LinkedPair.prototype.reverseOrder = function () {if (isNil(this.tail)) {if (!(this.head === undefined)) {
return LinkedPair(this.head);}; return LinkedPair();} else {return this.reverseOrderHelper();};}; (LinkedPair
).prototype.reverseOrderHelper = function (origin) {if (isNil(origin)) {origin = LinkedPair(); if (isNil(
this.tail)) {return LinkedPair(this.head, origin);} else {origin = LinkedPair(this.head); return (this.tail
).reverseOrderHelper(origin);};} else {if (isNil(this.tail)) {return LinkedPair(this.head, origin);} else {
origin = LinkedPair(this.head, origin); return this.tail.reverseOrderHelper(origin);};};}; (LinkedPair
).fromArray = function (thing, index) {if (!(Array.isArray(thing))) {return LinkedPair();}; if (isNil(
index)) {index = 0;}; return ((thing.length > 0) ? ((index < thing.length) ? LinkedPair(thing[index],
LinkedPair.fromArray(thing, (index + 1))) : undefined) : LinkedPair());};

LinkedPair.prototype.appendWith = function (pair, origin) {if (isNil(origin)) {origin = this.deepMap();
return origin.appendWith(pair, origin);} else {if (!(origin instanceof LinkedPair)) {origin = this.deepMap(
); return origin.appendWith(pair, origin);} else {if (isNil(pair)) {return origin;} else {if (!((origin
) instanceof LinkedPair)) {return origin;};}; if (isNil(this.tail)) {if (this.head === undefined) {return (
pair.deepMap());} else {this.setTailTo(pair.deepMap()); return origin;};} else {return this.tail.appendWith(
pair, origin);};};};};

LinkedPair.prototype.mapHelper = function (callback, index, pair) {
return (isNil(this.tail) ? ((this.head === undefined) ? LinkedPair() : LinkedPair(callback(this.head, index,
pair))) : (LinkedPair(callback(this.head, index, pair), this.tail.mapHelper(callback, (index + 1), pair))));
}; LinkedPair.prototype.map = function (callback) {if (!((typeof callback) === 'function')) {callback = (
function (id) {return id;});}; return this.mapHelper(callback, 1, this);}; (LinkedPair.prototype.deepMap
) = function (callback) {if (!((typeof callback) === 'function')) {callback = function (id) {return id;};};
return (this.map(function (item, index, pair) {return ((item instanceof LinkedPair) ? item.deepMap(callback
) : callback(item, index, pair));}));};

LinkedPair.prototype.keepItemsSuch = function (condition) {if (((typeof condition) === (
'function'))) {return this.keepItemsSuchHelper(condition, 1, this);} else {return (this
).deepMap();};}; LinkedPair.prototype.keepItemsSuchHelper = function (condition, index, pair
) {return (isNil(this.tail) ? ((this.head === undefined) ? LinkedPair() : LinkedPair(
condition(this.head, index, pair) ? this.head : undefined)) : (condition(this.head,
index, pair) ? LinkedPair(this.head, this.tail.keepItemsSuchHelper(condition, ((index
) + 1), pair)) : this.tail.keepItemsSuchHelper(condition, (index + 1), pair)));};

LinkedPair.prototype.combineItems = function (combinator) {if (isNil(this.tail)) {return (isNil((this
).head) ? null : this.head);} else {return combinator(this.head, this.tail.combineItems(combinator))};};

LinkedPair.prototype.textRepresentation = function () {return ('a LinkedPair \(').concat((this.getItems()).toString(), '\)');};