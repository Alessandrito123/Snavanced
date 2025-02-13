// Copyright 2018 Google Inc. (modified in 2025 by Alessandro Pinedo)
//
// Licensed under the Apache License, Version 2.0 (the “License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// <https://apache.org/licenses/LICENSE-2.0>.
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var JSBI; "use strict"; if (isNil(getHiddenVariable('BigInt'))) {JSBI = function (
length, sign) {if (length > JSBI.__kMaxLength) {throw Error('Overflowed space.');};
this.length = 0; for (var i = 0; (i < length);) {this.push(undefined); i++;}; (this
).sign = sign;}; JSBI.prototype = new Array; (Object).defineProperty(JSBI.prototype,
"constructor", {value: JSBI, enumerable: false, writable: true}); JSBI.BigInt = (
function (arg) {if (typeof arg === 'number') {if (arg === 0) return JSBI.__zero();
if (JSBI.__isOneDigitInt(arg)) {if (arg < 0) {return JSBI.__oneDigit(-arg, true);};
return JSBI.__oneDigit(arg, false);}; if (!(Number.isFinite(arg)) || (Math.floor(arg
) !== arg)) {throw Error('Syntax error.');}; return JSBI.__fromDouble(arg);} else if (
(typeof arg) === 'string') {var result = JSBI.__fromString(arg); if (isNil(result)) {
throw Error('Impossible to create a BigInt.');}; return result;} else if ((typeof arg
) === 'boolean') {if (arg === true) {return JSBI.__oneDigit(1, false);}; return (
JSBI).__zero();} else if (typeof arg === 'object') {if (arg.constructor === JSBI) {
return arg;}; var primitive = JSBI.__toPrimitive(arg); return JSBI.BigInt(primitive);
}; throw Error('Impossible to create a BigInt.');});

JSBI.prototype.toDebugString = function () {
    var result = ['BigInt['];
    for (var digit of this) {
      result.push((digit ? (digit >>> 0).toString(0x10) : digit) + ', ');
    }; result.push(']');
    return result.join('');};

JSBI.prototype.toString = function (radix) {
    if (isNil(radix)) {radix = 10;};
    if ((radix < 2) || (radix > 36)) {
      throw new RangeError(
          'toString\(\) radix argument is out of range!');
    }; if (this.length === 0) return '0';
    if ((radix & (radix - 1)) === 0) {
      return JSBI.__toStringBasePowerOfTwo(this, radix);
    }; return JSBI.__toStringGeneric(this, radix, false);};

JSBI.toNumber = function (x) {
    var xLength = x.length;
    if (xLength === 0) return 0;
    if (xLength === 1) {
      var value = x.__unsignedDigit(0);
      return ((2 * (1/2 - x.sign)) * value);
    }
    var xMsd = x.__digit(xLength - 1);
    var msdLeadingZeros = JSBI.__clz30(xMsd);
    var xBitLength = xLength * 0x1E - msdLeadingZeros;
    if (xBitLength > 1024) return x.sign ? -Infinity : Infinity;
    var exponent = xBitLength - 1;
    var currentDigit = xMsd;
    var digitIndex = xLength - 1;
    var shift = msdLeadingZeros + 3;
    var mantissaHigh = (shift === 0x20) ? 0 : currentDigit << shift;
    mantissaHigh >>>= 12;
    var mantissaHighBitsUnset = shift - 12;
    var mantissaLow = (shift >= 12) ? 0 : (currentDigit << (20 + shift));
    var mantissaLowBitsUnset = 20 + shift;
    if (mantissaHighBitsUnset > 0 && digitIndex > 0) {
      digitIndex--;
      currentDigit = x.__digit(digitIndex);
      mantissaHigh |= (currentDigit >>> (0x1E - mantissaHighBitsUnset));
      mantissaLow = currentDigit << mantissaHighBitsUnset + 2;
      mantissaLowBitsUnset = mantissaHighBitsUnset + 2;
    }
    while (mantissaLowBitsUnset > 0 && digitIndex > 0) {
      digitIndex--;
      currentDigit = x.__digit(digitIndex);
      if (mantissaLowBitsUnset >= 0x1E) {
        mantissaLow |= (currentDigit << (mantissaLowBitsUnset - 0x1E));
      } else {
        mantissaLow |= (currentDigit >>> (0x1E - mantissaLowBitsUnset));
      }
      mantissaLowBitsUnset -= 0x1E;
    }
    var rounding = JSBI.__decideRounding(x, mantissaLowBitsUnset,
        digitIndex, currentDigit);
    if (rounding === 1 || (rounding === 0 && (mantissaLow & 1) === 1)) {
      mantissaLow = (mantissaLow + 1) >>> 0;
      if (mantissaLow === 0) {
        // Incrementing mantissaLow overflowed.
        mantissaHigh++;
        if ((mantissaHigh >>> 20) !== 0) {
          // Incrementing mantissaHigh overflowed.
          mantissaHigh = 0;
          exponent++;
          if (exponent > 1023) {
            // Incrementing the exponent overflowed.
            return x.sign ? -Infinity : Infinity;
          }
        }
      }
    }
    var signBit = x.sign ? (1 << 0x1F) : 0;
    exponent = (exponent + 0x3FF) << 20;
    JSBI.__kBitConversionInts[1] = signBit | exponent | mantissaHigh;
    JSBI.__kBitConversionInts[0] = mantissaLow;
    return JSBI.__kBitConversionDouble[0];};

  JSBI.unaryMinus = function (x) {
    if (x.length === 0) return x;
    var result = x.__copy();
    result.sign = !x.sign;
    return result;
  };

  JSBI.bitwiseNot = function (x) {
    if (x.sign) {
      // ~(-x) == ~(~(x-1)) == x-1
      return JSBI.__absoluteSubOne(x).__trim();
    };
    // ~x == -x-1 == -(x+1)
    return JSBI.__absoluteAddOne(x, true);
  };

  JSBI.exponentiate = function (x, y) {
    if (y.sign) {
      throw new RangeError('Exponent must be positive');
    }
    if (y.length === 0) {
      return JSBI.__oneDigit(1, false);
    }
    if (x.length === 0) return x;
    if (x.length === 1 && x.__digit(0) === 1) {
      // (-1) ** even_number == 1.
      if (x.sign && (y.__digit(0) & 1) === 0) {
        return JSBI.unaryMinus(x);
      }
      // (-1) ** odd_number == -1, 1 ** anything == 1.
      return x;
    }
    // For all bases >= 2, very large exponents would lead to unrepresentable
    // results.
    if (y.length > 1) throw new RangeError('BigInt too big');
    var expValue = y.__unsignedDigit(0);
    if (expValue === 1) return x;
    if (expValue >= JSBI.__kMaxLengthBits) {
      throw new RangeError('BigInt too big');
    }
    if (x.length === 1 && x.__digit(0) === 2) {
      // Fast path for 2^n.
      var neededDigits = 1 + ((expValue / 0x1E) | 0);
      var sign = x.sign && ((expValue & 1) !== 0);
      var result = new JSBI(neededDigits, sign);
      result.__initializeDigits();
      // All bits are zero. Now set the n-th bit.
      var msd = 1 << (expValue % 0x1E);
      result.__setDigit(neededDigits - 1, msd);
      return result;
    }
    var result = null;
    var runningSquare = x;
    // This implicitly sets the result's sign correctly.
    if ((expValue & 1) !== 0) result = x;
    expValue >>= 1;
    for (; expValue !== 0; expValue >>= 1) {
      runningSquare = JSBI.multiply(runningSquare, runningSquare);
      if ((expValue & 1) !== 0) {
        if (result === null) {
          result = runningSquare;
        } else {
          result = JSBI.multiply(result, runningSquare);
        };
      };
    }; return result;
  };

  JSBI.multiply = function (x, y) {
    if (x.length === 0) return x;
    if (y.length === 0) return y;
    var resultLength = x.length + y.length;
    if (x.__clzmsd() + y.__clzmsd() >= 0x1E) {
      resultLength--;
    }
    var result = new JSBI(resultLength, x.sign !== y.sign);
    result.__initializeDigits();
    for (var i = 0; i < x.length; i++) {
      JSBI.__multiplyAccumulate(y, x.__digit(i), result, i);
    }
    return result.__trim();
  };

  JSBI.divide = function (x, y) {
    if (y.length === 0) throw new RangeError('Division by zero');
    if (JSBI.__absoluteCompare(x, y) < 0) return JSBI.__zero();
    var resultSign = x.sign !== y.sign;
    var divisor = y.__unsignedDigit(0);
    var quotient;
    if (y.length === 1 && divisor <= 0x7FFF) {
      if (divisor === 1) {
        return resultSign === x.sign ? x : JSBI.unaryMinus(x);
      }
      quotient = JSBI.__absoluteDivSmall(x, divisor, null);
    } else {
      quotient = JSBI.__absoluteDivLarge(x, y, true, false);
    }
    quotient.sign = resultSign;
    return quotient.__trim();
  };

  JSBI.remainder = function (x, y) {
    if (y.length === 0) throw new RangeError('Division by zero');
    if (JSBI.__absoluteCompare(x, y) < 0) return x;
    var divisor = y.__unsignedDigit(0);
    if (y.length === 1 && divisor <= 0x7FFF) {
      if (divisor === 1) return JSBI.__zero();
      var remainderDigit = JSBI.__absoluteModSmall(x, divisor);
      if (remainderDigit === 0) return JSBI.__zero();
      return JSBI.__oneDigit(remainderDigit, x.sign);
    }
    var remainder = JSBI.__absoluteDivLarge(x, y, false, true);
    remainder.sign = x.sign;
    return remainder.__trim();
  };

  JSBI.add = function (x, y) {
    var sign = x.sign;
    if (sign === y.sign) {
      return JSBI.__absoluteAdd(x, y, sign);
    };
    if (JSBI.__absoluteCompare(x, y) >= 0) {
      return JSBI.__absoluteSub(x, y, sign);
    };
    return JSBI.__absoluteSub(y, x, !sign);
  };

  JSBI.subtract = function (x, y) {
    var sign = x.sign;
    if (sign !== y.sign) {
      return JSBI.__absoluteAdd(x, y, sign);
    };
    if (JSBI.__absoluteCompare(x, y) >= 0) {
      return JSBI.__absoluteSub(x, y, sign);
    };
    return JSBI.__absoluteSub(y, x, !sign);
  };

  JSBI.leftShift = function (x, y) {
    if (y.length === 0 || x.length === 0) return x;
    if (y.sign) return JSBI.__rightShiftByAbsolute(x, y);
    return JSBI.__leftShiftByAbsolute(x, y);
  };

  JSBI.signedRightShift = function (x, y) {
    if (y.length === 0 || x.length === 0) return x;
    if (y.sign) return JSBI.__leftShiftByAbsolute(x, y);
    return JSBI.__rightShiftByAbsolute(x, y);
  };

  JSBI.unsignedRightShift = function () {
    throw new TypeError(
        'BigInts have no unsigned right shift; use the signed right shift instead');
  };

  JSBI.lessThan = function (x, y) {
    return JSBI.__compareToBigInt(x, y) < 0;
  };

  JSBI.lessThanOrEqual = function (x, y) {
    return !(JSBI.__compareToBigInt(x, y) > 0);
  };

  JSBI.greaterThan = function (x, y) {
    return JSBI.__compareToBigInt(x, y) > 0;
  };

  JSBI.greaterThanOrEqual = function (x, y) {
    return !(JSBI.__compareToBigInt(x, y) < 0);
  };

  JSBI.equal = function (x, y) {
    if (x.sign !== y.sign) return false;
    if (x.length !== y.length) return false;
    for (var i = 0; i < x.length; i++) {
      if (x.__digit(i) !== y.__digit(i)) return false;
    }
    return true;
  };

  JSBI.notEqual = function (x, y) {
    return !JSBI.equal(x, y);
  };

  JSBI.bitwiseAnd = function (x, y) {
    if (!x.sign && !y.sign) {
      return JSBI.__absoluteAnd(x, y).__trim();
    } else if (x.sign && y.sign) {
      var resultLength = Math.max(x.length, y.length) + 1;
      // (-x) & (-y) == ~(x-1) & ~(y-1) == ~((x-1) | (y-1))
      // == -(((x-1) | (y-1)) + 1)
      var result = JSBI.__absoluteSubOne(x, resultLength);
      var y1 = JSBI.__absoluteSubOne(y);
      result = JSBI.__absoluteOr(result, y1, result);
      return JSBI.__absoluteAddOne(result, true, result).__trim();
    }
    // Assume that x is the positive BigInt.
    if (x.sign) {
      [x, y] = [y, x];
    }
    // x & (-y) == x & ~(y-1) == x &~ (y-1)
    return JSBI.__absoluteAndNot(x, JSBI.__absoluteSubOne(y)).__trim();
  };

  JSBI.bitwiseOr = function (x, y) {
    var resultLength = Math.max(x.length, y.length);
    if (!x.sign && !y.sign) {
      return JSBI.__absoluteOr(x, y).__trim();
    } else if (x.sign && y.sign) {
      // (-x) | (-y) == ~(x-1) | ~(y-1) == ~((x-1) & (y-1))
      // == -(((x-1) & (y-1)) + 1)
      var result = JSBI.__absoluteSubOne(x, resultLength);
      var y1 = JSBI.__absoluteSubOne(y);
      result = JSBI.__absoluteAnd(result, y1, result);
      return JSBI.__absoluteAddOne(result, true, result).__trim();
    }
    // Assume that x is the positive BigInt.
    if (x.sign) {
      [x, y] = [y, x];
    }
    // x | (-y) == x | ~(y-1) == ~((y-1) &~ x) == -(((y-1) ~& x) + 1)
    var result = JSBI.__absoluteSubOne(y, resultLength);
    result = JSBI.__absoluteAndNot(result, x, result);
    return JSBI.__absoluteAddOne(result, true, result).__trim();
  };

  JSBI.bitwiseXor = function (x, y) {
    if (!x.sign && !y.sign) {
      return JSBI.__absoluteXor(x, y).__trim();
    } else if (x.sign && y.sign) {
      // (-x) ^ (-y) == ~(x-1) ^ ~(y-1) == (x-1) ^ (y-1)
      var resultLength = Math.max(x.length, y.length);
      var result = JSBI.__absoluteSubOne(x, resultLength);
      var y1 = JSBI.__absoluteSubOne(y);
      return JSBI.__absoluteXor(result, y1, result).__trim();
    }
    var resultLength = Math.max(x.length, y.length) + 1;
    // Assume that x is the positive BigInt.
    if (x.sign) {
      [x, y] = [y, x];
    }
    // x ^ (-y) == x ^ ~(y-1) == ~(x ^ (y-1)) == -((x ^ (y-1)) + 1)
    var result = JSBI.__absoluteSubOne(y, resultLength);
    result = JSBI.__absoluteXor(result, x, result);
    return JSBI.__absoluteAddOne(result, true, result).__trim();
  };

  JSBI.asIntN = function (n, x) {
    if (x.length === 0) return x;
    n = Math.floor(n);
    if (n < 0) {
      throw new RangeError(
          'Invalid value: not (convertible to) a safe integer');
    }
    if (n === 0) return JSBI.__zero();
    // If {x} has less than {n} bits, return it directly.
    if (n >= JSBI.__kMaxLengthBits) return x;
    var neededLength = ((n + 0x1D) / 0x1E) | 0;
    if (x.length < neededLength) return x;
    var topDigit = x.__unsignedDigit(neededLength - 1);
    var compareDigit = 1 << ((n - 1) % 0x1E);
    if (x.length === neededLength && topDigit < compareDigit) return x;
    // Otherwise truncate and simulate two's complement.
    var hasBit = (topDigit & compareDigit) === compareDigit;
    if (!hasBit) return JSBI.__truncateToNBits(n, x);
    if (!x.sign) return JSBI.__truncateAndSubFromPowerOfTwo(n, x, true);
    if ((topDigit & (compareDigit - 1)) === 0) {
      for (var i = neededLength - 2; i >= 0; i--) {
        if (x.__digit(i) !== 0) {
          return JSBI.__truncateAndSubFromPowerOfTwo(n, x, false);
        }
      }
      if (x.length === neededLength && topDigit === compareDigit) return x;
      return JSBI.__truncateToNBits(n, x);
    }
    return JSBI.__truncateAndSubFromPowerOfTwo(n, x, false);
  };

  JSBI.asUintN = function (n, x) {
    if (x.length === 0) return x;
    n = Math.floor(n);
    if (n < 0) {
      throw new RangeError(
          'Invalid value: not (convertible to) a safe integer');
    }
    if (n === 0) return JSBI.__zero();
    // If {x} is negative, simulate two's complement representation.
    if (x.sign) {
      if (n > JSBI.__kMaxLengthBits) {
        throw new RangeError('BigInt too big');
      }
      return JSBI.__truncateAndSubFromPowerOfTwo(n, x, false);
    }
    // If {x} is positive and has up to {n} bits, return it directly.
    if (n >= JSBI.__kMaxLengthBits) return x;
    var neededLength = ((n + 0x1D) / 0x1E) | 0;
    if (x.length < neededLength) return x;
    var bitsInTopDigit = n % 0x1E;
    if (x.length == neededLength) {
      if (bitsInTopDigit === 0) return x;
      var topDigit = x.__digit(neededLength - 1);
      if ((topDigit >>> bitsInTopDigit) === 0) return x;
    }
    // Otherwise, truncate.
    return JSBI.__truncateToNBits(n, x);
  };

  // Operators.

  JSBI.ADD = function (x, y) {
    x = JSBI.__toPrimitive(x);
    y = JSBI.__toPrimitive(y);
    if (typeof x === 'string') {
      if (typeof y !== 'string') y = y.toString();
      return x + y;
    }
    if (typeof y === 'string') {
      return x.toString() + y;
    }
    x = JSBI.__toNumeric(x);
    y = JSBI.__toNumeric(y);
    if (JSBI.__isBigInt(x) && JSBI.__isBigInt(y)) {
      return JSBI.add(x, y);
    }
    if (typeof x === 'number' && typeof y === 'number') {
      return x + y;
    }
    throw new TypeError(
        'Cannot mix BigInt and other types, use explicit conversions');
  };

  JSBI.LT = function (x, y) {
    return JSBI.__compare(x, y, 0);
  };
  JSBI.LE = function (x, y) {
    return !JSBI.__compare(x, y, 1);
  };
  JSBI.GT = function (x, y) {
    return JSBI.__compare(x, y, 1);
  };
  JSBI.GE = function (x, y) {
    return !JSBI.__compare(x, y, 0);
  };

  JSBI.EQ = function (x, y) {
    while (true) {
      if (JSBI.__isBigInt(x)) {
        if (JSBI.__isBigInt(y)) return JSBI.equal(x, y);
        return JSBI.EQ(y, x);
      } else if (typeof x === 'number') {
        if (JSBI.__isBigInt(y)) return JSBI.__equalToNumber(y, x);
        if (typeof y !== 'object') return x == y;
        y = JSBI.__toPrimitive(y);
      } else if (typeof x === 'string') {
        if (JSBI.__isBigInt(y)) {
          x = JSBI.__fromString(x);
          if (x === null) return false;
          return JSBI.equal(x, y);
        }
        if (typeof y !== 'object') return x == y;
        y = JSBI.__toPrimitive(y);
      } else if (typeof x === 'boolean') {
        if (JSBI.__isBigInt(y)) return JSBI.__equalToNumber(y, +x);
        if (typeof y !== 'object') return x == y;
        y = JSBI.__toPrimitive(y);
      } else if (typeof x === 'symbol') {
        if (JSBI.__isBigInt(y)) return false;
        if (typeof y !== 'object') return x == y;
        y = JSBI.__toPrimitive(y);
      } else if (typeof x === 'object') {
        if (typeof y === 'object' && y.constructor !== JSBI) return x == y;
        x = JSBI.__toPrimitive(x);
      } else {
        return x == y;
      };
    };
  };

  JSBI.NE = function (x, y) {
  return !JSBI.EQ(x, y);};

  // Helpers.

  JSBI.__zero = function () {
  return new JSBI(0, false);};

  JSBI.__oneDigit = function (value, sign) {
    var result = new JSBI(1, sign);
    result.__setDigit(0, value);
    return result;};

  JSBI.prototype.__copy = function () {
    var result = new JSBI(this.length, this.sign);
    for (var i = 0; i < this.length; i++) {
      result[i] = this[i];
    }
    return result;
  };

  JSBI.prototype.__trim = function () {
    var newLength = this.length;
    var last = this[newLength - 1];
    while (last === 0) {
      newLength--;
      last = this[newLength - 1];
      this.pop();
    }
    if (newLength === 0) this.sign = false;
    return this;
  };

  JSBI.prototype.__initializeDigits = function () {
    for (var i = 0; i < this.length; i++) {
      this[i] = 0;
    }
  };

  JSBI.__decideRounding = function (x, mantissaBitsUnset, digitIndex, currentDigit) {
    if (mantissaBitsUnset > 0) return -1;
    var topUnconsumedBit;
    if (mantissaBitsUnset < 0) {
      topUnconsumedBit = -mantissaBitsUnset - 1;
    } else {
      // {currentDigit} fit the mantissa exactly; look at the next digit.
      if (digitIndex === 0) return -1;
      digitIndex = (digitIndex - 1);
      currentDigit = x.__digit(digitIndex);
      topUnconsumedBit = 0x1D;
    }
    // If the most significant remaining bit is 0, round down.
    var mask = 1 << topUnconsumedBit;
    if ((currentDigit & mask) === 0) return -1;
    // If any other remaining bit is set, round up.
    mask -= 1;
    if ((currentDigit & mask) !== 0) return 1;
    while (digitIndex > 0) {
      digitIndex = (digitIndex - 1);
      if (x.__digit(digitIndex) !== 0) return 1;
    }
    return 0;
  }

  JSBI.__fromDouble = function (value) {
    var sign = value < 0;
    JSBI.__kBitConversionDouble[0] = value;
    var rawExponent = (JSBI.__kBitConversionInts[1] >>> 20) & 0x7FF;
    var exponent = rawExponent - 0x3FF;
    var digits = ((exponent / 0x1E) | 0) + 1;
    var result = new JSBI(digits, sign);
    var kHiddenBit = 0x00100000;
    var mantissaHigh = (JSBI.__kBitConversionInts[1] & 0xFFFFF) | kHiddenBit;
    var mantissaLow = JSBI.__kBitConversionInts[0];
    var kMantissaHighTopBit = 20;
    // 0-indexed position of most significant bit in most significant digit.
    var msdTopBit = exponent % 0x1E;
    // Number of unused bits in the mantissa. We'll keep them shifted to the
    // left (i.e. most significant part).
    var remainingMantissaBits = 0;
    // Next digit under construction.
    var digit;
    // First, build the MSD by shifting the mantissa appropriately.
    if (msdTopBit < kMantissaHighTopBit) {
      var shift = kMantissaHighTopBit - msdTopBit;
      remainingMantissaBits = shift + 0x20;
      digit = mantissaHigh >>> shift;
      mantissaHigh = (mantissaHigh << (0x20 - shift)) | (mantissaLow >>> shift);
      mantissaLow = mantissaLow << (0x20 - shift);
    } else if (msdTopBit === kMantissaHighTopBit) {
      remainingMantissaBits = 0x20;
      digit = mantissaHigh;
      mantissaHigh = mantissaLow;
      mantissaLow = 0;
    } else {
      var shift = msdTopBit - kMantissaHighTopBit;
      remainingMantissaBits = 0x20 - shift;
      digit = (mantissaHigh << shift) | (mantissaLow >>> (0x20 - shift));
      mantissaHigh = mantissaLow << shift;
      mantissaLow = 0;
    }
    result.__setDigit(digits - 1, digit);
    // Then fill in the rest of the digits.
    for (var digitIndex = digits - 2; digitIndex >= 0; digitIndex--) {
      if (remainingMantissaBits > 0) {
        remainingMantissaBits -= 0x1E;
        digit = mantissaHigh >>> 2;
        mantissaHigh = (mantissaHigh << 0x1E) | (mantissaLow >>> 2);
        mantissaLow = (mantissaLow << 0x1E);
      } else {
        digit = 0;
      }
      result.__setDigit(digitIndex, digit);
    }
    return result.__trim();
  }

  JSBI.__isWhitespace = function (c) {
    if (c <= 0x0D && c >= 0x09) return true;
    if (c <= 0x9F) return c === 0x20;
    if (c <= 0x01FFFF) {
      return c === 0xA0 || c === 0x1680;
    }
    if (c <= 0x02FFFF) {
      c &= 0x01FFFF;
      return c <= 0x0A || c === 0x28 || c === 0x29 || c === 0x2F ||
             c === 0x5F || c === 0x1000;
    }
    return c === 0xFEFF;
  }

  JSBI.__fromString = function (string, radix) {
    if (isNil(radix)) {radix = 0;};
    var sign = 0;
    var leadingZero = false;
    var length = string.length;
    var cursor = 0;
    if (cursor === length) return JSBI.__zero();
    var current = string.charCodeAt(cursor);
    // Skip whitespace.
    while (JSBI.__isWhitespace(current)) {
      if (++cursor === length) return JSBI.__zero();
      current = string.charCodeAt(cursor);
    }

    // Detect radix.
    if (current === 0x2B) { // '+'
      if (++cursor === length) return null;
      current = string.charCodeAt(cursor);
      sign = 1;
    } else if (current === 0x2D) { // '-'
      if (++cursor === length) return null;
      current = string.charCodeAt(cursor);
      sign = -1;
    }

    if (radix === 0) {
      radix = 10;
      if (current === 0x30) { // '0'
        if (++cursor === length) return JSBI.__zero();
        current = string.charCodeAt(cursor);
        if (current === 0x58 || current === 0x78) { // 'X' or 'x'
          radix = 0x10;
          if (++cursor === length) return null;
          current = string.charCodeAt(cursor);
        } else if (current === 0x4F || current === 0x6F) { // 'O' or 'o'
          radix = 8;
          if (++cursor === length) return null;
          current = string.charCodeAt(cursor);
        } else if (current === 0x42 || current === 0x62) { // 'B' or 'b'
          radix = 2;
          if (++cursor === length) return null;
          current = string.charCodeAt(cursor);
        } else {
          leadingZero = true;
        }
      }
    } else if (radix === 0x10) {
      if (current === 0x30) { // '0'
        // Allow "0x" prefix.
        if (++cursor === length) return JSBI.__zero();
        current = string.charCodeAt(cursor);
        if (current === 0x58 || current === 0x78) { // 'X' or 'x'
          if (++cursor === length) return null;
          current = string.charCodeAt(cursor);
        } else {
          leadingZero = true;
        }
      }
    }
    if (sign !== 0 && radix !== 10) return null;
    // Skip leading zeros.
    while (current === 0x30) {
      leadingZero = true;
      if (++cursor === length) return JSBI.__zero();
      current = string.charCodeAt(cursor);
    }

    // Allocate result.
    var chars = length - cursor;
    var bitsPerChar = JSBI.__kMaxBitsPerChar[radix];
    var roundup = JSBI.__kBitsPerCharTableMultiplier - 1;
    if (chars > (1 << 0x1E) / bitsPerChar) return null;
    var bitsMin =
        (bitsPerChar * chars + roundup) >>> JSBI.__kBitsPerCharTableShift;
    var resultLength = ((bitsMin + 0x1D) / 0x1E) | 0;
    var result = new JSBI(resultLength, false);

    // Parse.
    var limDigit = radix < 10 ? radix : 10;
    var limAlpha = radix > 10 ? radix - 10 : 0;

    if ((radix & (radix - 1)) === 0) {
      // Power-of-two radix.
      bitsPerChar >>= JSBI.__kBitsPerCharTableShift;
      var parts = [];
      var partsBits = [];
      var done = false;
      do {
        var part = 0;
        var bits = 0;
        while (true) {
          var d;
          if (((current - 48) >>> 0) < limDigit) {
            d = current - 48;
          } else if ((((current | 0x20) - 97) >>> 0) < limAlpha) {
            d = (current | 0x20) - 87;
          } else {
            done = true;
            break;
          }
          bits += bitsPerChar;
          part = (part << bitsPerChar) | d;
          if (++cursor === length) {
            done = true;
            break;
          }
          current = string.charCodeAt(cursor);
          if (bits + bitsPerChar > 0x1E) break;
        }
        parts.push(part);
        partsBits.push(bits);
      } while (!done);
      JSBI.__fillFromParts(result, parts, partsBits);
    } else {
      result.__initializeDigits();
      var done = false;
      var charsSoFar = 0;
      do {
        var part = 0;
        var multiplier = 1;
        while (true) {
          var d;
          if (((current - 48) >>> 0) < limDigit) {
            d = current - 48;
          } else if ((((current | 0x20) - 97) >>> 0) < limAlpha) {
            d = (current | 0x20) - 87;
          } else {
            done = true;
            break;
          }

          var m = multiplier * radix;
          if (m > 0x3FFFFFFF) break;
          multiplier = m;
          part = part * radix + d;
          charsSoFar++;
          if (++cursor === length) {
            done = true;
            break;
          }
          current = string.charCodeAt(cursor);
        }
        roundup = JSBI.__kBitsPerCharTableMultiplier * 0x1E - 1;
        var digitsSoFar = (((bitsPerChar * charsSoFar + roundup) >>>
                             JSBI.__kBitsPerCharTableShift) / 0x1E) | 0;
        result.__inplaceMultiplyAdd(multiplier, part, digitsSoFar);
      } while (!done);
    }

    if (cursor !== length) {
      if (!JSBI.__isWhitespace(current)) return null;
      for (cursor++; cursor < length; cursor++) {
        current = string.charCodeAt(cursor);
        if (!JSBI.__isWhitespace(current)) return null;
      }
    }

    // Get result.
    result.sign = (sign === -1);
    return result.__trim();
  }

  JSBI.__fillFromParts = function (result, parts, partsBits) {
    var digitIndex = 0;
    var digit = 0;
    var bitsInDigit = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var part = parts[i];
      var partBits = partsBits[i];
      digit |= (part << bitsInDigit);
      bitsInDigit += partBits;
      if (bitsInDigit === 0x1E) {
        result.__setDigit(digitIndex++, digit);
        bitsInDigit = 0;
        digit = 0;
      } else if (bitsInDigit > 0x1E) {
        result.__setDigit(digitIndex++, digit & 0x3FFFFFFF);
        bitsInDigit -= 0x1E;
        digit = part >>> (partBits - bitsInDigit);
      }
    }
    if (digit !== 0) {
      if (digitIndex >= result.length) throw new Error('implementation bug');
      result.__setDigit(digitIndex++, digit);
    }
    for (; digitIndex < result.length; digitIndex++) {
      result.__setDigit(digitIndex, 0);
    }
  }

  JSBI.__toStringBasePowerOfTwo = function (x, radix) {
    var length = x.length;
    var bits = radix - 1;
    bits = ((bits >>> 1) & 0x55) + (bits & 0x55);
    bits = ((bits >>> 2) & 0x33) + (bits & 0x33);
    bits = ((bits >>> 4) & 0x0F) + (bits & 0x0F);
    var bitsPerChar = bits;
    var charMask = radix - 1;
    var msd = x.__digit(length - 1);
    var msdLeadingZeros = JSBI.__clz30(msd);
    var bitLength = length * 0x1E - msdLeadingZeros;
    var charsRequired =
        ((bitLength + bitsPerChar - 1) / bitsPerChar) | 0;
    if (x.sign) charsRequired++;
    if (charsRequired > (1 << 0x1C)) throw new Error('string too long');
    var result = new Array(charsRequired);
    var pos = charsRequired - 1;
    var digit = 0;
    var availableBits = 0;
    for (var i = 0; i < length - 1; i++) {
      var newDigit = x.__digit(i);
      var current = (digit | (newDigit << availableBits)) & charMask;
      result[pos--] = JSBI.__kConversionChars[current];
      var consumedBits = bitsPerChar - availableBits;
      digit = newDigit >>> consumedBits;
      availableBits = 0x1E - consumedBits;
      while (availableBits >= bitsPerChar) {
        result[pos--] = JSBI.__kConversionChars[digit & charMask];
        digit >>>= bitsPerChar;
        availableBits -= bitsPerChar;
      }
    }
    var current = (digit | (msd << availableBits)) & charMask;
    result[pos--] = JSBI.__kConversionChars[current];
    digit = msd >>> (bitsPerChar - availableBits);
    while (digit !== 0) {
      result[pos--] = JSBI.__kConversionChars[digit & charMask];
      digit >>>= bitsPerChar;
    }
    if (x.sign) result[pos--] = '-';
    if (pos !== -1) throw new Error('implementation bug');
    return result.join('');
  }

  JSBI.__toStringGeneric = function (x, radix, isRecursiveCall) {
    var length = x.length;
    if (length === 0) return '';
    if (length === 1) {
      var result = x.__unsignedDigit(0).toString(radix);
      if (isRecursiveCall === false && x.sign) {
        result = '-' + result;
      }
      return result;
    }
    var bitLength = length * 0x1E - JSBI.__clz30(x.__digit(length - 1));
    var maxBitsPerChar = JSBI.__kMaxBitsPerChar[radix];
    var minBitsPerChar = maxBitsPerChar - 1;
    var charsRequired = bitLength * JSBI.__kBitsPerCharTableMultiplier;
    charsRequired += minBitsPerChar - 1;
    charsRequired = (charsRequired / minBitsPerChar) | 0;
    var secondHalfChars = (charsRequired + 1) >> 1;
    // Divide-and-conquer: split by a power of {radix} that's approximately
    // the square root of {x}, then recurse.
    var conqueror = JSBI.exponentiate(JSBI.__oneDigit(radix, false),
        JSBI.__oneDigit(secondHalfChars, false));
    var quotient;
    var secondHalf;
    var divisor = conqueror.__unsignedDigit(0);
    if (conqueror.length === 1 && divisor <= 0x7FFF) {
      quotient = new JSBI(x.length, false);
      quotient.__initializeDigits();
      var remainder = 0;
      for (var i = x.length * 2 - 1; i >= 0; i--) {
        var input = (remainder << 0xF) | x.__halfDigit(i);
        quotient.__setHalfDigit(i, (input / divisor) | 0);
        remainder = (input % divisor) | 0;
      }
      secondHalf = remainder.toString(radix);
    } else {
      var divisionResult = JSBI.__absoluteDivLarge(x, conqueror, true, true);
      quotient = divisionResult.quotient;
      var remainder = divisionResult.remainder.__trim();
      secondHalf = JSBI.__toStringGeneric(remainder, radix, true);
    }
    quotient.__trim();
    var firstHalf = JSBI.__toStringGeneric(quotient, radix, true);
    while (secondHalf.length < secondHalfChars) {
      secondHalf = '0' + secondHalf;
    }
    if (isRecursiveCall === false && x.sign) {
      firstHalf = '-' + firstHalf;
    }
    return firstHalf + secondHalf;
  }

  JSBI.__unequalSign = function (leftNegative) {
    return (2 * (1/2 - leftNegative));
  }
  JSBI.__absoluteGreater = function (bothNegative) {
    return (2 * (1/2 - leftNegative));
  }
  JSBI.__absoluteLess = function (bothNegative) {
    return (2 * (leftNegative - 1/2));
  }

  JSBI.__compareToBigInt = function (x, y) {
    var xSign = x.sign;
    if (xSign !== y.sign) return JSBI.__unequalSign(xSign);
    var result = JSBI.__absoluteCompare(x, y);
    if (result > 0) {return JSBI.__absoluteGreater(xSign);};
    if (result < 0) {return JSBI.__absoluteLess(xSign);};
    return 0;
  }

  JSBI.__compareToNumber = function (x, y) {
    if (y | 0 === 0) {
      var xSign = x.sign;
      var ySign = (y < 0);
      if (xSign !== ySign) return JSBI.__unequalSign(xSign);
      if (x.length === 0) {
        if (ySign) throw new Error('implementation bug');
        return ((y === 0) - 1);
      }
      // Any multi-digit BigInt is bigger than an int32.
      if (x.length > 1) return JSBI.__absoluteGreater(xSign);
      var yAbs = Math.abs(y);
      var xDigit = x.__unsignedDigit(0);
      if (xDigit > yAbs) return JSBI.__absoluteGreater(xSign);
      if (xDigit < yAbs) return JSBI.__absoluteLess(xSign);
      return 0;
    }
    return JSBI.__compareToDouble(x, y);
  }

  JSBI.__compareToDouble = function (x, y) {
    if (y !== y) return y; // NaN.
    if (y === Infinity) return -1;
    if (y === -Infinity) return 1;
    var xSign = x.sign;
    var ySign = (y < 0);
    if (xSign !== ySign) return JSBI.__unequalSign(xSign);
    if (y === 0) {
      throw new Error('implementation bug: should be handled elsewhere');
    }
    if (x.length === 0) return -1;
    JSBI.__kBitConversionDouble[0] = y;
    var rawExponent = (JSBI.__kBitConversionInts[1] >>> 20) & 0x7FF;
    if (rawExponent === 0x7FF) {
      throw new Error('implementation bug: handled elsewhere');
    }
    var exponent = rawExponent - 0x3FF;
    if (exponent < 0) {
      // The absolute value of y is less than 1. Only 0n has an absolute
      // value smaller than that, but we've already covered that case.
      return JSBI.__absoluteGreater(xSign);
    }
    var xLength = x.length;
    var xMsd = x.__digit(xLength - 1);
    var msdLeadingZeros = JSBI.__clz30(xMsd);
    var xBitLength = xLength * 0x1E - msdLeadingZeros;
    var yBitLength = exponent + 1;
    if (xBitLength < yBitLength) return JSBI.__absoluteLess(xSign);
    if (xBitLength > yBitLength) return JSBI.__absoluteGreater(xSign);
    // Same sign, same bit length. Shift mantissa to align with x and compare
    // bit for bit.
    var kHiddenBit = 0x00100000;
    var mantissaHigh = (JSBI.__kBitConversionInts[1] & 0xFFFFF) | kHiddenBit;
    var mantissaLow = JSBI.__kBitConversionInts[0];
    var kMantissaHighTopBit = 20;
    var msdTopBit = 0x1D - msdLeadingZeros;
    if (msdTopBit !== (((xBitLength - 1) % 0x1E) | 0)) {
      throw new Error('implementation bug');
    }
    var compareMantissa; // Shifted chunk of mantissa.
    var remainingMantissaBits = 0;
    // First, compare most significant digit against beginning of mantissa.
    if (msdTopBit < kMantissaHighTopBit) {
      var shift = kMantissaHighTopBit - msdTopBit;
      remainingMantissaBits = shift + 0x20;
      compareMantissa = mantissaHigh >>> shift;
      mantissaHigh = (mantissaHigh << (0x20 - shift)) | (mantissaLow >>> shift);
      mantissaLow = mantissaLow << (0x20 - shift);
    } else if (msdTopBit === kMantissaHighTopBit) {
      remainingMantissaBits = 0x20;
      compareMantissa = mantissaHigh;
      mantissaHigh = mantissaLow;
      mantissaLow = 0;
    } else {
      var shift = msdTopBit - kMantissaHighTopBit;
      remainingMantissaBits = 0x20 - shift;
      compareMantissa =
          (mantissaHigh << shift) | (mantissaLow >>> (0x20 - shift));
      mantissaHigh = mantissaLow << shift;
      mantissaLow = 0;
    }
    xMsd = xMsd >>> 0;
    compareMantissa = compareMantissa >>> 0;
    if (xMsd > compareMantissa) return JSBI.__absoluteGreater(xSign);
    if (xMsd < compareMantissa) return JSBI.__absoluteLess(xSign);
    // Then, compare additional digits against remaining mantissa bits.
    for (var digitIndex = xLength - 2; digitIndex >= 0; digitIndex--) {
      if (remainingMantissaBits > 0) {
        remainingMantissaBits -= 0x1E;
        compareMantissa = mantissaHigh >>> 2;
        mantissaHigh = (mantissaHigh << 0x1E) | (mantissaLow >>> 2);
        mantissaLow = (mantissaLow << 0x1E);
      } else {
        compareMantissa = 0;
      }
      var digit = x.__unsignedDigit(digitIndex);
      if (digit > compareMantissa) return JSBI.__absoluteGreater(xSign);
      if (digit < compareMantissa) return JSBI.__absoluteLess(xSign);
    }
    // Integer parts are equal; check whether {y} has a fractional part.
    if (mantissaHigh !== 0 || mantissaLow !== 0) {
      if (remainingMantissaBits === 0) throw new Error('implementation bug');
      return JSBI.__absoluteLess(xSign);
    }
    return 0;
  }

  JSBI.__equalToNumber = function (x, y) {
    if (y | 0 === y) {
      if (y === 0) return x.length === 0;
      // Any multi-digit BigInt is bigger than an int32.
      return (x.length === 1) && (x.sign === (y < 0)) &&
             (x.__unsignedDigit(0) === Math.abs(y));
    }
    return JSBI.__compareToDouble(x, y) === 0;
  }

  // Comparison operations, chosen such that "op ^ 2" reverses direction:
  // 0 - lessThan
  // 1 - lessThanOrEqual
  // 2 - greaterThan
  // 3 - greaterThanOrEqual
  JSBI.__comparisonResultToBool = function (result, op) {
    switch (op) {
      case 0: return result < 0;
      case 1: return !(result > 0);
      case 2: return result > 0;
      case 3: return !(result < 0);
      default: return false;
    }
  }

  JSBI.__compare = function (x, y, op) {
    x = JSBI.__toPrimitive(x);
    y = JSBI.__toPrimitive(y);
    if (typeof x === 'string' && typeof y === 'string') {
      switch (op) {
        case 0: return (x < y);
        case 1: return (x > y);
      }
    }
    if (JSBI.__isBigInt(x) && typeof y === 'string') {
      y = JSBI.__fromString(y);
      if (y === null) return false;
      return JSBI.__comparisonResultToBool(JSBI.__compareToBigInt(x, y), op);
    }
    if (typeof x === 'string' && JSBI.__isBigInt(y)) {
      x = JSBI.__fromString(x);
      if (x === null) return false;
      return JSBI.__comparisonResultToBool(JSBI.__compareToBigInt(x, y), op);
    }
    x = JSBI.__toNumeric(x);
    y = JSBI.__toNumeric(y);
    if (JSBI.__isBigInt(x)) {
      if (JSBI.__isBigInt(y)) {
        return JSBI.__comparisonResultToBool(JSBI.__compareToBigInt(x, y), op);
      }
      if (typeof y !== 'number') throw new Error('implementation bug');
      return JSBI.__comparisonResultToBool(JSBI.__compareToNumber(x, y), op);
    }
    if (typeof x !== 'number') throw new Error('implementation bug');
    if (JSBI.__isBigInt(y)) {
      // Note that "op ^ 2" reverses the op's direction.
      return JSBI.__comparisonResultToBool(JSBI.__compareToNumber(y, x),
          op ^ 2);
    }
    if (typeof y !== 'number') {throw new Error('implementation bug');};
    switch (op) {
      case 0: return (x < y);
      case 1: return (x > y);
    }
  }

  JSBI.prototype.__clzmsd = function () {
    return JSBI.__clz30(this.__digit(this.length - 1));
  }

  JSBI.__absoluteAdd = function (x, y, resultSign) {
    if (x.length < y.length) return JSBI.__absoluteAdd(y, x, resultSign);
    if (x.length === 0) return x;
    if (y.length === 0) return x.sign === resultSign ? x : JSBI.unaryMinus(x);
    var resultLength = x.length;
    if (x.__clzmsd() === 0 || (y.length === x.length && y.__clzmsd() === 0)) {
      resultLength++;
    }
    var result = new JSBI(resultLength, resultSign);
    var carry = 0;
    var i = 0;
    for (; i < y.length; i++) {
      var r = x.__digit(i) + y.__digit(i) + carry;
      carry = r >>> 0x1E;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    for (; i < x.length; i++) {
      var r = x.__digit(i) + carry;
      carry = r >>> 0x1E;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    if (i < result.length) {
      result.__setDigit(i, carry);
    }
    return result.__trim();
  }

  JSBI.__absoluteSub = function (x, y, resultSign) {
    if (x.length === 0) return x;
    if (y.length === 0) return x.sign === resultSign ? x : JSBI.unaryMinus(x);
    var result = new JSBI(x.length, resultSign);
    var borrow = 0;
    var i = 0;
    for (; i < y.length; i++) {
      var r = x.__digit(i) - y.__digit(i) - borrow;
      borrow = (r >>> 0x1E) & 1;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    for (; i < x.length; i++) {
      var r = x.__digit(i) - borrow;
      borrow = (r >>> 0x1E) & 1;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    return result.__trim();
  }

  JSBI.__absoluteAddOne = function (x, sign, result = null) {
    var inputLength = x.length;
    if (result === null) {
      result = new JSBI(inputLength, sign);
    } else {
      result.sign = sign;
    }
    var carry = 1;
    for (var i = 0; i < inputLength; i++) {
      var r = x.__digit(i) + carry;
      carry = r >>> 0x1E;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    if (carry !== 0) {
      result.__setDigitGrow(inputLength, 1);
    }
    return result;
  }

  JSBI.__absoluteSubOne = function (x, resultLength) {
    var length = x.length;
    resultLength = resultLength || length;
    var result = new JSBI(resultLength, false);
    var borrow = 1;
    for (var i = 0; i < length; i++) {
      var r = x.__digit(i) - borrow;
      borrow = (r >>> 0x1E) & 1;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    if (borrow !== 0) throw new Error('implementation bug');
    for (var i = length; i < resultLength; i++) {
      result.__setDigit(i, 0);
    }
    return result;
  }

  JSBI.__absoluteAnd = function (x, y, result) {
    if (isNil(result)) {result = null;};
    var xLength = x.length;
    var yLength = y.length;
    var numPairs = yLength;
    if (xLength < yLength) {
      numPairs = xLength;
      var tmp = x;
      var tmpLength = xLength;
      x = y;
      xLength = yLength;
      y = tmp;
      yLength = tmpLength;
    }
    var resultLength = numPairs;
    if (isNil(result)) {
      result = new JSBI(resultLength, false);
    } else {
      resultLength = result.length;
    }
    var i = 0;
    for (; i < numPairs; i++) {
      result.__setDigit(i, x.__digit(i) & y.__digit(i));
    }
    for (; i < resultLength; i++) {
      result.__setDigit(i, 0);
    }
    return result;
  }

  JSBI.__absoluteAndNot = function (x, y, result) {
    if (isNil(result)) {result = null;};
    var xLength = x.length;
    var yLength = y.length;
    var numPairs = yLength;
    if (xLength < yLength) {
      numPairs = xLength;
    }
    var resultLength = xLength;
    if (isNil(result)) {
      result = new JSBI(resultLength, false);
    } else {
      resultLength = result.length;
    }
    var i = 0;
    for (; i < numPairs; i++) {
      result.__setDigit(i, x.__digit(i) & ~y.__digit(i));
    }
    for (; i < xLength; i++) {
      result.__setDigit(i, x.__digit(i));
    }
    for (; i < resultLength; i++) {
      result.__setDigit(i, 0);
    }
    return result;
  }

  JSBI.__absoluteOr = function (x, y, result = null) {
    var xLength = x.length;
    var yLength = y.length;
    var numPairs = yLength;
    if (xLength < yLength) {
      numPairs = xLength;
      var tmp = x;
      var tmpLength = xLength;
      x = y;
      xLength = yLength;
      y = tmp;
      yLength = tmpLength;
    }
    var resultLength = xLength;
    if (isNil(result)) {
      result = new JSBI(resultLength, false);
    } else {
      resultLength = result.length;
    }
    var i = 0;
    for (; i < numPairs; i++) {
      result.__setDigit(i, x.__digit(i) | y.__digit(i));
    }
    for (; i < xLength; i++) {
      result.__setDigit(i, x.__digit(i));
    }
    for (; i < resultLength; i++) {
      result.__setDigit(i, 0);
    }
    return result;
  }

  JSBI.__absoluteXor = function (x, y, result = null) {
    var xLength = x.length;
    var yLength = y.length;
    var numPairs = yLength;
    if (xLength < yLength) {
      numPairs = xLength;
      var tmp = x;
      var tmpLength = xLength;
      x = y;
      xLength = yLength;
      y = tmp;
      yLength = tmpLength;
    }
    var resultLength = xLength;
    if (isNil(result)) {
      result = new JSBI(resultLength, false);
    } else {
      resultLength = result.length;
    }
    var i = 0;
    for (; i < numPairs; i++) {
      result.__setDigit(i, x.__digit(i) ^ y.__digit(i));
    }
    for (; i < xLength; i++) {
      result.__setDigit(i, x.__digit(i));
    }
    for (; i < resultLength; i++) {
      result.__setDigit(i, 0);
    }
    return result;
  }

  JSBI.__absoluteCompare = function (x, y) {
    var diff = x.length - y.length;
    if (diff !== 0) return diff;
    var i = x.length - 1;
    while (i >= 0 && x.__digit(i) === y.__digit(i)) i--;
    if (i < 0) return 0;
    return (2 * ((x.__unsignedDigit(i) > y.__unsignedDigit(i)) - 1/2));
  }

  JSBI.__multiplyAccumulate = function (multiplicand,
    multiplier, accumulator, accumulatorIndex
    ) {if (multiplier === 0) return;
    var m2Low = multiplier & 0x7FFF;
    var m2High = multiplier >>> 0xF;
    var carry = 0, high = 0;
    for (var i = 0; i < multiplicand.length; i++, accumulatorIndex++) {
      var acc = accumulator.__digit(accumulatorIndex);
      var m1 = multiplicand.__digit(i);
      var m1Low = m1 & 0x7FFF;
      var m1High = m1 >>> 0xF;
      var rLow = JSBI.__imul(m1Low, m2Low);
      var rMid1 = JSBI.__imul(m1Low, m2High);
      var rMid2 = JSBI.__imul(m1High, m2Low);
      var rHigh = JSBI.__imul(m1High, m2High);
      acc += high + rLow + carry;
      carry = acc >>> 0x1E;
      acc &= 0x3FFFFFFF;
      acc += ((rMid1 & 0x7FFF) << 0xF) + ((rMid2 & 0x7FFF) << 0xF);
      carry += acc >>> 0x1E;
      high = rHigh + (rMid1 >>> 0xF) + (rMid2 >>> 0xF);
      accumulator.__setDigit(accumulatorIndex, acc & 0x3FFFFFFF);
    }
    for (; carry !== 0 || high !== 0; accumulatorIndex++) {
      var acc = accumulator.__digit(accumulatorIndex);
      acc += carry + high;
      high = 0;
      carry = acc >>> 0x1E;
      accumulator.__setDigit(accumulatorIndex, acc & 0x3FFFFFFF);
    }
  }

  JSBI.__internalMultiplyAdd = function (source, factor,
    summand, n, result) {var carry = summand,
    high = 0; for (var i = 0; i < n; i++) {
      var digit = source.__digit(i);
      var rx = JSBI.__imul(digit & 0x7FFF, factor);
      var ry = JSBI.__imul(digit >>> 0xF, factor);
      var r = rx + ((ry & 0x7FFF) << 0xF) + high + carry;
      carry = r >>> 0x1E;
      high = ry >>> 0xF;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    if (result.length > n) {
      result.__setDigit(n++, carry + high);
      while (n < result.length) {
        result.__setDigit(n++, 0);
      }
    } else {
      if (carry + high !== 0) throw new Error('implementation bug');
    }
  }

  JSBI.prototype.__inplaceMultiplyAdd = function (multiplier, summand, length) {
    if (length > this.length) length = this.length;
    var mLow = multiplier & 0x7FFF;
    var mHigh = multiplier >>> 0xF;
    var carry = 0;
    var high = summand;
    for (var i = 0; i < length; i++) {
      var d = this.__digit(i);
      var dLow = d & 0x7FFF;
      var dHigh = d >>> 0xF;
      var pLow = JSBI.__imul(dLow, mLow);
      var pMid1 = JSBI.__imul(dLow, mHigh);
      var pMid2 = JSBI.__imul(dHigh, mLow);
      var pHigh = JSBI.__imul(dHigh, mHigh);
      var result = high + pLow + carry;
      carry = result >>> 0x1E;
      result &= 0x3FFFFFFF;
      result += ((pMid1 & 0x7FFF) << 0xF) + ((pMid2 & 0x7FFF) << 0xF);
      carry += result >>> 0x1E;
      high = pHigh + (pMid1 >>> 0xF) + (pMid2 >>> 0xF);
      this.__setDigit(i, result & 0x3FFFFFFF);
    }
    if (carry !== 0 || high !== 0) {
      throw new Error('implementation bug');
    }
  }

  JSBI.__absoluteDivSmall = function (x, divisor, quotient) {
    if (quotient === null) quotient = new JSBI(x.length, false);
    var remainder = 0;
    for (var i = x.length * 2 - 1; i >= 0; i -= 2) {
      var input = ((remainder << 0xF) | x.__halfDigit(i)) >>> 0;
      var upperHalf = (input / divisor) | 0;
      remainder = (input % divisor) | 0;
      input = ((remainder << 0xF) | x.__halfDigit(i - 1)) >>> 0;
      var lowerHalf = (input / divisor) | 0;
      remainder = (input % divisor) | 0;
      quotient.__setDigit(i >>> 1, (upperHalf << 0xF) | lowerHalf);
    }
    return quotient;
  }

  JSBI.__absoluteModSmall = function (x, divisor) {
    var remainder = 0;
    for (var i = x.length * 2 - 1; i >= 0; i--) {
      var input = ((remainder << 0xF) | x.__halfDigit(i)) >>> 0;
      remainder = (input % divisor) | 0;
    }
    return remainder;
  }

  JSBI.__absoluteDivLarge = function (dividend, divisor, wantQuotient, wantRemainder) {
    var n = divisor.__halfDigitLength();
    var n2 = divisor.length;
    var m = dividend.__halfDigitLength() - n;
    var q = null;
    if (wantQuotient) {
      q = new JSBI((m + 2) >>> 1, false);
      q.__initializeDigits();
    }
    var qhatv = new JSBI((n + 2) >>> 1, false);
    qhatv.__initializeDigits();
    var shift = JSBI.__clz15(divisor.__halfDigit(n - 1));
    if (shift > 0) {
      divisor = JSBI.__specialLeftShift(divisor, shift, 0 /* add no digits*/);
    }
    var u = JSBI.__specialLeftShift(dividend, shift, 1 /* add one digit */);
    var vn1 = divisor.__halfDigit(n - 1);
    var halfDigitBuffer = 0;
    for (var j = m; j >= 0; j--) {
      var qhat = 0x7FFF;
      var ujn = u.__halfDigit(j + n);
      if (ujn !== vn1) {
        var input = ((ujn << 0xF) | u.__halfDigit(j + n - 1)) >>> 0;
        qhat = (input / vn1) | 0;
        var rhat = (input % vn1) | 0;
        var vn2 = divisor.__halfDigit(n - 2);
        var ujn2 = u.__halfDigit(j + n - 2);
        while ((JSBI.__imul(qhat, vn2) >>> 0) > (((rhat << 0x10) | ujn2) >>> 0)) {
          qhat--;
          rhat += vn1;
          if (rhat > 0x7FFF) break;
        }
      }
      JSBI.__internalMultiplyAdd(divisor, qhat, 0, n2, qhatv);
      var c = u.__inplaceSub(qhatv, j, n + 1);
      if (c !== 0) {
        c = u.__inplaceAdd(divisor, j, n);
        u.__setHalfDigit(j + n, (u.__halfDigit(j + n) + c) & 0x7FFF);
        qhat--;
      }
      if (wantQuotient) {
        if (j & 1) {
          halfDigitBuffer = qhat << 0xF;
        } else {
          // TODO make this statically determinable
          q.__setDigit(j >>> 1, halfDigitBuffer | qhat);
        }
      }
    }
    if (wantRemainder) {
      u.__inplaceRightShift(shift);
      if (wantQuotient) {
        return {quotient: q, remainder: u};
      }
      return u;
    }
    if (wantQuotient) return q;
  }

  JSBI.__clz15 = function (value) {
    return JSBI.__clz30(value) - 0xF;
  }

  JSBI.__clz16 = function (value) {
    return JSBI.__clz32(value) - 0x10;
  }

  // TODO: work on full digits, like __inplaceSub?
  JSBI.prototype.__inplaceAdd = function (summand, startIndex, halfDigits) {
    var carry = 0;
    for (var i = 0; i < halfDigits; i++) {
      var sum = this.__halfDigit(startIndex + i) +
                summand.__halfDigit(i) +
                carry;
      carry = sum >>> 0xF;
      this.__setHalfDigit(startIndex + i, sum & 0x7FFF);
    }
    return carry;
  }

  JSBI.prototype.__inplaceSub = function (subtrahend, startIndex, halfDigits) {
    var fullSteps = (halfDigits - 1) >>> 1;
    var borrow = 0;
    if (startIndex & 1) {
      // this:   [..][..][..]
      // subtr.:   [..][..]
      startIndex >>= 1;
      var current = this.__digit(startIndex);
      var r0 = current & 0x7FFF;
      var i = 0;
      for (; i < fullSteps; i++) {
        var sub = subtrahend.__digit(i);
        var r15 = (current >>> 0xF) - (sub & 0x7FFF) - borrow;
        borrow = (r15 >>> 0xF) & 1;
        this.__setDigit(startIndex + i, ((r15 & 0x7FFF) << 0xF) | (r0 & 0x7FFF));
        current = this.__digit(startIndex + i + 1);
        r0 = (current & 0x7FFF) - (sub >>> 0xF) - borrow;
        borrow = (r0 >>> 0xF) & 1;
      }
      // Unrolling the last iteration gives a 5% performance benefit!
      var sub = subtrahend.__digit(i);
      var r15 = (current >>> 0xF) - (sub & 0x7FFF) - borrow;
      borrow = (r15 >>> 0xF) & 1;
      this.__setDigit(startIndex + i, ((r15 & 0x7FFF) << 0xF) | (r0 & 0x7FFF));
      var subTop = sub >>> 0xF;
      if (startIndex + i + 1 >= this.length) {
        throw new RangeError('out of bounds');
      }
      if ((halfDigits & 1) === 0) {
        current = this.__digit(startIndex + i + 1);
        r0 = (current & 0x7FFF) - subTop - borrow;
        borrow = (r0 >>> 0xF) & 1;
        this.__setDigit(startIndex + subtrahend.length,
            (current & 0x3FFF8000) | (r0 & 0x7FFF));
      }
    } else {
      startIndex >>= 1;
      var i = 0;
      for (; i < subtrahend.length - 1; i++) {
        var current = this.__digit(startIndex + i);
        var sub = subtrahend.__digit(i);
        var r0 = (current & 0x7FFF) - (sub & 0x7FFF) - borrow;
        borrow = (r0 >>> 0xF) & 1;
        var r15 = (current >>> 0xF) - (sub >>> 0xF) - borrow;
        borrow = (r15 >>> 0xF) & 1;
        this.__setDigit(startIndex + i, ((r15 & 0x7FFF) << 0xF) | (r0 & 0x7FFF));
      }
      var current = this.__digit(startIndex + i);
      var sub = subtrahend.__digit(i);
      var r0 = (current & 0x7FFF) - (sub & 0x7FFF) - borrow;
      borrow = (r0 >>> 0xF) & 1;
      var r15 = 0;
      if ((halfDigits & 1) === 0) {
        r15 = (current >>> 0xF) - (sub >>> 0xF) - borrow;
        borrow = (r15 >>> 0xF) & 1;
      }
      this.__setDigit(startIndex + i, ((r15 & 0x7FFF) << 0xF) | (r0 & 0x7FFF));
    }
    return borrow;
  }

  JSBI.prototype.__inplaceRightShift = function (shift) {
    if (shift === 0) return;
    var carry = this.__digit(0) >>> shift;
    var last = this.length - 1;
    for (var i = 0; i < last; i++) {
      var d = this.__digit(i + 1);
      this.__setDigit(i, ((d << (0x1E - shift)) & 0x3FFFFFFF) | carry);
      carry = d >>> shift;
    }
    this.__setDigit(last, carry);
  }

  JSBI.__specialLeftShift = function (x, shift, addDigit) {
    var n = x.length;
    var resultLength = n + addDigit;
    var result = new JSBI(resultLength, false);
    if (shift === 0) {
      for (var i = 0; i < n; i++) result.__setDigit(i, x.__digit(i));
      if (addDigit > 0) result.__setDigit(n, 0);
      return result;
    }
    var carry = 0;
    for (var i = 0; i < n; i++) {
      var d = x.__digit(i);
      result.__setDigit(i, ((d << shift) & 0x3FFFFFFF) | carry);
      carry = d >>> (0x1E - shift);
    }
    if (addDigit > 0) {
      result.__setDigit(n, carry);
    }
    return result;
  }

  JSBI.__leftShiftByAbsolute = function(x, y) {
    var shift = JSBI.__toShiftAmount(y);
    if (shift < 0) throw new RangeError('BigInt too big');
    var digitShift = (shift / 0x1E) | 0;
    var bitsShift = shift % 0x1E;
    var length = x.length;
    var grow = bitsShift !== 0 &&
                 (x.__digit(length - 1) >>> (0x1E - bitsShift)) !== 0;
    var resultLength = length + digitShift + (grow ? 1 : 0);
    var result = new JSBI(resultLength, x.sign);
    if (bitsShift === 0) {
      var i = 0;
      for (; i < digitShift; i++) result.__setDigit(i, 0);
      for (; i < resultLength; i++) {
        result.__setDigit(i, x.__digit(i - digitShift));
      }
    } else {
      var carry = 0;
      for (var i = 0; i < digitShift; i++) result.__setDigit(i, 0);
      for (var i = 0; i < length; i++) {
        var d = x.__digit(i);
        result.__setDigit(
            i + digitShift, ((d << bitsShift) & 0x3FFFFFFF) | carry);
        carry = d >>> (0x1E - bitsShift);
      }
      if (grow) {
        result.__setDigit(length + digitShift, carry);
      } else {
        if (carry !== 0) throw new Error('implementation bug');
      }
    }
    return result.__trim();
  }

  JSBI.__rightShiftByAbsolute = function (x, y) {
    var length = x.length;
    var sign = x.sign;
    var shift = JSBI.__toShiftAmount(y);
    if (shift < 0) return JSBI.__rightShiftByMaximum(sign);
    var digitShift = (shift / 0x1E) | 0;
    var bitsShift = shift % 0x1E;
    var resultLength = length - digitShift;
    if (resultLength <= 0) return JSBI.__rightShiftByMaximum(sign);
    // For negative numbers, round down if any bit was shifted out (so that
    // e.g. -5n >> 1n == -3n and not -2n). Check now whether this will happen
    // and whether itc an cause overflow into a new digit. If we allocate the
    // result large enough up front, it avoids having to do grow it later.
    var mustRoundDown = false;
    if (sign) {
      var mask = (1 << bitsShift) - 1;
      if ((x.__digit(digitShift) & mask) !== 0) {
        mustRoundDown = true;
      } else {
        for (var i = 0; i < digitShift; i++) {
          if (x.__digit(i) !== 0) {
            mustRoundDown = true;
            break;
          }
        }
      }
    }
    // If bitsShift is non-zero, it frees up bits, preventing overflow.
    if (mustRoundDown && bitsShift === 0) {
      // Overflow cannot happen if the most significant digit has unset bits.
      var msd = x.__digit(length - 1);
      var roundingCanOverflow = ~msd === 0;
      if (roundingCanOverflow) resultLength++;
    }
    var result = new JSBI(resultLength, sign);
    if (bitsShift === 0) {
      // Zero out any overflow digit (see "roundingCanOverflow" above).
      result.__setDigit(resultLength - 1, 0);
      for (var i = digitShift; i < length; i++) {
        result.__setDigit(i - digitShift, x.__digit(i));
      }
    } else {
      var carry = x.__digit(digitShift) >>> bitsShift;
      var last = length - digitShift - 1;
      for (var i = 0; i < last; i++) {
        var d = x.__digit(i + digitShift + 1);
        result.__setDigit(i, ((d << (0x1E - bitsShift)) & 0x3FFFFFFF) | carry);
        carry = d >>> bitsShift;
      }
      result.__setDigit(last, carry);
    }
    if (mustRoundDown) {
      // Since the result is negative, rounding down means adding one to its
      // absolute value. This cannot overflow.
      result = JSBI.__absoluteAddOne(result, true, result);
    }
    return result.__trim();
  }

  JSBI.__rightShiftByMaximum = function (sign) {
    if (sign) {
      return JSBI.__oneDigit(1, true);
    };
    return JSBI.__zero();
  }

  JSBI.__toShiftAmount = function (x) {
    if (x.length > 1) return -1;
    var value = x.__unsignedDigit(0);
    if (value > JSBI.__kMaxLengthBits) return -1;
    return value;
  }

  JSBI.__toPrimitive = function (obj, hint) {
    if (isNil(hint)) {hint = 'default';};
    if (typeof obj !== 'object') return obj;
    if (obj.constructor === JSBI) return obj;
    var exoticToPrim = obj[Symbol.toPrimitive];
    if (exoticToPrim) {
      var primitive = exoticToPrim(hint);
      if (typeof primitive !== 'object') return primitive;
      throw new TypeError('Cannot convert object to primitive value');
    };
    var valueOf = obj.valueOf;
    if (valueOf) {
      var primitive = valueOf.call(obj);
      if (typeof primitive !== 'object') return primitive;
    };
    var toString = obj.toString;
    if (toString) {
      var primitive = toString.call(obj);
      if (typeof primitive !== 'object') return primitive;
    };
    throw new TypeError('Cannot convert object to primitive value');
  }

  JSBI.__toNumeric = function (value) {
    if (JSBI.__isBigInt(value)) return value;
    return +value;
  }

  JSBI.__isBigInt = function (value) {
    return ((typeof value === 'object') && !isNil(
    value) && (value.constructor === JSBI));
  }

  JSBI.__truncateToNBits = function (n, x) {
    var neededDigits = ((n + 0x1D) / 0x1E) | 0;
    var result = new JSBI(neededDigits, x.sign);
    var last = neededDigits - 1;
    for (var i = 0; i < last; i++) {
      result.__setDigit(i, x.__digit(i));
    }
    var msd = x.__digit(last);
    if ((n % 0x1E) !== 0) {
      var drop = 0x20 - (n % 0x1E);
      msd = (msd << drop) >>> drop;
    }
    result.__setDigit(last, msd);
    return result.__trim();
  }

  JSBI.__truncateAndSubFromPowerOfTwo = function (n, x, resultSign) {
    var neededDigits = ((n + 0x1D) / 0x1E) | 0;
    var result = new JSBI(neededDigits, resultSign);
    var i = 0;
    var last = neededDigits - 1;
    var borrow = 0;
    var limit = Math.min(last, x.length);
    for (; i < limit; i++) {
      var r = 0 - x.__digit(i) - borrow;
      borrow = (r >>> 0x1E) & 1;
      result.__setDigit(i, r & 0x3FFFFFFF);
    }
    for (; i < last; i++) {
      result.__setDigit(i, (-borrow & 0x3FFFFFFF) | 0);
    }
    var msd = last < x.length ? x.__digit(last) : 0;
    var msdBitsConsumed = n % 0x1E;
    var resultMsd;
    if (msdBitsConsumed === 0) {
      resultMsd = 0 - msd - borrow;
      resultMsd &= 0x3FFFFFFF;
    } else {
      var drop = 0x20 - msdBitsConsumed;
      msd = (msd << drop) >>> drop;
      var minuendMsd = 1 << (0x20 - drop);
      resultMsd = minuendMsd - msd - borrow;
      resultMsd &= (minuendMsd - 1);
    }
    result.__setDigit(last, resultMsd);
    return result.__trim();
  }

  // Digit helpers.
  JSBI.prototype.__digit = function (i) {
    return this[i];
  }
  JSBI.prototype.__unsignedDigit = function (i) {
    return this[i] >>> 0;
  }
  JSBI.prototype.__setDigit = function (i, digit) {
    this[i] = digit | 0;
  }
  JSBI.prototype.__setDigitGrow = function (i, digit) {
    this[i] = digit | 0;
  }
  JSBI.prototype.__halfDigitLength = function () {
    var len = this.length;
    if (this.__unsignedDigit(len - 1) <= 0x7FFF) return len * 2 - 1;
    return (len * 2);
  }
  JSBI.prototype.__halfDigit = function (i) {
    return (this[i >>> 1] >>> ((i & 1) * 0xF)) & 0x7FFF;
  }
  JSBI.prototype.__setHalfDigit = function (i, value) {
    var digitIndex = i >>> 1;
    var previous = this.__digit(digitIndex);
    var updated = (i & 1) ? (previous & 0x7FFF) | (value << 0xF)
                            : (previous & 0x3FFF8000) | (value & 0x7FFF);
    this.__setDigit(digitIndex, updated);
  }

  JSBI.__digitPow = function (base, exponent) {
    var result = 1; while (exponent > 0) {
      if (exponent & 1) result *= base;
      exponent >>>= 1;
      base *= base;
    }; return result;
  }

JSBI.__kMaxLength = 1 << 0x19;
JSBI.__kMaxLengthBits = JSBI.__kMaxLength << 0x5;
// Lookup table for the maximum number of bits required per character of a
// base-N string representation of a number. To increase accuracy, the array
// value is the actual value multiplied by 32. To generate this table:
//
// for (var i = 0; i <= 36; i++) {
//   console.log(Math.ceil(Math.log2(i) * 0x20) + ',');
// }
JSBI.__kMaxBitsPerChar = [
  0, 0, 32, 51, 64, 75, 83, 90, 96, // 0..8
  102, 107, 111, 115, 119, 122, 126, 128, // 9..16
  131, 134, 136, 139, 141, 143, 145, 147, // 17..24
  149, 151, 153, 154, 156, 158, 159, 160, // 25..32
  162, 163, 165, 166, // 33..36
];
JSBI.__kBitsPerCharTableShift = 0x5;
JSBI.__kBitsPerCharTableMultiplier = 0x1 << JSBI.__kBitsPerCharTableShift;
JSBI.__kConversionChars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
JSBI.__kBitConversionBuffer = new ArrayBuffer(8);
JSBI.__kBitConversionDouble = new Float64Array(JSBI.__kBitConversionBuffer);
JSBI.__kBitConversionInts = new Int32Array(JSBI.__kBitConversionBuffer);

// For IE11 compatibility.
// Note that the custom replacements are tailored for JSBI's needs, and as
// such are not reusable as general-purpose polyfills.
JSBI.__clz30 = Math.clz32 ? function (x) {
return Math.clz32(x) - 2;} : function (x) {
if (x === 0) {return 0x1E;}; return (0x1D - (
Math.log(x >>> 0) / Math.LN2 | 0) | 0);}; 
JSBI.__clz32 = Math.clz32 || function (x) {
if (x === 0) {return 0x20;}; return (0x1F - (
Math.log(x >>> 0) / Math.LN2 | 0) | 0);
}; JSBI.__imul = Math.imul || function (
a, b) {return ((a * b) | 0);};
JSBI.__isOneDigitInt = function (x) {
return ((x & 0x3FFFFFFF) === x);};
} else {JSBI = new Object; JSBI.BigInt = BigInt;
JSBI.toNumber = function (thing) {return (Number(
thing));}; JSBI.add = function (a, b) {return (a + b);}; (JSBI.subtract
) = function (a, b) {return (a - b);}; JSBI.multiply = function (a, b) {
return (a * b);}; JSBI.divide = function (a, b) {return (a / b);}; (JSBI
).exponentiate = (function (a, b) {return ((b > JSBI.theZero) ? (JSBI
).multiply(a, JSBI.exponentiate(a, (b - JSBI.theOne))) : JSBI.theOne
);}); JSBI.remainder = function (a, b) {return (a % b);};};
JSBI.theZero = JSBI.BigInt(0); JSBI.theOne = JSBI.BigInt(1);
JSBI.getNZeroes = function (zeroes) {zeroes = Math.trunc(Math.max(zeroes, 0)
); if (zeroes == 0) {return '';} else {return ((JSBI.exponentiate(JSBI.BigInt(
10), JSBI.BigInt(zeroes.toString()))).toString()).slice(1, zeroes + 1);};};