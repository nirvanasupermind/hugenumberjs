var HugeNumber = (function () {
    const MAX_DEPTH = 10;
    function normalize(array, depth = 0) {
        if(depth > MAX_DEPTH || typeof array === "number") {
            return array;
        }
        var a = array[0];
        var b = array[1];
        var c = array[2];
        if(array.length === 2) {
            var lhs = normalize(array[0], ++depth);
            var rhs = normalize(array[1], ++depth); 
            if(Number.isFinite(lhs) && Number.isFinite(rhs)) {
                return lhs * rhs;
            } else {
                return [lhs, rhs];
            }
        } else if(array[array.length - 1] === 0) {
            return normalize(array.slice(0, -1), ++depth);
        } else if(b === 1) {
            return a;
        } else if(b === 0 && c > 0) {
            return 1;
        } else if(b === 0 && c === 0) {
            return 0;
        } else if(b > 1 && c > 0) {
            var pound = array.slice(3);
            var innerArray = normalize([a, b - 1, c, ...pound], ++depth);
            return normalize([a, innerArray, c - 1, ...pound], ++depth);
        } else {
            for(var i = 3; i < array.length; i++) {
                if(array[i] != 0) {
                    var n = array[i];
                    var result = [a, a, ...array.slice(2, i - 1), b, n - 1];
                    return normalize(result, ++depth);
                }
            }

            return array.map((e) => normalize(e, ++depth));
        }
    }

    class HugeNumber {
        constructor(sign, array) {
            this.sign = sign;
            this.array = normalize(array);
        }

    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;

}