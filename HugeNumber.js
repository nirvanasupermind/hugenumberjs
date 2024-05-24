var HugeNumber = (function () {
    var maxDepth = Infinity;
    var cap = 5;
    


    // Arrow notation with standard numbers
    function arrow(a, x, y) {
        if(a >= 2 && x >= 4 && y >= 3) {
            return Infinity;
        }

        if (x <= 1 || y === 1) {
            return Math.pow(a, x);
        } else if(1 < y && y < 2) {
            return Math.pow(arrow(a, x, 1), (2 - y)) * Math.pow(arrow(a, x, 2), y - 1);         
        } else {
            var result = arrow(a, x % 1, y);
            for(var i = 0; i < Math.floor(x); i++) {
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
            while(x >= a) {
                x = inverseArrow(a, x, y - 1);
                result++;
            }
            result += inverseArrow(a, x, y - 1);
            return result;
            
        }
    }

    function normalize(array, base = 10) {
        console.log(array);
        var b = array[0];
        if(array.length === 0 || b === 1) {
            return base;
        } else if(array.length === 1) {
            return Math.pow(base, b);
        } else if(array[array.length - 1] === 1) {
            return array.slice(0, -1);
        } else if(array.length === 2) {
            var result = arrow(base, array[0], array[1]);
            if(Number.isFinite(result)) {
                return result;
            } else {
                return array;
            }
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
    //         return array;
    //     }
    // }


    class HugeNumber {
        constructor(sign, array) {
            this.sign = sign;
            this.array = array;
        }

        add(other) {
            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array + other.array);
            } else if(this.array.length === 1 && other.array.length === 1) {
                var gaussianLog = Math.log10(1 + Math.pow(10, other.array[0] - this.array[0]));
                return new HugeNumber(1, this.array[0] + gaussianLog);
            } else {
                return this.max(other);
            }
        }

        sub(other) {
            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array - other.array);
            } else if(this.array.length === 1 && other.array.length === 1) {
                var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, other.array[0] - this.array[0])));
                return new HugeNumber(1, [this.array[0] + gaussianLog]);
            } else {
                return this.max(other);
            }
        }


        mul(other) {
            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array * other.array);
            } else if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(1, [this.array[0] + other.array[0]]);
            } else if(this.array.length === 2 && this.array[1] === 2 
                     && other.array.length === 2 && other.array[1] == 2) {
                var doubleLogThis = arrow(10, this.array[0] - 2, 2);
                var doubleLogOther = arrow(10, other.array[0] - 2, 2);
                if(Number.isFinite(doubleLogThis) && Number.isFinite(doubleLogOther)) {
                    var gaussianLog = Math.log10(1 + Math.pow(10, doubleLogOther - doubleLogThis));
                    return new HugeNumber(1, [inverseArrow(10, doubleLogThis + gaussianLog, 2) + 2, 2]);
                } else {
                    return this.max(other);
                }
            } else {
                return this.max(other);
            }
        }

        div(other) {
            if (typeof this.array === "number" && typeof other.array === "number") {
                return new HugeNumber(1, this.array / other.array);
            } else if(this.array.length === 1 && other.array.length === 1) {
                return new HugeNumber(1, [this.array[0] - other.array[0]]);
            } else if(this.array.length === 2 && this.array[1] === 2 
                     && other.array.length === 2 && other.array[1] == 2) {
                var doubleLogThis = arrow(10, this.array[0] - 2, 2);
                var doubleLogOther = arrow(10, other.array[0] - 2, 2);
                if(Number.isFinite(doubleLogThis) && Number.isFinite(doubleLogOther)) {
                    var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, doubleLogOther - doubleLogThis)));
                    return new HugeNumber(1, [inverseArrow(10, doubleLogThis + gaussianLog, 2) + 2, 2]);
                } else {
                    return this.max(other);
                }
            } else {
                return this.max(other);
            }
        }

        toString() {
            return "{10, " + this.array.join(", ") + "}";
        }
    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}