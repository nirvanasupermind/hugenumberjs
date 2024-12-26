// Wrapping all code in the function
// so I can have private variables
var HugeNumber = (function () {
    // log10(Number.MAX_VALUE)
    const LOG10_MAX_VALUE = 308.25471555991675;

    // Base-10 super-logarithm
    // Using linear approximation for non-integer arguments
    function slog10(z) {
        if(z <= 0) {
            return slog10(Math.pow(10, z)) - 1;
        } else if(0 < z && z <= 1) {
            return z - 1;
        } else {
            return slog10(Math.log10(z)) + 1;
        }
    }

    // returns log10(10^x + 10^y)
    function addLogs(x, y) {
        var gaussianLog = Math.log10(1 + Math.pow(10, y - x));
        if(Number.isFinite(gaussianLog)) {
            return x + gaussianLog;
        } else {
            return y;
        }
    }
    
    // returns log10(10^x - 10^y)
    function subLogs(x, y) {
        var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, y - x)));
        if(Number.isFinite(gaussianLog)) {
            return x + gaussianLog;
        } else {
            return y;
        }
    }
    
    
    // Normalizes an array in my continuous extension of linear BAN
    // (the first term is implicit 10, so {10,100,1,2} -> [100,1,2])
    function normalize(array) {
        var a = 10;
        var b = array[0];
        var c = array[1];
        if(array.length === 0) {
            // Rule 2
            // {a} = a
            return 10;
        } else if(array.length === 1) {
            // Rule 3
            // {a, b} = a^b
            if(b < LOG10_MAX_VALUE) {
                return Math.pow(a, b);
            } else {
                return array;
            }
        } else if(array[array.length - 1] === 1) {
            // Rule 4
            // {#, 1} = {#}
            return normalize(array.slice(0,-1));
        } else if(b === 1) {
            // Rule 5
            // {a, 1, #} = a
            // if(outputVanillaNumbers) {
            return a;
            // } else {
            //     return [1];
            // }
        } else if(c === 1) {
            var n = 1;
            while(array[n] === 1) {
                n++;
            }
            n--;
            var d = array[n + 1];
            var pound = array.slice(n + 2);
            if(1 < d && d < 2) {
                // Rule 6
                // {a, b, 1<n>, d, #} = {a, b, 1<n + 1>, #}^(2 - d) *  {a, b, 1<n>, 2, #}^(d - 1) if 1 < d < 2
                var t1 = array.slice();
                t1[n + 1] = 1;
                t1 = normalize(t1);
                
                var t2 = array.slice();
                t2[n + 1] = 2;
                t2 = normalize(t2);

                if(typeof t1 === "number" && typeof t2 === "number") {
                    return t1 * (2 - d) + t2 * (d - 1);
                }

                if(typeof t1 === "number") {
                    t1 = [Math.log10(t1)];
                } else if(typeof t2 === "number") {
                    t2 = [Math.log10(t2)];
                }

                if(t1.length === 1 && t2.length === 1) {
                    return normalize([addLogs(t1[0] + Math.log10(2 - d), t2[0] + Math.log10(d - 1))]);
                } else {
                    return t2;
                }
            } else {
                var result = [];
                for(var i = 0; i < n; i++) {
                    result.push(a);
                }
                if(b >= 2) {
                    // Rule 8
                    // {a, b, 1<n>, d, #} = {a<n + 1>, {a, b - 1, 1<n>, d, #}, d - 1, #} if b > 2 and d >= 2
                    var temp = array.slice();
                    temp[0]--;
                    temp = normalize(temp);
                    if(Number.isFinite(temp)) {
                        result.push(temp);
                    } else {
                        return array;
                    }
                } else {
                    // Rule 7
                    // {a, b, 1<n>, d, #} = {a<n + 1>, a^(b - 1), d - 1, #} if 1 < b < 2 and d > 2
                    result.push(Math.pow(a, b - 1));
                }
                result.push(d - 1);
                return normalize(result.concat(pound));
            }
        } else if(1 < c && c < 2) {
            // Rule 9
            // {a, b, c, #} =  {a, b, 1, #}^(2 - c) * {a, b, 1, #}^(c - 1) if 1 < c < 2
            var pound = array.slice(2);
            var t1 = array.slice();
            t1[1] = 1;
            t1 = normalize(t1);
            
            var t2 = array.slice();
            t2[1] = 2;
            t2 = normalize(t2);

            if(typeof t1 === "number" && typeof t2 === "number") {
                // if(outputVanillaNumbers) {
                return t1 * (2 - c) + t2 * (c - 1);
                // } else {
                //     return [Math.log10(t1 * (2 - c) + t2 * (c - 1))];
                // }
            }

            if(typeof t1 === "number") {
                t1 = [Math.log10(t1)];
            } else if(typeof t2 === "number") {
                t2 = [Math.log10(t2)];
            }

            if(t1.length === 1 && t2.length === 1) {
                return normalize([addLogs(t1[0] + Math.log10(2 - c), t2[0] + Math.log10(c - 1))]);
            } else {
                return t2;
            }
        } else if(c >= 2) {
            var pound = array.slice(2);
            var result = [];
            if(b >= 2) {
                if(b >= 10) {
                    return array;
                }
                // Rule 11
                // {a, b, c, #} = {a, {a, b - 1, c, #}, c - 1, #} if b >= 2 and c >= 2
                var temp = array.slice();
                temp[0]--;
                temp = normalize(temp);
                if(Number.isFinite(temp)) {
                    result.push(temp);
                } else {
                    if(c % 1 === 0) {
                        return array;
                    } else {
                        // The map thing irons out the remaining decimal arguments
                        // for example {10, 3, 2.5} = {10, 3, 3}
                        // (which is basically true anyways, they are very close googologically)
                        return array.map((e, i) => i ? Math.ceil(e): e);
                    }
                }
            } else {
                // Rule 10
                // {a, b, c, #} = {a, a^(b - 1), c - 1, #} if 1 < b < 2 and c >= 2
                result.push(Math.pow(a, b - 1));
            }
            result.push(c - 1);
            return normalize(result.concat(pound));
        } else {
            console.log("No BAN rules found for array " + JSON.stringify(array));
            return array;
        }
    }

    class HugeNumber {
        // Constructs HugeNumber from the sign and BAN array
        constructor(sign, array) {
            this.sign = sign;
            this.array = normalize(array);
            if(typeof this.array === "number") {
                this.array = [Math.log10(this.array)];
            }
            if(this.array[0] === -Infinity) {
                this.sign = 0;
            } else if(this.array[0] === NaN) {
                this.sign = NaN;
            }
        }

        // Clones a HugeNumber object
        clone() {
            return new HugeNumber(this.sign, this.array.slice());
        }

        // Absolute value
        abs() {
            return new HugeNumber(1, this.array.slice());
        }

        // Negation
        neg() {
            return new HugeNumber(-this.sign,  this.array.slice());
        }

        // Absolute value then negation (this is faster than doing this.neg().abs())
        absNeg() {
            return new HugeNumber(-1, this.array.slice());
        }

        // Addition
        add(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            // Deal with negative arguments
            if(this.sign === -1 && other.sign === -1) {
                return this.abs().add(other.abs()).absNeg();
            } else if(this.sign === -1 && other.sign === 1) {
                return this.abs().sub(other.absNeg()).absNeg();
            } else if(this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            } 
            // Main part (both arguments are positive)
            else if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(1, [addLogs(this.array[0], other.array[0])]);
            } else {
                // At this scale, x + y is indistinguishable from max(x, y)
                return this.max(other);
            }
        }

        // Subtraction
        sub(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // x - x = 0
            if(this.eq(other)) {
                return HugeNumber.ZERO.clone();
            }
            // Deal with negative arguments
            else if(this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).absNeg();
            } else if(this.sign === -1 && other.sign === 1) {
                return this.abs().add(other.absNeg()).absNeg();
            } else if(this.sign === 1 && other.sign === -1) {
                return this.add(other.abs());
            } 
            // Main part (both arguments are positive)
            else if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(1, [subLogs(this.array[0], other.array[0])]);
            } else {
                // At this scale, x - y is indistinguishable from max(x, y)
                return this.max(other);
            }
        }

        // Multiplication
        mul(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var sign = this.sign * other.sign;
            if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(sign, [this.array[0] + other.array[0]]);
            } else if(this.array.length === 2 && other.array.length === 1
                && this.array[1] === 2) {
                var x = Math.pow(10, Math.pow(10, this.array[0] - 3));
                var y = Math.log10(other.array[0]);
                if(Number.isFinite(x) && Number.isFinite(y)) {
                    return new HugeNumber(sign, [3 + Math.log10(Math.log10(addLogs(x, y))), 2]);
                } else {
                    return this.max(other);
                }
            } else if(this.array.length === 2 && other.array.length === 1
                && this.array[1] === 2) {
                var x = Math.pow(10, Math.pow(10, this.array[0] - 3));
                var y = Math.log10(other.array[0]);
                if(Number.isFinite(x) && Number.isFinite(y)) {
                    return new HugeNumber(sign, [3 + Math.log10(Math.log10(addLogs(x, y))), 2]);
                } else {
                    return this.max(other);
                }
            } else if(this.array.length === 1 && other.array.length === 2
                && other.array[1] === 2) {
                return other.mul(this);
            } else if(this.array.length === 2 && other.array.length === 2
                && this.array[1] === 2 && other.array[1] === 2) {
                var x = Math.pow(10, Math.pow(10, this.array[0] - 3));
                var y = Math.pow(10, Math.pow(10, other.array[0] - 3));
                if(Number.isFinite(x) && Number.isFinite(y)) {
                    return new HugeNumber(sign, [3 + Math.log10(Math.log10(addLogs(x, y))), 2]);
                } else {
                    return this.max(other);
                }
            } else {
                // At this scale, x * y is indistinguishable from max(x, y)
                return this.max(other);
            }
        }

        // Division
        div(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var sign = this.sign * other.sign;
            if(this.eq(other)) {
                return HugeNumber.ONE.clone();
            } else if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(sign, [this.array[0] - other.array[0]]);
            } else if(this.array.length === 2 && other.array.length === 1
                && this.array[1] === 2) {
                var x = Math.pow(10, Math.pow(10, this.array[0] - 3));
                var y = Math.log10(other.array[0]);
                if(Number.isFinite(x) && Number.isFinite(y)) {
                    return new HugeNumber(sign, [3 + Math.log10(Math.log10(subLogs(x, y))), 2]);
                } else {
                    return this.max(other);
                }
            } else if(this.array.length === 1 && other.array.length === 2
                && other.array[1] === 2) {
                return HugeNumber.ZERO.clone();
            } else if(this.array.length === 2 && other.array.length === 2
                && this.array[1] === 2 && other.array[1] === 2) {
                var x = Math.pow(10, Math.pow(10, this.array[0] - 3));
                var y = Math.pow(10, Math.pow(10, other.array[0] - 3));
                if(Number.isFinite(x) && Number.isFinite(y)) {
                    return new HugeNumber(1, [3 + Math.log10(Math.log10(subLogs(x, y))), 2]);
                } else {
                    return this.max(other);
                }
            } else {
                // At this scale, x / y is indistinguishable from 0 if x < y or x if x > y
                if(x.lt(y)) {
                    return HugeNumber.ZERO.clone();
                } else {
                    return x.clone();
                }
            } 
        }

        // Modulo
        mod(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // Use property that x % y = x - (floor(x / y) * y)
            return this.abs().sub(this.abs().div(other).floor().mul(other));
        }

        // Base-10 exponential function
        exp10() {
            if(this.array.length === 1) {
                if(this.array[0] < LOG10_MAX_VALUE) {
                    return new HugeNumber(1, [this.toNumber()]);
                } else {
                return new HugeNumber(1, [slog10(this.array[0]) + 2, 2]);
                }
            } else if(this.array.length === 2 && this.array[1] === 2) {
                // 10^(10^^x) = 10^^(x + 1)
                return new HugeNumber(1, [this.array[0] + 1, 2]);
            } else {
                // At this scale, 10^x is indistinguishable from x
                return this.clone();
            }
        }

        // Base-e exponential function
        exp() {
            // Use change-of-base rule
            return this.mul(Math.LOG10E).exp10();
        }
        
        // Exponentiation
        pow(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // Use change-of-base rule
            return other.mul(this.log10()).exp10();
        }

        // Base-10 logarithm
        log10() {
            if(this.array.length === 1) {
                return HugeNumber.fromNumber(this.array[0]);
            } else if(this.array.length === 2 && this.array[1] === 2) {
                // log10(10^^x) = 10^^(x - 1)
                return new HugeNumber(1, [this.array[0] - 1, 2]);
            } else {
                // At this scale, log10(x) is indistinguishable from x
                return this.clone();
            }
        }

        // Base-e logarithm
        log() {
            // Use change-of-base rule
            return this.mul(Math.LN10).log10();
        }


        // Sine
        sin() {
            return HugeNumber.fromNumber(Math.sin(this.toNumber()));
        }

        // Cosine
        cos() {
            return HugeNumber.fromNumber(Math.cos(this.toNumber()));
        }

                // Tangent
                tan() {
                    return HugeNumber.fromNumber(Math.tan(this.toNumber()));
                }
                
                
                // Inverse sine
                asin() {
                    return HugeNumber.fromNumber(Math.asin(this.toNumber()));
                }
                

                // Inverse cosine
                acos() {
                    return HugeNumber.fromNumber(Math.acos(this.toNumber()));
                }
                

                // Inverse tangent
                atan() {
                    return HugeNumber.fromNumber(Math.atan(this.toNumber()));
                }

                // Hyperbolic sine
                sinh() {
                    return HugeNumber.fromNumber(Math.sinh(this.toNumber()));
                }
                
                // Hyperbolic cosine
                cosh() {
                    return HugeNumber.fromNumber(Math.cosh(this.toNumber()));
                }
                
                // Hyperbolic tangent
                tanh() {
                    return HugeNumber.fromNumber(Math.tanh(this.toNumber()));
                }
                
                // Inverse hyperbolic sine
                asinh() {
                    return HugeNumber.fromNumber(Math.asinh(this.toNumber()));
                }
                
                // Inverse hyperbolic cosine
                acosh() {
                    return HugeNumber.fromNumber(Math.acosh(this.toNumber()));
                }
                
                                // Inverse hyperbolic tangent
                                atanh() {
                                    return HugeNumber.fromNumber(Math.atanh(this.toNumber()));
                                }
              
        // Returns {10, this, array[0], array[1], array[2], array[3]....} in Bird's Array Notation
        ban10(array) {
            if(array[0] > 1 && array[0] < 2) {
                return this.ban10([1].concat(array.slice(1))).mul(array[0] - 1).add(this.ban10([2].concat(array.slice(1))).mul(2 - array[0]));
            }
            var num = this.toNumber();
            var array2 = array.slice();
            array2[0]++;
            if(Number.isFinite(num)) {
                return new HugeNumber(1, [num].concat(array));
            } else if(this.lt(new HugeNumber(1, [2.0000000000000004].concat(array2)))) {
                var lower = 1;
            var upper = 2.0000000000000004;
            var middle = (lower + upper) / 2;
            for(var i = 0; i < 70; i++) {
                var temp = new HugeNumber(1, [middle].concat(array2));
                if(temp.lt(this)) {
                    lower = middle;
                } else if(temp.gt(this)) {
                    upper = middle;
                } else {
                    return new HugeNumber(1, [middle + 1].concat(array2));;
                }

                middle = (lower + upper) / 2;
            }

            return new HugeNumber(1, [middle + 1].concat(array2));
        } else if(JSON.stringify(this.array.slice(1)) === JSON.stringify(array2)) {
            return new HugeNumber(1, [this.array[0] + 1].concat(array2));
        } else {
            return this.clone();
        }
    }

     // Returns {this, other, array[0], array[1], array[2], array[3]....} in Bird's Array Notation
    ban(other, array) {
        if (typeof other === "number") {
            other = HugeNumber.fromNumber(other);
        }

        if(array[0] > 1 && array[0] < 2) {
            return this.ban(other, [1].concat(array.slice(1))).mul(array[0] - 1).add(this.ban(other, [2].concat(array.slice(1))).mul(2 - array[0]));
        }
        
        if(array.length === 1 && array[0] === 1) { 
            return this.pow(other);
        }

        var temp = new HugeNumber(1, [0]);
        for(var i = 0; i < 7; i++) {
            if(i === other.toNumber()) {
                return temp;
            }
            // temp = this.ban(temp);
            temp = this.ban(temp, [array[0] - 1].concat(array.slice(1)));
            console.log(temp.toString());
        }
        var offset = temp.array[0] - 6;
        return other.add(offset).ban10(array);
    }

        floor() {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var num = this.toNumber();
            if(Number.isFinite(num)) {
                return HugeNumber.fromNumber(Math.floor(num));
            } else {
                return this.clone();
            }
        }


        ceil() {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var num = this.toNumber();
            if(Number.isFinite(num)) {
                return HugeNumber.fromNumber(Math.ceil(num));
            } else {
                return this.clone();
            }
        }

        // Three-way comparison operator 
        // Returns 1 if this > other, 0 if this = other, and -1 if this < other
        cmp(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.sign === -1 && other.sign === -1) {
                return -this.abs().cmp(other.abs());
            } else if(this.sign === -1 && other.sign === 1) {
                return -1;
            } else if(this.sign === 1 && other.sign === -1) {
                return 1;
            } else if(this.array.length > other.array.length) {
                return 1;
            } else if(this.array.length < other.array.length) {
                return -1;
            } else {
                for (var i = this.array.length - 1;i >= 0; i--) {
                    if (this.array[i] > other.array[i]){
                        return 1;
                    }else if (this.array[i] < other.array[i]){
                        return -1;
                    }
                }
                return 0;
            }
        }

        // Equal to
        eq(other) {
            return JSON.stringify(this) === JSON.stringify(other);
        }
        
        // Not equal to
        ne(other) {
            return JSON.stringify(this) !== JSON.stringify(other);
        }
                
        // Less than
        lt(other) {
            return this.cmp(other) < 0;
        }
        

        // Less than or equal to
        le(other) {
            return this.cmp(other) <= 0;
        }
        
        // Greater than
        gt(other) {
            return this.cmp(other) > 0;
        }
                
                
        // Greater than or equal to
        ge(other) {
            return this.cmp(other) >= 0;
        }
        
                
        
    
        // Returns the maximum of this and other
        max(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) === 1 ? this.clone() : other.clone();
        }

        
        // Converts HugeNumber to vanilla number
        toNumber() {
            if(this.array.length === 1) {
                return this.sign * Math.pow(10, this.array[0]);
            } else {
                return this.sign * Infinity;
            }
        }

        // Converts HugeNumber to string
        toString() {
            if(this.array.length === 1) {
                if(this.array[0] === -Infinity) {
                    return "0";
                } else if(this.array[0] < -324) {
                    return Math.pow(10, this.array[0] - Math.floor(this.array[0])) + "e-" + Math.floor(-this.array[0]);
                } else if(this.array[0] >= -324 && this.array[0] < LOG10_MAX_VALUE) {
                    return Math.pow(10, this.array[0]).toString();
                } else {
                    return Math.pow(10, this.array[0] % 1) + "e+" + Math.floor(this.array[0]);
                }
            } else if(this.array.length === 2 && this.array[1] === 2) {
                return "10^^" + this.array[0];
            } else if(this.array.length === 2 && this.array[1] === 3) {
                return "10^^^" + this.array[0];
            } else if(this.array.length === 2 && this.array[1] === 4) {
                return "10^^^^" + this.array[0];
            } else if(this.array.length === 2 && this.array[1] > 4) {
                return "10{" + this.array[1] + "}" + this.array[0];
            } else {
                return "{10," + this.array + "}";
            }
        }

        // Converts a JS number to a HugeNumber
        static fromNumber(num) {
            return new HugeNumber(Math.sign(num), [Math.log10(Math.abs(num))]);
        }
    }

    // Constants
    HugeNumber.ZERO = new HugeNumber(0, [-Infinity]);
    HugeNumber.ONE = new HugeNumber(1, [0]);

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}


// var HugeNumber = (function () {
//     const LNLN2 = -0.36651292058166435;

//     // function dh(ord, n) {
//     //     if(ord === 0) {
//     //         return n;
//     //     } else if(typeof ord === "number") {
//     //         return dh(ord - 1, Math.pow(10, n));
//     //     }
//     // }

//     function jsonEq(a, b) {
//         return JSON.stringify(a) === JSON.stringify(b);
//     }


//     function cmpOrd(a, b) {
//         if (typeof a === "number" && typeof b === "number") {
//             return (a < b ? -1 : (a === b ? 0 : 1));
//         } else if (typeof a === "number") {
//             return -1;
//         } else if (typeof b === "number") {
//             return 1;
//         } else {
//             for (var i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
//                 var t1 = i >= a.length ? 0 : a[i][1];
//                 var t2 = i >= a.length ? 0 : b[i][1];
//                 if (cmpOrd(t1, t2) === -1) {
//                     return -1;
//                 } else if (cmpOrd(t1, t2) === 1) {
//                     return 1;
//                 }
//                 var t3 = i >= a.length ? 0 : a[i][0];
//                 var t4 = i >= a.length ? 0 : b[i][0];
//                 if (t3 < t4) {
//                     return -1;
//                 } else if (t3 > t4) {
//                     return 1;
//                 }
//             }

//             return 0;
//         }
//     }

//     function normalizeOrd(ord) {
//         if (typeof ord === "number") {
//             return ord;
//         } else if (ord.length === 0) {
//             return 0;
//         } else if (ord.length === 1 && ord[0][1] === 0) {
//             return ord[0][0];
//         }

//         var result = [...ord].map((e) => [e[0], normalizeOrd(e[1])]).filter((e) => e !== 0 && (e[0] !== 0));
//         var largestExp = 0;
//         // var indicesToRemove = [];
//         for (var i = ord.length - 1; i >= 0; i--) {
//             if (cmpOrd(ord[i][1], largestExp) >= 0) {
//                 largestExp = ord[i][1];
//             } else {
//                 result = result.filter((e) => !jsonEq(e[1], ord[i][1]) && e[0] !== 0);
//             }
//         }

//         var largestExpTerms = result.filter((e) => jsonEq(e[1], largestExp));
//         if (largestExpTerms.length > 1) {
//             var sum = 0;
//             for (var i = 0; i < largestExpTerms.length; i++) {
//                 sum += largestExpTerms[i][0];
//             }
//             result = result.filter((e) => !largestExpTerms.includes(e));
//             result.push([sum, largestExp]);
//         }

//         return result;
//     }

//     // 

//     function ordToString(ord) {
//         if (typeof ord === "number") {
//             return ord;
//         } else {
//             var result = "";
//             for (var i = 0; i < ord.length; i++) {
//                 var coef = (ord[i][0] === 1 ? "" : "*" + ord[i][0].toString());
//                 var exp = ordToString(ord[i][1]);
//                 if (ord[i][1] === 0) {
//                     result += ord[i][0] + "+";
//                 } else if (ord[i][1] === 1) {
//                     result += "ω" + coef + "+";
//                 } else {
//                     if ((typeof ord[i][1] === "number") || (ord[i][1].length === 1 && ord[i][1][0][1] === 1)) {
//                         result += "ω^" + exp + coef + "+";
//                     } else {
//                         result += "ω^(" + exp + ")" + coef + "+";
//                     }
//                 }
//             }
//             return result.slice(0, -1);
//         }
//     }

//     // Check if ord is a limit ordinal

//     function isLimitOrd(ord) {
//         if (typeof ord === "number") {
//             return false;
//         }

//         return ord.filter((e) => e[1] === 0).length === 0;
//     }


//     // Decrement (subtract 1) from ord
//     // Only works for non-limit ordinals
//     function dec(ord) {
//         if(typeof ord === "number") {
//             return ord - 1;
//         }
        
//         var constantTerm = ord[ord.length - 1][0];
//         return ord.slice(0, -1).concat(constantTerm - 1);
//     }

//     // Get the nth term of the fundamental sequence of ord
//     function getFSTerm(ord, n) {
//         if (jsonEq(ord, [[1, 1]])) {
//             return n;
//         } else if (ord.length === 1) {
//             if (isLimitOrd(ord[0][1])) {
//                 return [[ord[0][0] - 1, ord[0][1]], [1, getFSTerm(ord[0][1], n)]];
//             } else {
//                 return [[ord[0][0] - 1, ord[0][1]], [n, dec(ord[0][1])]];
//             }
//         } else {
//             var higherTerms = ord.slice(0, -1);
//             var lowestTerm = [ord[ord.length - 1]];
//             return higherTerms.concat(getFSTerm(lowestTerm, n));
//         }
//     }

//     class HugeNumber {
//         constructor(sign, ord, n) {
//             // console.log("!", sign, ord, n);
//             this.sign = sign;
//             this.ord = normalizeOrd(ord);
//             this.n = n;
//             while(isLimitOrd(this.ord)) {
//                 this.ord = normalizeOrd(getFSTerm(this.ord, Math.ceil(n)));
//                 this.n = Math.ceil(n);
//             }
//             if(typeof this.ord === "number") {
//                 while(this.ord > 0 && this.n <= 308.25471555991675) {
//                     this.ord = dec(this.ord);
//                     this.n = Math.pow(10, this.n);                
//                 }
//             }
//         }

//         clone() {
//             return new HugeNumber(this.sign, [...this.ord], this.n);
//         }

//         cmp(other) {
//             if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().cmp(other.negAbs());
//             }
//             if (jsonEq(this.ord, other.ord)) {
//                 return (this.n < other.n ? -1 : (this.n === other.n ? 0 : 1));
//             } else {
//                 return cmpOrd(this.ord, other.ord);
//             }
//         }

//         eq(other) {
//             return this.cmp(other) === 0;
//         }

//         ne(other) {
//             return this.cmp(other) !== 0;
//         }

//         lt(other) {
//             return this.cmp(other) < 0;
//         }

//         le(other) {
//             return this.cmp(other) <= 0;
//         }

//         gt(other) {
//             return this.cmp(other) > 0;
//         }

//         ge(other) {
//             return this.cmp(other) >= 0;
//         }

//         min(other) {
//             return this.lt(other) ? this.clone() : other;
//         }

//         max(other) {
//             return this.gt(other) ? this.clone() : other;
//         }

//         add(other) {
//             if (this.lt(other)) {
//                 return other.add(this);
//             } else if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().add(other.negAbs()).negAbs();
//             } else if (this.sign === 1 && other.sign === -1) {
//                 return this.sub(other.negAbs());
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(1, 0, this.n + other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(1 + Math.pow(10, y - this.n));
//                 return new HugeNumber(1, 1, this.n + gaussianLog);
//             } else {
//                 return this.clone();
//             }
//         }

//         sub(other) {
//             if (this.lt(other)) {
//                 return other.sub(this).neg();
//             } else if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().sub(other.negAbs()).negAbs();
//             } else if (this.sign === 1 && other.sign === -1) {
//                 return this.add(other.negAbs());
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(1, 0, this.n - other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, y - this.n)));
//                 return new HugeNumber(1, 1, this.n + gaussianLog);
//             } else {
//                 return this.clone();
//             }
//         }

//         mul(other) {
//             var sign = this.sign * other.sign;
//             if (this.lt(other)) {
//                 return other.mul(this);
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(1, 0, this.n * other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 return new HugeNumber(1, 0, this.n + (other.ord === 0 ? Math.log10(other.n) : other.n));
//             } else if (this.ord === 2 && (other.ord === 1 || other.ord === 2)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(1 + Math.pow(10, y - this.n));
//                 return new HugeNumber(1, 2, this.n + gaussianLog);
//             } else {
//                 return this.clone();
//             }
//         }

//         div(other) {
//             var sign = this.sign * other.sign;
//             if (this.eq(other)) {
//                 return new HugeNumber(sign, 0, 1);
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(sign, 0, this.n / other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 return new HugeNumber(sign, 0, this.n - (other.ord === 0 ? Math.log10(other.n) : other.n));
//             } else if (this.lt(other)) {
//                 return new HugeNumber(sign, 0, 0);
//             } else if (this.ord === 2 && (other.ord === 1 || other.ord === 2)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, y - this.n)));
//                 return new HugeNumber(sign, 2, this.n + gaussianLog);
//             } else if (this.gt(other)) {
//                 return this.clone();
//             }
//         }

//         pow10() {
//             if(this.sign === -1) {
//                 return new HugeNumber(1, 0, Math.pow(10, -this.toNumber()));
//             } else if (typeof this.ord === "number") {
//                 return new HugeNumber(1, this.ord + 1, this.n);
//             } else if(jsonEq(this.ord, [[1, 1]])) {
//                 return new HugeNumber(1, this.ord, this.n + 1);                
//             } else {
//                 return this.clone();
//             }
//         }

//         log10() {
//             if(this.ord === 0) {
//                 return new HugeNumber(sign, 0, Math.log10(this.n));
//             } else if(typeof this.ord === "number") {
//                 return new HugeNumber(sign, this.ord - 1, this.n);
//             } else if(jsonEq(this.ord, [[1, 1]])) {
//                 return new HugeNumber(sign, this.ord, this.n - 1);                
//             } else {
//                 return this.clone();
//             }
//         }


//         pow(other) {
//             return other.mul(this.log10()).pow10();
//         }

//         tetr10() {
//             if (typeof this.ord === "number") {
//                 return new HugeNumber(1, Math.floor(this.n), Math.pow(10, this.n % 1));
//             } else if(cmpOrd(this.ord, [[1, 2]]) === -1) {
//                 return new HugeNumber(1, [[1, 1]].concat(this.ord), this.n);                
//             } else if(jsonEq(this.ord, [[1, 2]])) {
//                 return new HugeNumber(1, [[1, 2]], this.n + 1);
//             } else {
//                 return this.clone();
//             }
//         }

//         pent10() {
//             if (typeof this.ord === "number") {
//                 console.log([[this.n, 1]], Math.pow(10, this.n % 1));
//                 return new HugeNumber(1,  [[this.n, 1]], 1);                
//             } else if(cmpOrd(this.ord, [[1, 3]]) === -1) {
//                 return new HugeNumber(1, [[1, 3]].concat(this.ord), this.n);                
//             } else if(jsonEq(this.ord, [[1, 2]])) {
//                 return new HugeNumber(1, [[1, 3]], this.n + 1);
//             } else {
//                 return this.clone();
//             }
//         }

//         // slog10() {
//         //     if(cmpOrd(this.ord, [[1, 2]]) === -1) {
//         //         console.log("!");
//         //         return new HugeNumber(1, [[1, 1]].concat(this.ord), this.n);                
//         //     } else if(jsonEq(this.ord, [[1, 2]])) {
//         //         return new HugeNumber(1, [[1, 2]], this.n + 1);
//         //     } else {
//         //         return this.clone();
//         //     }
//         // }


//         toNumber() {
//             if(this.ord === 0) {
//                 return this.sign * this.n;
//             } else {
//                 return this.sign * Infinity;
//             }
//         }


//         toString() {
//             if(this.ord === 0) {
//                 return this.n.toString();
//             } else {
//                 return "D_" + ordToString(this.ord) + "(" + this.n + ")";
//             }
//         }
//     }

//     return HugeNumber;
// })();


// // Export if in node.js
// if (typeof module === "object") {
//     module.exports = HugeNumber;
// }