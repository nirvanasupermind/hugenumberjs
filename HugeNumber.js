var HugeNumber = (function () {
    const NORMALIZE_CAP = 100;
    // Global variable is very non-ideal but this is the only way the code runs
    var normalizeDepth = 0;
    const MAX_NORMALIZE_DEPTH = 10;
    const ETH_ROOT_OF_E = 1.444667861009766;
    
    // found here:
    // https://stackoverflow.com/questions/15454183/how-to-make-a-function-that-computes-the-factorial-for-numbers-with-decimals
    const g = 7;
    const C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    
    function gamma(z) {

        if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
        else {
            z -= 1;
    
            var x = C[0];
            for (var i = 1; i < g + 2; i++)
            x += C[i] / (z + i);
    
            var t = z + g + 0.5;
            return Math.sqrt(2 * Math.PI) * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x;
        }
    }

    function lambertW(z, num_iters = 20) {
        // Use Newton iteration
        var logZ = Math.log(z);
        var wj = z < 2 ? Math.log(z + 1) : logZ - Math.log(logZ);
        for(var i = 0; i < num_iters; i++) {
            var t1 = Math.exp(wj);
            var t2 = wj * t1;
            wj += -(t2 - z)/(t1 + t2);
        }
        return wj;
    }

    // Arrow notation with standard numbers
    function arrow(a, x, y) {
        if ((a >= 2 && x >= 4 && y > 2) || (a > 1.5 && x >= 2000)) {
            return Infinity;
        }

        if (x < 0 && y === 2) {
            return Math.log(x + 2) / Math.log(a);
        } else if (x <= 1 || y === 1) {
            return Math.pow(a, x);
        } else if (1 < y && y < 2) {
            return Math.pow(arrow(a, x, 1), (2 - y)) * Math.pow(arrow(a, x, 2), y - 1);
        } else {
            var result = arrow(a, x % 1, y);
            for (var i = 0; i < Math.floor(x); i++) {
                result = arrow(a, result, y - 1);
            }
            return result;
        }
    }

    // Inverse arrow notation with standard numbers (hyper-logarithm)
    function inverseArrow(a, x, y) {
        if (x <= a || y === 1) {
            return Math.log10(x) / Math.log10(a);
        } else {
            var result = 0;
            while (x >= a) {
                x = inverseArrow(a, x, y - 1);
                result++;
            }
            result += inverseArrow(a, x, y - 1);
            return result;

        }
    }

    function ceilArray(array) {
        if (Array.isArray(array)) {
            return [array[0], ...array.slice(1).map(Math.ceil)];
        } else {
            return array;
        }
    }


    function normalize(array, base = 10) {
        normalizeDepth++;
        if(normalizeDepth > MAX_NORMALIZE_DEPTH) {
            return array;
        }

        var b = array[0];
        if (array.length === 0 || b === 1) {
            return base;
        } else if (array.length === 1) {
            var result = Math.pow(base, b);
            if (Number.isFinite(result)) {
                return result;
            } else {
                return ceilArray(array);
            }
        } else if(!Number.isFinite(array[0])) {
            return [array[0]];
        } else if (array[array.length - 1] === 1) {
            return normalize(array.slice(0, -1));
        } else if (array[1] === 1) {
            var n = 0;
            for (var i = 1; i < array.length; i++) {
                if (array[i] === 1) {
                    n++;
                } else {
                    break;
                }
            }

            var c = array[n + 1];
            var pound = array.slice(n + 2);
            if (1 <= c && c < 2) {
                var array2 = [...array];
                array2[n + 1] = 1;
                var array3 = [...array];
                array3[n + 1] = 2;
                var normalizedArray2 = normalize(array2);
                var normalizedArray3 = normalize(array3);
                if (typeof normalizedArray2 === "number") {
                    normalizedArray2 = [Math.log(normalizedArray2) / Math.log(base)];
                }
                if (typeof normalizedArray3 === "number") {
                    normalizedArray3 = [Math.log(normalizedArray3) / Math.log(base)];
                }
                if (normalizedArray2.length === 1 && normalizedArray3.length === 1) {
                    return normalize([normalizedArray2[0] * (2 - c) + normalizedArray3[0] * (c - 1)]);
                } else {
                    return normalize(normalizedArray3);
                }
            } else if (1 <= b && b < 2) {
                return normalize(new Array(n).fill(base).concat([Math.pow(base, b - 1), c - 1]).concat(pound));
            } else {
                var array2 = [...array];
                array2[0]--;
                var normalizedArray2 = normalize(array2);
                if (typeof normalizedArray2 === "number") {
                    return normalize(new Array(n).fill(base).concat([normalizedArray2, c - 1, ...pound]));
                } else {
                    return ceilArray(array);
                }
            }
        } else if (array[1] === 1 && b >= 2 && c >= 2 && c < NORMALIZE_CAP) {
            var n = 0;
            for (var i = 1; i < array.length; i++) {
                if (array[i] === 1) {
                    n++;
                } else {
                    break;
                }
            }
            var c = array[n + 1];
            var pound = array.slice(n + 2);
            var array2 = [...array];
            array2[0]--;
            var normalizedArray2 = normalize(array2);
            if (typeof normalizedArray2 === "number") {
                return normalize(new Array(n).fill(base).concat([normalizedArray2, c - 1, ...pound]));
            } else {
                return ceilArray(array);
            }
        } else if (1 < array[1] && array[1] < 2) {
            var c = array[1];
            var array2 = [...array];
            array2[1] = 1;
            var array3 = [...array];
            array3[1] = 2;
            var normalizedArray2 = normalize(array2);
            var normalizedArray3 = normalize(array3);
            if (typeof normalizedArray2 === "number") {
                normalizedArray2 = [Math.log(normalizedArray2) / Math.log(base)];
            }
            if (typeof normalizedArray3 === "number") {
                normalizedArray3 = [Math.log(normalizedArray3) / Math.log(base)];
            }
            if (normalizedArray2.length === 1 && normalizedArray3.length === 1) {
                return normalize([normalizedArray2[0] * (2 - c) + normalizedArray3[0] * (c - 1)]);
            } else {
                return normalize(normalizedArray3);
            }
        } else if (1 <= b && b <= 2 && array[1] >= 2 && array[1] < Number.MAX_SAFE_INTEGER) {
            var c = array[1];
            var pound = array.slice(2);
            return normalize([Math.pow(base, b - 1), c - 1, ...pound]);
        } else if (b >= 2 && b < NORMALIZE_CAP && array[1] >= 2 && array[1] < NORMALIZE_CAP) {
            var c = array[1];
            var pound = array.slice(2);
            var array2 = [...array];
            array2[0]--;
            // console.log("!", depth, array, array2);
            var normalizedArray2 = normalize(array2);
            if (typeof normalizedArray2 === "number") {
                return normalize([normalizedArray2, c - 1, ...pound]);
            } else {
                return ceilArray(array);
            }
        } else {
            return normalize(array);
        }
    }

    // function normalize(array, base = 10) {
    //     var b = array[0];
    //     if(array.length === 0 || b === 1) {
    //         return [1];
    //     } else if(array.length === 2) {
    //         var num = arrow(base, b, p);
    //         return Number.isFinite(num) ? num : array;
    //     } else if(array[array.length - 1] === 1) {
    //         return array.slice(0, -1);
    //     } else if(p === 1 && 1 <= b && b <= 2) {
    //         var n = 0;
    //         for(var i = 1; i < array.length; i++) {
    //             if(array[i] === 1) {
    //                 n++;
    //             } else {
    //                 break;
    //             }
    //         }
    //         var c = array[n + 2];
    //         var pound = array.slice(n + 3);
    //         return [...new Array(n + 1).fill(bases), Array.isArray(b) ? [b] : Math.pow(base, b - 1), c - 1, ...pound];
    //     } else if(1 <= p && p <= 2) {
    //         var temp1 = ;
    //         return [...new Array(n + 1).fill(bases), Math.pow(base, b - 1), c - 1, ...pound];
    //     } else {
    //         return ceil(array);
    //     }
    // }


    class HugeNumber {
        constructor(sign, array) {
            this.sign = sign;
            this.array = array.length === 1 ? array : normalize(array);
            if (typeof this.array === "number") {
                this.array = [Math.log10(this.array)];
            }
            if (this.array[0] === -Infinity || Number.isNaN(this.array[0])) {
                this.sign = 1;
            }
            // normalizeDepth = 0;
        }

        clone() {
            if (typeof this.array === "number") {
                return new HugeNumber(this.sign, this.array);
            }
            return new HugeNumber(this.sign, [...this.array]);
        }

        abs() {
            return new HugeNumber(1, this.array);
        }

        neg() {
            return new HugeNumber(-this.sign, this.array);
        }

        add(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if (this.sign === -1 && other.sign === -1) {
                return this.abs().add(other.abs()).neg();
            } else if (this.sign === -1 && other.sign === 1) {
                return this.abs().sub(other).neg();
            } else if (this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            } else if (this.array.length === 1 && other.array.length === 1) {
                var gaussianLog = Math.log10(1 + Math.pow(10, other.array[0] - this.array[0]));
                var exponent = this.array[0] + gaussianLog;
                if (Number.isFinite(exponent)) {
                    return new HugeNumber(1, [exponent]);
                } else {
                    return this.max(other);
                }
            } else {
                return this.max(other);
            }
        }

        sub(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if (this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).neg();
            } else if (this.sign === -1 && other.sign === 1) {
                return this.abs().add(other).neg();
            } else if (this.sign === 1 && other.sign === -1) {
                return this.add(other.abs());
            } else if (this.eq(other)) {
                return new HugeNumber(1, 0);
            } else if (this.lt(other)) {
                return other.sub(this).neg();
            } else if (this.array.length === 1 && other.array.length === 1) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0] - this.array[0])));
                return new HugeNumber(1, [this.array[0] + gaussianLog]);
            } else {
                return this.max(other);
            }
        }


        mul(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var sign = this.sign * other.sign;

            if (this.eq(0) || other.eq(0)) {
                return new HugeNumber(1, [-Infinity]);
            } else if (this.array.length === 1 && other.array.length === 1) {
                var result = this.array[0] + other.array[0];
                if (Number.isFinite(result)) {
                    return new HugeNumber(sign, [result]);
                } else {
                    var doubleLogThis = Math.log10(this.array[0]);
                    var doubleLogOther = Math.log10(other.array[0]);
                    var gaussianLog = Math.log10(1 + Math.pow(10, doubleLogOther - doubleLogThis));
                    return new HugeNumber(sign, [inverseArrow(10, doubleLogThis + gaussianLog, 2) + 2, 2]);
                }
            } else if (this.array.length === 2 && this.array[1] === 2
                && other.array.length === 2 && other.array[1] == 2) {
                var doubleLogThis = arrow(10, this.array[0] - 2, 2);
                var doubleLogOther = arrow(10, other.array[0] - 2, 2);
                var gaussianLog = Math.log10(1 + Math.pow(10, doubleLogOther - doubleLogThis));
                var doubleLogResult = doubleLogThis + gaussianLog
                if (Number.isFinite(doubleLogResult)) {
                    return new HugeNumber(sign, [inverseArrow(10, doubleLogResult, 2) + 2, 2]);
                } else {
                    return this.max(other).abs().mul(sign);
                }
            } else {
                return this.max(other).abs().mul(sign);
            }
        }

        div(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var sign = this.sign * other.sign;

            if (this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(sign, [this.array[0] - other.array[0]]);
            } else if (this.array.length === 2 && this.array[1] === 2
                && other.array.length === 2 && other.array[1] == 2) {
                var doubleLogThis = arrow(10, this.array[0] - 2, 2);
                var doubleLogOther = arrow(10, other.array[0] - 2, 2);
                if (Number.isFinite(doubleLogThis) && Number.isFinite(doubleLogOther)) {
                    var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, doubleLogOther - doubleLogThis)));
                    return new HugeNumber(sign, [inverseArrow(10, doubleLogThis + gaussianLog, 2) + 2, 2]);
                } else {
                    return this.max(other);
                }
            } else if(this.lt(other)) {
                return new HugeNumber(1, [-Infinity]);
            } else if(this.eq(other)) {
                return new HugeNumber(1, [1]);
            } else {
                return other.clone().abs().mul(sign);
            }
        }

        pow10() {
            var num = this.toNumber();
            if (this.sign === -1) {
                return new HugeNumber(1, [0]).div(this.abs().pow10());
            } else if (Number.isFinite(num)) {
                return new HugeNumber(1, [num]);
            } else if (this.array.length === 1) {
                return new HugeNumber(1, [inverseArrow(10, this.array[0], 2) + 2, 2]);
            } else if (this.array.length === 2 && this.array[1] === 2) {
                return new HugeNumber(1, [this.array[0] + 1, 2]);
            } else {
                return this.clone();
            }
        }

        log10() {
            if (this.array.length === 1) {
                return new HugeNumber(1, [Math.log10(this.array[0])]);
            } else if (this.array.length === 2 && this.array[1] === 2) {
               return new HugeNumber(1, [this.array[0] - 1, 2]);
            } else {
                return this.clone();
            }
        }


        pow(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            return other.mul(this.log10()).pow10();
        }

        log() {
            return this.log10().mul(Math.LN10);
        }

        sqrt() {
            return this.pow(0.5);
        }

        cbrt() {
            return this.pow(1/3);
        }

        lambertW() {
            var num = this.toNumber();
            if(Number.isFinite(num)) {
                return HugeNumber.fromNumber(lambertW(num));
            } /* else {
                 return this.log().sub(this.log().log());
             } */
        }

        tetr(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var tetrCap = this.gt(ETH_ROOT_OF_E) && this.lt(1.449) ? 4000 : 50;

            if (other.ge(0) && other.le(1)) {
                return this.pow(other);
            } else if (other.le(tetrCap)) {
                return this.pow(this.tetr(other.sub(1)));
            } else if (this.le(ETH_ROOT_OF_E)) {
                return this.tetr(tetrCap);
            } else {
                var tetratedToCap = this.tetr(tetrCap);
                if (tetratedToCap.array.length === 2 & tetratedToCap.array[1] === 2) {
                    var offset = tetratedToCap.array[0] - tetrCap;
                    return other.add(offset).tetr10();
                } else {
                    return other.max(tetratedToCap).tetr10();
                }
            }
        }

        tetr10() {
            if (this.array.length === 1) {
                var slogthis = inverseArrow(10, this.array[0], 2) + 1;
                var sslogthis = inverseArrow(10, slogthis, 3) + 1;
                return new HugeNumber(1, [sslogthis + 1, 3]);
            } else if (this.array.length === 2 && this.array[1] === 2) {
                var sslogthis = inverseArrow(10, this.array[0], 3) + 1;
                return new HugeNumber(1, [sslogthis + 1, 3]);
            } else if (this.array.length === 2 && this.array[1] === 3) {
                return new HugeNumber(1, [this.array[0] + 1, 3]);
            } else {
                return this.clone();
            }
        }

        arrow10(arrows) {
            if (typeof arrows === "number") {
                arrows = HugeNumber.fromNumber(arrows);
            }

            var arrowsNum = arrows.toNumber();
            if (Number.isFinite(arrowsNum)) {
                var num = this.toNumber();
                if (Number.isFinite(num)) {
                    return new HugeNumber(1, [num, arrowsNum]);
                } else if (this.array.length === 1 || (this.array.length === 2 && this.array[1] <= arrowsNum + 1)) {
                    var loopStart = this.array.length === 1 ? 2 : this.array[1] + 1;
                    var loopEnd = Math.ceil(arrowsNum + 1);
                    if (loopEnd - loopStart < 50) {
                        var snlogs = [this.array[0]];
                        for (var i = loopStart; i <= loopEnd; i++) {
                            snlogs.push(inverseArrow(10, snlogs[snlogs.length - 1], i) + 1);
                        }
                        return new HugeNumber(1, [snlogs[snlogs.length - 1] + 1, arrowsNum + 1])
                    } else {
                        return new HugeNumber(1, [2, arrowsNum + 1]);
                    }
                } else {
                    return this.clone();
                }
            }  else if(arrows.array.length === 1) {
                return new HugeNumber(1, [2 + Math.log10(2), 1, 2]);
            } else if(arrows.array.length === 2) {
                return new HugeNumber(1, [2 + Math.log10(arrows.array[1]), 1, 2]);
            } 
        }

        arrow(other, arrows) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if (typeof arrows === "number") {
                arrows = HugeNumber.fromNumber(arrows);
            }

            if(arrows.eq(1) || other.ge(0) && other.le(1)) {
                return this.pow(other);
            }  else if(arrows.gt(1) && arrows.lt(2)) {
                return this.pow(other).pow(HugeNumber.fromNumber(2).sub(arrows)).mul(this.tetr(other).pow(arrows.sub(1)));
            } else if(arrows.eq(2)) {
                return this.tetr(other);
            } else if(other.le(100)) {
                // console.log("!", arrows.sub(1).toString());
                return this.arrow(this.arrow(other.sub(1), arrows), arrows.sub(1));
            }

            var num = arrow(this.toNumber(), other.toNumber(), arrows.toNumber());
            if(Number.isFinite(num)) {
                return HugeNumber.fromNumber(num);
            }

            return other.arrow10(arrows);
        }

        gamma() {
            var num = this.toNumber();
            if(Number.isFinite(num)) {
                return HugeNumber.fromNumber(gamma(num));
            } else {
                return this.pow10();
            }
        }

        fact() {
            var num = this.toNumber();
            if(Number.isFinite(num)) {
                return HugeNumber.fromNumber(gamma(num + 1));
            } else {
                return this.pow10();
            }
        }
            
        
    
        cmp(other) {            
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.sign === -1 && other.sign === -1) {
                return this.abs().cmp(other.abs()).neg();
            } else if (this.sign === -1 && other.sign === 1) {
                return -1;
            } else if (this.sign === 1 && other.sign === -1) {
                return 1;
            } else  if (this.array.length > other.array.length) {
                return 1;
            } else if (this.array.length < other.array.length) {
                return -1;
            } else {
                for (var i = this.array.length - 1; i >= 0; i--) {
                    if (this.array[i] > other.array[i]) {
                        return 1;
                    } else if (this.array[i] < other.array[i]) {
                        return -1;
                    }
                }

                return 0;
            }
        }

        eq(other) {
            return this.cmp(other) === 0;
        }

        ne(other) {
            return this.cmp(other) !== 0;
        }

        lt(other) {
            return this.cmp(other) < 0;
        }

        le(other) {
            return this.cmp(other) <= 0;
        }

        gt(other) {
            return this.cmp(other) > 0;
        }

        ge(other) {
            return this.cmp(other) >= 0;
        }

        max(other) {
            return this.lt(other) ? other.clone() : this.clone();
        }

        min(other) {
            return this.lt(other) ? this.clone() : other.clone();
        }

        toNumber() {
            if (this.array.length === 1 && this.array[0] < Math.log10(Number.MAX_VALUE)) {
                return this.sign * Math.pow(10, this.array[0]);
            } else {
                return this.sign * Infinity;
            }
        }


        toString() {
            if (this.sign === -1) {
                return "-" + this.abs().toString();
            }

            if(this.array[0] === -Infinity) {
                return "0";
            } else if(this.array[0] === Infinity) {
                return "Infinity";
            } else if(Number.isNaN(this.array[0])) {
                return "NaN";
            }

            var num = this.toNumber();

            if (Number.isFinite(num) && num > 0) {
                return num.toString();
            } else if (this.array.length === 1) {
                var exponent = Math.floor(this.array[0]);
                var mantissa = Math.pow(10, this.array[0] - exponent);
                var optionalPlus = (exponent < 0 ? "" : "+");
                return mantissa + "e" + optionalPlus + exponent;
            } else if (this.array.length === 2 && this.array[1] === 2) {
                return "10^^" + this.array[0];
            } else if (this.array.length === 2 && this.array[1] === 3) {
                return "10^^^" + this.array[0];
            } else if (this.array.length === 2 && this.array[1] === 4) {
                return "10^^^^" + this.array[0];
            } else {
                return "{10," + this.array.join(",") + "}";
            }
        }


        static fromNumber(num) {
            return new HugeNumber(num < 0 ? -1 : 1, [Math.log10(Math.abs(num))]);
        }
    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}