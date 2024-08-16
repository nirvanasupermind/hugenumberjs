var HugeNumber = (function () {
    function jsonEq(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function cmpOrd(a, b) {
        if (typeof a === "number" && typeof b === "number") {
            return (a < b ? -1 : (a === b ? 0 : 1));
        } else if (typeof a === "number") {
            return -1;
        } else if (typeof b === "number") {
            return 1;
        } else {
            for (var i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
                var t1 = i >= a.length ? 0 : a[i][1];
                var t2 = i >= a.length ? 0 : b[i][1];
                if (cmpOrd(t1, t2) === -1) {
                    return -1;
                } else if (cmpOrd(t1, t2) === 1) {
                    return 1;
                }
                var t3 = i >= a.length ? 0 : a[i][0];
                var t4 = i >= a.length ? 0 : b[i][0];
                if (t3 < t4) {
                    return -1;
                } else if (t3 > t4) {
                    return 1;
                }
            }

            return 0;
        }
    }

    function normalizeOrd(ord) {
        if (typeof ord === "number") {
            return ord;
        } else if (ord.length === 0) {
            return 0;
        } else if (ord.length === 1 && ord[0][1] === 0) {
            return ord[0][0];
        }

        var result = [...ord].map((e) => [e[0], normalizeOrd(e[1])]).filter((e) => e !== 0 && (e[0] !== 0));
        var largestExp = 0;
        // var indicesToRemove = [];
        for (var i = 0; i < ord.length; i++) {
            if (cmpOrd(ord[i][1], largestExp) >= 0) {
                largestExp = ord[i][1];
            } else {
                result = result.filter((e) => !jsonEq(e[1], ord[i][1]));
            }
        }

        var largestExpTerms = result.filter((e) => jsonEq(e[1], largestExp));
        if (largestExpTerms.length > 1) {
            var sum = 0;
            for (var i = 0; i < largestExpTerms.length; i++) {
                sum += largestExpTerms[i][0];
            }
            result = result.filter((e) => !largestExpTerms.includes(e));
            result.push([sum, largestExp]);
        }

        return result;
    }


    function hOmegaSquared(n) {
        var t1, t2;
        if (n < 26) {
            t1 = n << n;
            t2 = (n + 1) << (n + 1);
        } else {
            t1 = Math.floor(n) * Math.pow(2, Math.floor(n));
            t2 = Math.ceil(n) * Math.pow(2, Math.ceil(n));
        }
        return t1 * (1 - (n % 1)) + t2 * (n % 1);
    }

    function hW2ToSci(n) {
        if (n % 1 === 0) {
            var fractionalLog = (n + Math.log2(n)) * Math.log10(2);
            var significand = Math.pow(10, fractionalLog % 1);
            var exp = Math.floor(fractionalLog);
            return [significand, exp];
        } else {
            var f = hW2ToSci(Math.floor(n));
            var c = hW2ToSci(Math.ceil(n));
            if (f[1] === c[1]) {
                return [f[0] * (1 - (n % 1)) + c[0] * (n % 1), f[1]];
            } else {
                var t = f[0] * (1 - (n % 1)) + (c[0] * 10) * (n % 1);
                if (t >= 10) {
                    return [t / 10, c[1]];
                } else {
                    return [t, f[1]];
                }
            }
        }
    }

    class HugeNumber {
        constructor(sign, ord, n) {
            this.sign = sign;
            this.ord = normalizeOrd(ord);
            this.n = n;
            if (this.ord && typeof this.ord === "number") {
                this.n += this.ord;
                this.ord = 0;
            } else {
                var constTerm = this.ord.filter((e) => e[1] === 0)[0];
                var omegaTerm = this.ord.filter((e) => e[1] === 1)[0];

                if (!constTerm && omegaTerm) {
                    this.ord = this.ord.filter((e) => e[1] !== 1);
                    this.n *= Math.pow(2, omegaTerm[0]);
                } else if (constTerm && omegaTerm) {
                    this.ord = this.ord.filter((e) => e[1] >= 2);
                    this.n += constTerm[0];
                    this.n *= Math.pow(2, omegaTerm[0]);
                }
                if (jsonEq(this.ord, [[1, 2]]) && this.n < 1014.00984251968) {
                    this.ord = 0;
                    this.n = hOmegaSquared(this.n);
                }
            }
        }

        abs() {
            return new HugeNumber(1, this.ord, this.n);
        }

        neg() {
            return new HugeNumber(-this.sign, this.ord, this.n);
        }

        negAbs() {
            return new HugeNumber(-1, this.ord, this.n);
        }
    }
    return HugeNumber;
})();


// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}