var HugeNumber = (function () {
    function hyperE(a, h) {
        var n = a.length;
        var b = a[n - 2];
        var p = a[n - 1];
        var x = h[n - 2];
        if (n === 1) {
            // console.log("1.", a, h);
            return Math.pow(10, p);
        } else if (p === 1) {
            // console.log("2.", a, h);
            return hyperE(a.slice(0, n - 1), h.slice(0, n - 2));
        } else if (x > 1 && 1 < p && p <= 2) {
            // console.log("3.", a, h);
            var at = a.slice(0, n - 2);
            return hyperE(at.concat([b, Math.pow(b, p - 1)]), h.slice(0, n - 3).concat([x - 1]));
        } else if (1 < p && p <= 2) {
            // console.log("4.", a, h);
            var at = a.slice(0, n - 2);
            var temp = Math.pow(hyperE(at.concat([b]), h.slice(0, n - 2)), p - 1);
            return hyperE(at.concat(Math.pow(b, 2 - p) * temp), h.slice(0, n - 3));
        } else if (x > 1 && p > 2) {
            // console.log("5.", a, h);
            var at = a.slice(0, n - 2);
            return hyperE(at.concat([b, b, p - 1]), h.slice(0, n - 3).concat([x - 1, x]));
        } else if (p > 2) {
            // console.log("6.", a, h);
            var at = a.slice(0, n - 2);
            var temp = hyperE(at.concat([b, p - 1]), h.slice(0, n - 3).concat([1]));
            return hyperE(at.concat(temp), h.slice(0, n - 3).concat([1]));
        } else {
            // console.log("7.", a, h);
            throw Error("No hyper-E rules are matched: a=" + a + ", h=" + h);
        }
    }

        class HugeNumber {
            constructor(sign, a, h) {
                this.sign = sign;
                this.a = a;
                this.h = h;
                this.normalize();
            }

            normalize() {
                for (var i = 0; i < 10; i++) {
                    var flag = true;
                    var flag2 = true;
                    var n = this.a.length;
                    var b = this.a[n - 2];
                    var p = this.a[n - 1];
                    var x = this.h[n - 2];
                    if(n === 1) {
                        break;
                    } else if (p === 1) {
                        this.a = this.a.slice(0, n - 1);
                        this.h = this.h.slice(0, n - 2);
                    } else if (x > 1 && 1 < p && p <= 2) {
                        var at = this.a.slice(0, n - 2);
                        this.a = at.concat([b, Math.pow(b, p - 1)]);
                        this.h = this.h.slice(0, n - 3).concat([x - 1]);
                    } else if (1 < p && p <= 2 && flag) {
                        var at = this.a.slice(0, n - 2);
                        var temp = Math.pow(hyperE(at.concat([b]), this.h.slice(0, n - 2)), p - 1);
                        if(Number.isFinite(temp)) {
                            this.a = at.concat(Math.pow(b, 2 - p) * temp)
                            this.h = this.h.slice(0, n - 3);
                        } else {
                            flag = false;
                        }
                    } else if (x > 1 && p > 2) {
                        var at = this.a.slice(0, n - 2);
                        return hyperE(at.concat([b, b, p - 1]), this.h.slice(0, n - 3).concat([x - 1, x]));
                    } else if (p > 2 && flag2) {
                        var at = this.a.slice(0, n - 2);
                        var temp = hyperE(at.concat([b, p - 1]), this.h.slice(0, n - 3).concat([1]));
                        if(Number.isFinite(temp)) {
                            this.a = at.concat(temp), this.h.slice(0, n - 3).concat([1]);
                            this.h = this.h.slice(0, n - 2);
                        } else {
                            flag2 = false;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        return HugeNumber;
    }) ();

    // Export if in node.js
    if (typeof module === "object") {
        module.exports = HugeNumber;
    }