/* "math.js" is an advanced arbitrary-precision math library for any JavaScript project, made with harder work. Written by Alessandro Moisés, email: aless01pime@gmail.com. Copyleft (Ɔ) 2024
by Alessandro Moisés. The following list shows the order in which all constructors are defined. Use this list to locate code on this document: BigNumMemoizer; [BigDec, {BigMgn, BigCmp}]. */

const isNil = (thing => nil.includes(thing)), getHiddenVariable = function (selectedVar) {if (isNil(selectedVar)) {return undefined;} else if (selectedVar.toString instanceof Function) {selectedVar = (selectedVar
).toString();} else {return undefined;}; return (new Function(('try \{return ').concat(selectedVar,'\;\} catch \(error\) \{return undefined\;\}\;')))();}, nil = [null, undefined]; Array.prototype.flatten = (
function () {var result = []; this.deepMap(item => result.push(item)); return result;}); Array.prototype.shallowCopy = function () {var result = []; this.forEach(item => result.push(item)); return result;};
Array.prototype.deepMap = function (callback) {return this.map(item => ((item instanceof Array) ? item.deepMap(callback) : callback(item)));}; Array.prototype.fullCopy = function () {return this.deepMap((item
) => ((item instanceof Array) ? item.fullCopy() : item));}; Array.prototype.completeCopy = function () {return (this.deepMap(item => ((item instanceof Array) ? item.fullCopy() : (isNil(item) ? item : (((item
).fullCopy instanceof Function) ? item.fullCopy() : item)))));}; Array.prototype.uniques = function () {return this.filter((item, index, list) => (list.indexOf(item) == index));}; var isBigDecSupported = (
getHiddenVariable('BigInt') instanceof Object); if (isBigDecSupported) {console.log('BigDec is supported.');} else {console.error('BigDec is not supported.');}; const BigNumMemoizer = function () {this.init();
}; BigNumMemoizer.prototype.saveOnTheStorage = function(selectedInput, selectedOutput) {if (!(isNil(this.localStorage))) {if (this.localStorage.getItem('bigNumMemoizerInputs') == '') {this.localStorage.setItem(
'bigNumMemoizerInputs', selectedInput);} else {this.localStorage.setItem('bigNumMemoizerInputs', (this.localStorage.getItem('bigNumMemoizerInputs')).concat('\|', selectedInput));}; if (this.localStorage.getItem(
'bigNumMemoizerOutputs') == '') {this.localStorage.setItem('bigNumMemoizerOutputs', selectedOutput);} else {this.localStorage.setItem('bigNumMemoizerOutputs', (this.localStorage.getItem('bigNumMemoizerOutputs'
)).concat('\|', selectedOutput));};};}; BigNumMemoizer.prototype.clearTheCache = function () {if (!(isNil(this.localStorage))) {this.localStorage.setItem('bigNumMemoizerInputs', ''); (this.localStorage
).setItem('bigNumMemoizerOutputs', '');}; this.memoizedInputs = []; this.memoizedOutputs = [];}; BigNumMemoizer.prototype.memoize = function (selectedFunction, selectedFirstInput, selectedSecondInput) {
var selectedString = selectedFunction.concat(',', selectedFirstInput.toString(), ',', isNil(selectedSecondInput) ? 'monadic' : selectedSecondInput.toString(), ',', BigDec.prototype.maximumDecimals.toString(
)), selectedSearch = this.memoizedInputs.indexOf(selectedString); var result; if (selectedSearch > -1) {result = this.memoizedOutputs[selectedSearch];} else {try {result = ((selectedFirstInput[selectedFunction])(
selectedSecondInput)).toString();} catch (exception) {result = 'error'; console.error(exception);}; this.memoizedInputs.push(selectedString); this.memoizedOutputs.push(result); if (false) {this.saveOnTheStorage(
selectedString, result);};}; var selectedConstructor = selectedFirstInput.constructor.name, receivedOutput = new Function('text', ('return \(new ').concat(selectedConstructor, '\(text\)\)\;')); if ((result
) == 'error') {throw Error('Unsupported calculation.');} else {return receivedOutput(result);};}; BigNumMemoizer.prototype.init = function () {this.memoizedInputs = []; this.memoizedOutputs = []; (this
).localStorage = null; try {this.localStorage = window.localStorage;} catch (error) {}; if (!isNil(this.localStorage)) {if (isNil(this.localStorage.getItem('bigNumMemoizerInputs'))) {(this.localStorage
).setItem('bigNumMemoizerInputs', '');}; if (isNil(this.localStorage.getItem('bigNumMemoizerOutputs'))) {this.localStorage.setItem('bigNumMemoizerOutputs', '');}; this.memoizedInputs = ((this.localStorage
).getItem('bigNumMemoizerInputs')).split('\|'); this.memoizedOutputs = (this.localStorage.getItem('bigNumMemoizerOutputs')).split('\|');};}; const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
'-', '.'], infinities = ['Infinity', '-Infinity'], isADigit = (digit => digits.includes(digit)), getNZeroes = function (zeroes) {zeroes = Math.trunc(Math.max(zeroes, 0)); if (zeroes == 0) {return '';} else {
return ((BigInt(10) ** BigInt(zeroes.toString())).toString()).slice(1, zeroes + 1);};}, isSecureForNumbers = function (text) {return (infinities.includes(text) || (text.split('')).every(isADigit));}, BigDec = (
function (text) {if (new.target instanceof Function) {this.init(text);} else {return (new BigDec(text));};}), containsNumbers = function (text) {return (text.split('')).some(isADigit);}; (BigNumMemoizer.prototype
).constructor = BigNumMemoizer; const LocalBigNumMemoizer = new BigNumMemoizer; BigDec.prototype.constructor = BigDec; var BigDecCounter = BigInt(0); BigDec.prototype.init = function (text) {this.bignum = this;
this.imaginaryPart = null; if (isNil(text)) {text = '';} else if (text.toString instanceof Function) {text = text.toString(); text = (isSecureForNumbers(text) ? text : '');} else {text = '';}; if ((infinities
).includes(text)) {this.naturalContainer = BigInt(1); this.isNegative = (text[0] == '-'); this.isInfinite = true; this.dotPosition = 0;} else {this.isInfinite = false; var splittedNumeral = text.split('.'); (this
).isNegative = ((splittedNumeral[0])[0] == '-'); this.dotPosition = 0; if (this.isNegative) {splittedNumeral[0] = (splittedNumeral[0]).slice(1, (splittedNumeral[0]).length);}; if (splittedNumeral.length > 1) {if (
(splittedNumeral[1]).length > this.maximumDecimals) {splittedNumeral[1] = (splittedNumeral[1]).slice(0, this.maximumDecimals);}; while (true) {if ((splittedNumeral[1])[splittedNumeral[1].length - 1] == '0') {
splittedNumeral[1] = ((splittedNumeral[1]).slice(0, ((splittedNumeral[1]).length - 1)));} else {break;};};} else {splittedNumeral.push('');}; this.dotPosition = (splittedNumeral[1]).length; (this.naturalContainer
) = BigInt((splittedNumeral[0]).concat(splittedNumeral[1])); if (this.naturalContainer.toString() == '0') {this.isNegative = false;}; this.magnitudes = [];}; BigDecCounter = (BigDecCounter + BigInt(1)); (this
).counter = BigDecCounter; return this;}; BigDec.prototype.toString = function () {if (this.isInfinite) {return (this.isNegative ? '-' : '').concat(infinities[0]);}; var numeral = this.naturalContainer.toString(
); if (this.dotPosition > 0) {return (this.isNegative ? '-' : '').concat((!(this.dotPosition < (this.naturalContainer.toString()).length) ? '0' : ''), numeral.slice(0, Math.max((numeral.length - this.dotPosition
), 0)), '.', getNZeroes(this.dotPosition - (this.naturalContainer.toString()).length), numeral.slice(Math.max((numeral.length - this.dotPosition), 0), numeral.length));} else {return ((this.isNegative ? '-' : ''
).concat(numeral));};}; BigDec.prototype.maximumDecimals = 16; BigDec.prototype.toSignedInteger = function () {var copy = this.fullCopy(); copy.dotPosition = 0; return copy.toString();}; (BigDec.prototype
).subtractWith = function (anotherBigNum) {return this.addWith(anotherBigNum.negativeCopy());}; BigDec.prototype.fullCopy = function () {if (this.isInfinite) {return BigDec(this);} else {var splittedNumeral = (
this.toString()).split('.'); if (splittedNumeral.length > 1) {if ((splittedNumeral[1]).length > this.maximumDecimals) {splittedNumeral[1] = (splittedNumeral[1]).slice(0, this.maximumDecimals);};} else {
splittedNumeral.push('0');}; return BigDec((splittedNumeral[0]).concat('.', splittedNumeral[1]));};}; BigDec.prototype.negativeCopy = function () {var copy = this.fullCopy(); copy.isNegative = !((copy
).isNegative); return copy.fullCopy();}; BigDec.prototype.getImaginaryPart = function () {var imag = this.imaginaryPart; return (isNil(imag) ? theZero : imag);}; BigDec.prototype.addWith = function (
anotherBigNum) {if (this.isInfinite || anotherBigNum.isInfinite) {if (this.isInfinite && anotherBigNum.isInfinite) {if (this.isNegative == anotherBigNum.isNegative) {return this.fullCopy();} else {return (
theZero);};} else {if (this.isInfinite) {return this.fullCopy();} else {return anotherBigNum.fullCopy();};};} else {var firstNum = this.toSignedInteger(), firstDot = this.dotPosition, secondNum = (anotherBigNum
).toSignedInteger(), secondDot = anotherBigNum.dotPosition, result; if (firstDot > secondDot) {secondNum = secondNum.concat(getNZeroes(firstDot - secondDot)); result = BigDec(BigInt(firstNum) + BigInt(secondNum
)); result.dotPosition = firstDot; return result.fullCopy();} else if (secondDot > firstDot) {firstNum = firstNum.concat(getNZeroes(secondDot - firstDot)); result = BigDec(BigInt(firstNum) + BigInt(secondNum)
); result.dotPosition = secondDot; return result.fullCopy();} else {result = BigDec(BigInt(firstNum) + BigInt(secondNum)); result.dotPosition = firstDot; return result.fullCopy();};};}; (BigDec.prototype
).isPureInteger = function () {return (this.getDecimals()).isEqualTo(theZero);}; BigDec.prototype.isGreaterThan = function (anotherBigNum) {return (anotherBigNum.subtractWith(this)).isNegative;}; (BigDec.prototype
).isLessThan = function (anotherBigNum) {return (this.subtractWith(anotherBigNum)).isNegative;}; BigDec.prototype.floor = function () {return ((this.isNegative && !(this.isPureInteger())) ? (this.truncate()
).addWith(theDarkUnit) : this.truncate());}; BigDec.prototype.truncate = function () {return (BigDec((((this.fullCopy()).toString()).split('.'))[0]));}; BigDec.prototype.getSignum = function () {return (this
).divideWith(this.absoluteValue());}; BigDec.prototype.isEqualTo = function (anotherBigNum) {return (((anotherBigNum.subtractWith(this)).absoluteValue()).toString() == '0');}; BigDec.prototype.ceiling = function (
) {return ((!(this.isNegative) && !(this.isPureInteger())) ? theOne.addWith(this.truncate()) : (this.truncate()));}; BigDec.prototype.getDecimals = function () {return this.subtractWith(this.truncate());};
BigDec.prototype.absoluteValue = function () {return (this.isNegative ? this.negativeCopy() : this.fullCopy());}; BigDec.prototype.gammaHelper = function () {var identity = this.addWith(theDarkUnit); if ((this
).isEqualTo(positiveInfinity) || this.isEqualTo(theOne)) {return this;} else if (this.isGreaterThan(theOne)) {return (identity.multiplicateWith(identity.gamma()));} else if (this.isEqualTo(theZero)) {return (
positiveInfinity);} else if (this.isLessThan(theZero)) {return ((this.addWith(theOne)).gamma()).divideWith(this);} else {return (this.gammaLogarithm()).exponential();};}; BigDec.prototype.gamma = function () {
return LocalBigNumMemoizer.memoize('gammaHelper', this);}; BigDec.prototype.simpleFactorial = function () {return (this.addWith(theOne)).gamma();}; BigDec.prototype.basicModulateWith = function (anotherBigNum
) {if (this.isInfinite) {return theZero;} else if (anotherBigNum.isInfinite) {var copy = this.fullCopy(); if (anotherBigNum.isNegative) {copy = copy.negativeCopy();}; return copy;} else {var firstNum = ((this
).absoluteValue()).toSignedInteger(), firstDot = this.dotPosition, secondNum = (anotherBigNum.absoluteValue()).toSignedInteger(), secondDot = anotherBigNum.dotPosition, result; if (this.isEqualTo(anotherBigNum
)) {return theZero;} else if (anotherBigNum.isEqualTo(theZero)) {return infinitySignedAs(this.isNegative);}; if (firstDot > secondDot) {secondNum = secondNum.concat(getNZeroes(firstDot - secondDot)); result = (
BigDec(BigInt(firstNum) % BigInt(secondNum))); result.dotPosition = firstDot; result.isNegative = this.isNegative; return result.fullCopy();} else if (secondDot > firstDot) {firstNum = firstNum.concat(getNZeroes(
secondDot - firstDot)); result = BigDec(BigInt(firstNum) % BigInt(secondNum)); result.dotPosition = secondDot; result.isNegative = this.isNegative; return result.fullCopy();} else {result = BigDec(BigInt(firstNum
) % BigInt(secondNum)); result.dotPosition = firstDot; result.isNegative = this.isNegative; return result.fullCopy();};};}; BigDec.prototype.betterModulateWith = function (anotherBigNum) {if (this.isInfinite) {
return theZero;} else if (anotherBigNum.isInfinite) {var copy = this.fullCopy(); if (anotherBigNum.isNegative) {copy.isNegative = !(copy.isNegative);}; return copy;} else if (anotherBigNum.isEqualTo(theZero)
) {return infinitySignedAs(this.isNegative);} else {return ((this.basicModulateWith(anotherBigNum)).addWith(anotherBigNum)).basicModulateWith(anotherBigNum);};}; BigDec.prototype.betterRound = function () {
var rounded = (this.absoluteValue()).basicRound(); rounded.isNegative = this.isNegative; return rounded.fullCopy();}; BigDec.prototype.basicRound = function () {return (!(((this.absoluteValue()).getDecimals(
)).isLessThan(theHalf)) ? this.ceiling() : this.floor());}; BigDec.prototype.exponentialHelper = function () {if (this.isLessThan(theZero)) {return ((this.negativeCopy()).exponentialHelper()).getReciprocal();
} else if (this.isEqualTo(theZero)) {return theOne;} else if (this.isGreaterThan(theOne)) {return (eulerNatural.raiseWith(this.truncate())).multiplicateWith((this.getDecimals()).exponentialHelper());} else {
return (repeatedSummatory((n => (this.raiseWith(n)).divideWith(n.simpleFactorial())), theZero, theSevenTeen)).fixDecimals();};}; BigDec.prototype.multiplicateWith = function (anotherBigNum) {if (theOne.isEqualTo(
anotherBigNum)) {return this.fullCopy();} else if (anotherBigNum.isEqualTo(theZero)) {return theZero;} else if (this.isInfinite || anotherBigNum.isInfinite) {return (infinitySignedAs(!(this.isNegative == (
anotherBigNum.isNegative))));} else {var secondNum = anotherBigNum.toSignedInteger(), firstNum = this.toSignedInteger(), firstDot = this.dotPosition, secondDot = anotherBigNum.dotPosition, result = BigDec(BigInt(
firstNum) * BigInt(secondNum)); result.dotPosition = firstDot + secondDot; return result.fixDecimals();};}; BigDec.prototype.arcTangentRadians = function () {return summatoryIntegral((z => (theOne.addWith(
z.squarePower()).getReciprocal())), this, theZero, arcCreator);}; BigDec.prototype.min = function (anotherBigNum) {if (isNil(anotherBigNum)) {anotherBigNum = theZero;}; return [anotherBigNum, this][+((this
).isLessThan(anotherBigNum))];}; BigDec.prototype.max = function (anotherBigNum) {if (isNil(anotherBigNum)) {anotherBigNum = theZero;}; return [anotherBigNum, this][+(this.isGreaterThan(anotherBigNum))];
}; BigDec.prototype.divideWith = function (divisor) {if (this.isInfinite || divisor.isInfinite) {if (this.isInfinite && divisor.isInfinite) {return getUnitWithSign((this.isNegative + divisor.isNegative
) == 1);} else {if (this.isInfinite) {return infinitySignedAs(((this.isNegative + divisor.isNegative) == 1));}; if (divisor.isInfinite) {return theZero;};};} else {var dividend = this.naturalContainer,
divisorDotPosition = divisor.dotPosition, isNegative = ((this.isNegative + divisor.isNegative) == 1), quotient; divisor = divisor.naturalContainer; if (dividend == '0') {quotient = theZero;} else if ((
dividend == divisor) && (this.dotPosition == divisorDotPosition)) {quotient = getUnitWithSign(isNegative);} else if (divisor == '0') {return (infinitySignedAs(this.isNegative));} else {var multiplier = (
'1').concat(getNZeroes((this.maximumDecimals + divisorDotPosition) - this.dotPosition)); quotient = ((dividend * BigInt(multiplier)) / divisor); quotient = BigDec(quotient); quotient.dotPosition = (this
).maximumDecimals; quotient = quotient.fixDecimals(); quotient.isNegative = isNegative;}; return quotient;};}; BigDec.prototype.raisingHelper = function (power) {try {var result = BigDec((this.naturalContainer
) ** (power.truncate()).naturalContainer); result.dotPosition = this.dotPosition * (+((power.truncate()).toString())); if (this.isNegative) {result.isNegative = theOne.isEqualTo((power.truncate()
).betterModulateWith(theTwo));}; return result.fullCopy();} catch (error) {return repeatedProduct((() => this), theZero, power.addWith(theDarkUnit));};}; BigDec.prototype.exponential = function () {return (
this.isEqualTo(theZero) ? theOne : (this.isInfinite ? (this.isNegative ? theZero : positiveInfinity) : (LocalBigNumMemoizer.memoize('exponentialHelper', this)).fixDecimals()));}; BigDec.prototype.raiseWith = (
function (power) {return LocalBigNumMemoizer.memoize('raisingHelper', this, power);}); BigDec.prototype.naturalLogarithm = function () {return this.logarithmWith(eulerNatural);}; BigDec.prototype.powerWith = (
function (exponent) {var result; if (exponent.isNegative) {return (this.powerWith(exponent.negativeCopy())).getReciprocal();} else if (exponent.isEqualTo(theOne)) {return this.fullCopy();} else if ((exponent
).isEqualTo(theZero)) {return this.divideWith(this);} else if (this.isInfinite || exponent.isInfinite) {if (exponent.isInfinite) {if (this.isInfinite) {return positiveInfinity;} else if ((this.absoluteValue()
).isGreaterThan(theZero)) {return positiveInfinity;} else if ((this.absoluteValue()).isEqualTo(theOne)) {return theOne;} else {return theZero;};} else if (exponent.isGreaterThan(theZero)) {return (positiveInfinity
);};} else if (this.isEqualTo(theZero)) {return theZero;} else if (this.isEqualTo(eulerNatural)) {return exponent.exponential();} else if (this.isEqualTo(theTen)) {result = (BigDec(('1').concat(getNZeroes((+(
exponent)).toString())))); exponent = exponent.getDecimals(); if (exponent.isGreaterThan(theZero)) {result = result.multiplicateWith((this).radicateWith(exponent.getReciprocal()));}; return result;} else {
result = this.raiseWith(exponent); exponent = exponent.getDecimals(); if (exponent.isGreaterThan(theZero)) {result = result.multiplicateWith(this.radicateWith(exponent.getReciprocal()));}; return (result
).fixDecimals();};}); BigDec.prototype.decimalLogarithm = function () {var i = BigDec(((this.truncate()).naturalContainer.toString()).length - 1), characteristic = (this.absoluteValue()).divideWith((theTen
).raiseWith(i)); while (true) {if (characteristic.isLessThan(theTen)) {break;}; i = i.addWith(theOne); characteristic = characteristic.divideWith(theTen);}; if (characteristic.isGreaterThan(theOne)) {var k,
j = 0, mantissa = '.'; while (j < this.maximumDecimals) {characteristic = characteristic.raiseWith(theTen); k = 0; while (true) {if (characteristic.isLessThan(theTen)) {break;}; characteristic = (characteristic
).divideWith(theTen); k++;}; mantissa = mantissa.concat(k.toString()); j++;}; return (i.addWith(BigDec(mantissa))).fixDecimals();} else {return i;};}; BigDec.prototype.squarePower = function () {return (
this.multiplicateWith(this));}; BigDec.prototype.logarithmHelper = function (base) {if (this.isEqualTo(base)) {return theOne;} else if (base.isEqualTo(theOne) || !(base.isGreaterThan(theZero))) {return (
negativeInfinity);} else if (base.isLessThan(theOne)) {return ((this.logarithmHelper(base.getReciprocal())).fixDecimals()).negativeCopy();} else if ((this.truncate()).isEqualTo(theZero)) {return ((((this
).getReciprocal()).logarithmWith(base)).fixDecimals()).negativeCopy();} else {return ((this.decimalLogarithm()).divideWith(base.decimalLogarithm())).fixDecimals();};}; BigDec.prototype.logarithmWith = (
function (base) {if (base.isNegative) {return negativeInfinity;} else if (base.isInfinite) {return ((this.isInfinite && !(this.isNegative)) ? theOne : theZero);} else if (this.isNegative) {return (
negativeInfinity);} else if (this.isEqualTo(theZero)) {return negativeInfinity;} else {return (this.isEqualTo(positiveInfinity) ? this : LocalBigNumMemoizer.memoize('logarithmHelper', this, base));};}
); BigDec.prototype.logistic = function () {return (this.isLessThan(theZero) ? theOne.subtractWith((this.negativeCopy()).logistic()) : (theOne.addWith((this.negativeCopy()).exponential())).getReciprocal(
));}; BigDec.prototype.logit = function () {return (this.divideWith(theOne.subtractWith(this))).naturalLogarithm();}; BigDec.prototype.getReciprocal = function () {return theOne.divideWith(this);}; (BigDec
).prototype.fixDecimals = function () {var copy = this.fullCopy(), decimals = (copy.toString()).split('.'); if (decimals.length > 1) {decimals = decimals[1]; if (decimals.length === this.maximumDecimals) {
var result = this.fullCopy(); result.maximumDecimals -= 3; result = result.fullCopy(); decimals = (result.toString()).split('.'); if (decimals.length > 1) {decimals = decimals[1]; if ((decimals.split('')
).every(digit => (digit === '9'))) {copy = (result.truncate()).addWith(result.isNegative ? theDarkUnit : theOne);} else if (decimals.length === 0) {copy = result;};};};}; return copy;}; const theZero = (
BigDec()), octaveOfTurn = BigDec(45), theOne = BigDec(1), halfTurn = BigDec(180), tripleQuartOfTurn = BigDec(270), positiveInfinity = BigDec(Infinity), negativeInfinity = BigDec(-Infinity), theTwo = (
BigDec(2)), theSevenTeen = BigDec(17), entireTurn = BigDec(360), oldBase = BigDec(60), theTen = BigDec(10), theHalf = BigDec(1/2), theDarkUnit = BigDec(-1), getUnitWithSign = function (isNegative) {return (
BigDec((isNegative ? '-' : '').concat('1')));}, twoSquaredTimesThree = BigDec(12), infinitySignedAs = function (isNegative) {return BigDec(((isNegative) ? '-' : '').concat(infinities[0]));}, theThree = (
BigDec(3)), threePlusTwo = BigDec(5), twoSquared = BigDec(4), twoCubed = BigDec(8), getRandomDigit = (() => ((Math.round(Math.random() * 10)).toString())[0]), quarterOfTurn = BigDec(90), summatoryIntegral = (
function (func, upperBound, lowerBound, intervals, old = false) {var dx = upperBound.subtractWith(lowerBound); if (dx.isEqualTo(theZero)) {return dx;} else {dx = dx.divideWith(intervals); intervals = (theTwo
).multiplicateWith(theOne.max(((intervals.betterRound()).divideWith(theTwo)).ceiling())); if (old == true) {return ((upperBound.subtractWith(lowerBound)).divideWith(intervals)).multiplicateWith((((func(upperBound
)).addWith(func(lowerBound))).divideWith(theTwo)).addWith(repeatedSummatory((k => (func(lowerBound.addWith((k.multiplicateWith(upperBound.subtractWith(lowerBound))).divideWith(intervals))))), theOne, (intervals
).addWith(theDarkUnit)))); return (repeatedSummatory((k => (func(lowerBound.addWith(k.multiplicateWith(dx)))).multiplicateWith((k.betterModulateWith(theTwo)).isEqualTo(theZero) ? (k.isInTheRangeOf(theZero,
intervals) ? theTwo : theOne) : twoSquared)), theZero, intervals)).multiplicateWith(dx.divideWith(theThree));};};}), repeatedProduct = function(func, offset, steps) {var offset = offset.betterRound(),
steps = (steps.betterRound()).subtractWith(offset), result = theOne; while (!(steps.isLessThan(theZero))) {result = (result.multiplicateWith(func(offset))); steps = steps.addWith(theDarkUnit); offset = (
offset.addWith(theOne));}; return result;}, getDerivativeOf = function(func, value, distance) {return ((func(value.addWith(distance))).subtractWith(func(value))).divideWith(distance);}, repeatedSummatory = (
function (func, offset, steps) {var result = theZero, offset = offset.betterRound(), steps = (steps.betterRound()).subtractWith(offset); while (!(steps.isLessThan(theZero))) {result = result.addWith(func(offset
)); steps = steps.addWith(theDarkUnit); offset = offset.addWith(theOne);}; return result;}), eulerNatural = theOne.exponential(), productIntegral = function (func, upperBound, lowerBound, intervals, old) {
return (summatoryIntegral((y => func(y.naturalLogarithm())), upperBound, lowerBound, intervals, old)).exponential();}; BigDec.prototype.cosine = function () {var modular = this.betterModulateWith(entireTurn);
if (modular.isGreaterThan(tripleQuartOfTurn)) {return (entireTurn.subtractWith(modular)).cosine();} else if (modular.isGreaterThan(halfTurn)) {return ((modular.subtractWith(halfTurn)).cosine()).negativeCopy();
} else if (modular.isGreaterThan(quarterOfTurn)) {return ((halfTurn.subtractWith(modular)).cosine()).negativeCopy();} else {return LocalBigNumMemoizer.memoize('cosineHelper', modular);};}; (BigDec.prototype
).cosineHelper = function () {if (this.isEqualTo(quarterOfTurn)) {return theZero;} else if (oldBase.isEqualTo(this)) {return theHalf;} else if (this.isEqualTo(theZero)) {return theOne;} else {return (
repeatedSummatory((k => ((theDarkUnit.powerWith(k)).multiplicateWith((this.radians()).powerWith(theTwo.multiplicateWith(k)))).divideWith((k.multiplicateWith(theTwo)).simpleFactorial())), theZero,
twoCubed)).fixDecimals();};}; BigDec.prototype.sine = function () {return (this.isInfinite ? theZero : ((this.addWith(quarterOfTurn)).cosine()).negativeCopy());}; BigDec.prototype.tangent = function () {
return (this.sine()).divideWith(this.cosine());}; BigDec.prototype.cotangent = function () {return (this.isInfinite ? positiveInfinity : (quarterOfTurn.subtractWith(this)).tangent());}; (BigDec.prototype
).isInTheRangeOf = function (startPoint, endPoint) {return (this.isGreaterThan(startPoint) && this.isLessThan(endPoint));}; BigDec.prototype.cosecant = function () {return (this.sine()).getReciprocal();};
BigDec.prototype.getMagnitudeNames = (() => []); BigDec.prototype.secant = function () {return (this.cosine()).getReciprocal();}; BigDec.prototype.sinc = function () {return (this.isEqualTo(theZero) ? (
theOne.radians()) : (this.sine()).divideWith(this));}; BigDec.prototype.radians = function () {return (this.multiplicateWith(piIncalculable)).divideWith(halfTurn);}; BigDec.prototype.squareRoot = function (
isFaster) {return (isFaster ? ((this.naturalLogarithm()).divideWith(theTwo)).exponential() : this.radicateWith(theTwo));}; BigDec.prototype.degrees = function () {return (this.multiplicateWith(halfTurn)
).divideWith(piIncalculable);}; BigDec.prototype.getIntervalMetallicMean = function () {return (this.addWith((twoSquared.addWith(this.squarePower())).squareRoot())).divideWith(theTwo);}; (BigDec.prototype
).getCoreMetallicMean = function () {return (twoSquared.addWith(this.squarePower())).squareRoot();}; BigDec.prototype.radicateWith = function (anotherBigNum) {var index = anotherBigNum.absoluteValue(); if (
index.isInfinite) {return theZero;} else if (this.isInfinite) {return positiveInfinity;} else if ((index.getDecimals()).isGreaterThan(theZero)) {return LocalBigNumMemoizer.memoize('radicationHelper', this,
anotherBigNum);} else {if ((index.basicModulateWith(theTwo)).isGreaterThan(theZero)) {return (LocalBigNumMemoizer.memoize('radicationHelper', this.absoluteValue(), anotherBigNum)).multiplicateWith((this
).getSignum());} else {return LocalBigNumMemoizer.memoize('radicationHelper', this, anotherBigNum);};};}; BigDec.prototype.doubleFactorial = function () {var factor = this.basicRound(); if (factor.isGreaterThan(
theTwo)) {return (factor.multiplicateWith(factor.subtractWith(theTwo))).multiplicateWith(LocalBigNumMemoizer.memoize('doubleFactorial', factor.subtractWith(twoSquared)));} else {return factor.max(theOne);};
}; BigDec.prototype.radicationHelper = function (index) {if (index.isLessThan(theZero)) {return (this.radicateWith(index.negativeCopy())).getReciprocal();} else if (this.isEqualTo(theZero)) {return theZero;
} else if (index.isEqualTo(theZero)) {return positiveInfinity;} else if (this.isEqualTo(theZero)) {return theZero;} else if (index.isLessThan(theOne)) {return this.powerWith(index.getReciprocal());} else if (
index.isEqualTo(theOne)) {return this.fullCopy();} else {var i = theZero, result = theZero; if ((index.getDecimals()).isGreaterThan(i)) {return ((this.naturalLogarithm()).divideWith(index)).exponential();
} else {while (result.isLessThan(this)) {i = i.addWith(theOne); result = i.powerWith(index);}; if (result.isGreaterThan(this)) {if ((this.getDecimals()).isGreaterThan(theZero)) {return ((this.naturalLogarithm(
)).divideWith(index)).exponential();} else {var limit = ((Math.trunc(this.maximumDecimals / 4)) * (+(index.toString())) * ((this.truncate()).toString()).length), j = 0; result = this.subtractWith((i.addWith(
theDarkUnit)).powerWith(index)); while (j < limit) {result = (result.subtractWith(((result.powerWith(index)).subtractWith(this)).divideWith(index.multiplicateWith(result.powerWith(index.addWith(theDarkUnit)))
))); j++;}; return result;};} else {return i;};};};}; BigDec.prototype.combineWith = function (anotherBigNum) {return (this.permutateWith(anotherBigNum)).divideWith(anotherBigNum.simpleFactorial());}; (BigDec
).prototype.permutateWith = function (anotherBigNum) {return (this.simpleFactorial()).divideWith((this.subtractWith(anotherBigNum)).simpleFactorial());}; BigDec.prototype.containsMagnitudeNamed = (() => false
); BigDec.prototype.customFibonacci = function (base) {var metallicPower = (base.getIntervalMetallicMean()).powerWith(this), result = (metallicPower.subtractWith(((halfTurn.multiplicateWith(this)).cosine(
)).divideWith(metallicPower))).divideWith(base.getCoreMetallicMean()); if (this.isPureInteger() && base.isPureInteger()) {result = result.betterRound();}; return result;}; BigDec.prototype.customLucas = (
function (base) {var metallicPower = (base.getIntervalMetallicMean()).powerWith(this), result = (metallicPower.addWith(((halfTurn.multiplicateWith(this)).cosine()).divideWith(metallicPower))); if ((this
).isPureInteger() && base.isPureInteger()) {result = result.betterRound();}; return result;}); BigDec.prototype.standardLucas = function () {return this.customLucas(theOne);}; (BigDec.prototype.hypotenuse
) = function (anotherBigNum) {return ((this.squarePower()).addWith(anotherBigNum.squarePower())).squareRoot();}; BigDec.prototype.textRepresentation = function () {return (this.isInfinite ? ((this.isNegative
) ? '-' : '').concat('∞') : this.toString());}; BigDec.prototype.getRandomNumberFromSignedUnits = function () {return this.multiplicateWith(theOne.dealWith(theDarkUnit));}; (BigDec.prototype.standardFibonacci
) = function () {return this.customFibonacci(theOne);}; BigDec.prototype.getMagnitudeNamed = (() => ['', '0']); BigDec.prototype.arcTangent = function () {return (this.isLessThan(theZero) ? halfTurn.subtractWith(
(this.negativeCopy()).arcTangent()) : (this.isGreaterThan(theOne) ? (quarterOfTurn.subtractWith((this.getReciprocal()).arcTangent())) : (((this.arcTangentRadians()).divideWith(arcPi)).multiplicateWith(octaveOfTurn
))));}; BigDec.prototype.arcTangentTwo = function (anotherBigNum) {if (anotherBigNum.isLessThan(theZero) && this.isGreaterThan(theZero)) {return halfTurn.subtractWith(this.arcTangentTwo(anotherBigNum.negativeCopy(
)));} else if (anotherBigNum.isLessThan(theZero) && this.isEqualTo(theZero)) {return halfTurn;} else if ((anotherBigNum.isLessThan(theZero)) && this.isLessThan(theZero)) {return (halfTurn.addWith(((this
).negativeCopy()).arcTangentTwo(anotherBigNum.negativeCopy())));} else if (anotherBigNum.isEqualTo(theZero) && this.isLessThan(theZero)) {return tripleQuartOfTurn;} else if (anotherBigNum.isGreaterThan(theZero
) && this.isLessThan(theZero)) {return (entireTurn.subtractWith((this.negativeCopy()).arcTangentTwo(anotherBigNum)));} else if (anotherBigNum.isGreaterThan(theZero) && this.isEqualTo(theZero)) {return theZero;
} else {return (quarterOfTurn.subtractWith((anotherBigNum.divideWith(this)).arcTangent()));};}; BigDec.prototype.arcCosine = function () {return (this.isGreaterThan(theDarkUnit) ? (this.isGreaterThan(theOne
) ? negativeInfinity : (((theOne.subtractWith(this.squarePower())).squareRoot()).divideWith(this)).arcTangent()) : (this.isLessThan(theDarkUnit) ? positiveInfinity : halfTurn));}; (BigDec.prototype.arcSine
) = function () {var result = quarterOfTurn.subtractWith(this.arcCosine()); return (result.isInfinite ? result : result.betterModulateWith(entireTurn));}; BigDec.prototype.arcSecant = function () {return (
this.getReciprocal()).arcCosine();}; BigDec.prototype.arcCosecant = function () {return (this.getReciprocal()).arcSine();}; BigDec.prototype.arcCotangent = function () {return quarterOfTurn.subtractWith((this
).arcTangent());}; BigDec.prototype.dealWith = function(anotherBigNum) {var max = this.max(anotherBigNum), min = this.min(anotherBigNum), result = max.subtractWith(min), digitPlacers = (((result.truncate()
).toString()).length + 15); if (result.isEqualTo(theZero)) {return min;} else {var randomness = '', i = 0; while (i < digitPlacers) {randomness = randomness.concat(getRandomDigit()); i++;}; result = (result
).multiplicateWith(BigDec(randomness)); result.dotPosition += digitPlacers; return (result.fullCopy()).addWith(min);};}; const medianMean = function () {var list = (Array.from(arguments)).sort((a, b) => (
a.isLessThan(b))); return ((list.length > 1) ? ((list.length % 2) > 0) ? list[Math.ceil(list.length / 2)] : (arithmeticMean(list[list.length / 2], list[(list.length / 2) + 1])) : ((list.length > 0) ? list[0
] : theZero));}, arithmeticMean = function () {var list = Array.from(arguments); return ((list.length > 1) ? (list.reduce((a, b) => a.addWith(b))).divideWith(BigDec(list.length)) : ((list.length > 0) ? list[0
] : theZero));}, geometricMean = function () {var list = Array.from(arguments); return ((list.length > 1) ? (list.reduce((a, b) => a.multiplicateWith(b))).radicateWith(BigDec(list.length)) : ((list.length > 0
) ? list[0] : theOne));}, harmonicMean = function () {var basic = Array.from(arguments), list = (basic.fullCopy()).map(n => (n.getReciprocal())); return ((list.length > 1) ? (BigDec(list.length)).divideWith(
list.reduce((a, b) => a.addWith(b))) : ((list.length > 0) ? basic[0] : positiveInfinity));}; BigDec.prototype.cubeRoot = function (isFaster) {return (isFaster ? ((this.naturalLogarithm()).divideWith(theThree
)).exponential() : this.radicateWith(theThree));}; BigDec.prototype.hyperbolicCosine = function () {return ((this.exponential()).addWith((this.negativeCopy()).exponential())).divideWith(theTwo);}; (BigDec
).prototype.hyperbolicTangent = function () {return (this.hyperbolicSine()).divideWith(this.hyperbolicCosine());}; BigDec.prototype.hyperbolicCotangent = function () {return (this.hyperbolicCosine()).divideWith(
this.hyperbolicSine());}; BigDec.prototype.agm = function (anotherBigNum) {var firstA = this, firstB = anotherBigNum, secondA, secondB, i = 0, limit = (((((arithmeticMean(firstA, firstB)).betterRound()
).absoluteValue()).toString()).length * (this.maximumDecimals * 2)); while (i < limit) {secondA = arithmeticMean(firstA, firstB); secondB = geometricMean(firstA, firstB); firstA = secondA; firstB = secondB;
i++;}; return arithmeticMean(firstA, firstB);}; BigDec.prototype.hyperbolicSine = function () {return ((this.exponential()).subtractWith((this.negativeCopy()).exponential())).divideWith(theTwo);}; (BigDec
).prototype.hyperbolicSecant = function () {return (this.hyperbolicCosine()).getReciprocal();}; BigDec.prototype.ghm = function (anotherBigNum) {var firstA = this, firstB = anotherBigNum, secondA, secondB, i = 0,
limit = (((((((harmonicMean(firstA, firstB)).betterRound()).absoluteValue()).toString()).length) * this.maximumDecimals) * 2); while (i < limit) {secondA = harmonicMean(firstA, firstB); secondB = geometricMean(
firstA, firstB); firstA = secondA; firstB = secondB; i++;}; return harmonicMean(firstA, firstB);}; BigDec.prototype.hyperbolicCosecant = function () {return (this.hyperbolicSine()).getReciprocal();}; (BigDec
).prototype.hyperbolicArcSine = function () {return (this.addWith((theOne.addWith(this.squarePower())).squareRoot(true))).naturalLogarithm();}; BigDec.prototype.hyperbolicArcCosine = function () {return ((this
).addWith((theDarkUnit.addWith(this.squarePower())).squareRoot(true))).naturalLogarithm();}; BigDec.prototype.hyperbolicArcCosecant = function () {return (this.getReciprocal()).hyperbolicArcSine();}; (BigDec
).prototype.hyperbolicArcTangent = function () {return (((theOne.addWith(this)).divideWith(theOne.subtractWith(this))).naturalLogarithm()).divideWith(theTwo);}; BigDec.prototype.hyperbolicArcCotangent = (
function () {return (this.getReciprocal()).hyperbolicArcTangent();}); BigDec.prototype.hyperbolicArcSecant = function () {return (this.getReciprocal()).hyperbolicArcCosine();}; (BigDec.prototype.naperianLogarithm
) = function () {return (tenMillion.multiplicateWith((this.divideWith(tenMillion)).naturalLogarithm())).negativeCopy();}; BigDec.prototype.gammaLogarithm = function () {var lg = theZero, z = this, z1 = z; if (!(
z.isEqualTo(theOne))) {if (!(z.isLessThan(threeHalves)) && z.isLessThan(fiveHalves)) {lg = (z.gammaErrors()).naturalLogarithm();} else if (!(z.isLessThan(fiveHalves))) {while (!(z1.isLessThan(fiveHalves))) {z1 = (
z1.subtractWith(theOne)); lg = lg.addWith(z1.naturalLogarithm());}; lg = lg.addWith((z1.gammaErrors()).naturalLogarithm());} else {while (z1.isLessThan(threeHalves)) {lg = lg.subtractWith(z1.naturalLogarithm());
z1 = z1.addWith(theOne);}; lg = lg.addWith((z1.gammaErrors()).naturalLogarithm());};}; return lg;}; const piIncalculable = BigDec('3.1415926535897932'), arcCreator = BigDec(94), arcPi = theOne.arcTangentRadians(
), preciseEpsilon = BigDec(0.0000011), dottie = BigDec('.9998477415310881'), fiveHalves = BigDec(5/2), tenMillion = BigDec(10000000), threeCubeQuarters = BigDec(27/4), gammaHelpers = [BigDec(0.9999999999998099),
BigDec(676.52036812188513), BigDec(-1259.1392167224028), BigDec('771.32342877765313'), BigDec('-176.61502916214059'), BigDec(12.507343278686905), BigDec(-0.13857109526572012), BigDec(0.000009984369578), BigDec(
'0.0000001505632735')], threeQuarters = BigDec(3/4), powerOnlyIntegralHandler = function (upperBound, multiplier, power, lowerBound) {var addedPower = power.addWith(theOne); return (multiplier.multiplicateWith((
upperBound.powerWith(addedPower)).subtractWith(lowerBound.powerWith(addedPower)))).divideWith(addedPower);}, threeHalves = BigDec(3/2), fifteenHalves = BigDec(15/2), superGoldenRatio = (threeQuarters.squareRoot(
)).divideWith((((threeCubeQuarters.squareRoot()).hyperbolicArcSine()).divideWith(theThree)).hyperbolicSine()), superSilverRatio = threeQuarters.divideWith((threeHalves.squareRoot()).multiplicateWith(
((((threeHalves.squareRoot()).multiplicateWith(threeQuarters)).hyperbolicArcSine()).divideWith(theThree)).hyperbolicSine())), plasticRatio = (theTwo.multiplicateWith((((threeCubeQuarters.squareRoot()
).hyperbolicArcCosine()).divideWith(theThree)).hyperbolicCosine())).divideWith(theThree.squareRoot()); BigDec.prototype.gammaErrors = function () {var z = this.subtractWith(theOne), a = gammaHelpers[
0], t = z.addWith(fifteenHalves); for (var i = 1; i < gammaHelpers.length; i++) {a = a.addWith((gammaHelpers[i]).divideWith(z.addWith(BigDec(i))));}; return (a.multiplicateWith((t.negativeCopy()).exponential(
))).multiplicateWith(((theTwo.multiplicateWith(piIncalculable)).squareRoot()).multiplicateWith(t.powerWith(z.addWith(theHalf))));}; BigDec.prototype.beta = function (anotherBigNum) {return ((this.gamma()
).multiplicateWith(anotherBigNum.gamma())).divideWith((this.addWith(anotherBigNum)).gamma());}; BigDec.prototype.digamma = function () {return (getDerivativeOf((z => z.gamma()), this, preciseEpsilon)).divideWith(
this.gamma());}; BigDec.prototype.lambertW = function () {return this.multiplicateWith(this.exponential());}; BigDec.prototype.inverseSmooth = function () {var clamped = theZero.max(this.min(theOne)), checked = (
false); if (clamped.isGreaterThan(theHalf)) {clamped = theOne.subtractWith(clamped); checked = true;}; var result = (theHalf.subtractWith((((theOne.subtractWith(clamped.multiplicateWith(theTwo))).arcSine()
).divideWith(theThree)).sine())); return (checked ? theOne.subtractWith(result) : result);}; BigDec.prototype.smooth = function () {var clamped = theZero.max(this.min(theOne)), squaredClamped = (clamped
).squarePower(); return (theThree.multiplicateWith(squaredClamped)).subtractWith(theTwo.multiplicateWith(squaredClamped.multiplicateWith(clamped)));}; BigDec.prototype.trigamma = function () {return (
getDerivativeOf(z => z.digamma(), num, preciseEpsilon));}; BigDec.prototype.triangle = function () {return (this.multiplicateWith(this.addWith(theOne))).divideWith(theTwo);}; (BigDec.prototype.tetrahedron
) = function () {return (this.multiplicateWith((this.addWith(theOne)).multiplicateWith(this.addWith(theTwo)))).divideWith(twoWithThree);}; const mascheroniEulerConstant = (theOne.digamma()).negativeCopy(),
twoWithThree = BigDec(6), theQuarter = BigDec(1/4), strangeLemniscate = piIncalculable.divideWith(theOne.agm(theTwo.squareRoot())); BigDec.prototype.tetrateWith = function (anotherBigNum) {var out = (theOne
).addWith((anotherBigNum.absoluteValue()).getDecimals()); if (!(anotherBigNum.isLessThan(theOne))) {while (!(anotherBigNum.isLessThan(theOne))) {out = this.powerWith(out); anotherBigNum = (anotherBigNum.addWith(
theDarkUnit));};} else {while (anotherBigNum.isLessThan(theZero)) {anotherBigNum = anotherBigNum.addWith(theOne); out = this.logarithmWith(out);};}; return out;}; BigDec.prototype.circularHelper = function () {
return (theOne.subtractWith(((this.divideWith(quarterOfTurn)).addWith(theDarkUnit)).squarePower())).squareRoot(true);}; BigDec.prototype.triangularPeriodicWave = function (anotherBigNum) {var expansion = (theTwo
).multiplicateWith(anotherBigNum), modular = this.betterModulateWith(expansion); return (modular.isGreaterThan(anotherBigNum) ? expansion.subtractWith(modular) : modular);}; (BigDec.prototype.circularPeriodicWave
) = function () {var modular = this.betterModulateWith(entireTurn); if (modular.isGreaterThan(tripleQuartOfTurn)) {return ((entireTurn.subtractWith(modular)).circularPeriodicWave()).negativeCopy();} else if (
modular.isGreaterThan(halfTurn)) {return ((modular.subtractWith(halfTurn)).circularPeriodicWave()).negativeCopy();} else if (modular.isGreaterThan(quarterOfTurn)) {return (halfTurn.subtractWith(modular)
).circularPeriodicWave();} else {return LocalBigNumMemoizer.memoize('circularHelper', modular);};}; (Object.keys(BigDec.prototype)).forEach(key => console.log(('BigDec.prototype.').concat(key)));

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
i = (i.addWith(theOne));}; return new List(result); */

/* getImaginaryPart() */

/*
var BigCmp = function(real, imag) {
    if (new.target instanceof Function) {
        this.init(real, imag);
    } else {
        return new BigCmp(real,imag);
    }
    ;
};
BigCmp.prototype = BigDec();
BigCmp.prototype.constructor = BigCmp;
BigCmp.prototype.init = function(real, imag) {
    this.bignum = real;
    this.imaginaryPart = imag;
    this.naturalContainer = (this.bignum).naturalContainer;
    this.isNegative = (this.bignum).isNegative;
}
;

BigCmp.prototype.textRepresentation = function() {
    var imag = this.imaginaryPart
      , bigText = (this.bignum).textRepresentation();
    if (imag.isEqualTo(theZero)) {
        return bigText;
    } else {
        if ((this.bignum).isEqualTo(theZero)) {
            return (imag.textRepresentation()).concat('i');
        } else {
            return bigText.concat(((imag.isNegative) ? '−' : '+').concat((imag.absoluteValue()).textRepresentation(), 'i'));
        }
        ;
    }
    ;
}
;

BigCmp.prototype.fullCopy = function() {
    return BigCmp((this.bignum).fullCopy(), (this.imaginaryPart).fullCopy());
}
;
BigCmp.prototype.negativeCopy = function() {
    return (BigCmp(theZero, theZero)).subtractWith(this);
}
;
BigCmp.prototype.addWith = function(anotherBigCmp) {
    return BigCmp((this.bignum).addWith(anotherBigCmp.bignum), (this.getImaginaryPart()).addWith(anotherBigCmp.getImaginaryPart()));
}
;
BigCmp.prototype.subtractWith = function(anotherBigCmp) {
    return BigCmp((this.bignum).subtractWith(anotherBigCmp.bignum), (this.getImaginaryPart()).subtractWith((anotherBigCmp).getImaginaryPart()));
}
;
BigCmp.prototype.multiplicateWith = function(anotherBigCmp) {
    var realResult = (this.bignum).multiplicateWith(anotherBigCmp.bignum)
      , imaginaryResult = ((this.bignum).multiplicateWith((anotherBigCmp).getImaginaryPart())).addWith((this.getImaginaryPart()).multiplicateWith(anotherBigCmp.bignum));
    if (((this.getImaginaryPart()).isGreaterThan(theZero) && (anotherBigCmp.getImaginaryPart()).isLessThan(theZero)) || ((this.getImaginaryPart()).isLessThan(theZero) && (anotherBigCmp.getImaginaryPart()).isGreaterThan(theZero))) {
        realResult = (realResult.addWith((this.getImaginaryPart()).multiplicateWith((anotherBigCmp.getImaginaryPart()).negativeCopy())));
    } else if (((this.getImaginaryPart()).getSignum()).isEqualTo((anotherBigCmp.getImaginaryPart()).getSignum()) && (!((this.getImaginaryPart()).isEqualTo(theZero)) && !((anotherBigCmp.getImaginaryPart()).isEqualTo(theZero)))) {
        realResult = realResult.subtractWith((this.getImaginaryPart()).multiplicateWith(anotherBigCmp.getImaginaryPart()));
    }
    ;return BigCmp(realResult, imaginaryResult);
}
;
BigCmp.prototype.getConjugate = (function() {
    return BigCmp(this.bignum, (this.getImaginaryPart()).negativeCopy());
}
);
BigCmp.prototype.divideWith = function(anotherBigCmp) {
    if ((this.getImaginaryPart()).isEqualTo(theZero) && (anotherBigCmp.getImaginaryPart()).isEqualTo(theZero)) {
        return BigCmp((this.bignum).divideWith(anotherBigCmp.bignum), theZero);
    } else {
        var numerator = this.multiplicateWith((anotherBigCmp).getConjugate())
          , denominator = (BigCmp((anotherBigCmp.bignum).multiplicateWith(anotherBigCmp.bignum), theZero)).addWith(BigCmp((anotherBigCmp.imaginaryPart).multiplicateWith(anotherBigCmp.imaginaryPart), theZero));
        return BigCmp((numerator.bignum).divideWith(denominator), (numerator.imaginaryPart).divideWith(denominator));
    }
    ;
}
;
BigCmp.prototype.getReciprocal = function() {
    return (BigCmp(theOne, theZero)).divideWith(this);
}
;
BigCmp.prototype.exponential = function() {
    return BigCmp(((this.bignum).exponential()).multiplicateWith(((this.imaginaryPart).degrees()).cosine()), ((this.bignum).exponential()).multiplicateWith(((this.imaginaryPart).degrees()).sine()));
}
;
BigCmp.prototype.absoluteValue = function() {
    return BigCmp((((this.bignum).squarePower()).addWith((this.imaginaryPart).squarePower())).squareRoot(), theZero);
}
;
BigCmp.prototype.getArgument = function(inRadians) {
    var result = (this.bignum).arcTangentTwo(this.imaginaryPart);
    return BigCmp((inRadians ? result.degrees() : result), theZero);
}
;

var isANonMagnitude = ((magnitude)=>{
    var exceptions = ['ºC', 'ºF', 'K', 'º', 'rad'];
    return (exceptions.indexOf(magnitude) > -1);
}
)
  , BigMgn = function(bignum, magnitudes) {
    this.init(bignum, magnitudes);
};
BigMgn.prototype = BigDec();
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
BigMgn.prototype.constructor = BigMgn;
BigMgn.prototype.init = (function(bignum, magnitudes) {
    this.bignum = (isNil(bignum) ? theZero : bignum);
    this.naturalContainer = (this.bignum).naturalContainer;
    this.isNegative = (this.bignum).isNegative;
    this.dotPosition = this.bignum.dotPosition;
    this.magnitudes = (isNil(magnitudes) ? [] : magnitudes);
}
);
Number.prototype.toSuperScript = function() {
    var inputs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'], outputs = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁻'], copy = ((Math.round(Math.abs(this))) * Math.sign(this)).toString(), result = '', i = 0, selectedIndex;
    while (i < copy.length) {
        selectedIndex = inputs.indexOf(copy[i]);
        result = result.concat((selectedIndex > -1) ? (outputs[selectedIndex]) : '');
        i++;
    }
    ;return result;
}
;
BigMgn.prototype.addWith = function(anotherBigMgn) {
    return new BigMgn((this.bignum).addWith(anotherBigMgn.bignum),this.magnitudes);
}
;
BigMgn.prototype.getMagnitudeNames = function() {
    var i = 0
      , names = [];
    while (i < (this.magnitudes).length) {
        names.push(((this.magnitudes[i]).split('\|'))[0]);
        i++;
    }
    ;return names;
}
;
BigMgn.prototype.checkEmptyMagnitudes = function() {
    var i = 0
      , magnitudes = [];
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
    var bignum = (this.bignum).multiplicateWith(anotherBigMgn.bignum), magnitudeNames = (this.getMagnitudeNames()).concat((anotherBigMgn).getMagnitudeNames()), firstItem, secondItem, i = 0, result = [];
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
    var bignum = (this.bignum).divideWith(anotherBigMgn.bignum), magnitudeNames = (this.getMagnitudeNames()).concat(anotherBigMgn.getMagnitudeNames()), firstItem, secondItem, i = 0, result = [];
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
    var bignum = (this.bignum).powerWith(anotherBigMgn.bignum), magnitudeNames = this.getMagnitudeNames(), selectedItem, i = 0, result = [];
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
    var bignum = (this.bignum).radicateWith(anotherBigMgn.bignum), magnitudeNames = this.getMagnitudeNames(), selectedItem, i = 0, result = [];
    magnitudeNames = magnitudeNames.uniques();
    while (i < (magnitudeNames.length)) {
        firstItem = this.getMagnitudeNamed(magnitudeNames[i]);
        result.push((magnitudeNames[i]).concat('\|', ((+(firstItem[1])) / (+((anotherBigMgn.bignum).toString()))).toString()));
        i++;
    }
    ;bignum = (new BigMgn(bignum,result));
    bignum.checkEmptyMagnitudes();
    return bignum;
}
;

*/