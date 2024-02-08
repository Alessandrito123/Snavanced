NaturalMath = {}; NaturalMath.getNumberFromString = function (string) {return (isNil(string) ? '0' : (isNil(string.toString) ? '0' : string.toString(
)));}; NaturalMath.basicAddOne = function (string) {var starters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], succesors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
string = NaturalMath.getNumberFromString(string); var last = succesors[string[string.length - 1]], fromStart = string.slice(0, string.length - 1); return ((fromStart.length > 0) ? ((
last === '0') ? NaturalMath.basicAddOne(fromStart) : fromStart) : ((string[0] === '9') && (last === '0') ? '1' : '')) + last;}; NaturalMath.basicDeleteOne = function (string) {
var starters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], succesors = ['9', '0', '1', '2', '3', '4', '5', '6', '7', '8']; string = NaturalMath.getNumberFromString(string);
var last = succesors[string[string.length - 1]], fromStart = string.slice(0, string.length - 1); return ((fromStart.length > 0) ? ((last === '9') ? NaturalMath.basicDeleteOne(fromStart
) : fromStart) : ((string[0] === '9') && (last === '0') ? '1' : '')) + last;}; NaturalMath.fixZeroesOnNumber = function (string) {var i = 0, checker = [];
string = NaturalMath.getNumberFromString(string); if (string === '0') {return string;} else {while ((i < string.length) && (string[i] === '0')) {checker.push(string[i]); i++;};
var j = checker.length, arrangement = ''; i = 0; while (i < string.length) {if (!(i < j)) {arrangement = (arrangement + string[i]);}; i++;}; return arrangement;};};
NaturalMath.addOne = function (string) {return NaturalMath.fixZeroesOnNumber(NaturalMath.basicAddOne(string));}; NaturalMath.deleteOne = function (string) {
string = NaturalMath.getNumberFromString(string); return ((string === '0') ? string : NaturalMath.fixZeroesOnNumber(NaturalMath.basicDeleteOne(string)));};
NaturalMath.basicOnePlusTwo = function (string1, string2) {while (!(string2 === '0')) {string1 = NaturalMath.addOne(string1); string2 = NaturalMath.deleteOne(string2);};
return string1;}; NaturalMath.basicOneMinusTwo = function (string1, string2) {while (!(string2 === '0')) {string1 = NaturalMath.deleteOne(string1); string2 = NaturalMath.deleteOne(
string2);}; return string1;}; NaturalMath.basicOneTimesTwo = function (string1, string2) {var string3 = NaturalMath.getNumberFromString(string1);
string1 = NaturalMath.getNumberFromString(string1); string2 = NaturalMath.getNumberFromString(string2); if ((string1 === '0') || (string2 === '0')) {return '0';} else {while (!(
string2 === '0')) {string1 = NaturalMath.basicOnePlusTwo(string1, ((string2 === '1') ? '0' : string3)); string2 = NaturalMath.deleteOne(string2);}; return string1;};};
NaturalMath.basicOnePowerTwo = function (string1, string2) {var string3 = NaturalMath.getNumberFromString(string1); string1 = NaturalMath.getNumberFromString(string1);
string2 = NaturalMath.getNumberFromString(string2); if (string1 === '0') {return '0';} else if (string2 === '0') {return '1';} else {while (!(string2 === '0')) {
string1 = NaturalMath.basicOneTimesTwo(string1, ((string2 === '1') ? '1' : string3)); string2 = NaturalMath.deleteOne(string2);}; return string1;};}; function IntegerNumber (
naturalNumber, isNegative) {this.naturalNumber = NaturalMath.fixZeroesOnNumber(NaturalMath.getNumberFromString(naturalNumber || '0')); this.isNegative = asABool(
isNegative);}; IntegerNumber.prototype = new IntegerNumber; IntegerNumber.prototype.constructor = IntegerNumber; IntegerNumber.uber = IntegerNumber.prototype;
IntegerNumber.prototype.fullCopy = function () {return new IntegerNumber(this.naturalNumber, this.isNegative);};
/* IntegerNumber.prototype.addWith = function (
integer) {if (!isNil(integer)) {var changedInteger = this.fullCopy(); if (integer.isNegative) {changedInteger.naturalNumber
} else {changedInteger.naturalNumber = changedInteger.
}; this.addWith(changedInteger);};}; */ /* In development... */