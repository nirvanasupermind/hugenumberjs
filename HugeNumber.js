var HugeNumber = (function () {
    // // Precomputed table of inverseArrow(10, NUMBER.MAX_VALUE, x)
    // const INV_ARROW_MAX_VAL = [0,308.25471555991675,2.396009145337229,1.379488471380844,1.1397180753577163,1.0567974360219177,1.0239917509322811,1.010296458066549,1.0044488304267682,1.0019278174114654,1.000836434476243,1.000363107041043,1.0001576667610417,1.0000684684068457,1.0000297344333549,1.0000129133083446,1.0000056081423474,1.0000024355784456,1.000001057756991,1.0000004593777814,1.0000001995051897,1.0000000866439944,1.000000037629007,1.0000000163420697,1.0000000070972705,1.0000000030823055,1.0000000013386283,1.000000000581359,1.000000000252481,1.0000000001096512,1.0000000000476208,1.0000000000206815,1.000000000008982,1.0000000000039009,1.0000000000016942,1.0000000000007359,1.0000000000003195,1.0000000000001388,1.0000000000000602,1.0000000000000262,1.0000000000000113,1.0000000000000049,1.0000000000000022,1.0000000000000009,1.0000000000000004];
    const SLOG10_MAX_VALUE = 2.396009145337229;

    function isFiniteAndNonzero(x) {
        return Number.isFinite(x) && x;
    }

    // function slog(a, x) {
    //     if(x < 0) {
    //         return slog(a, Math.pow(a, x)) + 1;
    //     } else if(x >= 0 && x <= 1) {
    //         return x - 1;
    //     } else {
    //         return slog(a, Math.log(x)/Math.log(a)) - 1;
    //     }
    // }


    // Arrow notation with built-in numbers
    function arrow(a, x, y) {
        if(y === 0) {
            return a * x;
        }

        if(a >= 2 && x >= 5 && y >= 2) {
            return Infinity;
        }

        try {
            if (x <= 1 || y === 1) {
                return Math.pow(a, x);
            } else {
                var result = arrow(a, x % 1, y);
                for (var i = 0; i < Math.floor(x); i++) {
                    result = arrow(a, result, y - 1);
                }
                return result;
            }
        } catch(e) {
            if(e instanceof RangeError) {
                return Infinity;
            } else {
                throw e;
            }
        }
    }

    // Inverse arrow notation with built-in numbers
    // (generalization of logarithm/super-logarithm)
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

    class HugeNumber {
        constructor(sign, array) {
            // if(!(sign === 1 || sign == -1)) {
            //     throw new Error("Invalid sign for HugeNumber: " + sign);
            // }
            // if(!Array.isArray(array)) {
            //     throw new Error("Invalid array for HugeNumber: " + array);
            // }
            this.sign = sign;
            this.array = array;
            this.normalize();
        }

        clone() {
            return new HugeNumber(this.sign, [...this.array]);
        }

        // Normalize (standardize irregular BEAF)
        // e.g. {10, 2, 3} = {10, 10, 2}
        normalize() {
            
            // var resultSign = this.sign;
            // var resultArray = this.array;

            while(true) {  
                var b = this.array[0];
                var c = this.array[1];
                var temp = arrow(10, b - 1, c);
                if(this.array[this.array.length - 1] === 1) {
                    //{a, b, @, 1} = {a, b, @}
                    this.array.pop();
                } else if(b === 1) {
                    // {a, 1, @} = a
                    this.array = [];
                    break;
                } else if(this.array.length === 2 && Number.isFinite(temp) && c > 1 && c < 1000) {
                    // {a, b, c, @} = {a, {a, b - 1, c, @}, c - 1, @} 
                    // if b > 2 and c > 1
                    this.array = [temp, c - 1];
                } else if(b > 1 && b < 2 && c > 1) {
                    // {a, b, c, @} = {a, a^(b-1), c - 1, @}
                    // if 1 < b < 2 and c > 1
                    var at = this.array.slice(2);
                    this.array = [Math.pow(10, b - 1), c - 1, ...at];
                } else if(this.array[1] === 1 && b > 1 && b <= 2) {
                    // {a, b, 1<n>, d, @} = {a, na^(b-1), a<n>, 1, d-1,@} 
                    // if 1 < b < 2, d > 1 and n > 0
                    var n = 0;
                    for(var i = 1; i < this.array.length; i++) {
                        if(this.array[i] === 1) {
                            n++;
                        }
                    }
                    var d = this.array[n + 1];
                    var at = this.array.slice(n + 2);
                    this.array = [Math.pow(10, b - 1), ...new Array(n).fill(10), d-1, ...at];
                } else {
                    break;
                }
            }

            if(this.array.length === 1) {
                return;
            }
            
            // while (resultArray[0] > 1 && resultArray[0] <= 2) {
            //     var oldResultArray = resultArray;
            //     if (resultArray[1] === 1) {
            //         if(resultArray.length === 2) {
            //             break;
            //         }

            //         var onesCount = 0;
            //         while (resultArray[onesCount + 2] === 1) {
            //             onesCount++;
            //         }
            //         resultArray = [Math.pow(10, oldResultArray[0] - 1)].concat(new Array(onesCount + 1).fill(10));
            //         resultArray.push(oldResultArray[onesCount + 2] - 1);
            //         resultArray = resultArray.concat(oldResultArray.slice(onesCount + 3));
            //     } else {
            //         resultArray = [Math.pow(10, oldResultArray[0] - 1), oldResultArray[1] - 1];
            //         resultArray = resultArray.concat(oldResultArray.slice(2));
            //     }
            // }


            // while (resultArray[resultArray.length - 1] === 1) {
            //     resultArray.pop();
            // }

            // if(resultArray.length === 2) {
            //     var prime = arrow(10, resultArray[0] - 1, resultArray[1]);
            //     while(Number.isFinite(prime) && resultArray[1] > 1) {
            //         resultArray = [prime, resultArray[1] - 1];
            //         prime = arrow(10, resultArray[0] - 1, resultArray[1]);
            //     }
            // }

            // while (resultArray[resultArray.length - 1] === 1) {
            //     resultArray.pop();
            // }

            // this.sign = resultSign;
            // this.array = resultArray;
        }


        neg() {
            return new HugeNumber(-this.sign, this.array);
        }

        abs() {
            return new HugeNumber(1, this.array);
        }

        add(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.sign === -1 && other.sign === -1) {
                return this.neg().add(other.neg()).neg();
            } else if(this.sign === -1 && other.sign === 1) {
                return this.neg().sub(other).neg();
            } else if(this.sign === 1 && other.sign === -1) {
                return this.sub(other.neg());
            } else if(this.lt(other)) {
                return other.add(this);
            } else {
                if(this.array.length === 1 && other.array.length === 1) {
                    var gaussianLog = Math.log10(1 + Math.pow(10, other.array[0] - this.array[0]));
                    return new HugeNumber(1, [this.array[0] + gaussianLog]);
                } else {
                    return this.max(other);
                }
            }
        }

        sub(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.sign === -1 && other.sign === -1) {
                return this.neg().sub(other.neg()).neg();
            } else if(this.sign === -1 && other.sign === 1) {
                return this.neg().add(other).neg();
            } else if(this.sign === 1 && other.sign === -1) {
                return this.add(other.neg());
            } else if(this.lt(other)) {
                return other.sub(this).neg();
            } else {
                if(this.array.length === 1 && other.array.length === 1) {
                    var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0] - this.array[0])));
                    return new HugeNumber(1, [this.array[0] + gaussianLog]);
                } else {
                    return this.max(other);
                }
            }
        }

        mul(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(this.sign * other.sign, [this.array[0] + other.array[0]]);
            } else if(this.lt(new HugeNumber(1, [SLOG10_MAX_VALUE + 2, 2])) && other.lt(new HugeNumber(1, [SLOG10_MAX_VALUE + 2, 2]))) {
                if(this.lt(other)) {
                    return other.mul(this);
                } else {
                    var x = this.array.length === 1 ? Math.log10(this.array[0]) : arrow(10, this.array[0] - 2, 2);
                    var y = other.array.length === 1 ? Math.log10(other.array[0]) : arrow(10, other.array[0] - 2, 2);
                    var gaussianLog = Math.log10(1 + Math.pow(10, y - x));
                    return new HugeNumber(this.sign * other.sign, [inverseArrow(10, x + gaussianLog, 2) + 2, 2]);
                }
            } else {
                return this.max(other);
            }
        }

        div(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.eq(other)) {
                return new HugeNumber(1, [0]);
            } else if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(this.sign * other.sign, [this.array[0] - other.array[0]]);
            } else if(this.lt(new HugeNumber(1, [SLOG10_MAX_VALUE + 2, 2])) && other.lt(new HugeNumber(1, [SLOG10_MAX_VALUE + 2, 2]))) {
                var x = this.array.length === 1 ? Math.log10(this.array[0]) : arrow(10, this.array[0] - 2, 2);
                var y = other.array.length === 1 ? Math.log10(other.array[0]) : arrow(10, other.array[0] - 2, 2);
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, y - x)));
                return new HugeNumber(this.sign * other.sign, [inverseArrow(10, x + gaussianLog, 2) + 2, 2]);
            } else {
                return this.lt(other) ? new HugeNumber(1, [-Infinity]) : this.clone();
            }
        }

        mod(other) {
            return this.sub(this.div(other).trunc().mul(other));
        }


        pow10() {
            var num = this.toNumber();
            if(Number.isFinite(num)) {
                return new HugeNumber(1, [num]);
            } else if(this.array.length === 1) {
                return new HugeNumber(1, [inverseArrow(10, this.array[0], 2) + 2]);
            } else if(this.array.length === 2 && this.array[1] == 2) {
                return new HugeNumber(1, [this.array[0] + 1, 2]);
            } else {
                return this.clone();
            }
        }

        log10() {
            if(this.sign === -1) {
                return HugeNumber.fromNumber(NaN);
            } else if(this.array.length === 1) {
                return HugeNumber.fromNumber(this.array[0]);
            } else if(this.array.length === 2 && this.array[1] == 2) {
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

        tetr10() {
            var num = this.toNumber();
            if(this.sign === -1) {
                return HugeNumber.fromNumber(Math.log10(this.toNumber() + 2));
            } else if(Number.isFinite(num)) {
                return new HugeNumber(1, [num, 2]);
            } else if(this.array.length === 1) {
                return new HugeNumber(1, [Math.log10(inverseArrow(10, this.array[0], 2)+1)+2, 3]);
            } else if(this.array.length === 2 && this.array[1] == 2) {
                return new HugeNumber(1, [inverseArrow(10, this.array[0], 3) + 2, 3]);
            } else if(this.array.length === 2 && this.array[1] == 3) {
                return new HugeNumber(1, [this.array[0] + 1, 3]);
            } else {
                return this.clone();
            }
        }

        slog10() {
            if(this.sign === -1) {
                return HugeNumber.fromNumber(Math.pow(10, this.toNumber()) - 2);
            } else if(this.array.length === 1) {
                return HugeNumber.fromNumber(inverseArrow(10, this.array[0], 2) + 1);
            }  else if(this.array.length === 2 && this.array[1] === 2) {
                return HugeNumber.fromNumber(this.array[0]);       
            } else if(this.array.length === 2 && this.array[1] === 3) {
                return new HugeNumber(1, [this.array[0] - 1, 3]);
            } else {
                return this.clone();
            }
        } 

        tetr(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(other.gt(-1) && other.lt(0)) {
                return other.add(1);
            } else if(other.lt(20)) {
                return this.pow(this.tetr(other.sub(1)));
            } else {
                return this.slog10().add(other).add(1).tetr10();
            } 
        }

        
        // arrow(other) {

        // }

        floor() {
            if(Number.isFinite(this.toNumber())) {
                return HugeNumber.fromNumber(Math.floor(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        ceil() {
            if(Number.isFinite(this.toNumber())) {
                return HugeNumber.fromNumber(Math.ceil(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        round() {
            if(Number.isFinite(this.toNumber())) {
                return HugeNumber.fromNumber(Math.round(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        trunc() {
            if(Number.isFinite(this.toNumber())) {
                return HugeNumber.fromNumber(Math.trunc(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        sin() {
            if(isFiniteAndNonzero(this.toNumber())) {
                return HugeNumber.fromNumber(Math.sin(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        cos() {
            if(Number.isFinite(this.toNumber())) {
                return HugeNumber.fromNumber(Math.cos(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        tan() {
            if(isFiniteAndNonzero(this.toNumber())) {
                return HugeNumber.fromNumber(Math.tan(this.toNumber()));
            } else {
                return this.clone();
            }
        }

        cmp(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.sign === -1 && other.sign === -1) {
                return -this.abs().cmp(other.abs());
            } else if(this.sign !== other.sign) {
                return this.sign;
            } else if(this.array.length > other.array.length) {
                return 1;
            } else if(this.array.length < other.array.length) {
                return -1;
            } else {
                for(var i = this.array.length - 1; i >= 0; i--) {
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

        min(other) {
            return this.lt(other) ? this : other;
        }

        max(other) {
            return this.gt(other) ? this : other;
        }

        toNumber() {
            if (this.array.length === 1) {
                return this.sign * Math.pow(10, this.array[0]);
            } else {
                return this.sign * Infinity;
            }
        }

        toString() {
            var num = this.toNumber();
            if(Number.isFinite(num) || !Number.isFinite(this.array[0])) {
                return num.toString();
            } else if (this.sign === -1) {
                return "-" + this.neg().toString();
            } else if (this.array.length === 1) {
                // if(this.array[0] < -307 || this.array[0] > 308) {
                var exponent = Math.floor(this.array[0]);
                var mantissa = Math.pow(10, this.array[0] - exponent);
                var optionalPlus = (exponent >= 0 ? "+" : "");
                return mantissa + "e" + optionalPlus + exponent;
                // } else {
                //     return this.toNumber().toString();
                // }
            } else if (this.array.length === 2 && this.array[1] === 2) {
                if(this.array[0] < SLOG10_MAX_VALUE + 2) {
                    return "1e+" + this.log10();
                } else {
                    return "10^^" + this.array[0];
                }
            } else if (this.array.length === 2 && this.array[1] === 3) {
                return "10^^^" + this.array[0];
            } else if (this.array.length === 2 && this.array[1] === 4) {
                return "10^^^^" + this.array[0];
            } else {
                return this.toBEAFString();
            }
        }

        toBEAFString() {
            return  "{10," + this.array + "}";
        }

        static fromNumber(num) {
            return new HugeNumber((num < 0 ? -1 : 1), [Math.log10(Math.abs(num))]);
        }
    };
    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}