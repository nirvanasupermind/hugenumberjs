var HugeNumber = (function () {
    const DEPTH_LIMIT = 500;
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
        if(typeof array === "number") {
            return false;
        }

        return array[1] === 1 && array[2] === 1;
    }

    function is10To10ToX(array) {
        if(typeof array === "number") {
            return false;
        }

        return array[0] < 4.396009145337229 && array[1] === 2 && array[2] === 1;
    }

    function beafInterpolate(x, y, n, depth) {
        if (typeof x === "number" && typeof y === "number") {
            return Math.pow(x, 1 - n) * Math.pow(y, n);
        } else if (typeof x === "number" && is10ToX(y)) {
            return normalize([Math.log10(x) * (1 - n) + y[0] * n, 1, 1], depth);
        } else if (is10ToX(x) && typeof y === "number") {
            return normalize([x[0] * (1 - n) + Math.log10(y) * n, 1, 1], depth);
        } else if (is10ToX(x) && is10ToX(y)) {
            return normalize([x[0] * (1 - n) + y * n, 1, 1], depth);
        } else {
            return y;
        }
    }

    function arrow(a, x, y) {
        if (x <= 1 || y === 1) {
            return Math.pow(a, x);
        } else {
            var result = arrow(a, x % 1, y);
            for(var i = 0; i < Math.floor(x); i++) {
                result = arrow(a, result, y - 1);
            }
            return result;
        }
    }

    function inverseArrow(a, x, y) {
        if (x <= a || y === 1) {
            return Math.log10(x) / Math.log10(a);
        } else {
            var result = 0;
            while(x >= a) {
                x = inverseArrow(a, x, y - 1);
                result++;
            }
            result += inverseArrow(a, x, y - 1);
            return result;
            
        }
    }

    function normalize(array, depth = 0) {
        if (typeof array === "number" || depth > DEPTH_LIMIT) {
            return array;
        }

        var dp1 = depth + 1;
        var b = normalize(array[0], dp1), c = normalize(array[1], dp1), d = normalize(array[2], dp1);

        if (Number.isNaN(b) || Number.isNaN(c) || Number.isNaN(d)) {
            return NaN;
        } else if (b === Infinity || c === Infinity || d === Infinity) {
            return Infinity;
        } else if (c === 1 && d === 1) {
            if (b < 308.25471555991675) {
                return Math.pow(10, b);
            } else {
                return [b, c, d];
            }
        } else if(b > 10) {
            return [b, c, d];
        } else if (b === 1) {
            return 10;
        } else if (c === 1 && 1 < d && d < 2) {
            var x = normalize([b, 1, 1], dp1);
            var y = normalize([b, 1, 2], dp1);
            return beafInterpolate(x, y, d - 1);
        } else if (c === 1 && 1 < b && b < 2 && d >= 2) {
            return normalize([Math.pow(10, b - 1), 10, d - 1], dp1);
        } else if (c === 1 && b >= 2 && d >= 2) {
            var inner =  normalize([b - 1, 1, d], dp1);
            if(typeof inner === "number") {
                return normalize([10, inner, d - 1], dp1);
            } else {
                return [b, c, d];
            }
        } else if (1 < c && c < 2) {
            var x = normalize([b, 1, d], dp1);
            var y = normalize([b, 2, d], dp1);
            return beafInterpolate(x, y, c - 1);
        } else if (1 < b && b < 2 && c >= 2) {
            return normalize([Math.pow(10, b - 1), c - 1, d], dp1);
        } else if (b >= 2 && c >= 2) {
            var inner = normalize([b - 1, c, d], dp1);
            if(typeof inner === "number") {
                return normalize([inner, c - 1, d], dp1);
            } else {
                return [b, c, d];
            }
        } else {
            return [b, c, d];
        }

        // if (b < 1.7976931348623158e+307 && c === 0 && d === 0) {
        //     return 10 * b;
        // } else if (c === 1 && d === 0) {
        //     if (b < 308.25471555991675) {
        //         return Math.pow(10, b);
        //     } else  {
        //         return [b, c, d];
        //     }
        // } else if (0 < c && c < 1) {
        //     var x = normalize([b, 0, d], dp1);
        //     var y = normalize([b, 1, d], dp1);
        //     return phenolInterpolate(x, y, c, dp1);
        // } else if (0 <= b && b < 1 && (c >= 1 || Array.isArray(c))) {
        //     return Math.pow(10, b);
        // } else if (b >= 1 && c >= 1) {
        //     return normalize([normalize([b - 1, c, d], dp1), c - 1, d], dp1);
        // } else if (c === 0 && 0 < d && d < 1) {
        //     var x = 10 * b;
        //     var y = normalize([b, 0, 1], dp1);
        //     return phenolInterpolate(x, y, d, dp1);
        // } else if (c === 0 & d >= 1) {
        //     return normalize([10, b, d - 1], dp1);
        // } else {
        //     return [b, c, d];
        //     //    throw new Error("No rules applicable: " + JSON.stringify(array));
        // }
    }

    function arrayToString(array) {
        if (typeof array === "number") {
            return array.toString();
        } else if(is10ToX(array)) {
            return Math.pow(10, array[0] % 1) + "e+" + Math.floor(array[0]);
        } else {
            return "{10," + array.map(arrayToString) + "}";
        }
    }

    class HugeNumber {
        constructor(sign, array) {
            this.sign = sign;
            this.array = normalize(array);
        }

        clone() {
            if(typeof this.array === "number") {
                return new HugeNumber(this.sign, this.array);
            } else {
                return new HugeNumber(this.sign, [...this.array]);
            }
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
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if (this.sign === -1 && other.sign === -1) {
                return -this.abs().cmp(other.abs());
            } else if (this.sign === -1 && other.sign === 1) {
                return -1;
            } else if (this.sign === 1 && other.sign === -1) {
                return 1;
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                if (this.array < other.array) {
                    return -1;
                } else if (this.array === other.array) {
                    return 0;
                } else {
                    return 1;
                }
            } else if (typeof this.array === "number") {
                return -1;
            } else if (typeof other.array === "number") {
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
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            if (this.lt(other)) {
                return other.add(this);
            } else if (this.sign === -1 && other.sign === -1) {
                return this.abs().add(other.abs()).negAbs();
            } else if (this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array + other.array);
            } else if (is10ToX(this.array) && typeof other.array === "number") {
                var gaussianLog = Math.log10(1 + Math.pow(10, Math.log10(other.array) - this.array[0]));
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 1]);
            } else if (is10ToX(this.array) && is10ToX(other.array)) {
                var gaussianLog = Math.log10(1 + Math.pow(10, other.array[0] - this.array[0]));
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 1]);
            } else {
                return this.clone();
            }
        }


        sub(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            if (this.lt(other)) {
                return other.sub(this).neg();
            } else if (this.eq(other)) {
                return new HugeNumber(1, 0);
            } else if (this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).negAbs();
            } else if (this.sign === 1 && other.sign === -1) {
                return this.add(other.abs());
            } else if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array - other.array);
            } else if (is10ToX(this.array) && typeof other.array === "number") {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, Math.log10(other.array) - this.array[0])));
                return new HugeNumber(14, [this.array[0] + gaussianLog, 1, 1]);
            } else if (is10ToX(this.array) && is10ToX(other.array)) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0] - this.array[0])));
                return new HugeNumber(1, [this.array[0] + gaussianLog, 1, 1]);
            } else {
                return this.clone();
            }
        }

        mul(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // console.log(this.array, other.array);

            if (this.lt(other)) {
                return other.mul(this);
            }

            var sign = this.sign * other.sign;

            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(sign, this.array * other.array);
            } else if (is10ToX(this.array) && typeof other.array === "number") {
                return new HugeNumber(sign, [this.array[0] + Math.log10(other.array), 1, 1]);
            } else if (is10ToX(this.array) && is10ToX(other.array)) {
                return new HugeNumber(sign, [this.array[0] + other.array[0], 1, 1]);
            } else if (is10To10ToX(this.array) && is10ToX(other.array)) {
                var x = arrow(10, this.array[0] - 2, 2);
                var gaussianLog = Math.log10(1 + Math.pow(10, Math.log10(other.array[0]) - x));
                return new HugeNumber(1, [inverseArrow(x + gaussianLog, 2) + 2, 2]);
            } else if (is10To10ToX(this.array) && is10To10ToX(other.array)) {
                var x = arrow(10, this.array[0] - 2, 2);
                var y = arrow(10, other.array[0] - 2, 2);
                var gaussianLog = Math.log10(1 + Math.pow(10, y - x));
                return new HugeNumber(1, [inverseArrow(x + gaussianLog, 2) + 2, 2]);
            } else {
                return this.clone();
            }
        }

        div(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            // if (this.lt(other)) {
            //     return new HugeNumber(1, 0);
            // }

            var sign = this.sign * other.sign;
            

            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(sign, this.array / other.array);
            } else if (is10ToX(this.array) && typeof other.array === "number") {
                return new HugeNumber(sign, [this.array[0] - Math.log10(other.array), 1, 1]);
            } else if (is10ToX(this.array) && is10ToX(other.array)) {
                return new HugeNumber(sign, [this.array[0] - other.array[0], 1, 1]);
            } else if (is10To10ToX(this.array) && is10ToX(other.array)) {
                var x = arrow(10, this.array[0] - 2, 2);
                var gaussianLog = Math.log10(1 + Math.pow(10, Math.log10(other.array[0]) - x));
                return new HugeNumber(1, [inverseArrow(x + gaussianLog, 2) + 2, 2]);
            } else if (is10To10ToX(this.array) && is10To10ToX(other.array)) {
                var x = arrow(10, this.array[0] - 2, 2);
                var y = arrow(10, other.array[0] - 2, 2);
                var gaussianLog = Math.log10(1 + Math.pow(10, y - x));
                return new HugeNumber(1, [inverseArrow(x + gaussianLog, 2) + 2, 2]);
            } else {
                return this.clone();
            }
        }

        mod(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            return this.sub(this.div(other).trunc().mul(other));
        }

        pow10() {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            if(this.sign === -1) {
                if(typeof this.array === "number") {
                    return new HugeNumber(1, Math.pow(10, -this.array));
                } else {
                    return new HugeNumber(1, 0);
                }
            }

            if(this.array < 308.25471555991675) {
                return new HugeNumber(1, Math.pow(10, this.array));
            } else if(typeof this.array === "number") {
                return new HugeNumber(1, [this.array, 1, 1]);                
            } else if(is10ToX(this.array)) {
               return new HugeNumber(1, [inverseArrow(10, this.array[0], 2) + 2, 2, 1]);
            } else if(this.array[1] === 2 && this.array[2] === 1) {
                return new HugeNumber(1, [this.array[0] + 1, 2, 1]);
            } else {
                return this.clone();
            }
        }

        log10() {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            

            if(this.array < 308.25471555991675) {
                return new HugeNumber(1, Math.log10(this.array));
            } else if(is10ToX(this.array)) {
            return new HugeNumber(1, this.array[0]);
            } else if(this.array[0] === 2 && this.array[1] === 1) {
                return new HugeNumber(1, [this.array[0] - 1, 2, 1]);
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
            if(this.array < 1) {
                return new HugeNumber(1, Math.pow(10, this.array));
            } else if(typeof this.array === "number") {
                return new HugeNumber(1, [this.array, 2, 1]);
            } else if(is10ToX(this.array)) {
                return new HugeNumber(1, [2 + Math.log10(inverseArrow(10, this.array[0], 2) + 1), 3, 1]);
            } else if(this.array[1] === 2 && this.array[2] === 1) {
                return new HugeNumber(1, [inverseArrow(10, this.array[0], 3) + 2, 3, 1]);
            }  else if(this.array[1] === 3 && this.array[2] === 1) {
                return new HugeNumber(1, [this.array[0] + 1, 3, 1]);
            } else {
                return this.array.clone();
            }
        }

        slog10() {
            if(this.array < 1) {
                return this.array.sub(1);
            } else if(typeof this.array === "number") {
                return new HugeNumber(1, inverseArrow(10, this.array, 2));
            } else if(is10ToX(this.array)) {
                return new HugeNumber(1, inverseArrow(10, this.array[0] + 1, 2));
            } else if(this.array[1] === 2 && this.array[2] === 1) {
                return new HugeNumber(1, this.array[0]);
            }  else if(this.array[1] === 3 && this.array[2] === 1) {
                return new HugeNumber(1, [this.array[0] - 1, 3, 1]);
            } else {
                return this.array.clone();
            }
        }
        
        tetr(other) {
            if(typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            if(other.sign === -1) {
                if(other.array < 1) {
                    return new HugeNumber(1, Math.pow(10, this.array));
                } else if(other.array < 2) {
                    return this.tetr((-other.array) + 1).log10();
                }
            } else if(other.array < 1) {
                return new HugeNumber(1, Math.pow(this, other));
            } else if(other.array <= 20) {
                return this.pow(this.tetr(other.array - 1));
            } else {
                var offset = this.tetr(20).slog10().sub(20);
                return other.add(offset).tetr10();
            }
        }


        arrow10(arrows) {
            if(typeof arrows === "number") {
                arrows = HugeNumber.fromNumber(arrows);
            }

            if(this.array < 1) {
                return new HugeNumber(1, Math.pow(10, this.array));
            } else if(typeof this.array === "number") {
                return new HugeNumber(1, [this.array, arrows.array, 1]);
            } else if(this.array[1] < arrows.array - 1 && this.array[2] === 1) {
                var a = 1;
                var b = 2;
                var c = 0;
                for(var i = 0; i < 100; i++) {
                    c = (a + b) / 2;
                    var val = new HugeNumber(1, [c, 2, 2]);
                    if(val.inverseArrow10(arrows).lt(this)) {
                        a = c;
                    } else {
                        b = c;
                    }
                }

                return new HugeNumber(1, [c, 2, 2]);
            }else if(this.array[1] === arrows.array - 1 && this.array[2] === 1) {
                return new HugeNumber(1, [2 + Math.log10(inverseArrow(10, this.array[0], 2) + 1), arrows.array + 1, 1]);
            } else if(this.array[1] === arrows.array && this.array[2] === 1) {
                return new HugeNumber(1, [inverseArrow(10, this.array[0], arrows.array) + 2, arrows.array + 1, 1]);
            } else if(this.array[1] === arrows.array + 1 && this.array[2] === 1) {
                return new HugeNumber(1, [this.array[0] + 1, this.array[1], 1]);
            } else {
                return this.clone();
            }
        }

        inverseArrow10(arrows) {
            if(typeof arrows === "number") {
                arrows = HugeNumber.fromNumber(arrows);
            }

            if(this.array < 1) {
                return this.array.sub(1);
            } else if(typeof this.array === "number") {
                return new HugeNumber(1, inverseArrow(10, arrows, 2));
            } else if(this.array[1] < arrows.array - 1 && this.array[2] === 1) {
                var a = 1;
                var b = 2;
                var c = 0;
                for(var i = 0; i < 100; i++) {
                    c = (a + b) / 2;
                    var val = new HugeNumber(1, [c, arrows.array, 1]);
                    if(val.lt(this)) {
                        a = c;
                    } else {
                        b = c;
                    }
                }

                return new HugeNumber(1, c);
            } else if(this.array[1] === arrows.array - 1 && this.array[2] === 1) {
                return new HugeNumber(1, inverseArrow(10, this.array[0] + 1, arrows.array));
            } else if(this.array[1] === arrows.array && this.array[2] === 1) {
                return new HugeNumber(1, this.array[0]);
            } else if(this.array[1] === arrows.array + 1 && this.array[2] === 1) {
                return new HugeNumber(1, [this.array[0] - 1, this.array[1], 1]);
            } else {
                return this.clone();
            }
        }


        trunc() {
            if (typeof this.array === "number") {
                return new HugeNumber(this.sign, Math.trunc(this.array));
            } else {
                return this.clone();
            }
        }

        static fromNumber(num) {
            return new HugeNumber((num < 0 ? -1 : 1), Math.abs(num));
        }


        beaf(b, c, d) {
            if(c.eq(1) && d.eq(1)) {
                return this.pow(b);
            } else if(b.eq(1)) {
                return this.clone();
            } else if(d.gt(1) && d.lt(2)) {
                return this.pow(b).pow(new HugeNumber(1, 2).sub(d));
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