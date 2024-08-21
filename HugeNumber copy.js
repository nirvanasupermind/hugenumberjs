var HugeNumber = (function () {
    const LNLN2 = -0.36651292058166435;

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
        for (var i = ord.length - 1; i >= 0; i--) {
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
        if (n % 1 === 0 && n < 26) {
            return n << n;
        } else {
            return n * Math.pow(2, n);
        }
        // var t1, t2;
        // if (n < 26) {
        //     t1 = n << n;
        //     t2 = (n + 1) << (n + 1);
        // } else {
        //     t1 = Math.floor(n) * Math.pow(2, Math.floor(n));
        //     t2 = Math.ceil(n) * Math.pow(2, Math.ceil(n));
        // }
        // return t1 * (1 - (n % 1)) + t2 * (n % 1);
    }

    // Converts number from H_omega^2(n) to scientific notation
    function hOmegaSquaredToSci(n) {
        // if (n % 1 === 0) {
        var fractionalLog = (n + Math.log2(n)) * Math.log10(2);
        var sig = Math.pow(10, fractionalLog % 1);
        var exp = Math.floor(fractionalLog);
        return [sig, exp];
        // } else {
        //     var f = hOmegaSquaredToSci(Math.floor(n));
        //     var c = hOmegaSquaredToSci(Math.ceil(n));
        //     if (f[1] === c[1]) {
        //         return [f[0] * (1 - (n % 1)) + c[0] * (n % 1), f[1]];
        //     } else {
        //         var t = f[0] * (1 - (n % 1)) + (c[0] * 10) * (n % 1);
        //         if (t >= 10) {
        //             return [t / 10, c[1]];
        //         } else {
        //             return [t, f[1]];
        //         }
        //     }
        // }
    }

    // Computes Lambert W function of 2^x*ln(2)
    // This is a helper for sciToHOmegaSquared
    function w2ToXLN2(x) {
        var x0 = x * Math.LN2;
        for (var i = 0; i < 10; i++) {
            var a = (x0 + Math.log(x0 / Math.LN2)) / Math.LN2 - x;
            var b = (1 / x0 + 1) / Math.LN2;
            x0 = x0 - a / b;
        }
        return x0;
    }

    // // Uses asympotic series:
    // // W(x) = ln(x) - ln(ln(x)) + ln(ln(x))/ln(x)...

    // // var l1 = Math.log(x);
    // // var l2 = Math.log(l1);

    // var l1 = x * Math.LN2 + LNLN2; // ln(2^x * ln(2)) = x * ln(2) + ln(ln(2))
    // var l2 = Math.log(l1);

    // // First few terms of the asymptotic series
    // var t1 = l1;
    // var t2 = -l2;
    // var t3 = l2 / l1;
    // var t4 = (l2 * (2 - l2)) / (2 * l1 * l1);
    // var t5 = (l2 * (6 - 9 * l2 + 2 * l2 * l2)) / (6 * l1 * l1 * l1);
    // var t6 = (l2 * (-12 + 36 * l2 - 22 * l2 * l2 + 3 * l2 * l2 * l2)) / (12 * l1 * l1 * l1 * l1);
    // return t1 + t2 + t3 + t4 + t5 + t6;

    // Converts number from scientific notation to H_omega^2(n)
    function sciToHOmegaSquared(sig, exp) {
        var fractionalLog = (exp + Math.log10(sig)) * Math.log2(10);
        var t = w2ToXLN2(fractionalLog) / Math.LN2;
        return t;
        // var floorT = Math.floor(t);
        // var f = hOmegaSquaredToSci(floorT);
        // var c = hOmegaSquaredToSci(Math.ceil(t));
        // if (f[1] === exp && c[1] === exp) {
        //     return floorT + (sig - f[0]) / (c[0] - f[0]);
        // } else if (f[1] === exp - 1 && c[1] === exp) {
        //     var f0Div10 = f[0] / 10;
        //     return floorT + (sig - f0Div10) / (c[0] - f0Div10);
        // } else if (f[1] === exp && c[1] === exp + 1) {
        //     return floorT + (sig - f[0]) / ((c[0] * 10) - f[0]);
        // }
    }

    function ordToString(ord) {
        if (typeof ord === "number") {
            return ord;
        } else {
            var result = "";
            for (var i = 0; i < ord.length; i++) {
                var coef = (ord[i][0] === 1 ? "" : ord[i][0].toString());
                var exp = ordToString(ord[i][1]);
                if (ord[i][1] === 0) {
                    result += ord[i][0] + "+";
                } else if (ord[i][1] === 1) {
                    result += coef + "w+";
                } else {
                    if ((typeof ord[i][1] === "number") || (ord[i][1].length === 1 && ord[i][1][0][1] === 1)) {
                        result += coef + "w^" + exp + "+";
                    } else {
                        result += coef + "w^(" + exp + ")+";
                    }
                }
            }
            return result.slice(0, -1);
        }
    }
    class HugeNumber {
        constructor(sign, ord, n) {
            this.sign = sign;
            this.ord = normalizeOrd(ord);
            this.n = n;
            if (typeof this.ord === "number") {
                this.n += this.ord;
                this.ord = 0;
            } else {
                // console.log(this.ord);
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

        clone() {
            return new HugeNumber(this.sign, [...this.ord], this.n);
        }

        abs() {
            return new HugeNumber(1, [...this.ord], this.n);
        }

        neg() {
            return new HugeNumber(-this.sign, [...this.ord], this.n);
        }

        negAbs() {
            return new HugeNumber(-1, [...this.ord], this.n);
        }

        cmp(other) {
            if (this.sign === -1 && other.sign === -1) {
                return this.negAbs().cmp(other.negAbs());
            }
            if (jsonEq(this.ord, other.ord)) {
                return (this.n < other.n ? -1 : (this.n === other.n ? 0 : 1));
            } else {
                return cmpOrd(this.ord, other.ord);
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
            return this.lt(other) ? this.clone() : other;
        }

        max(other) {
            return this.gt(other) ? this.clone() : other;
        }

        add(other) {
            if (this.lt(other)) {
                return other.add(this);
            } else if (this.sign === -1 && other.sign === -1) {
                return this.negAbs().add(other.negAbs()).negAbs();
            } else if (this.sign === 1 && other.sign === -1) {
                return this.sub(other.negAbs());
            } else if (this.ord === 0 && other.ord === 0) {
                return new HugeNumber(1, 0, this.n + other.n);
            } else if (jsonEq(this.ord, [[1, 2]]) && other.ord === 0) {
                var [s, e] = hOmegaSquaredToSci(this.n);
                return new HugeNumber(1, [[1, 2]], sciToHOmegaSquared(s + other.n * Math.pow(10, -e), e));
            } else if (jsonEq(this.ord, [[1, 2]]) && jsonEq(other.ord, [[1, 2]])) {
                var [s1, e1] = hOmegaSquaredToSci(this.n);
                var [s2, e2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(1, [[1, 2]], sciToHOmegaSquared(s1 + s2 * Math.pow(10, e1 - e2), e1));
            } else {
                return this.clone();
            }
        }

        sub(other) {
            if (this.lt(other)) {
                return other.sub(this).neg();
            } else if (this.sign === -1 && other.sign === -1) {
                return this.negAbs().sub(other.negAbs()).negAbs();
            } else if (this.sign === 1 && other.sign === -1) {
                return this.add(other.negAbs());
            } else if (this.ord === 0 && other.ord === 0) {
                return new HugeNumber(1, 0, this.n - other.n);
            } else if (jsonEq(this.ord, [[1, 2]]) && other.ord === 0) {
                var [s, e] = hOmegaSquaredToSci(this.n);
                return new HugeNumber(1, [[1, 2]], sciToHOmegaSquared(s - other.n * Math.pow(10, -e), e));
            } else if (jsonEq(this.ord, [[1, 2]]) && jsonEq(other.ord, [[1, 2]])) {
                var [s1, e1] = hOmegaSquaredToSci(this.n);
                var [s2, e2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(1, [[1, 2]], sciToHOmegaSquared(s1 + s2 * Math.pow(10, e1 - e2), e1));
            } else {
                return this.clone();
            }
        }

        mul(other) {
            var sign = this.sign * other.sign;
            if (this.lt(other)) {
                return other.mul(this);
            } else if (this.ord === 0 && other.ord === 0) {
                return new HugeNumber(sign, 0, this.n * other.n);
            } else if (jsonEq(this.ord, [[1, 2]]) && other.ord === 0) {
                var [s, e] = hOmegaSquaredToSci(this.n);
                return new HugeNumber(sign, [[1, 2]], sciToHOmegaSquared(s * other.n, e));
            } else if (jsonEq(this.ord, [[1, 2]]) && jsonEq(other.ord, [[1, 2]])) {
                var [s1, e1] = hOmegaSquaredToSci(this.n);
                var [s2, e2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(sign, [[1, 2]], sciToHOmegaSquared(s1 * s2, e1 + e2));
            } else if (jsonEq(this.ord, [[2, 2]]) && jsonEq(other.ord, [[1, 2]])) {
                var [logS1, logE1] = hOmegaSquaredToSci(this.n);
                var [s2, e2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(sign, [[2, 2]], sciToHOmegaSquared(logS1 + (e2 + Math.log10(s2)) * Math.pow(10, -logE1), logE1));
            } else if (jsonEq(this.ord, [[2, 2]]) && jsonEq(other.ord, [[2, 2]])) {
                var [logS1, logE1] = hOmegaSquaredToSci(this.n);
                var [logS2, logE2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(1, [[2, 2]], sciToHOmegaSquared(logS1 + logS2 * Math.pow(10, logE1 - logE2), logE1));
            } else {
                return this.clone();
            }
        }

        div(other) {
            var sign = this.sign * other.sign;
            if (this.eq(other)) {
                return new HugeNumber(1, 0, 1);
            } else if (this.ord === 0 && other.ord === 0) {
                return new HugeNumber(sign, 0, this.n / other.n);
            } else if (jsonEq(this.ord, [[1, 2]]) && other.ord === 0) {
                var [s, e] = hOmegaSquaredToSci(this.n);
                return new HugeNumber(sign, [[1, 2]], sciToHOmegaSquared(s / other.n, e));
            } else if (jsonEq(this.ord, [[1, 2]]) && jsonEq(other.ord, [[1, 2]])) {
                var [s1, e1] = hOmegaSquaredToSci(this.n);
                var [s2, e2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(sign, [[1, 2]], sciToHOmegaSquared(s1 / s2, e1 - e2));
            } else if (jsonEq(this.ord, [[2, 2]]) && jsonEq(other.ord, [[1, 2]])) {
                var [logS1, logE1] = hOmegaSquaredToSci(this.n);
                var [s2, e2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(sign, [[2, 2]], sciToHOmegaSquared(logS1 - (e2 + Math.log10(s2)) * Math.pow(10, -logE1), logE1));
            } else if (jsonEq(this.ord, [[2, 2]]) && jsonEq(other.ord, [[2, 2]])) {
                var [logS1, logE1] = hOmegaSquaredToSci(this.n);
                var [logS2, logE2] = hOmegaSquaredToSci(other.n);
                return new HugeNumber(1, [[2, 2]], sciToHOmegaSquared(logS1 - logS2 * Math.pow(10, logE1 - logE2), logE1));
            } else if (this.lt(other)) {
                return new HugeNumber(1, 0, 0);xq
            } else {
                return this.clone();
            }
        }

        toString() {
            if (this.sign === -1) {
                return "-" + this.negAbs().toString();
            } else if (this.ord === 0) {
                return this.n.toString();
            } else if (jsonEq(this.ord, [[1, 2]])) {
                var [s, e] = hOmegaSquaredToSci(this.n);
                return s + "e+" + e;
            } else {
                return "H_" + ordToString(this.ord) + "(" + this.n + ")";
            }
        }
    }

    return HugeNumber;
})();


// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}