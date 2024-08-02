var HugeNumber = (function () {
    const DEPTH_LIMIT = 10;
    // const SCI_PREC = 16;
    // const TEN_TO_SCI_PREC = 1e+16;

    // function log10ToSci(log10) {
    //     return [Math.round(Math.pow(10, log10 % 1 + SCI_PREC)), [10, Math.floor(log10) - SCI_PREC, 1]];
    // }

    // function isSci(array) {
    //     return array.length === 2 && typeof array[0] === "number"
    //         && array[1].length === 3
    //         & array[1][0] === 10 && typeof array[1][1] === "number" && array[1][2] === 1;
    // }

    function is10ToX(array) {
        return typeof array[0] === "number" && array[1] === 1 && array[2] === 0;
    }

    function is10To10ToX(array) {
        return is10ToX(array[0]) && array[1] === 1 && array[2] === 0;
    }

    function phenolInterpolate(x, y, n, depth) {
        if (typeof x === "number" && typeof y === "number") {
            return Math.pow(x, 1 - n) * Math.pow(y, n);
        } else if (typeof x === "number" && y[1] === 1) {
            return normalize([Math.log10(x) * (1 - n) + y[0] * n, 1], depth);
        } else if (x[1] === 1 && typeof y === "number") {
            return normalize([x[0] * (1 - n) + Math.log10(y) * n, 1], depth);
        } else if (x[1] === 1 && typeof y === "number") {
            return normalize([x[0] * (1 - n) + Math.log10(y) * n, 1], depth);
        } else if (x[1] === 1 && y[1] === 1) {
            return normalize([x[0] * (1 - n) + y * n, 1], depth);
        } else {
            return y;
        }
    }

    function normalize(array, depth = 0) {
        if (typeof array === "number" || depth > DEPTH_LIMIT) {
            return array;
        }

        var dp1 = depth + 1;
        var b = normalize(array[0], dp1), c = normalize(array[1], dp1), d = normalize(array[2], dp1);
        if (b < 1.7976931348623158e+307 && c === 0 && d === 0) {
            return 10 * b;
        } else if (c === 1 && d === 0) {
            if (b < 308.25471555991675) {
                return Math.pow(10, b);
            } else  {
                return [b, c, d];
            }
        } else if (0 < c && c < 1) {
            var x = normalize([b, 0, d], dp1);
            var y = normalize([b, 1, d], dp1);
            return phenolInterpolate(x, y, c, dp1);
        } else if (0 <= b && b < 1 && (c >= 1 || Array.isArray(c))) {
            return Math.pow(10, b);
        } else if (b >= 1 && c >= 1) {
            return normalize([normalize([b - 1, c, d], dp1), c - 1, d], dp1);
        } else if (c === 0 && 0 < d && d < 1) {
            var x = 10 * b;
            var y = normalize([b, 0, 1], dp1);
            return phenolInterpolate(x, y, d, dp1);
        } else if (c === 0 & d >= 1) {
            return normalize([10, b, d - 1], dp1);
        } else {
            return [b, c, d];
            //    throw new Error("No rules applicable: " + JSON.stringify(array));
        }
    }

    function arrayToString(array) {
        if (typeof array === "number") {
            return array.toString();
        }  else {
            return "10[" + arrayToString(array[1]) + "," + arrayToString(array[2]) + "]" + arrayToString(array[0]);
        }
    }

    class HugeNumber {
        constructor(sign, array) {
            this.sign = sign;
            this.array = normalize(array);
        }

        clone() {
            return new HugeNumber(this.sign, [...this.array]);
        }

        toString() {
            if (this.sign === -1) {
                return "-" + this.abs().toString();
            } else {
                return arrayToString(this.array);
            }

        }

        abs() {
            return new HugeNumber(1, this.array);
        }

        neg() {
            return new HugeNumber(-this.sign, this.array);
        }

        negAbs() {
            return new HugeNumber(-1, this.array);
        }

        cmp(other) {
            if (this.sign === -1 && other.sign === -1) {
                return -this.abs().cmp(other.abs());
            } else if (this.sign === -1 && other.sign === 1) {
                return -1;
            } else if (this.sign === 1 && other.sign === -1) {
                return 1;
            } else if (this.array < other.array) {
                return -1;
            } else if (this.array === other.array) {
                return 0;
            } else if (this.array > other.array) {
                return 1;
            } else if(typeof this.array === "number") {
                return -1;
            } else if(typeof other.array === "number") {
                return 1;
            } else {
                for (var i = 2; i >= 0; i--) {
                    var a = new HugeNumber(1, this.array[i]);
                    var b = new HugeNumber(1, other.array[i]);
                    if (a.gt(b)) {
                        return 1;
                    } else if (a.lt(b)) {
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
            return this.lt(other) ? this.clone() : other.clone();
        }

        max(other) {
            return this.gt(other) ? this.clone() : other.clone();
        }

        add(other) {
            if (this.lt(other)) {
                return other.add(this);
            } else if (this.sign === -1 && other.sign === -1) {
                return this.abs().add(other.abs()).negAbs();
            } else if (this.sign === 1 && this.sign === -1) {
                return this.sub(other.abs());
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array + other.array);
            } else if (is10ToX(array)  && typeof other.array === "number") {
                var gaussianLog = Math.log10(1 + Math.pow(10, Math.log10(other.array) - this.array[0]));
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 0]);
            }  else if (is10ToX(array) && is10ToX(other.array)) {
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 0]);
            } else {
                return this.max(other);
            }
        }


        sub(other) {
            if (this.lt(other)) {
                return other.sub(this).neg();
            } else if(this.eq(other)) {
                return new HugeNumber(1, 0);
            } else if (this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).negAbs();
            } else if (this.sign === 1 && this.sign === -1) {
                return this.add(other.abs());
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array - other.array);
            } else if (is10ToX(array)  && typeof other.array === "number") {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, Math.log10(other.array) - this.array[0])));
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 0]);
            } else if (is10ToX(array) && is10ToX(other.array)) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0] - this.array[0])));
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 0]);
            } else {
                return this.max(other);
            }
        }
        
        mul(other) {
            if(this.lt(other)) {
                return other.mul(this);
            }

            var sign = this.sign * other.sign;
            if(typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(sign, this.array * other.array);
            } else if(is10ToX(this.array) && typeof other.array === "number") {
                return new HugeNumber(sign, [this.array[0] + Math.log10(other.array), 1, 0]);
            } else if(is10ToX(this.array) && is10ToX(other.array)) {
                return new HugeNumber(sign, [this.array[0] + other.array[0], 1, 0]);
            } else if(is10To10ToX(this.array) && is10ToX(other.array)) {
                var gaussianLog = Math.log10(1 + Math.pow(10, Math.log10(other.array[0]) - this.array[0][0]));
                return new HugeNumber(1, [[this.array[0][0] + gaussianLog, 1, 0], 1, 0]);
            } else if(is10To10ToX(this.array) && is10To10ToX(other.array)) {
                var gaussianLog = Math.log10(1+ Math.pow(10, other.array[0][0] - this.array[0][0]));
                return new HugeNumber(1, [[this.array[0][0] + gaussianLog, 1, 0], 1, 0]);
            } else {
                return this.clone();
            }
        }
        
        div(other) {
            if(this.lt(other)) {
                return new HugeNumber(1, 0);
            }

            var sign = this.sign * other.sign;
            if(typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(sign, this.array / other.array);
            } else if(is10ToX(this.array) && typeof other.array === "number") {
                return new HugeNumber(sign, [this.array[0] - Math.log10(other.array), 1, 0]);
            } else if(is10ToX(this.array) && is10ToX(other.array)) {
                return new HugeNumber(sign, [this.array[0] - other.array[0], 1, 0]);
            } else if(is10To10ToX(this.array) && is10ToX(other.array)) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, Math.log10(other.array[0]) - this.array[0][0])));
                return new HugeNumber(1, [[this.array[0][0] + gaussianLog, 1, 0], 1, 0]);
            } else if(is10To10ToX(this.array) && is10To10ToX(other.array)) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0][0] - this.array[0][0])));
                return new HugeNumber(1, [[this.array[0][0] + gaussianLog, 1, 0], 1, 0]);
            } else {
                return this.clone();
            }
        }
        

        // sub(other) {
        //     if (this.lt(other)) {
        //         return other.sub(this).neg();
        //     } else if (this.eq(other)) {
        //         return new HugeNumber(1, 0);
        //     } else if (this.sign === -1 && other.sign === -1) {
        //         return this.abs().sub(other.abs()).negAbs();
        //     } else if (this.sign === 1 && this.sign === -1) {
        //         return this.add(other.abs());
        //     } else if (typeof this.array === "number" && typeof other.array === "number") {
        //         return new HugeNumber(1, this.array - other.array);
        //     } else if (isSci(this.array) && typeof other.array === "number") {
        //         return log10ToSci(Math.log10(this.array[0]) + this.array[1][1] + Math.log10(other.array));
        //     } else if (isSci(this.array) && isSci(other.array)) {
        //         return new HugeNumber(1, [Math.log10(this.array[0]) + this.array[1][1] + Math.log10(other.array[0]) + Math.log10(other.array[1][1])]);
        //     } else {
        //         return this.clone();
        //     }
        // }

        // mul(other) {
        //     return new HugeNumber(this.sign * other.sign, [this.array[0], other.array[0]]);
        // }

        // div(other) {
        //     if (typeof this.array === "number" && typeof other.array === "number") {
        //         return new HugeNumber(this.sign * other.sign, Math.floor(this.array / other.array));
        //     } else if (this.lt(other)) {
        //         return new HugeNumber(1, 0);
        //     } else if (this.eq(other)) {
        //         return new HugeNumber(1, 1);
        //     } else if (isSci(this.array) && typeof other.array === "number") {
        //         return new HugeNumber(1, log10ToSci(Math.log10(this.array[0]) + this.array[1][1] - Math.log10(other.array)));
        //     } else if (isSci(this.array) && isSci(other.array)) {
        //         return new HugeNumber(1, log10ToSci(Math.log10(this.array[0]) + this.array[1][1] - Math.log10(other.array[0]) - other.array[1][1]));
        //     }
        // }

    }

    return HugeNumber;
})();



// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}