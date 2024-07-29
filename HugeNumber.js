var HugeNumber = (function () {
    const MAX_DEPTH = 500;
    const SCI_PREC = 16;
    const TEN_TO_SCI_PREC = 1e+16;

    function log10ToSci(log10) {
        return [Math.round(Math.pow(10, log10 % 1 + SCI_PREC)), [10, Math.floor(log10) - SCI_PREC, 1]];
    }

    function isSci(array) {
        return array.length === 2 && typeof array[0] === "number"
            && array[1].length === 3
            & array[1][0] === 10 && typeof array[1][1] === "number" && array[1][2] === 1;
    }

    function normalize(array, depth = 0) {
        if (typeof array === "number") {
            return array;
        }

        if(!isSci(array)) {
        array = array.map((e) => normalize(e, depth + 1));
        }

        var temp = Math.pow(array[0], array[1]);
        if (depth > MAX_DEPTH) {
            return array;
        } else if (array.length === 2 && typeof array[0] === "number" && typeof array[1] === "number") {
            var result =  array[0] * array[1];;
            if(Number.isFinite(result)) {
                return result;
            } else {
                return log10ToSci(Math.log10(array[0]) + Math.log10(array[1]));
            }
        } else if (array.length === 2 && typeof array[0] === "number" && isSci(array[1])) {
            var log10 = Math.log10(array[0]) + Math.log10(array[1][0]) +  array[1][1][1];
            return log10ToSci(log10);
        } else if (array.length === 2 && isSci(array[0]) && typeof array[1] === "number") {
            var log10 = Math.log10(array[1]) + Math.log10(array[0][0]) +  array[0][1][1];
            return log10ToSci(log10);
        } else if (array.length === 2 && isSci(array[0]) && isSci(array[1])) {
            var log10 = Math.log10(array[0][0]) + Math.log10(array[1][0]) + array[0][1][1] + array[1][1][1];
            return log10ToSci(log10);
        } else if (isSci(array)) {
            var newArray = [...array];

            while(newArray[0] >= (TEN_TO_SCI_PREC * 10)) {
                newArray[0] /= 10;
                newArray[1][1]++;
            }

            while(newArray[0] < TEN_TO_SCI_PREC) {
                newArray[0] *= 10;
                newArray[1][1]--;
            }

            return newArray;
        } else if (array.length === 3 && typeof array[0] === "number" && typeof array[1] === "number" && array[2] === 1 && Number.isFinite(temp)) {
            return temp;
        } else if (array.length === 3 && typeof array[0] === "number" && typeof array[1] === "number" && array[2] === 1 && !Number.isFinite(temp)) {
            var log = array[1] * Math.log10(array[0]);
            return [Math.round(Math.pow(10, (log % 1) + SCI_PREC)), [10, Math.floor(log - SCI_PREC), 1]];
        } else if (array[array.length - 1] == 0) {
            return normalize(array.slice(0, -1), depth + 1);
        } else if (array[1] === 1) {
            return array[0];
        } else if (array[1] === 0 && array[2] > 0) {
            return 1;
        } else if (array[1] === 0 && array[2] === 0) {
            return 0;
        } else if (array[1] > 1 && array[1] <= 4 && array[2] > 0 && typeof array[2] === "number") {
            var innerArray = normalize([array[0], array[1] - 1, ...array.slice(2)], depth + 1);
            var outerArray = [array[0], innerArray, array[2] - 1, ...array.slice(3)];
            return normalize(outerArray, depth + 1);
        } else if (array[1] > 4 && (array[2] > 0 || typeof array[2] !== "number")) {
            return array;
        } else {
            var newArray = [...array];
            for (var i = 2; i < array.length; i++) {
                if (array[i] !== 0) {
                    newArray[1] = array[0];
                    newArray[i] = array[i] - 1;
                    newArray[i - 1] = array[1];
                    break;
                }
            }
            return normalize(newArray, depth + 1);
        }
    }

    function arrayToString(array) {
        if(typeof array === "number") {
            return array.toString();
        } else if(isSci(array)) {
            return (array[0] / TEN_TO_SCI_PREC) + "e+" + (array[1][1] + SCI_PREC);
        } else if(array.length === 2) {
            return arrayToString(array[0]) + "*" + arrayToString(array[1]);
        } else if(array.length === 3 && array[2] === 1) {
            return arrayToString(array[0]) + "^" + arrayToString(array[1]);
        } else {
            var inner = array.slice(2).map(arrayToString).join(",");
            return arrayToString(array[0]) + "[" + inner + "]" + arrayToString(array[1]);
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
            if(this.sign === -1) {
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
            } else {
                for (var i = this.array.length - 1; i >= 0; i--) {
                    var a = new HugeNumber(1, this.array[i]);
                    var b = new HugeNumber(1, other.array[i]);
                    if (a.gt(b)) {
                        return 1;
                    } else if(a.lt(b)) {
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
            } else if (isSci(this.array) && typeof other.array === "number") {
                return new HugeNumber(1, [this.array[0] + other.array * Math.pow(10, -this.array[1][1]), [10, this.array[1][1], 1]]);
            } else if (isSci(this.array) && isSci(other.array)) {
                return new HugeNumber(1, [this.array[0] + other.array[0] * Math.pow(10, other.array[1][1] - this.array[1][1]), [10, this.array[1][1], 1]]);
            } else {
                return this.clone();
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
            } else if (isSci(this.array) && typeof other.array === "number") {
                return log10ToSci(Math.log10(this.array[0]) + this.array[1][1] + Math.log10(other.array));
            } else if (isSci(this.array) && isSci(other.array)) {
                return new HugeNumber(1, [Math.log10(this.array[0]) + this.array[1][1] + Math.log10(other.array[0]) + Math.log10(other.array[1][1])]);
            } else {
                return this.clone();
            }
        }

        mul(other) {
            return new HugeNumber(this.sign * other.sign, [this.array[0], other.array[0]]);
        }

        div(other) {
            if(typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(this.sign * other.sign, Math.floor(this.array / other.array));
            } else if(this.lt(other)) {
                return new HugeNumber(1, 0);
            } else if(this.eq(other)) {
                return new HugeNumber(1, 1);
            } else if(isSci(this.array) && typeof other.array === "number") {
                return new HugeNumber(1, log10ToSci(Math.log10(this.array[0]) + this.array[1][1] - Math.log10(other.array)));
            } else if(isSci(this.array) && isSci(other.array)) {
                return new HugeNumber(1, log10ToSci(Math.log10(this.array[0]) + this.array[1][1] - Math.log10(other.array[0]) - other.array[1][1]));
            }
        }
        
    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;

}