var HugeNumber = (function () {
    const MAX_DEPTH = 10;
    const SCI_PREC = 15;
    
    function isSci(array) {
        return array.length === 2 && typeof array[0] === "number"
            && array[1].length === 3
            && array[1][0] === 10 && typeof array[1][1] === "number"
            && array[1][2] === 1;
    }
    function normalize(array, depth = 0) {
        if (depth > MAX_DEPTH) {
            return array;
        }
        var a = array[0];
        var b = array[1];
        var c = array[2];
        if (a === 2 && b === 2) {
            return 4;
        } else if(isSci(array)) {
            var result = [...array];
            while(result[0] >= Math.pow(10, SCI_PREC + 1)) {
                result[0] /= 10;
                result[1][1]++;
            }
            while(result[0] <= Math.pow(10, SCI_PREC - 1)) {
                result[0] *= 10;
                result[1][1]--;
            }
            return result;
        } else if (array.length === 2) {
            var lhs = normalize(a, ++depth);
            var rhs = normalize(b, ++depth);
            // if (isSci(lhs) && isSci(rhs)) {
            //     return [(lhs[0] * rhs[0]) / Math.pow(10, SCI_PREC), [10, lhs[1][1] + rhs[1][1] + SCI_PREC, 1]];
            // } else if(typeof lhs === "number") {
            //     return [lhs, rhs];
            // } else {
            //     return [lhs, rhs].sort();
            // }

            if (Number.isFinite(lhs * rhs)) {
                return lhs * rhs;
            } else if (isSci(lhs) && typeof rhs === "number") {
                var floorLog = Math.floor(Math.log10(rhs));
                return [(lhs[0] * rhs) / Math.pow(10, floorLog), [10, lhs[1][1] + floorLog, 1]];
            } else if (typeof lhs === "number" && isSci(rhs)) {
                var floorLog = Math.floor(Math.log10(lhs));
                return [(rhs[0] * lhs) / Math.pow(10, floorLog), [10, rhs[1][1] + floorLog, 1]];
            } else if (isSci(lhs) && isSci(rhs)) {
                return [(lhs[0] * rhs[0]) / Math.pow(10, SCI_PREC), [10, lhs[1][1] + rhs[1][1] + SCI_PREC, 1]];
            } else if(typeof lhs === "number") {
                return [lhs, rhs];
            } else {
                return [lhs, rhs].sort();
            }
        } else if (array.length === 3 && typeof a === "number" && typeof b === "number" && c === 1) {
            var num = Math.pow(a, b);
            if (Number.isFinite(num)) {
                return num;
            } else {
                var fracExp = b * Math.log10(a);
                var mantissa = Math.floor(Math.pow(10, (fracExp % 1) + SCI_PREC));
                var exponent = Math.floor(fracExp) - SCI_PREC;
                return [mantissa, [10, exponent, 1]];
            }
        } else if (array[array.length - 1] === 0) {
            return normalize(array.slice(0, -1), depth);
        } else if (b === 1) {
            return a;
        } else if (b === 0 && c > 0) {
            return 1;
        } else if (b === 0 && c === 0) {
            return 0;
        } else if (b > 1 && c > 0) {
            var pound = array.slice(3);
            var innerArray = normalize([a, b - 1, c, ...pound], ++depth);
            return normalize([a, innerArray, c - 1, ...pound], ++depth);
        } else {
            for (var i = 3; i < array.length; i++) {
                if (array[i] != 0) {
                    var n = array[i];
                    var result = [a, a, ...array.slice(2, i - 1), b, n - 1];
                    return normalize(result, ++depth);
                }
            }

            return array;
        }
    }

    function arrayString(array) {
        if(typeof array === "number") {
            return array.toString();
        } else if(isSci(array)) {
            return (array[0] / Math.pow(10, SCI_PREC)) + "e+" + (array[1][1] + SCI_PREC);
        } else {
            return arrayString(array[0]) + "[" + array.slice(2).map(arrayString).join(",") + "]" + arrayString(array[1]);
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
                return other.sub(this.abs());           
            } else if(this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            }
            
            var num = this.array + other.array;

            if (Number.isFinite(num)) {
                return new HugeNumber(1, num);
            } else if(this.lt(other)) {
                return other.add(this);
            } else if (isSci(this.array) && typeof other.array === "number") {
                var log10Other = Math.log10(other.array);
                var otherExponent = Math.floor(log10Other) - SCI_PREC;
                var otherMantissa = Math.floor(Math.pow(10, log10Other % 1) * Math.pow(10, SCI_PREC));
                var mantissa = Math.floor(this.array[0] + otherMantissa * Math.pow(10, otherExponent - this.array[1][1]));
                return new HugeNumber(1, [mantissa, this.array[1]]);
            } else if (isSci(this.array) && isSci(other.array)) {
                var mantissa = Math.floor(this.array[0] + other.array[0] * Math.pow(10, other.array[1][1] - this.array[1][1]));
                return new HugeNumber(1, [mantissa, this.array[1]]);
            } else {
                return this.clone();
            }
        }

        sub(other) {
            if(typeof other === "number") {
                other = HugeNumber.from(other);
            }
            
            if(this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).neg();
            } else if(this.sign === -1 && other.sign === 1) {
                return other.add(this.abs());           
            } else if(this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            }
            
            var num = this.array - other.array;

            if (Number.isFinite(num)) {
                return new HugeNumber(1, num);
            } else if(this.lt(other)) {
                return other.sub(this).neg();
            } else if (isSci(this.array) && typeof other.array === "number") {
                var log10Other = Math.log10(other.array);
                var otherExponent = Math.floor(log10Other) - SCI_PREC;
                var otherMantissa = Math.floor(Math.pow(10, log10Other % 1) * Math.pow(10, SCI_PREC));
                var mantissa = Math.floor(this.array[0] - otherMantissa * Math.pow(10, otherExponent - this.array[1][1]));
                return new HugeNumber(1, [mantissa, this.array[1]]);
            } else if (isSci(this.array) && isSci(other.array)) {
                var mantissa = Math.floor(this.array[0] - other.array[0] * Math.pow(10, other.array[1][1] - this.array[1][1]));
                return new HugeNumber(1, [mantissa, this.array[1]]);
            } else {
                return this.clone();
            }
        }

        mul(other) {
            if(typeof other === "number") {
                other = HugeNumber.from(other);
            }

            return new HugeNumber(this.sign * other.sign, [this.array, other.array]);
        }

        div(other) {
            if(typeof other === "number") {
                other = HugeNumber.from(other);
            }

            var sign = this.sign * other.sign;
        
            var num = Math.floor(this.array / other.array);

            if (Number.isFinite(num)) {
                return new HugeNumber(sign, num);
            } else if(this.lt(other)) {
                return new HugeNumber(1, 0);
            } else if (isSci(this.array) && typeof other.array === "number") {
                var log10Other = Math.log10(other.array);
                var otherExponent = Math.floor(log10Other) - SCI_PREC ;
                var otherMantissa = Math.floor(Math.pow(10, log10Other - otherExponent));
                var mantissa = Math.floor((this.array[0] / otherMantissa) * Math.pow(10, SCI_PREC + 1));
                return new HugeNumber(1, [mantissa, [10, this.array[1][1] - otherExponent - SCI_PREC - 1, 1]]);
            } else if (isSci(this.array) && isSci(other.array)) {
                var mantissa = Math.floor(this.array[0] / other.array[0] * Math.pow(10, SCI_PREC + 1));
                return new HugeNumber(1, [mantissa, [10, this.array[1][1] - other.array[1][1] - SCI_PREC - 1, 1]]);
            } else {
                return this.clone();
            }
        }

        exp(other) {
            if(typeof other === "number") {
                other = HugeNumber.from(other);
            }

            return new HugeNumber(this.sign * other.sign, [this.array, other.array, 1]);
        }

        tetr(other) {
            if(typeof other === "number") {
                other = HugeNumber.from(other);
            }

            return new HugeNumber(this.sign * other.sign, [this.array, other.array, 2]);
        }

        arrow(other, arrows) {
            if(typeof other === "number") {
                other = HugeNumber.from(other);
            }

            if(typeof arrows === "number") {
                arrows = HugeNumber.from(arrows);
            }

            return new HugeNumber(this.sign * other.sign, [this.array, other.array, arrows.array]);
        }
    
        cmp(other) {
            if (this.sign === -1 && other.sign === -1) {
                return -this.abs().cmp(other.abs());
            } else if (this.sign === -1 && other.sign === 1) {
                return -1;
            } else if (this.sign === 1 && other.sign === -1) {
                return 1;
            } if (typeof this.array === "number" && typeof other.array === "number") {
                if (this.array > other.array) {
                    return 1;
                } else if (this.array === other.array) {
                    return 0;
                } else {
                    return -1;
                }
            } else if ((typeof this.array === "number" && typeof other.array !== "number")
                || (this.array.length > other.array.length)) {
                return -1;
            } else if ((typeof this.array !== "number" && typeof other.array === "number")
                || (this.array.length < other.array.length)) {
                return 1;
            } else {
                for (var i = this.array.length - 1; i >= 0; i--) {
                    var a = new HugeNumber(1, this.array[i]);
                    var b = new HugeNumber(1, other.array[i]);
                    if (a.cmp(b) === 1) {
                        return 1;
                    } else if (a.cmp(b) === -1) {
                        return -1;
                    }
                }

                return 0;
            }
        }
        
        eq(other) {
            return this.cmp(other) === 0;
        }

        lt(other) {
            return this.cmp(other) < 0;
        }

        gt(other) {
            return this.cmp(other) > 0;
        }

        max(other) {
            return this.gt(other) ? this.clone() : other.clone();
        }

        toString() {
            return arrayString(this.array);
        }
        
        static from(val) {
            if(typeof val === "number") {
                return new HugeNumber(val < 0 ? -1 : 1, Math.abs(val));
            }
        }
    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;

}