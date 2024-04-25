var HugeNumber = (function () {
    // // Precomputed table of inverseArrow(10, NUMBER.MAX_VALUE, x)
    // const INV_ARROW_MAX_VAL = [0,308.25471555991675,2.396009145337229,1.379488471380844,1.1397180753577163,1.0567974360219177,1.0239917509322811,1.010296458066549,1.0044488304267682,1.0019278174114654,1.000836434476243,1.000363107041043,1.0001576667610417,1.0000684684068457,1.0000297344333549,1.0000129133083446,1.0000056081423474,1.0000024355784456,1.000001057756991,1.0000004593777814,1.0000001995051897,1.0000000866439944,1.000000037629007,1.0000000163420697,1.0000000070972705,1.0000000030823055,1.0000000013386283,1.000000000581359,1.000000000252481,1.0000000001096512,1.0000000000476208,1.0000000000206815,1.000000000008982,1.0000000000039009,1.0000000000016942,1.0000000000007359,1.0000000000003195,1.0000000000001388,1.0000000000000602,1.0000000000000262,1.0000000000000113,1.0000000000000049,1.0000000000000022,1.0000000000000009,1.0000000000000004];
    const SLOG10_MAX_VALUE = 2.396009145337229;

    function isFiniteAndNonzero(x) {
        return Number.isFinite(x) && x;
    }

    // Arrow notation with built-in numbers
    function arrow(a, x, y) {
        if(a >= 2 && x >= 5 && y >= 2) {
            // This is guaranteed to be too large for built-in numbers
            // Just hardcode the result to Infinity to prevent stack overflow
            return Infinity;
        } else  if (x <= 1 || y === 1) {
            return Math.pow(a, x);
        } else {
            var result = arrow(a, x % 1, y);
            for (var i = 0; i < Math.floor(x); i++) {
                result = arrow(a, result, y - 1);
            }
            return result;
        }
    }

    // Inverse arrow notation with built-in numbers (hyper-logarithm)
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


        // Normalize (standardize irregular BEAF)
        // e.g. {10, 2, 3} = {10, 10, 2}
        normalize() {
            var resultSign = this.sign;
            var resultArray = this.array;

            if (resultArray[0] === -Infinity) {
                resultSign = 1;
                this.sign = resultSign;
                return;
            }

            if (resultArray[0] >= 0 && resultArray[0] <= 1) {
                resultArray = [resultArray[0]];
                this.array = resultArray;
                return;
            }

            var thisNum = this.toNumber();
            if(Number.isFinite(thisNum)) {
                resultArray = [Math.log10(Math.abs(thisNum))];
                this.array = resultArray;
                return;
            }


            while (resultArray[0] > 1 && resultArray[0] <= 2) {
                var oldResultArray = resultArray;
                if (resultArray[1] === 1) {
                    if(resultArray.length === 2) {
                        break;
                    }

                    var onesCount = 0;
                    while (resultArray[onesCount + 2] === 1) {
                        onesCount++;
                    }
                    resultArray = [Math.pow(10, oldResultArray[0] - 1)].concat(new Array(onesCount + 1).fill(10));
                    resultArray.push(oldResultArray[onesCount + 2] - 1);
                    resultArray = resultArray.concat(oldResultArray.slice(onesCount + 3));
                } else {
                    resultArray = [Math.pow(10, oldResultArray[0] - 1), oldResultArray[1] - 1];
                    resultArray = resultArray.concat(oldResultArray.slice(2));
                }
            }


            while (resultArray[resultArray.length - 1] === 1) {
                resultArray.pop();
            }

            if(resultArray.length === 2) {
                var prime = arrow(10, resultArray[0] - 1, resultArray[1]);
                while(Number.isFinite(prime) && resultArray[1] > 1) {
                    resultArray = [prime, resultArray[1] - 1];
                    prime = arrow(10, resultArray[0] - 1, resultArray[1]);
                }
            }

            // while (resultArray[resultArray.length - 1] === 1) {
            //     resultArray.pop();
            // }

            this.sign = resultSign;
            this.array = resultArray;
        }



        toString() {
            var num = this.toNumber();
            if(Number.isFinite(num)) {
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
                // if(this.array[0] < SLOG10_MAX_VALUE) {
                //     return "1e+" + this.log10();
                // } else {
                    return "10^^" + this.array[0];
                // }
            } else if (this.array.length === 2 && this.array[1] === 3) {
                return "10^^^" + this.array[0];
            } else if (this.array.length === 2 && this.array[1] === 4) {
                return "10^^^^" + this.array[0];
            } else {
                return this.toBEAFString();
            }
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
        }

        toBEAFString() {
            return  "{10," + this.array + "}";
        }

        toNumber() {
            if (this.array.length === 1) {
                return this.sign * Math.pow(10, this.array[0]);
            } else {
                return this.sign * Infinity;
            }
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