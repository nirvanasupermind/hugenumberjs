var HugeNumber = (function () {
    var maxDepth = Infinity;
    var cap = 1000;
    var tetrationCap = 50;


    // Arrow notation with standard numbers
    function arrow(a, x, y) {
        if ((a >= 2 && x >= 4 && y > 2) || (a > 1.1 && x >= 7448)) {
            return Infinity;
        }

        if (x <= 1 || y === 1) {
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

    function ceil(array) {
        if(Array.isArray(array)) {
            return [array[0], ...array.slice(1).map(Math.ceil)];
        } else {
            return array;
        }
    }
    
    function normalize(array, base = 10) {
        var b = array[0];
        if (array.length === 0 || b === 1) {
            return base;
        } else if (array.length === 1) {
            var result = Math.pow(base, b);
            if (Number.isFinite(result)) {
                return result;
            } else {
                return ceil(array);
            }
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
                    return ceil(array);
                }
            }
        } else if (array[1] === 1 && b >= 2 && c >= 2 && c < cap) {
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
                return ceil(array);
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
        } else if (1 <= b && b < 2 && array[1] >= 2 && array[1] < cap) {
            var c = array[1];
            var pound = array.slice(2);
            return normalize([Math.pow(base, b - 1), c - 1, ...pound]);
        } else if (b >= 2 && b < cap && array[1] >= 2 && array[1] < cap) {
            var c = array[1];
            var pound = array.slice(2);
            var array2 = [...array];
            array2[0]--;
            var normalizedArray2 = normalize(array2);
            if (typeof normalizedArray2 === "number") {
                return normalize([normalizedArray2, c - 1, ...pound]);
            } else {
                return ceil(array);
            }
        } else {
            return ceil(array);
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
            this.array = normalize(array);
            if(this.array === 0 || Number.isNaN(this.array)) {
                this.sign = 1;
            }
        }

        clone() {
            if(typeof this.array === "number") {
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
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.sign === -1 && other.sign === -1) {
                return this.abs().add(other.abs()).neg();
            } else if(this.sign === -1 && other.sign === 1) {
                return this.abs().sub(other).neg();
            } else if(this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                var result = this.array + other.array;
                if(Number.isFinite(result)) {
                    return new HugeNumber(1, result);
                } else {
                    var logThis = Math.log10(this.array);
                    var logOther = Math.log10(other.array);
                    var gaussianLog = Math.log10(1 + Math.pow(10, logOther - logThis));
                    return new HugeNumber(1, [logThis + gaussianLog]);
                }
            } else if (this.array.length === 1 && other.array.length === 1) {
                var gaussianLog = Math.log10(1 + Math.pow(10, other.array[0] - this.array[0]));
                var exponent =  this.array[0] + gaussianLog;
                if(Number.isFinite(exponent)) {
                    return new HugeNumber(1, [exponent]);
                } else {
                    return this.max(other);
                }
            } else {
                return this.max(other);
            }
        }

        sub(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            if(this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).neg();
            } else if(this.sign === -1 && other.sign === 1) {
                return this.abs().add(other).neg();
            } else if(this.sign === 1 && other.sign === -1) {
                return this.add(other.abs());
            } else if(this.eq(other)) {
                return new HugeNumber(1, 0);
            }  else if(this.lt(other)) {
                return other.sub(this).neg();
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array - other.array);
            } else if (this.array.length === 1 && other.array.length === 1) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0] - this.array[0])));
                return new HugeNumber(1, [this.array[0] + gaussianLog]);
            } else {
                return this.max(other);
            }
        }


        mul(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var sign = this.sign * other.sign;

            if (typeof this.array === "number" && typeof other.array === "number") {
                var result = this.array * other.array;
                if(Number.isFinite(result)) {
                    return new HugeNumber(sign, result);
                } else {
                    return new HugeNumber(sign, [Math.log10(this.array) + Math.log10(other.array)]);
                }
            } else if (this.array.length === 1 && other.array.length === 1) {
                var result = this.array + other.array;
                if(Number.isFinite(result)) {
                    return new HugeNumber(1, result);
                } else {
                    var doubleLogThis = Math.log10(this.array);
                    var doubleLogOther = Math.log10(other.array);
                    var gaussianLog = Math.log10(1 + Math.pow(10, doubleLogOther - doubleLogThis));
                    return new HugeNumber(sign, [inverseArrow(10, doubleLogThis + gaussianLog, 2) + 2, 2]);
                }
            } else if (this.array.length === 2 && this.array[1] === 2
                && other.array.length === 2 && other.array[1] == 2) {
                    var doubleLogThis = arrow(10, this.array[0] - 2, 2);
                var doubleLogOther = arrow(10, other.array[0] - 2, 2);
                var gaussianLog = Math.log10(1 + Math.pow(10, doubleLogOther - doubleLogThis));
                var doubleLogResult = doubleLogThis + gaussianLog
                if(Number.isFinite(doubleLogResult)) {
                    return new HugeNumber(sign, [inverseArrow(10, doubleLogResult, 2) + 2, 2]);
                } else {
                    return this.max(other);
                }
            } else {
                return this.max(other);
            }
        }

        div(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            var sign = this.sign * other.sign;
            
            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(sign, this.array / other.array);
            } else if (this.array.length === 1 && other.array.length === 1) {
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
            } else {
                return this.max(other);
            }
        }

        pow10() {
            if(this.sign === -1) {
                return new HugeNumber(1, 1).div(this.abs().pow10());
            } else if (typeof this.array === "number") {
                if(this.array < 1) {
                    return new HugeNumber(1, Math.pow(10, this.array));
                } else {
                    return new HugeNumber(1, [this.array]);
                }
            } else if (this.array.length === 1) {
                return new HugeNumber(1, [inverseArrow(10, this.array, 2) + 2, 2]);
            } else if (this.array.length === 2 && this.array[1] === 2) {
                return new HugeNumber(1, [this.array[0] + 1, 2]);
            } else {
                return this.clone();
            }
        }

        log10() {
            if (typeof this.array === "number") {
                return new HugeNumber(1, Math.log10(this.array));
            } else if (this.array.length === 1) {
                return new HugeNumber(1, this.array[0]);
            } else if (this.array.length === 2 && this.array[1] === 2) {
                return new HugeNumber(1, [this.array[0] - 1, 2]);
            } else {
                return this.clone();
            }
        }

        pow(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return other.mul(this.log10()).pow10();
        }

        tetr(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(other.array >= 0 && other.array <= 1) {
                return this.pow(other);
            } else if(other.array <= tetrationCap) {
                return this.pow(this.tetr(other.array - 1));
            } else if(this.array < 1.444667861009766) {
                return this.tetr(tetrationCap);
            } else {
                var tetratedToCap = this.tetr(tetrationCap);
                if(tetratedToCap.array.length === 2 & tetratedToCap.array[1] === 2) {
                    var offset = tetratedToCap.array[0] - tetrationCap;
                    return other.add(offset).tetr10();
                } else {
                    return other.max(tetratedToCap).tetr10();                    
                }
            } 
        }

        tetr10() {
            if(typeof this.array === "number") {
                return new HugeNumber(1, [this.array, 2]);
            } else if(this.array.length === 1) {
                var slogthis = inverseArrow(10, this.array[0], 2) + 1;
                var sslogthis = inverseArrow(10, slogthis, 3) + 1;
                return new HugeNumber(1, [sslogthis + 1, 3]);
            }  else if(this.array.length === 2 && this.array[1] === 2) {
                var sslogthis = inverseArrow(10, this.array[0], 3) + 1;
                return new HugeNumber(1, [sslogthis + 1, 3]);
            }  else if(this.array.length === 2 && this.array[1] === 3) {
                return new HugeNumber(1, [this.array[0] + 1, 3]);
            }  else {
                return this.clone();
            }
        }

        cmp(other) {
            if(this.array.length > other.array.length) {
                return 1;
            } else if(this.array.length < other.array.length) {
                return -1;
            } else if(this.array < other.array) {
                return -1;
            } else if(this.array === other.array) {
                return 0;
            } else if(this.array > other.array) {
                return 1;
            } else if(typeof this.array === "number" && typeof other.array !== "number") {
                return -1;
            } else if(typeof this.array !== "number" && typeof other.array === "number") {
                return 1;
            } else {
                for(var i = 0; i < this.array.length; i++) {
                    if(this.array[i] > other.array[i]) {
                        return 1;
                    } else if(this.array[i] < other.array[i]) {
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
            if(typeof this.array === "number") {
                return this.sign * this.array;
            } else {
                return this.sign * Infinity;
            }
        }

        toString() {
            if(this.sign === -1) {
                return "-" + this.abs().toString();
            }
            
            if (typeof this.array === "number") {
                return this.array.toString();
            } else if(this.array.length === 1) {
                var mantissa = Math.pow(10, this.array[0] % 1);
                var exponent = Math.floor(this.array[0]);
                return mantissa + "e+" + exponent;
            } else if(this.array.length === 2 && this.array[1] === 2) {
                return "10^^" + this.array[0];
            } else if(this.array.length === 2 && this.array[1] === 3) {
                return "10^^^" + this.array[0];
            } else if(this.array.length === 2 && this.array[1] === 4) {
                return "10^^^^" + this.array[0];
            } else {
                return "{10, " + this.array.join(", ") + "}";
            }
        }
        

        static fromNumber(num) {
            return new HugeNumber(num < 0 ? -1 : 1, Math.abs(num));
        }
    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}