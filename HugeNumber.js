var HugeNumber = (function () {
    class HugeNumber {
        constructor(sign, array) {
            this.sign = sign;
            this.array = array;
        }

        normalize() {
            if(this.array)
        }
    }
    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}