var HugeNumber = (function () {
    class HugeNumber {
        constructor(sign, n, alpha) {
            if(alpha === n) {
                this.n = n;
                this.alpha = alpha;
            }
        }
    };
    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}