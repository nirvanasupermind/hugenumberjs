var HugeNumber = (function () {
    var maxDepth = 10;
    


    // Arrow notation with standard numbers
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

    function normalize10(array, depth = 0, a = 10) {
        if(typeof array === "number") {
            return array;
        }
    
        var b = normalize10(array[0], ++depth);
        if(b === 1) {
            // (already handled by other rules, but added to speed things up)
            return a;
        }
    
        if(depth > maxDepth && array[array.length - 1] !== 1) {
            return array;
        } else if(array.length === 0) {
            return a;
        } else if(array.length === 1) {
            var result = Math.pow(a, array[0]);

            return Number.isFinite(result) ? result : array;
        } else if(array[array.length - 1] === 1) {
            return normalize10(array.slice(0, -1), ++depth);
        } else if(normalize10(array[1], ++depth) === 1 && 1 <= b && b < 2) {
            var n = 0;
            for(var i = 1; i < array.length; i++) {
                if(normalize10(array[i], ++depth) === 1) {
                    n++;
                } else {
                    break;
                }
            }
            var c = array[n + 1];
            var pound = array.slice(n + 2);
            return normalize10(new Array(n).fill(a).concat([Math.pow(a, b - 1), c - 1]).concat(pound), ++depth);
        } else if(array[1] === 1 && (b >= 2 && b < maxDepth || Array.isArray(b))) {
            var n = 0;
            for(var i = 1; i < array.length; i++) {
                if(normalize10(array[i], ++depth) === 1) {
                    n++;
                } else {
                    break;
                }
            }
            var c = array[n + 1];
            var pound = array.slice(n + 2);
            var array2 = [...array];
            if(typeof array2[1] === "number") {
                array2[1]--;
            }
            return normalize10(new Array(n).fill(a).concat([normalize10(array2, ++depth), c - 1, ...pound]), ++depth);
        } else if(1 < array[1] && array[1] < 2) {
            var pound = array.slice(2);
            var x = normalize10([b, 1, ...pound], ++depth);
            var y = normalize10([b, 2, ...pound], ++depth);
            if(typeof x === "number" && typeof y === "number") {
                return Math.pow(x, 2 - array[1]) * Math.pow(y, array[1] - 1);
             } else if(typeof x === "number") {
                x = [Math.log(x)/Math.log(a)];
            }

            if(y.length > 1) {
                return y;
            }
            
           if(typeof x[0] === "number" && typeof y[0] === "number") {
            return normalize10([x[0] * (2 - array[1]) + y[0] * (array[1] - 1)], ++depth);
           }  else if(typeof x[0] === "number"  && typeof y[0][0] === "number") {
                return normalize10([[y[0][0] + Math.log(array[1] - 1)/Math.log(a)]], ++depth);
            } else {
                return y;
            }
        } else if(1 <= b && b < 2 && (array[1] >= 2 || Array.isArray(array[1]))) {
            var pound = array.slice(3);
            return normalize10([Array.isArray(b) ? [b] : Math.pow(a, b - 1), (typeof array[1] === "number" ? array[1] - 1 : normalize10(array[1], ++depth)), ...pound], ++depth);
        } else if(((b >= 2 && b < 10) || Array.isArray(b)) && (array[1] >= 2 || Array.isArray(array[1]))) {
            var pound = array.slice(3);
            var array2 = [...array];
            if(!Array.isArray(array2[1])) {
                array2[1]--;
            }
            return normalize10([normalize10(array2, ++depth), array[1] - 1, ...pound], ++depth);
        } else {
            return array;
            // throw new Error("no rule found: " + JSON.stringify(array));
        }
    }
    
    // function normalize(array, base = 10) {
    //     var b = array[0];
    //     if(array.length === 0 || b === 1) {
    //         return [1];
    //     } else if(array.length === 2) {
    //         var num = arrow(base, b, array[1]);
    //         return Number.isFinite(num) ? num : array;
    //     } else if(array[array.length - 1] === 1) {
    //         return array.slice(0, -1);
    //     } else if(array[1] === 1 && 1 <= b && b <= 2) {
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
    //     } else if(1 <= array[1] && array[1] <= 2) {
    //         var temp1 = ;
    //         return [...new Array(n + 1).fill(bases), Math.pow(base, b - 1), c - 1, ...pound];
    //     } else {
    //         return array;
    //     }
    // }


    class HugeNumber {
        constructor(sign, array, normalizeArray = true) {
            this.sign = sign;
            if(normalizeArray === true) {
                this.array = normalize10(array);
            } else {
                this.array = array;
            }
        }


        add(other) {
            if (this.array.length === 1 && typeof this.array[0] === "number") {
                return this.array.length;
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