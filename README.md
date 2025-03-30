# hugenumberjs
[![npm version](https://badge.fury.io/js/hugenumberjs.svg)](https://badge.fury.io/js/hugenumberjs)

hugenumberjs is a library for storing extremely large numbers (up to {10, 1000\[2\]2} in Bird's array notation or approximately f_ω^ω(1000) in the fast-growing hierarchy) in JavaScript. Supports both Node and browser. It can be used for googology (the study of large numbers) and complex incremental games. It vastly exceeds the limitations of the next-best libraries for this purpose such as [https://github.com/Naruyoko/ExpantaNum.js/tree/master](ExpantaNum.js) but may be slow. You may want to use a simpler library like ExpantaNum.js or [https://github.com/Patashu/break_eternity.js](break_eternity.js) if you are not doing as heavy-duty large numbers. There is also some support for very small (near-zero) numbers in this library but it is much more limited than the very large number support, going down to approximately 10^(-(1.8*10^308)).

Numbers are represented in [https://www.mrob.com/users/chrisb/Linear_Array_Notation.pdf](Bird's Linear Array Notation) (or equivalently, linear BEAF), although it is a modified version to support non-integer arguments. Internally this is stored as a property called `array`, where the first argument is omitted and is an implicit 10 since this is 10-based. Nesting arrays are not allowed (aside from a limited nesting capability provided by the `blan10` method)–all elements are stored as base JavaScript numbers and never HugeNumbers. There is also a `sign`property equal to 1, 0, or -1 to support 0 and negative numbers. So for example, the number `-{10,100,1,1,2}`in BLAN would be represented by having the `array` property set to `[100,1,1,2]` and the `sign` property set to `-1` since it is a negative number.

## Changelog
* 1.0: Initial release which used chained arrow notation
* 2.0: New release which is basically a complete overhaul to use BLAN

## Continuous Bird's array notation definition
Numbers are represented in [https://www.mrob.com/users/chrisb/Linear_Array_Notation.pdf](Bird's Linear Array Notation) (or equivalently, linear BEAF), although it is a modified version to support non-integer arguments. The formal googological definition of this modified version of BLAN has been put here for convenience.

Let @ represent an arbitrary (possibly empty) comma-separated list of real numbers greater than or equal to 1. An expression is of the form {@}.

Let a<b>, where a is a real number greater than or equal to 1, and b is a positive integer, represent the comma-separated list of a repeated b times.

To evaluate an expression, use the following rules:
* {} = 1
* {a} = a
* {a, b} = a^b
* {@, 1} = {@}
* {a, 1, @} = a
* {a, b, 1<n>, d, @} = {a, b, 1<n + 1>, @}^(2 - d) *  {a, b, 1<n>, 2, @}^(d - 1) if 1 < d < 2
* {a, b, 1<n>, d, @} = {a<n + 1>, a^(b - 1), d - 1, @} if 1 < b < 2 and d > 2
* {a, b, 1<n>, d, @} = {a<n + 1>, {a, b - 1, 1<n>, d, @}, d - 1, @} if b > 2 and d > 2
* {a, b, c, @} =  {a, b, 1, @}^(2 - c) * {a, b, 1, @}^(c - 1)  1 < c < 2
* {a, b, c, @} = {a, a^(b - 1), c - 1, @} if 1 < b < 2 and c > 2
* {a, b, c, @} = {a, {a, b - 1, c, @}, c - 1, @} if b > 2 and c > 2

## Method documentation
* `constructor(sign, array)`: This is the constructor based on the internal representation, taking in the `sign` and `array` propertise as described earlier. Note that the array is "normalized" so for example inputting the array `[2,2]` would have it automatically simplify to `[10]` since {10,2,2} = {10,10} = 10^10.
* `static fromNumber(num)`: Converts from a standard (built-in) number to a `HugeNumber` object.
* `static fromString(str)`: Converts from a string to a `HugeNumber` object (currently can include ordinary numbers, scientific notation like `1e+1000`, scientific notation with nested exponents like `1e+1e+1000`, but not up-arrow notation, BLAN or anything else)
* `clone()`: Returns a cloned object of `this`.
* `abs()`: Returns the absolute value of `this`.
* `neg()`: Returns the negation of `this`.
* `add(other)`: Returns the sum of `this` and `other`.
* `sub(other)`: Returns the difference of `this` and `other`.
* `mul(other)`: Returns the product of `this` and `other`.
* `div(other)`: Returns the quotient of `this` and `other`.
* `mod(other)`: Returns the modulo of `this` and `other`.
* `exp10()`: Returns the base-10 exponential function of `this`.
* `exp()`: Returns the base-e exponential function of `this`.
* `pow(other)`:  Returns `this` raised to the power of `other`.
* `sqrt()`: Returns the square root of `this`.
* `cbrt()`: Returns the cube root of `this`.
* `log10()`:  Returns the base-10 logarithm of `this`.
* `log()`:  Returns the natural logarithm of `this`.
* `logb(b)`: Returns the base-`b` logarithm of `this`.
* `sin()`: Returns the sine of `this`.
* `cos()`: Returns the cosine of `this`.
* `tan()`: Returns the tangent of `this`.
* `asin()`: Returns the inverse sine of `this`.
* `acos()`: Returns the inverse cosine of `this`.
* `atan()`: Returns the inverse tangent of `this`.
* `sinh()`: Returns the hyperbolic sine of `this`.
* `cosh()`: Returns the hyperbolic cosine of `this`.
* `tanh()`: Returns the hyperbolic tangent of `this`.
* `asinh()`: Returns the inverse hyperbolic sine of `this`.
* `acosh()`: Returns the inverse hyperbolic cosine of `this`.
* `atanh()`: Returns the inverse hyperbolic tangent of `this`.
* `floor()`: Returns the floor function of `this`.
* `ceil()`:  Returns the ceiling function of `this`.
* `round()`: Returns the round to nearest integer function of `this`.
* `trunc()`:  Returns the truncate function of `this`.
* `tetr10()`:  Returns 10 tetrated to `this`. If you want to do pentation or higher with base 10 see the `blan10` method.
* `tetr(other)`:  Returns `this` tetrated to `other` (may be buggy or slow for bases very close to e^(1/e) ≈ 1.445). 
* `lambertw()`: Returns the Lambert W function of `this`.
* `ssqrt()`: Returns the super-square root of `this`.
* `slog10(other)`:  Returns the base-10 superlogarithm of `this`.
* `slogb(b)`:  Returns the base-`b` superlogarithm of `this` (may be buggy or slow for bases very close to e^(1/e) ≈ 1.445).
* `blan10(array)`:  Returns {10, this, array[0], array[1], array[2], array[3]....} in Bird's Linear Array Notation. For example: `HugeNumber.fromNumber(11).blan10([12,13])` would return {10,11,12,13} in Bird's Linear Array Notation. The elements of the array have to be standard numbers not `HugeNumber`s. This is the only way to do pentation or higher currently, and it is only base 10. 10 pentated to is `x.blan10([3])` since it's {10,x,3} in BLAN.    
* `cmp(other)`: "Three-way comparison" opearator (returns -1 if `this < other`, 0 if `this === other`, 1 if `this > other`)
* `eq(other)`: Equal to
* `ne(other)`: Not equal to
* `lt(other)`: Less than
* `le(other)`: Less than or equal
* `gt(other)`: Greater than
* `ge(other)`: Greater than or equal
* `min(other)`: Returns the minimum of `this` and `other`.
* `max(other)`: Returns the maximum of `this` and `other`.
* `toNumber()`: Converts a `HugeNumber` object to a standard (built-in) number. (if the `HugeNumber` is too large to be converted to a standard number, this will return `Infinity`)
* `toString()`: Converts a `HugeNumber` object to a string representation.