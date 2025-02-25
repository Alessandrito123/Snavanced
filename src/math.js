/* "math.js" is an advanced arbitrary-precision math library for any JavaScript project, made with harder work. Written by Alessandro Pinedo, email: aless01pime@gmail.com. Copyleft (Ɔ) 2024
by Alessandro Pinedo. The following list shows the order in which all constructors are defined. Use this list to locate code on this document: BigNumMemoizer; [BigDec, {BigMgn, BigCmp}]. */

"use strict"; function BigNumMemoizer () {this.init();}; BigNumMemoizer.prototype.saveOnTheStorage = function (selectedInput, selectedOutput) {if (!(isNil(this.localStorage))) {if (
this.localStorage.getItem('bigNumMemoizerInputs') == '') {this.localStorage.setItem('bigNumMemoizerInputs', selectedInput);} else {this.localStorage.setItem('bigNumMemoizerInputs',
(this.localStorage.getItem('bigNumMemoizerInputs')).concat('\|', selectedInput));}; if (this.localStorage.getItem('bigNumMemoizerOutputs') == '') {this.localStorage.setItem(
'bigNumMemoizerOutputs', selectedOutput);} else {(this.localStorage).setItem('bigNumMemoizerOutputs', (this.localStorage.getItem('bigNumMemoizerOutputs')).concat('\|', selectedOutput
));};};}; BigNumMemoizer.prototype.clearTheCache = function () {if (!(isNil(this.localStorage))) {this.localStorage.setItem('bigNumMemoizerInputs', ''); this.localStorage.setItem(
'bigNumMemoizerOutputs', '');}; this.memoizedInputs = new Array; this.memoizedOutputs = new Array;}; BigNumMemoizer.prototype.memoize = function (selectedFunction, selectedFirstInput,
selectedSecondInput) {var selectedString = selectedFunction.concat(',', selectedFirstInput.toString(), ',', isNil(selectedSecondInput) ? 'monadic' : selectedSecondInput.toString(),
',', BigDec.prototype.maximumDecimals.toString()), selectedSearch = this.memoizedInputs.indexOf(selectedString); var result; if (selectedSearch > -1) {result = this.memoizedOutputs[
selectedSearch];} else {try {result = ((selectedFirstInput[selectedFunction])(selectedSecondInput)).toString();} catch (exception) {result = 'error'; console.error(exception);}; (this
).memoizedInputs.push(selectedString); this.memoizedOutputs.push(result); if (false) {this.saveOnTheStorage(selectedString, result);};}; var selectedConstructor = (selectedFirstInput
).constructor.name, receivedOutput = new Function('text', ('return \(new ').concat(selectedConstructor, '\(text\)\)\;')); if (result == 'error') {throw Error('Unsupported calculation.'
);} else {return receivedOutput(result);};}; BigNumMemoizer.prototype.init = function () {this.memoizedInputs = new Array; this.memoizedOutputs = new Array; this.localStorage = null;
try {this.localStorage = window.localStorage;} catch (error) {}; if (!(isNil(this.localStorage))) {if (isNil(this.localStorage.getItem('bigNumMemoizerInputs'))) {this.localStorage.setItem(
'bigNumMemoizerInputs', '');}; if (isNil(this.localStorage.getItem('bigNumMemoizerOutputs'))) {this.localStorage.setItem('bigNumMemoizerOutputs', '');}; this.memoizedInputs = ((this
).localStorage.getItem('bigNumMemoizerInputs')).split('\|'); this.memoizedOutputs = (this.localStorage.getItem('bigNumMemoizerOutputs')).split('\|');};}; function BigDec (text) {if (
this instanceof BigDec) {this.init(text);} else {return (new BigDec(text));};}; BigDec.prototype.valueOf = function () {return Number.parseFloat(this.toString());}; (BigDec.prototype
).maximumDecimals = 16; var BigDecCounter = 0, LocalBigNumMemoizer = new BigNumMemoizer; BigDec.prototype.getImaginaryPart = function () {var imag = this.imaginaryPart; return (
isNil(imag) ? theZero : imag);}; BigDec.prototype.init = function (text) {this.bignum = this; this.imaginaryPart = null; this.magnitudes = new Array; var inputIsBigNum = false; if (
canGetTheStringOf(text)) {if (text instanceof BigDec) {inputIsBigNum = true;} else {text = text.toString(); text = (Number.isSecureForNumbers(text) ? text : '0');};} else {text = '0';};
if (inputIsBigNum) {this.naturalContainer = JSBI.add(text.naturalContainer, JSBI.theZero); this.isNegative = text.isNegative; this.dotPosition = (text.dotPosition + 0); (this.isInfinite
) = text.isInfinite;} else {if (Number.prototype.infinities.includes(text)) {this.naturalContainer = JSBI.BigInt(1); this.isNegative = (text[0] == '-'); this.isInfinite = true; (this
).dotPosition = 0;} else {this.isInfinite = false; var splittedNumeral = text.split('.'); this.isNegative = ((splittedNumeral[0])[0] == '-'); this.dotPosition = 0; if (this.isNegative
) {splittedNumeral[0] = (splittedNumeral[0]).slice(1, (splittedNumeral[0]).length);}; if (splittedNumeral.length > 1) {if ((splittedNumeral[1]).length > this.maximumDecimals) {
splittedNumeral[1] = (splittedNumeral[1]).slice(0, this.maximumDecimals);}; while (true) {if ((splittedNumeral[1])[(splittedNumeral[1]).length - 1] == '0') {splittedNumeral[1
] = ((splittedNumeral[1]).slice(0, ((splittedNumeral[1]).length - 1)));} else {break;};};} else {splittedNumeral.push('');}; this.dotPosition = (splittedNumeral[1]).length; (this
).naturalContainer = JSBI.BigInt((splittedNumeral[0]).concat(splittedNumeral[1])); if (this.naturalContainer.toString() == '0') {this.isNegative = false;};};}; BigDecCounter = (
BigDecCounter + 1); this.counter = BigDecCounter;}; BigDec.prototype.toString = function () {if (this.isInfinite) {return (this.isNegative ? '-' : '').concat((Number.prototype
).infinities[0]);}; var numeral = this.naturalContainer.toString(); if (this.dotPosition > 0) {return (this.isNegative ? '-' : '').concat((!(this.dotPosition < ((this.naturalContainer
).toString()).length) ? '0' : ''), numeral.slice(0, Math.max((numeral.length - this.dotPosition), 0)), '.', JSBI.getNZeroes(this.dotPosition - (this.naturalContainer.toString()).length
), numeral.slice(Math.max((numeral.length - this.dotPosition), 0), numeral.length));} else {return ((this.isNegative ? '-' : '').concat(numeral));};}; (BigDec.prototype.infiniteCostume
) = function () {var copy = BigDec(this); copy.isInfinite = true; return copy;}; BigDec.prototype.negativeCopy = function () {var copy = BigDec(this); copy.isNegative = !(copy.isNegative
); return copy;}; BigDec.prototype.toSignedInteger = function () {var copy = BigDec(this); copy.dotPosition = 0; return copy.toString();}; BigDec.prototype.fullCopy = function () {if (
this.isInfinite) {return BigDec(this);} else {var splittedNumeral = (this.toString()).split('.'); if (splittedNumeral.length > 1) {if ((splittedNumeral[1]).length > this.maximumDecimals
) {splittedNumeral[1] = (splittedNumeral[1]).slice(0, this.maximumDecimals);};} else {splittedNumeral.push('0');}; return BigDec((splittedNumeral[0]).concat('.', splittedNumeral[1]));};};
BigDec.prototype.subtractWith = function (anotherBigNum) {return this.addWith(anotherBigNum.negativeCopy());}; BigDec.prototype.throwInfinite = function () {var copy = BigDec(this); (copy
).isInfinite = false; return copy;}; BigDec.prototype.addWith = function (anotherBigNum) {if (this.isInfinite || anotherBigNum.isInfinite) {if (this.isInfinite && anotherBigNum.isInfinite
) {return ((this.throwInfinite()).addWith(anotherBigNum.throwInfinite())).infiniteCostume();} else {if (this.isInfinite) {return this.fullCopy();} else {return anotherBigNum.fullCopy();};
};} else {var firstNum = this.toSignedInteger(), secondNum = anotherBigNum.toSignedInteger(), result, firstDot = this.dotPosition, secondDot = anotherBigNum.dotPosition; if (firstDot > (
secondDot)) {secondNum = secondNum.concat(JSBI.getNZeroes(firstDot - secondDot)); result = BigDec(JSBI.add(JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))); result.dotPosition = firstDot; return (
result.fullCopy());} else if (secondDot > firstDot) {firstNum = firstNum.concat(JSBI.getNZeroes(secondDot - firstDot)); result = BigDec(JSBI.add(JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))
); result.dotPosition = secondDot; return result.fullCopy();} else {result = BigDec(JSBI.add(JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))); result.dotPosition = firstDot; return (result
).fullCopy();};};}; BigDec.prototype.isPureInteger = function () {return (this.getDecimals()).isEqualTo(theZero);}; BigDec.prototype.isGreaterThan = function (anotherBigNum) {return (
anotherBigNum.subtractWith(this)).isNegative;}; BigDec.prototype.isLessThan = function (anotherBigNum) {return (this.subtractWith(anotherBigNum)).isNegative;}; BigDec.prototype.floor = (
function () {return ((this.isNegative && !(this.isPureInteger())) ? (this.truncate()).addWith(theDarkUnit) : this.truncate());}); BigDec.prototype.truncate = function () {return (BigDec(
(((this.fullCopy()).toString()).split('.'))[0]));}; BigDec.prototype.getSignum = function () {return this.divideWith(this.absoluteValue());}; BigDec.prototype.ceiling = function () {
return ((!(this.isNegative) && !(this.isPureInteger())) ? theOne.addWith(this.truncate()) : this.truncate());}; BigDec.prototype.getDecimals = function () {return this.subtractWith((this
).truncate());}; BigDec.prototype.absoluteValue = function () {return (this.isNegative ? this.negativeCopy() : this.fullCopy());}; BigDec.prototype.isEqualTo = function (anotherBigNum) {
return (((anotherBigNum.subtractWith(this)).absoluteValue()).toString() == '0');}; BigDec.prototype.basicModulateWith = function (anotherBigNum) {if (this.isInfinite) {return theZero;
} else if (anotherBigNum.isInfinite) {var copy = this.fullCopy(); if (anotherBigNum.isNegative) {copy = copy.negativeCopy();}; return copy;} else {var firstNum = (this.absoluteValue(
)).toSignedInteger(), firstDot = this.dotPosition, secondNum = (anotherBigNum.absoluteValue()).toSignedInteger(), secondDot = anotherBigNum.dotPosition, result; if (this.isEqualTo(
anotherBigNum)) {return theZero;} else if (anotherBigNum.isEqualTo(theZero)) {return this.infiniteCostume();}; if (firstDot > secondDot) {secondNum = secondNum.concat(JSBI.getNZeroes((firstDot
) - secondDot)); result = BigDec(JSBI.remainder(JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))); result.dotPosition = firstDot; result.isNegative = this.isNegative; return result.fullCopy(
);} else if (secondDot > firstDot) {firstNum = firstNum.concat(JSBI.getNZeroes(secondDot - firstDot)); result = BigDec(JSBI.remainder(JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))); (result
).dotPosition = secondDot; result.isNegative = this.isNegative; return result.fullCopy();} else {result = BigDec(JSBI.remainder(JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))); (result
).dotPosition = firstDot; result.isNegative = this.isNegative; return result.fullCopy();};};}; BigDec.prototype.betterModulateWith = function (anotherBigNum) {if (this.isInfinite) {return (
theZero);} else if (anotherBigNum.isInfinite) {var copy = this.fullCopy(); if (anotherBigNum.isNegative) {copy.isNegative = !(copy.isNegative);}; return copy;} else if (anotherBigNum.isEqualTo(
theZero)) {return this.infiniteCostume();} else {return ((this.basicModulateWith(anotherBigNum)).addWith(anotherBigNum)).basicModulateWith(anotherBigNum);};}; BigDec.prototype.betterRound = (
function () {var rounded = (this.absoluteValue()).basicRound(); rounded.isNegative = this.isNegative; return rounded.fullCopy();}); BigDec.prototype.basicRound = function () {return (!((((this
).absoluteValue()).getDecimals()).isLessThan(theHalf)) ? this.ceiling() : this.floor());}; BigDec.prototype.multiplicateWith = function (anotherBigNum) {if (theOne.isEqualTo(anotherBigNum)) {
return this.fullCopy();} else if (anotherBigNum.isEqualTo(theZero)) {return theZero;} else if (this.isInfinite || anotherBigNum.isInfinite) {
return infinitySignedAs(!(this.isNegative == anotherBigNum.isNegative));
} else {var secondNum = anotherBigNum.toSignedInteger(), firstNum = this.toSignedInteger(), firstDot = this.dotPosition, secondDot = anotherBigNum.dotPosition, result = BigDec(JSBI.multiply(
JSBI.BigInt(firstNum), JSBI.BigInt(secondNum))); result.dotPosition = firstDot + secondDot; return result.fixDecimals();};}; BigDec.prototype.min = function (anotherBigNum) {if (isNil(anotherBigNum)) {
anotherBigNum = theZero;}; return [anotherBigNum, this][+(this.isLessThan(anotherBigNum))];}; BigDec.prototype.max = function (anotherBigNum) {if (isNil(anotherBigNum)) {anotherBigNum = theZero;}; return [
anotherBigNum, this][+(this.isGreaterThan(anotherBigNum))];};

BigDec.prototype.divideWith = function (divisor) {if (this.isInfinite || divisor.isInfinite) {if (this.isInfinite && divisor.isInfinite) {return getUnitWithSign((this.isNegative + divisor.isNegative
) == 1);} else {if (this.isInfinite) {return infinitySignedAs(((this.isNegative + divisor.isNegative) == 1));}; if (divisor.isInfinite) {return theZero;};};} else {var dividend = this.naturalContainer,
divisorDotPosition = divisor.dotPosition, isNegative = ((this.isNegative + divisor.isNegative) == 1), quotient; divisor = divisor.naturalContainer; if (dividend == '0') {quotient = theZero;} else if ((
dividend == divisor) && (this.dotPosition == divisorDotPosition)) {quotient = getUnitWithSign(isNegative);} else if (divisor == '0') {return (infinitySignedAs(this.isNegative));} else {var multiplier = (
'1').concat(JSBI.getNZeroes((this.maximumDecimals + divisorDotPosition) - this.dotPosition)); quotient = JSBI.divide(JSBI.multiply(dividend, JSBI.BigInt(multiplier)), divisor); quotient = BigDec(quotient);
quotient.dotPosition = this.maximumDecimals; quotient = quotient.fixDecimals(); quotient.isNegative = isNegative;}; return quotient;};};

BigDec.prototype.gammaHelper = function () {var identity = this.addWith(theDarkUnit); if (
this.isEqualTo(positiveInfinity) || this.isEqualTo(theOne)) {return this;} else if (this.isGreaterThan(theOne)) {return (identity.multiplicateWith(identity.gamma()));} else if (this.isEqualTo(theZero)) {return (
positiveInfinity);} else if (this.isEqualTo(negativeInfinity)) {return theZero;} else if (this.isLessThan(theZero)) {return ((this.addWith(theOne)).gamma()).divideWith(this);} else {return (this.gammaLogarithm(
)).exponential();};}; BigDec.prototype.gamma = function () {return LocalBigNumMemoizer.memoize('gammaHelper', this);}; BigDec.prototype.simpleFactorial = function () {return (this.addWith(theOne)).gamma();};
(BigDec.prototype.exponentialHelper
) = function () {if (this.isLessThan(theZero)) {return ((this.negativeCopy()).exponentialHelper()).getReciprocal();} else if (this.isEqualTo(theZero)) {return theOne;} else if (this.isGreaterThan(theOne)) {
return (eulerNatural.raiseWith(this.truncate())).multiplicateWith((this.getDecimals()).exponentialHelper());} else {var myself = this; return (repeatedSummatory((function (n) {return (myself.raiseWith(n)
).divideWith(n.simpleFactorial());}), theZero, theSevenTeen)).fixDecimals();};}; BigDec.prototype.arcTangentRadians = function () {return summatoryIntegral((function (z) {return (
theOne.addWith(z.squarePower())).getReciprocal();}), this, theZero, arcCreator);}; BigDec.prototype.exponential = function () {return (this.isEqualTo(theZero) ? (
theOne) : (this.isInfinite ? (this.isNegative ? theZero : positiveInfinity) : (LocalBigNumMemoizer.memoize('exponentialHelper', this)).fixDecimals()));}; BigDec.prototype.raisingHelper = function (power) {try {
var result = BigDec(JSBI.exponentiate(this.naturalContainer, (power.truncate()).naturalContainer)); result.dotPosition = this.dotPosition * (+((power.truncate()).toString())); if (this.isNegative) {(result
).isNegative = theOne.isEqualTo((power.truncate()).betterModulateWith(theTwo));}; return result.fullCopy();} catch (error) {var myself = this; return repeatedProduct((function () {return myself;}), theZero,
power.addWith(theDarkUnit));};}; BigDec.prototype.raiseWith = function (power) {return LocalBigNumMemoizer.memoize('raisingHelper', this, power);}; BigDec.prototype.naturalLogarithm = function () {return (this
).logarithmWith(eulerNatural);}; BigDec.prototype.powerWith = function (exponent) {var result; if (exponent.isNegative) {return (this.powerWith(exponent.negativeCopy())).getReciprocal();} else if ((exponent
).isEqualTo(theOne)) {return this.fullCopy();} else if (exponent.isEqualTo(theZero)) {return this.divideWith(this);} else if (this.isInfinite || exponent.isInfinite) {if (exponent.isInfinite) {if (this.isInfinite
) {return positiveInfinity;} else if ((this.absoluteValue()).isGreaterThan(theZero)) {return positiveInfinity;} else if ((this.absoluteValue()).isEqualTo(theOne)) {return theOne;} else {return theZero;};
} else if (exponent.isGreaterThan(theZero)) {return positiveInfinity;};} else if (this.isEqualTo(theZero)) {return theZero;} else if (this.isEqualTo(eulerNatural)) {return exponent.exponential();} else if (
this.isEqualTo(theTen)) {result = (BigDec(('1').concat(JSBI.getNZeroes((+(exponent)).toString())))); exponent = exponent.getDecimals(); if (exponent.isGreaterThan(theZero)) {result = result.multiplicateWith((this
).radicateWith(exponent.getReciprocal()));}; return result;} else {result = this.raiseWith(exponent); exponent = exponent.getDecimals(); if (exponent.isGreaterThan(theZero)) {result = result.multiplicateWith(
this.radicateWith(exponent.getReciprocal()));}; return result.fixDecimals();};}; BigDec.prototype.decimalLogarithm = function () {var i = BigDec(((this.truncate()).naturalContainer.toString()).length - 1),
characteristic = (this.absoluteValue()).divideWith(theTen.raiseWith(i)); while (true) {if (characteristic.isLessThan(theTen)) {break;}; i = i.addWith(theOne); characteristic = characteristic.divideWith(theTen);
}; if (characteristic.isGreaterThan(theOne)) {var k, j = 0, mantissa = '.'; while (j < this.maximumDecimals) {characteristic = characteristic.raiseWith(theTen); k = 0; while (true) {if (characteristic.isLessThan(
theTen)) {break;}; characteristic = characteristic.divideWith(theTen); k = (k + 1);}; mantissa = mantissa.concat(k.toString()); j = (j + 1);}; return (i.addWith(BigDec(mantissa))).fixDecimals();} else {return i;
};}; BigDec.prototype.squarePower = function () {return this.multiplicateWith(this);}; BigDec.prototype.logarithmHelper = function (base) {if (this.isEqualTo(base)) {return theOne;} else if (base.isEqualTo(theOne
) || !(base.isGreaterThan(theZero))) {return negativeInfinity;} else if (base.isLessThan(theOne)) {return ((this.logarithmHelper(base.getReciprocal())).fixDecimals()).negativeCopy();} else if ((this.truncate()
).isEqualTo(theZero)) {return (((this.getReciprocal()).logarithmWith(base)).fixDecimals()).negativeCopy();} else {return ((this.decimalLogarithm()).divideWith(base.decimalLogarithm())).fixDecimals();};}; (BigDec
).prototype.logarithmWith = function (base) {if (base.isNegative) {return negativeInfinity;} else if (base.isInfinite) {return ((this.isInfinite && !(this.isNegative)) ? theOne : theZero);} else if ((this
).isNegative) {return negativeInfinity;} else if (this.isEqualTo(theZero)) {return negativeInfinity;} else {return (this.isEqualTo(positiveInfinity) ? this : LocalBigNumMemoizer.memoize('logarithmHelper', this,
base));};}; BigDec.prototype.logistic = function () {return (this.isLessThan(theZero) ? theOne.subtractWith((this.negativeCopy()).logistic()) : (theOne.addWith((this.negativeCopy()).exponential())).getReciprocal(
));}; BigDec.prototype.logit = function () {return (this.divideWith(theOne.subtractWith(this))).naturalLogarithm();}; BigDec.prototype.getReciprocal = function () {return theOne.divideWith(this);}; (BigDec
).prototype.fixDecimals = function () {var copy = this.fullCopy(), decimals = (copy.toString()).split('.'); if (decimals.length > 1) {decimals = decimals[1]; if (decimals.length === this.maximumDecimals) {
var result = this.fullCopy(); result.maximumDecimals -= 3; result = result.fullCopy(); decimals = (result.toString()).split('.'); if (decimals.length > 1) {decimals = decimals[1]; if ((decimals.split('')
).every(function (digit) {return (digit === '9');})) {copy = (result.truncate()).addWith(result.isNegative ? theDarkUnit : theOne);} else if (decimals.length === 0) {copy = result;};};};}; return copy;
}; BigDec.prototype.gammaLogarithm = function () {var lg = theZero, z = this, z1 = z; if (!(z.isEqualTo(theOne))) {if (!(z.isLessThan(threeHalves)) && z.isLessThan(fiveHalves)) {lg = (z.gammaErrors()
).naturalLogarithm();} else if (!(z.isLessThan(fiveHalves))) {while (!(z1.isLessThan(fiveHalves))) {z1 = z1.subtractWith(theOne); lg = lg.addWith(z1.naturalLogarithm());}; lg = lg.addWith((z1.gammaErrors()
).naturalLogarithm());} else {while (z1.isLessThan(threeHalves)) {lg = lg.subtractWith(z1.naturalLogarithm()); z1 = z1.addWith(theOne);}; lg = lg.addWith((z1.gammaErrors()).naturalLogarithm());};}; return lg;};
function getRandomDigit () {return ((Math.round(Math.random() * 10)).toString())[0];}; function getUnitWithSign (isNegative) {return (BigDec((isNegative ? '-' : '').concat('1')));}; function infinitySignedAs (
isNegative) {return BigDec(((isNegative) ? '-' : '').concat(Number.prototype.infinities[0]));}; function summatoryIntegral (func, upperBound, lowerBound, intervals, old) {
var dx = upperBound.subtractWith(lowerBound); if ((dx
).isEqualTo(theZero)) {return dx;} else {dx = dx.divideWith(intervals); intervals = theTwo.multiplicateWith(theOne.max(((intervals.betterRound()).divideWith(theTwo)).ceiling())); if (old) {return (((upperBound
).subtractWith(lowerBound)).divideWith(intervals)).multiplicateWith((((func(upperBound)).addWith(func(lowerBound))).divideWith(theTwo)).addWith(repeatedSummatory((function (k) {return func(lowerBound.addWith(
(k.multiplicateWith(upperBound.subtractWith(lowerBound))).divideWith(intervals)));}), theOne, intervals.addWith(theDarkUnit))));} else {return (repeatedSummatory((function (k) {return (func(lowerBound.addWith(
k.multiplicateWith(dx)))).multiplicateWith((k.betterModulateWith(theTwo)).isEqualTo(theZero) ? (k.isInTheRangeOf(theZero, intervals) ? theTwo : theOne) : twoSquared);}), theZero, intervals)).multiplicateWith(
dx.divideWith(theThree));};};}; function repeatedProduct (func, offset, steps) {var offset = offset.betterRound(), steps = (steps.betterRound()).subtractWith(offset), result = theOne; while (!(steps.isLessThan(
theZero))) {result = (result.multiplicateWith(func(offset))); steps = steps.addWith(theDarkUnit); offset = (offset.addWith(theOne));}; return result;}; function getDerivativeOf (func, value, distance) {return ((
func(value.addWith(distance))).subtractWith(func(value))).divideWith(distance);}; function repeatedSummatory (func, offset, steps) {var result = theZero, offset = offset.betterRound(), steps = (steps.betterRound(
)).subtractWith(offset); while (!(steps.isLessThan(theZero))) {result = result.addWith(func(offset)); steps = steps.addWith(theDarkUnit); offset = offset.addWith(theOne);}; return result;}; var theZero = BigDec(
), octaveOfTurn = BigDec(45), theOne = BigDec(1), halfTurn = BigDec(180), tripleQuartOfTurn = BigDec(270), positiveInfinity = BigDec(Infinity), negativeInfinity = BigDec(-Infinity), theSevenTeen = BigDec(17
), theTwo = BigDec(2), entireTurn = BigDec(360), oldBase = BigDec(60), theTen = BigDec(10), theHalf = BigDec(1/2), theDarkUnit = BigDec(-1), twoSquared = BigDec(4), theThree = BigDec(3), twoCubed = BigDec(
8), quarterOfTurn = BigDec(90), eulerNatural = theOne.exponential(), fiveHalves = BigDec(5/2), gammaHelpers = [BigDec(0.9999999999998099), BigDec(676.52036812188513), BigDec(-1259.1392167224028), BigDec(
'771.32342877765313'), BigDec('-176.61502916214059'), BigDec(12.507343278686905), BigDec(-0.13857109526572012), BigDec(0.000009984369578), BigDec('0.0000001505632735')], threeCubeQuarters = BigDec(27/4),
threeHalves = BigDec(3/2), fifteenHalves = BigDec(15/2), preciseEpsilon = BigDec(0.0000011), piIncalculable = BigDec('3.1415926535897932'); function productIntegral (func, upperBound, lowerBound, intervals,
old) {return (summatoryIntegral((function (y) {return func(y.naturalLogarithm());}), upperBound, lowerBound, intervals, old)).exponential();}; BigDec.prototype.beta = function (anotherBigNum) {return (((this
).gamma()).multiplicateWith(anotherBigNum.gamma())).divideWith((this.addWith(anotherBigNum)).gamma());}; BigDec.prototype.gammaErrors = function () {var z = this.subtractWith(theOne), a = gammaHelpers[0], t = (
z.addWith(fifteenHalves)), i = 1; while (i < gammaHelpers.length) {a = a.addWith((gammaHelpers[i]).divideWith(z.addWith(BigDec(i)))); i = (i + 1);}; return (a.multiplicateWith((t.negativeCopy()).exponential()
)).multiplicateWith(((theTwo.multiplicateWith(piIncalculable)).squareRoot()).multiplicateWith(t.powerWith(z.addWith(theHalf))));}; BigDec.prototype.digamma = function () {return (getDerivativeOf((function (z
) {return z.gamma();}), this, preciseEpsilon)).divideWith(this.gamma());}; BigDec.prototype.squareRoot = function (isFaster) {return (isFaster ? ((this.naturalLogarithm()).divideWith(theTwo)).exponential() : (
this).radicateWith(theTwo));}; BigDec.prototype.radicateWith = function (anotherBigNum) {var index = anotherBigNum.absoluteValue(); if (index.isInfinite) {return theZero;} else if (this.isInfinite) {return (
positiveInfinity);} else if ((index.getDecimals()).isGreaterThan(theZero)) {return LocalBigNumMemoizer.memoize('radicationHelper', this, anotherBigNum);} else {if ((index.basicModulateWith(theTwo)).isGreaterThan(
theZero)) {return (LocalBigNumMemoizer.memoize('radicationHelper', this.absoluteValue(), anotherBigNum)).multiplicateWith(this.getSignum());} else {return LocalBigNumMemoizer.memoize('radicationHelper', this,
anotherBigNum);};};}; BigDec.prototype.radicationHelper = function (index) {if (index.isLessThan(theZero)) {return (this.radicateWith(index.negativeCopy())).getReciprocal();} else if (this.isEqualTo(theZero)) {
return theZero;} else if (index.isEqualTo(theZero)) {return positiveInfinity;} else if (this.isEqualTo(theZero)) {return theZero;} else if (index.isLessThan(theOne)) {return this.powerWith(index.getReciprocal());
} else if (index.isEqualTo(theOne)) {return this.fullCopy();} else {var i = theZero, result = theZero; if ((index.getDecimals()).isGreaterThan(i)) {return ((this.naturalLogarithm()).divideWith(index)).exponential(
);} else {while (result.isLessThan(this)) {i = i.addWith(theOne); result = i.powerWith(index);}; if (result.isGreaterThan(this)) {if ((this.getDecimals()).isGreaterThan(theZero)) {return ((this.naturalLogarithm(
)).divideWith(index)).exponential();} else {var limit = ((Math.trunc(this.maximumDecimals / 4)) * (+(index.toString())) * ((this.truncate()).toString()).length), j = 0; result = this.subtractWith((i.addWith(
theDarkUnit)).powerWith(index)); while (j < limit) {result = (result.subtractWith(((result.powerWith(index)).subtractWith(this)).divideWith(index.multiplicateWith(result.powerWith(index.addWith(theDarkUnit))))
)); j = (j + 1);}; return result;};} else {return i;};};};}; BigDec.prototype.getCoreMetallicMean = function () {return this.hypotenuse(theTwo);}; BigDec.prototype.sineHelper = function () {return (this.gamma(
)).multiplicateWith((theOne.subtractWith(this)).gamma());}; var halfInputForSine = BigDec(30), continousPi = theHalf.sineHelper(); BigDec.prototype.sine = function () {var modular = this.betterModulateWith(
entireTurn); if (modular.isGreaterThan(tripleQuartOfTurn)) {return ((entireTurn.subtractWith(modular)).sine()).negativeCopy();} else if (modular.isGreaterThan(halfTurn)) {return ((modular.subtractWith(halfTurn
)).sine()).negativeCopy();} else if (modular.isGreaterThan(quarterOfTurn)) {return (halfTurn.subtractWith(modular)).sine();} else {return (modular.isEqualTo(halfInputForSine) ? theHalf : continousPi.divideWith(
(modular.divideWith(halfTurn)).sineHelper()));};}; BigDec.prototype.cosine = function () {return (this.isInfinite ? theOne : (quarterTurn.subtractWith(this)).sine());}; BigDec.prototype.tangent = function (
) {return (this.sine()).divideWith(this.cosine());}; BigDec.prototype.cotangent = function () {return (this.isInfinite ? positiveInfinity : (quarterOfTurn.subtractWith(this)).tangent());}; (BigDec.prototype
).isInTheRangeOf = function (startPoint, endPoint) {return (this.isGreaterThan(startPoint) && this.isLessThan(endPoint));}; BigDec.prototype.cosecant = function () {return (this.sine()).getReciprocal();};
BigDec.prototype.sinc = function () {return (this.isEqualTo(theZero) ? theOne.radians() : (this.sine()).divideWith(this));}; BigDec.prototype.secant = function () {return (this.cosine()).getReciprocal();
}; BigDec.prototype.radians = function () {return (this.multiplicateWith(piIncalculable)).divideWith(halfTurn);}; BigDec.prototype.degrees = function () {return (this.multiplicateWith(halfTurn)).divideWith(
piIncalculable);}; BigDec.prototype.getIntervalMetallicMean = function () {return (this.addWith(this.getCoreMetallicMean())).divideWith(theTwo);}; BigDec.prototype.getMagnitudeNames = function () {
return new Array;};

BigDec.prototype.doubleFactorial = function () {if (this.isInfinite) {return (this.isNegative ? theOne : this);}; var factor = this.basicRound(); if (factor.isGreaterThan(theTwo)) {return factor.multiplicateWith(
LocalBigNumMemoizer.memoize('doubleFactorial', factor.subtractWith(theTwo)));} else {return factor.max(theOne);};}; BigDec.prototype.risingFactorial = function (anotherBigNum) {return ((this.subtractWith(
anotherBigNum)).gamma()).divideWith(this.gamma());}; BigDec.prototype.combineWith = function (anotherBigNum) {return (this.permutateWith(anotherBigNum)).divideWith(anotherBigNum.simpleFactorial());}; (BigDec
).prototype.permutateWith = function (anotherBigNum) {return (this.simpleFactorial()).divideWith((this.subtractWith(anotherBigNum)).simpleFactorial());}; BigDec.prototype.containsMagnitudeNamed = function () {
return false;}; BigDec.prototype.customFibonacci = function (base) {var metallicPower = (base.getIntervalMetallicMean()).powerWith(this), result = (metallicPower.subtractWith(((halfTurn.multiplicateWith(this)
).cosine()).divideWith(metallicPower))).divideWith(base.getCoreMetallicMean()); if (this.isPureInteger() && base.isPureInteger()) {result = result.betterRound();}; return result;}; (BigDec.prototype.customLucas
) = function (base) {var metallicPower = (base.getIntervalMetallicMean()).powerWith(this), result = (metallicPower.addWith(((halfTurn.multiplicateWith(this)).cosine()).divideWith(metallicPower))); if ((this
).isPureInteger() && base.isPureInteger()) {result = result.betterRound();}; return result;}; BigDec.prototype.standardLucas = function () {return this.customLucas(theOne);}; BigDec.prototype.hypotenuse = (
function (anotherBigNum) {return ((this.squarePower()).addWith(anotherBigNum.squarePower())).squareRoot();}); BigDec.prototype.textRepresentation = function () {return (this.isInfinite ? (this.isNegative ? (
'-') : '').concat('∞') : this.toString());}; BigDec.prototype.getRandomNumberFromSignedUnits = function () {return this.multiplicateWith(theOne.dealWith(theDarkUnit));}; BigDec.prototype.standardFibonacci = (
function () {return this.customFibonacci(theOne);}); BigDec.prototype.getMagnitudeNamed = function () {return ['', '0'];}; BigDec.prototype.arcTangent = function () {return (this.isLessThan(theZero) ? (
halfTurn).subtractWith((this.negativeCopy()).arcTangent()) : (this.isGreaterThan(theOne) ? (quarterOfTurn.subtractWith((this.getReciprocal()).arcTangent())) : (((this.arcTangentRadians()).divideWith(arcPi
)).multiplicateWith(octaveOfTurn))));}; BigDec.prototype.arcTangentTwo = function (anotherBigNum) {if (anotherBigNum.isLessThan(theZero) && this.isGreaterThan(theZero)) {return halfTurn.subtractWith((this
).arcTangentTwo(anotherBigNum.negativeCopy()));} else if (anotherBigNum.isLessThan(theZero) && this.isEqualTo(theZero)) {return halfTurn;} else if ((anotherBigNum.isLessThan(theZero)) && (this.isLessThan(
theZero))) {return (halfTurn.addWith((this.negativeCopy()).arcTangentTwo(anotherBigNum.negativeCopy())));} else if (anotherBigNum.isEqualTo(theZero) && this.isLessThan(theZero)) {return tripleQuartOfTurn;
} else if (anotherBigNum.isGreaterThan(theZero) && this.isLessThan(theZero)) {return (entireTurn.subtractWith((this.negativeCopy()).arcTangentTwo(anotherBigNum)));} else if (anotherBigNum.isGreaterThan(
theZero) && this.isEqualTo(theZero)) {return theZero;} else {return (quarterOfTurn.subtractWith((anotherBigNum.divideWith(this)).arcTangent()));};}; BigDec.prototype.arcCosine = function () {return ((this
).isGreaterThan(theDarkUnit) ? (this.isGreaterThan(theOne) ? negativeInfinity : (((theOne.subtractWith(this.squarePower())).squareRoot()).divideWith(this)).arcTangent()) : (this.isLessThan(theDarkUnit) ? (
positiveInfinity) : halfTurn));}; BigDec.prototype.arcSine = function () {var result = quarterOfTurn.subtractWith(this.arcCosine()); return (result.isInfinite ? result : result.betterModulateWith(entireTurn));
}; BigDec.prototype.arcSecant = function () {return (this.getReciprocal()).arcCosine();}; BigDec.prototype.arcCosecant = function () {return (this.getReciprocal()).arcSine();}; (BigDec.prototype.arcCotangent
) = function () {return (quarterOfTurn.subtractWith(this.arcTangent())).betterModulateWith(entireTurn);}; BigDec.prototype.dealWith = function(anotherBigNum) {var max = this.max(anotherBigNum), min = this.min(
anotherBigNum), result = max.subtractWith(min), digitPlacers = (((result.truncate()).toString()).length + (this.maximumDecimals - 1)); if (result.isEqualTo(theZero)) {return min;} else {var randomness = '',
i = 0; while (i < digitPlacers) {randomness = randomness.concat(getRandomDigit()); i++;}; result = result.multiplicateWith(BigDec(randomness)); result.dotPosition += digitPlacers; return (result.fullCopy(
)).addWith(min);};}; function medianMean () {var list = (Array.from(arguments)).sort(function (a, b) {return (2 * (a.isLessThan(b) - 1/2));}); return ((list.length > 1) ? ((list.length % 2) > 0) ? list[
Math.ceil(list.length / 2)] : (arithmeticMean(list[list.length / 2], list[(list.length / 2) + 1])) : ((list.length > 0) ? list[0] : theZero));}; function arithmeticMean () {var list = Array.from(arguments
); return ((list.length > 1) ? (list.reduce(function (a, b) {return a.addWith(b);})).divideWith(BigDec(list.length)) : ((list.length > 0) ? list[0] : theZero));}; function harmonicMean () {var basic = (Array
).from(arguments), list = (basic.fullCopy()).map(function (n) {return n.getReciprocal();}); return ((list.length > 1) ? (BigDec(list.length)).divideWith(list.reduce(function (a, b) {return a.addWith(b);})
) : ((list.length > 0) ? basic[0] : positiveInfinity));}; function geometricMean () {var list = Array.from(arguments); return ((list.length > 1) ? (list.reduce(function (a, b) {return a.multiplicateWith(
b);})).radicateWith(BigDec(list.length)) : ((list.length > 0) ? list[0] : theOne));}; BigDec.prototype.cubeRoot  = function (isFaster) {return (isFaster ? ((this.naturalLogarithm()).divideWith(theThree)
).exponential() : this.radicateWith(theThree));}; BigDec.prototype.hyperbolicCosine = function () {return ((this.exponential()).addWith((this.negativeCopy()).exponential())).divideWith(theTwo);}; (BigDec
).prototype.agm = function (anotherBigNum) {var firstA = this, firstB = anotherBigNum, secondA, secondB, i = 0, limit = ((((((arithmeticMean(firstA, firstB)).betterRound()).absoluteValue()).toString()).length
) * this.maximumDecimals * 2); while (i < limit) {secondA = arithmeticMean(firstA, firstB); secondB = geometricMean(firstA, firstB); firstA = secondA; firstB = secondB; i++;}; return arithmeticMean(firstA, firstB
);}; BigDec.prototype.hyperbolicTangent = function () {return (this.hyperbolicSine()).divideWith(this.hyperbolicCosine());}; BigDec.prototype.hyperbolicCotangent = function () {return (this.hyperbolicCosine()
).divideWith(this.hyperbolicSine());}; BigDec.prototype.hyperbolicSine = function () {return ((this.exponential()).subtractWith((this.negativeCopy()).exponential())).divideWith(theTwo);}; BigDec.prototype.ghm = (
function (anotherBigNum) {var firstA = this, firstB = anotherBigNum, secondA, secondB, i = 0, limit = (((((((harmonicMean(firstA, firstB)).betterRound()).absoluteValue()).toString()).length) * this.maximumDecimals
) * 2); while (i < limit) {secondA = harmonicMean(firstA, firstB); secondB = geometricMean(firstA, firstB); firstA = secondA; firstB = secondB; i++;}; return harmonicMean(firstA, firstB);}); (BigDec.prototype
).hyperbolicSecant = function () {return (this.hyperbolicCosine()).getReciprocal();}; BigDec.prototype.hyperbolicCosecant = function () {return (this.hyperbolicSine()).getReciprocal();}; (BigDec.prototype
).hyperbolicArcSine = function () {return (this.addWith(this.hypotenuse(theOne))).naturalLogarithm();}; BigDec.prototype.hyperbolicArcCosine = function () {return (this.addWith((theDarkUnit.addWith((this
).squarePower())).squareRoot(true))).naturalLogarithm();}; BigDec.prototype.hyperbolicArcTangent = function () {return (((theOne.addWith(this)).divideWith(theOne.subtractWith(this))).naturalLogarithm(
)).divideWith(theTwo);}; BigDec.prototype.naperianLogarithm = function () {return (tenMillion.multiplicateWith((this.divideWith(tenMillion)).naturalLogarithm())).negativeCopy();}; (BigDec.prototype
).hyperbolicArcCosecant = function () {return (this.getReciprocal()).hyperbolicArcSine();}; BigDec.prototype.hyperbolicArcSecant = function () {return (this.getReciprocal()).hyperbolicArcCosine();}; (BigDec
).prototype.hyperbolicArcCotangent = function () {return (this.getReciprocal()).hyperbolicArcTangent();}; var tenMillion = BigDec(10000000), dottie = BigDec('.9998477415310881'), arcCreator = BigDec(94),
arcPi = theOne.arcTangentRadians(), threeQuarters = BigDec(3/4), superGoldenRatio = (threeQuarters.squareRoot()).divideWith((((threeCubeQuarters.squareRoot()).hyperbolicArcSine()).divideWith(theThree)
).hyperbolicSine()), superSilverRatio = threeQuarters.divideWith((threeHalves.squareRoot()).multiplicateWith(((((threeHalves.squareRoot()).multiplicateWith(threeQuarters)).hyperbolicArcSine()).divideWith(
theThree)).hyperbolicSine())), plasticRatio = (theTwo.multiplicateWith((((threeCubeQuarters.squareRoot()).hyperbolicArcCosine()).divideWith(theThree)).hyperbolicCosine())).divideWith(theThree.squareRoot()
); function powerOnlyIntegralHandler (upperBound, multiplier, power, lowerBound) {var addedPower = power.addWith(theOne); return (multiplier.multiplicateWith((upperBound.powerWith(addedPower)).subtractWith(
lowerBound.powerWith(addedPower)))).divideWith(addedPower);}; BigDec.prototype.lambertW = function () {return this.multiplicateWith(this.exponential());}; BigDec.prototype.inverseSmooth = function () {
var clamped = theZero.max(this.min(theOne)), checked = false; if (clamped.isGreaterThan(theHalf)) {clamped = theOne.subtractWith(clamped); checked = true;}; var result = (theHalf.subtractWith(((((theOne
).subtractWith(clamped.multiplicateWith(theTwo))).arcSine()).divideWith(theThree)).sine())); return (checked ? theOne.subtractWith(result) : result);}; BigDec.prototype.smooth = function () {var clamped = (
theZero.max(this.min(theOne))), squaredClamped = clamped.squarePower(); return (theThree.multiplicateWith(squaredClamped)).subtractWith((theTwo).multiplicateWith(squaredClamped.multiplicateWith(clamped)));
}; BigDec.prototype.trigamma = function () {return getDerivativeOf((function (z) {return z.digamma();}), num, preciseEpsilon);}; BigDec.prototype.tetrahedron = function () {return (this.multiplicateWith((
this.addWith(theOne)).multiplicateWith(this.addWith(theTwo)))).divideWith(twoWithThree);}; BigDec.prototype.triangle = function () {return (this.multiplicateWith(this.addWith(theOne))).divideWith(theTwo);};
var mascheroniEulerConstant = (theOne.digamma()).negativeCopy(), twoWithThree = BigDec(6), theQuarter = BigDec(1/4), strangeLemniscate = piIncalculable.divideWith(theOne.agm(theTwo.squareRoot())); (BigDec
).prototype.circularHelper = function () {return (theOne.subtractWith(((this.divideWith(quarterOfTurn)).addWith(theDarkUnit)).squarePower())).squareRoot(true);}; BigDec.prototype.triangularPeriodicWave = (
function (anotherBigNum) {var expansion = theTwo.multiplicateWith(anotherBigNum), modular = this.betterModulateWith(expansion); return (modular.isGreaterThan(anotherBigNum) ? expansion.subtractWith(modular
) : modular);}); BigDec.prototype.circularPeriodicWave = function () {var modular = this.betterModulateWith(entireTurn); if (modular.isGreaterThan(tripleQuartOfTurn)) {return ((entireTurn.subtractWith(
modular)).circularPeriodicWave()).negativeCopy();} else if (modular.isGreaterThan(halfTurn)) {return ((modular.subtractWith(halfTurn)).circularPeriodicWave()).negativeCopy();} else if (modular.isGreaterThan(
quarterOfTurn)) {return (halfTurn.subtractWith(modular)).circularPeriodicWave();} else {return LocalBigNumMemoizer.memoize('circularHelper', modular);};}; BigDec.prototype.tetrateWith = function (anotherBigNum
) {var out = theOne.addWith((anotherBigNum.absoluteValue()).getDecimals()); if (!(anotherBigNum.isLessThan(theOne))) {while (!(anotherBigNum.isLessThan(theOne))) {out = this.powerWith(out); anotherBigNum = (
anotherBigNum.addWith(theDarkUnit));};} else {while (anotherBigNum.isLessThan(theZero)) {anotherBigNum = anotherBigNum.addWith(theOne); out = this.logarithmWith(out);};}; return out;}; (BigDec.prototype
).nHyperShpereVolume = function (dimensions) {return ((piIncalculable.powerWith(dimensions.divideWith(theTwo))).multiplicateWith(this.powerWith(dimensions))).divideWith((theOne.addWith(dimensions.divideWith(
theTwo))).gamma());}; BigDec.prototype.nHyperShpereArea = function (dimensions) {return ((piIncalculable.powerWith(dimensions.divideWith(theTwo))).multiplicateWith(theTwo.multiplicateWith(this.powerWith(
dimensions.addWith(theDarkUnit))))).divideWith((dimensions.divideWith(theTwo)).gamma());};

(Object.keys(BigDec.prototype)).forEach(function (key) {console.log(('BigDec.prototype.').concat(key));});

function BigCmp (real, imag) {if (this instanceof BigCmp) {this.init(real, imag);} else {return new BigCmp(real, imag);};}; Object.setPrototypeOf(BigCmp, BigDec());
BigCmp.prototype.init = function (real, imag) {this.bignum = BigDec(real); this.imaginaryPart = BigDec(imag); this.naturalContainer = this.bignum.naturalContainer; this.isNegative = this.bignum.isNegative;};
BigCmp.prototype.textRepresentation = function () {var imag = this.imaginaryPart, bigText = this.bignum.textRepresentation(); if (imag.isEqualTo(theZero)) {return bigText;} else {if (this.bignum.isEqualTo(
theZero)) {return (imag.textRepresentation()).concat('i');} else {return bigText.concat((imag.isNegative ? '−' : '+').concat((imag.absoluteValue()).textRepresentation(), 'i'));};};}; (BigCmp.prototype.fullCopy
) = function () {return BigCmp(this.bignum.fullCopy(), this.imaginaryPart.fullCopy());}; BigCmp.prototype.negativeCopy = function () {return (BigCmp()).subtractWith(this);}; BigCmp.prototype.addWith = function (
anotherBigCmp) {return BigCmp(this.bignum.addWith(anotherBigCmp.bignum), (this.getImaginaryPart()).addWith(anotherBigCmp.getImaginaryPart()));}; BigCmp.prototype.subtractWith = function (anotherBigCmp) {return (
BigCmp(this.bignum.subtractWith(anotherBigCmp.bignum), (this.getImaginaryPart()).subtractWith(anotherBigCmp.getImaginaryPart())));}; BigCmp.prototype.absoluteValue = function () {var a = this.bignum, b = (this
).getImaginaryPart(), result; if (!(a.isEqualTo(theZero)) && !(b.isEqualTo(theZero))) {result = a.hypotenuse(b);} else {if (a.isEqualTo(theZero)) {result = b.absoluteValue();} else {result = a.absoluteValue();};
}; return BigCmp(result);}; BigCmp.prototype.multiplicateWith = function (anotherBigCmp) {var a = this.bignum, b = this.getImaginaryPart(), c = anotherBigCmp.bignum, d = anotherBigCmp.getImaginaryPart(); return (
BigCmp((a.multiplicateWith(c)).subtractWith(b.multiplicateWith(d)), (a.multiplicateWith(d)).addWith(b.multiplicateWith(c))));}; BigCmp.prototype.divideWith = function (anotherBigCmp) {var selected = (this
).multiplicateWith(anotherBigCmp.getConjugate()), distance = (anotherBigCmp.bignum.squarePower()).addWith((anotherBigCmp.getImaginaryPart()).squarePower()); return BigCmp(selected.bignum.divideWith(distance),
(selected.getImaginaryPart()).divideWith(distance));}; BigCmp.prototype.getConjugate = function () {return BigCmp(this.bignum, this.imaginaryPart.negativeCopy());}; BigCmp.prototype.getReciprocal = function () {
return (BigCmp(theOne)).divideWith(this);};

BigCmp.prototype.getArgument = function (inRadians) {var result = this.bignum.arcTangentTwo(this.getImaginaryPart()); return BigCmp(inRadians ? result.radians() : result);};

BigCmp.prototype.getArgument = function (inRadians) {var result = (this.getImaginaryPart()).arcTangentTwo(this.bignum); return BigCmp(inRadians ? result.radians() : result);};

BigCmp.prototype.cis = function (inRadians) {return BigCmp(((this.getArgument(inRadians)).bignum).cosine(),
(((this).getArgument(inRadians)).bignum).sine());}; BigCmp.prototype.powerWith = function (anotherBigCmp) {var a = this.bignum, b = this.getImaginaryPart(), c = anotherBigCmp.bignum,
d = anotherBigCmp.getImaginaryPart(); return (BigCmp(((
anotherBigCmp.getImaginaryPart()).multiplicateWith(this.getArgument(true))).cosine(), ((anotherBigCmp.getImaginaryPart(
)).multiplicateWith(this.getArgument(true))).sine())).multiplicateWith(a.powerWith(b));};

// Commented out to leave this script for developer usage.
/* var result = [new List, new List], i = theZero, j = i,
k = i, duration = BigDec(4410); while (i.isLessThan(duration
)) {k = theQuarter.getRandomNumberFromSignedUnits(); if (
((j.addWith(k)).absoluteValue()).isLessThan(theOne)) {j = (
j).addWith(k);} else {j = j.subtractWith(k);}; (result[0]
).add(j); i = (i.addWith(theOne));}; i = theZero, j = i,
k = i; while (i.isLessThan(duration)) {k = (theQuarter
).getRandomNumberFromSignedUnits(); if (((j.addWith(
k)).absoluteValue()).isLessThan(theOne)) {j = j.addWith(
k);} else {j = j.subtractWith(k);}; (result[1]).add(j);
i = (i.addWith(theOne));}; return new List(result);
var selfRepeater = function (loopTimes, givenValue) {
return (theTwo.addWith((loopTimes > 0) ? selfRepeater(
(loopTimes - 1), givenValue) : givenValue)).getReciprocal(
);}; return theOne.addWith(selfRepeater(20, theZero)); */

function isANonMagnitude (magnitude) {var exceptions = ['ºC', 'ºF',
'K', 'º', 'rad']; return (exceptions.indexOf(magnitude) > -1);};

function BigMgn (bignum, magnitudes) {this.init(bignum, magnitudes);}; BigMgn.prototype = BigDec();
BigMgn.prototype.textRepresentation = function() {
    var text = (this.bignum).textRepresentation(), i = 0, splittedMagnitude;
    while (i < (this.magnitudes).length) {
        splittedMagnitude = (this.magnitudes[i]).split('\|');
        text = text.concat(splittedMagnitude[0], (isANonMagnitude(splittedMagnitude[0]) ? '' : (+(splittedMagnitude[1])).toSuperScript()));
        i++;
    }
    ;return text;
}
;
BigMgn.prototype.init = (function(bignum, magnitudes) {
    this.bignum = (isNil(bignum) ? theZero : bignum);
    this.naturalContainer = (this.bignum).naturalContainer;
    this.isNegative = (this.bignum).isNegative;
    this.dotPosition = this.bignum.dotPosition;
    this.magnitudes = (isNil(magnitudes) ? new Array : magnitudes);
});

BigMgn.prototype.addWith = function(anotherBigMgn) {
    return new BigMgn((this.bignum).addWith(anotherBigMgn.bignum),this.magnitudes);
};

BigMgn.prototype.getMagnitudeNames = function() {
    var i = 0
      , names = new Array;
    while (i < (this.magnitudes).length) {
        names.push(((this.magnitudes[i]).split('\|'))[0]);
        i++;
    }
    ;return names;
}
;
BigMgn.prototype.checkEmptyMagnitudes = function() {
    var i = 0
      , magnitudes = new Array;
    while (i < this.magnitudes.length) {
        if (!(((this.magnitudes[i]).split('\|'))[1] == '0')) {
            magnitudes.push(this.magnitudes[i]);
        }
        ;i++;
    }
    ;this.magnitudes = magnitudes;
}
;
BigMgn.prototype.containsMagnitudeNamed = function(magnitude) {
    return ((this.getMagnitudeNames()).indexOf(magnitude) > -1);
}
;
BigMgn.prototype.subtractWith = function(anotherBigMgn) {
    return new BigMgn((this.bignum).subtractWith(anotherBigMgn.bignum),this.magnitudes);
}
;
BigMgn.prototype.getMagnitudeNamed = function(magnitude) {
    return (this.containsMagnitudeNamed(magnitude)) ? (this.magnitudes[(this.getMagnitudeNames()).indexOf(magnitude)]).split('\|') : ['', '0'];
}
;
BigMgn.prototype.negativeCopy = function() {
    return new BigMgn((this.bignum).negativeCopy(),this.magnitudes);
}
;
BigMgn.prototype.fullCopy = function() {
    return new BigMgn((this.bignum).fullCopy(),(this.magnitudes).fullCopy());
}
;
BigMgn.prototype.multiplicateWith = function(anotherBigMgn) {
    var bignum = (this.bignum).multiplicateWith(anotherBigMgn.bignum), magnitudeNames = (this.getMagnitudeNames()).concat((anotherBigMgn).getMagnitudeNames()), firstItem, secondItem, i = 0, result = new Array;
    magnitudeNames = magnitudeNames.uniques();
    while (i < (magnitudeNames.length)) {
        firstItem = this.getMagnitudeNamed(magnitudeNames[i]);
        secondItem = anotherBigMgn.getMagnitudeNamed(magnitudeNames[i]);
        result.push((magnitudeNames[i]).concat('\|', ((+(firstItem[1])) + (+(secondItem[1]))).toString()));
        i++;
    }
    ;bignum = new BigMgn(bignum,result);
    bignum.checkEmptyMagnitudes();
    return bignum;
}
;
BigMgn.prototype.getReciprocal = function() {
    return (new BigMgn(theOne)).divideWith(this);
}
;
BigMgn.prototype.divideWith = function(anotherBigMgn) {
    var bignum = (this.bignum).divideWith(anotherBigMgn.bignum), magnitudeNames = (this.getMagnitudeNames()).concat(anotherBigMgn.getMagnitudeNames()), firstItem, secondItem, i = 0, result = new Array;
    magnitudeNames = magnitudeNames.uniques();
    while (i < magnitudeNames.length) {
        firstItem = (this.getMagnitudeNamed(magnitudeNames[i]));
        secondItem = (anotherBigMgn.getMagnitudeNamed(magnitudeNames[i]));
        result.push((magnitudeNames[i]).concat('\|', ((+(firstItem[1])) - (+(secondItem[1]))).toString()));
        i++;
    }
    ;bignum = new BigMgn(bignum,result);
    bignum.checkEmptyMagnitudes();
    return bignum;
}
;
BigMgn.prototype.powerWith = function(anotherBigMgn) {
    var bignum = (this.bignum).powerWith(anotherBigMgn.bignum), magnitudeNames = this.getMagnitudeNames(), selectedItem, i = 0, result = new Array;
    magnitudeNames = (magnitudeNames.uniques());
    while (i < (magnitudeNames.length)) {
        firstItem = this.getMagnitudeNamed(magnitudeNames[i]);
        result.push((magnitudeNames[i]).concat('\|', ((+(firstItem[1])) * (+((anotherBigMgn.bignum).toString()))).toString()));
        i++;
    }
    ;bignum = new BigMgn(bignum,result);
    bignum.checkEmptyMagnitudes();
    return bignum;
}
;
BigMgn.prototype.radicateWith = function(anotherBigMgn) {
    var bignum = (this.bignum).radicateWith(anotherBigMgn.bignum), magnitudeNames = this.getMagnitudeNames(), selectedItem, i = 0, result = new Array;
    magnitudeNames = magnitudeNames.uniques();
    while (i < (magnitudeNames.length)) {
        firstItem = this.getMagnitudeNamed(magnitudeNames[i]);
        result.push((magnitudeNames[i]).concat('\|', ((+(firstItem[1])) / (+((anotherBigMgn.bignum).toString()))).toString()));
        i++;
    }
    ;bignum = (new BigMgn(bignum,result));
    bignum.checkEmptyMagnitudes();
    return bignum;
};