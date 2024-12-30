// Wrapping all code in the function
// so I can have private variables
var HugeNumber = (function () {
    const ARROW_LIMITS = [308.25471555991675, 2.396009145337229,1.3794884713808426,1.1397180753577167,1.0567974360219186,1.0239917509322818,1.0102964580665499,1.0044488304267691,1.0019278174114663,1.000836434476243,1.0003631070410433,1.0001576667610421,1.0000684684068455,1.0000297344333546,1.0000129133083444,1.0000056081423478,1.0000024355784451,1.0000010577569909,1.0000004593777803,1.0000001995051901,1.0000000866439955,1.0000000376290075,1.0000000163420704,1.0000000070972699,1.0000000030823064,1.0000000013386274,1.000000000581359,1.0000000002524811,1.000000000109651,1.0000000000476201,1.0000000000206821,1.0000000000089813,1.0000000000039009,1.0000000000016946,1.000000000000735,1.0000000000003197,1.0000000000001381,1.0000000000000608,1.0000000000000262,1.000000000000011,1.0000000000000062,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013];

    const LNLN2 = -0.36651292058166435;

    const FS_EXPANSION_CAP = 100;

    function getArrowLimit(x) {
        return ARROW_LIMITS[x - 1] || 1;
    }

    function tetr10(x) {
        if(x >= ARROW_LIMITS[1]) {
            return Infinity;
        } else if(-1 <= x && x <= 0) {
            return x + 1;
        } else {
            return Math.pow(10, tetr10(x - 1));
        }   
    }
    
    function slog10(x) {
        if(0 <= x && x <= 1) {
            return x - 1;
        } else {
            return slog10(Math.log10(x)) + 1;
        }   
    }


    function pent10(x) {
        if(x >= ARROW_LIMITS[2]) {
            return Infinity;
        } else if(0 <= x && x <= 1) {
            return Math.pow(10, x);
        } else {
            return tetr10(pent10(x - 1));
        }   
    }
    
    function sslog10(x) {
        if(1 <= x && x <= 10) {
            return Math.log10(x);
        } else {
            return sslog10(slog10(x)) + 1;
        }   
    }

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

    function decOrd(x) {
        return typeof x === "number" ? x - 1 : normalizeOrd(x.slice(0,-1).concat([[x[x.length - 1][0] - 1, x[x.length - 1][1]]]));
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
                result = result.filter((e) => !jsonEq(e[1], ord[i][1]) && e[0] !== 0);
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


        for(var i = 0; i < result.length - 1; i++) {
            if(cmpOrd(result[i][1], result[i + 1][1]) === 0) {
                result = result.slice(0, i - 1).concat([[result[i][0] + result[i + 1][0], result[i][1]]]).concat(result.slice(i + 1));
            }
        }
        return result;
    }

    // Returns string representation of an ordinal
    function ordToString(ord) {
        if (typeof ord === "number") {
            return ord;
        } else {
            var result = "";
            for (var i = 0; i < ord.length; i++) {
                var coef = (ord[i][0] === 1 ? "" : "*" + ord[i][0].toString());
                var exp = ordToString(ord[i][1]);
                if (ord[i][1] === 0) {
                    result += ord[i][0] + "+";
                } else if (ord[i][1] === 1) {
                    result += "ω" + coef + "+";
                } else {
                    if ((typeof ord[i][1] === "number") || (ord[i][1].length === 1 && ord[i][1][0][1] === 1)) {
                        result += "ω^" + exp + coef + "+";
                    } else {
                        result += "ω^(" + exp + ")" + coef + "+";
                    }
                }
            }
            return result.slice(0, -1);
        }
    }

    // Check if ord is a limit ordinal

    function isLimitOrd(ord) {
        if (typeof ord === "number") {
            return false;
        }

        return ord.filter((e) => e[1] === 0).length === 0;
    }


    // // Decrement (subtract 1) from ord
    // // Only works for non-limit ordinals
    // function dec(ord) {
    //     if(typeof ord === "number") {
    //         return ord - 1;
    //     }
        
    //     var constantTerm = ord[ord.length - 1][0];
    //     return ord.slice(0, -1).concat(constantTerm - 1);
    // }

    // Get the nth term of the fundamental sequence of ord
    function getFSTerm(ord, n) {
        if (jsonEq(ord, [[1, 1]])) {
            return n;
        } else if (ord.length === 1) {
            if (isLimitOrd(ord[0][1])) {
                return [[ord[0][0] - 1, ord[0][1]], [1, getFSTerm(ord[0][1], n)]];
            } else {
                return [[ord[0][0] - 1, ord[0][1]], [n, dec(ord[0][1])]];
            }
        } else {
            var higherTerms = ord.slice(0, -1);
            var lowestTerm = [ord[ord.length - 1]];
            return higherTerms.concat(getFSTerm(lowestTerm, n));
        }
    }

    // 10-growing hierarchy
    // (THIS FUNCTION OPERATES ON JS NUMBERS, NOT HUGENUMBERS. THIS IS JUST A UTILITY FUNCTION.)
    function tgh(ord, n) {
        if(Array.isArray(ord)) {
            if(n >= 3) {
                return Infinity;
            }

            if(JSON.stringify(ord[0]) === "[1,1]") {
                if(ord.length === 1) {
                    return Math.pow(tgh(Math.floor(n), n), 1 - (n % 1)) * Math.pow(tgh(Math.ceil(n), n), n % 1);
                } else {
                    // return Infinity;
                    try {
                        var pred = normalizeOrd([[1, 1], [ord[1][0] - 1, 0]]);
                        var result = Math.pow(10, Math.pow(Math.log10(tgh(pred, 10)), n % 1));

                        for(var i = 0; i < Math.floor(n - 1); i++) {
                            result = tgh(pred, result);
                            if(result === Infinity) {
                                break;
                            }
                        }
                        return result;
                    }
                    catch(e) {
                        return Infinity;
                    }
                }
            } else {
                return Infinity;
            }
        }

        if(ord === 0) {
            return 10 * n;
        } else if(ord === 1) {
            return Math.pow(10, n);
        } else if(ord === 2) {
            return tetr10(n);
        } else if(ord === 3) {
            return pent10(n);
        } else if(ord >= 4 && n >= ARROW_LIMITS[3]) {
            return Infinity;
        } else if(ord[0] === 0 && ord[1] === 1) {
            return Math.pow(tgh([Math.floor(n)], 10), 1 - (n % 1)) * Math.pow(tgh([Math.ceil(n)], 10), (n % 1));
        } else {
            try {
                if(0 <= n && n <= 1) {
                    return Math.pow(10, n);
                } else {
                    var result = Math.pow(10, n % 1);
                    // var result = Math.pow(10, Math.pow(Math.log10(tgh(ord - 1, 10)), n % 1));
                    for(var i = 0; i < Math.floor(n); i++) {
                        result = tgh(ord - 1, result);
                    }
                    return result;
                }
            }
            catch(e) {
                return Infinity;
            }
        }
    }

    class HugeNumber {
        constructor(sign, ord, n) {
            this.sign = sign
            this.ord = normalizeOrd(ord);
            this.n = n;
            if(!Number.isFinite(this.n)) {
                this.ord = 0;
            } else {
            var i = 0;

            while(isLimitOrd(this.ord) && i < FS_EXPANSION_CAP) {
                this.ord = normalizeOrd(getFSTerm(this.ord, Math.ceil(this.n)));
                i++;
            }

            while(this.n <= 2 && !isLimitOrd(this.ord)) {
                this.ord = decOrd(this.ord);
                this.n = Math.pow(10, this.n - 1);
            }

            var num = tgh(this.ord, this.n);
            if(Number.isFinite(num)) {
                this.ord = 0;
                this.n = num * 0.1;
            } else {
                if(this.ord <= Number.MAX_SAFE_INTEGER) {
                    // console.log(getArrowLimit(this.ord) + 1, this.n);
                    while(this.n < (getArrowLimit(this.ord) + 1) && this.ord >= 0) {
                        this.n = tgh(this.ord, this.n - 1);
                        this.ord--;
                    }
                    num = tgh(this.ord, this.n);

                }
            }
        }
        }

        clone() {
            return new HugeNumber(this.sign, this.ord, this.n);
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

        cmp(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if (this.sign === -1 && other.sign === -1) {
                return this.negAbs().cmp(other.negAbs());
            } else if(this.sign === -1 && other.sign === 1) {
                return -1;
            } else if(this.sign === 1 && other.sign === -1) {
                return 1;    
            }

            if (jsonEq(this.ord, other.ord)) {
                return (this.n < other.n ? -1 : (this.n === other.n ? 0 : 1));
            } else {
                return cmpOrd(this.ord, other.ord);
            }
        }
        

        eq(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) === 0;
        }

        ne(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) !== 0;
        }

        lt(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) < 0;
        }

        le(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) <= 0;
        }

        gt(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) > 0;
        }

        ge(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.cmp(other) >= 0;
        }

        min(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.lt(other) ? this.clone() : other;
        }

        max(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return this.gt(other) ? this.clone() : other;
        }

        add(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // Deal with negative arguments
            if(this.sign === -1 && other.sign === -1) {
                return this.abs().add(other.abs()).negAbs();
            } else if(this.sign === -1 && other.sign === 1) {
                return other.sub(this.abs());
            } else if(this.sign === 1 && other.sign === -1) {
                return this.sub(other.abs());
            } else {
                // Main case: Both arguments are positive
                if(this.ord === 0 && other.ord === 0) {
                    return new HugeNumber(1, 0, this.n + other.n);
                } else if(this.ord === 1 && other.ord === 0) {
                    var temp = Math.log10(1 + Math.pow(10, Math.log10(other.n) + 1 - this.n));
                    if(Number.isFinite(temp)) {
                        return new HugeNumber(1, 1, this.n + temp);
                    } else {
                        return other.clone();
                    }                    
                } else if(this.ord === 0) {
                    return other.add(this);
                } else if(this.ord === 1 && other.ord === 1) {
                    var temp = Math.log10(1 + Math.pow(10, other.n - this.n));
                    if(Number.isFinite(temp)) {
                        return new HugeNumber(1, 1, this.n + temp);
                    } else {
                        return other.clone();
                    }
                } else {
                    return this.max(other);
                }
            }
        }

        sub(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // Deal with negative arguments
            if(this.sign === -1 && other.sign === -1) {
                return this.abs().sub(other.abs()).negAbs();
            } else if(this.sign === -1 && other.sign === 1) {
                return other.add(this.abs());
            } else if(this.sign === 1 && other.sign === -1) {
                return this.add(other.abs());
            } else {
                // Main case: Both arguments are positive
                if(this.ord === 0 && other.ord === 0) {
                    return new HugeNumber(1, 0, this.n - other.n);
                } else if(this.ord === 1 && other.ord === 0) {
                    var temp = Math.log10(Math.abs(1 - Math.pow(10, Math.log10(other.n) + 1 - this.n)));
                    if(Number.isFinite(temp)) {
                        return new HugeNumber(1, 2, slog10(x + temp) + 2);
                    } else {
                        return other.clone();
                    }             
                } else if(this.ord === 0) {
                    return other.add(this);
                } else if(this.ord === 1 && other.ord === 1) {
                    var temp = Math.log10(Math.abs(1 - Math.pow(10, other.n - this.n)));
                    if(Number.isFinite(temp)) {
                        return new HugeNumber(1, 1, this.n + temp);
                    } else {
                        return other.clone();
                    }
                } else {
                    return this.max(other);
                }
            }
        }

        mul(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }
            
            var sign = this.sign * other.sign;

            if(this.ord === 0 && other.ord === 0) {
                var temp = this.n * other.n * 10;
                if(Number.isFinite(temp)) {
                    return new HugeNumber(sign, 0, temp);           
                } else {
                    return new HugeNumber(sign, 1, Math.log10(this.n) + Math.log10(other.n) + 2);                               
                }
            } else if(this.ord === 1 && other.ord === 0) {
                return new HugeNumber(sign, 0, this.n + Math.log10(other.n) + 1);                   
            } else if(this.ord === 0) {
                return other.mul(this);
            } else if(this.ord === 1 && other.ord === 1) {
                return new HugeNumber(sign, 1, this.n + other.n);
            } else if(this.ord === 2 && other.ord === 2) {
                var x = tetr10(this.n - 2);
                var y = other.ord === 2 ? tetr10(other.n - 2) :  Math.log10(other.n);
                if(Number.isFinite(x) && Number.isFinite(y)) {
                var temp = Math.log10(1 + Math.pow(10, y - x));
                if(Number.isFinite(temp)) {
                    return new HugeNumber(1, 2, slog10(x + temp) + 2);
                } else {
                    return other.clone();
                }
            } else {
                return this.max(other);
            }
            } else if(this.ord === 1) {
                return other.mul(this);
            } else {
                return this.max(other);
            }
        }

        div(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            if(this.eq(other)) {
                return new HugeNumber(1, 0, 0.1);
            }

            var sign = this.sign * other.sign;

            if(this.ord === 0 && other.ord === 0) {
                return new HugeNumber(sign, 0, (this.n / other.n) * 0.1);
            } else if(this.ord === 1 && other.ord === 0) {
                return new HugeNumber(sign, 1, this.n - Math.log10(other.n) - 1);                   
            }  else if(this.ord === 0 && other.ord === 1) {
                return new HugeNumber(sign, 1, Math.log10(this.n) + 1 - other.n);            
            } else if(this.ord === 1 && other.ord === 1) {
                return new HugeNumber(sign, 1, this.n - other.n);
            } else if(this.ord === 2 || other.ord === 2) {
                var x = this.ord === 2 ? tetr10(this.n - 2) : Math.log10(this.n);
                var y = other.ord === 2 ? tetr10(other.n - 2) : Math.log10(other.n);
                if(Number.isFinite(x) && Number.isFinite(y)) {
                    var temp = Math.log10(Math.abs(1 - Math.pow(10, y - x)));
                    if(Number.isFinite(temp)) {
                        return new HugeNumber(1, 2, slog10(x + temp) + 2);
                    } else {
                        return other.clone();
                    }
                } else {
                    return this.lt(other) ? new HugeNumber(1, 0) : this.clone();
                }
            } else {
                return this.lt(other) ? new HugeNumber(1, 0) : this.clone();
            }
        }

        // Modulo
        mod(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            // Use property that x % y = x - (floor(x / y) * y)
            return this.abs().sub(this.abs().div(other).floor().mul(other));
        }
        
                
        // Floor
        floor() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.floor(n));
            } else {
                return this.clone();
            }
        }

        // Ceilling
        ceil() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.ceil(n));
            } else {
                return this.clone();
            }
        }

        // Round to nearest integer
        round() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.round(n));
            } else {
                return this.clone();
            }
        }

        // Sine
        sin() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.sin(n));
            } else {
                // If the number is beyond 2^1024, we've lost too much precision to compute sine anyway, so just return NaN
                // Same thing for other trignometric functions
                return HugeNumber.fromNumber(NaN);
            }
        }

        // Cosine
        cos() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.cos(n));
            } else {
                return HugeNumber.fromNumber(NaN);
            }
        }

        // Tangent
        tan() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.tan(n));
            } else {
                return HugeNumber.fromNumber(NaN);
            }
        }

        // Inverse sine
        asin() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.asin(n));
            } else {
                return HugeNumber.fromNumber(NaN);
            }
        }

        // Inverse cosine
        acos() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.acos(n));
            } else {
                return HugeNumber.fromNumber(NaN);
            }
        }

        // Inverse tangent
        atan() {
            var n = this.toNumber();
            if (Number.isFinite(n)) {
                return HugeNumber.fromNumber(Math.atan(n));
            } else {
                return HugeNumber.fromNumber(NaN);
            }
        }


        // Base-10 exponentiation
        exp10() {
            if(this.sign === -1) {
                // 10^(-x) = 1/(10^x)
                return new HugeNumber(1, 0, 0.1).div(this.abs().exp10());
            }
            
            var num = this.toNumber();
            if (Number.isFinite(num)) {
                return new HugeNumber(1, 1, num);
            } else if(this.ord === 0) {
                return  new HugeNumber(1, 2, slog10(Math.log10(this.n) + 1) + 2);
            } else if(this.ord === 1) {
                return  new HugeNumber(1, 2, slog10(this.n) + 2);
            } else if(this.ord === 2) {
                return new HugeNumber(1, 2, this.n + 1);
            } else {
                return this.clone();
            }
        }

        // Base-e exponentiation
        exp() {
            return this.mul(Math.LOG10E).exp10();
        }
    
        // Exponentiation
        pow(other) {
            if (typeof other === "number") {
                other = HugeNumber.fromNumber(other);
            }

            return other.mul(this.log10()).exp10();
        }

        // Base-10 logarithm
        log10() {
            if(this.ord === 0) {
                return new HugeNumber(1, 0, (Math.log10(this.n) + 1) * 0.1);
            } else if(this.ord === 1) {
                return  new HugeNumber(1, 0, this.n * 0.1);
            } else if(this.ord === 2) {
                return new HugeNumber(1, 2, this.n - 1);
            } else {
                return this.clone();
            }
        }

        // Base-e logarithm
        log() {
            return this.log10().mul(Math.LN10);
        }

        // Arbitrary base logarithm
        logb(base) {
            if (typeof base === "number") {
                base = HugeNumber.fromNumber(base);
            }

            return this.log10().div(base.log10());
        }


        // Base-10 tetration
        tetr10() {
            var num = this.toNumber();
            if(-2 < num && num <= -1) {
                return this.add(2).log10();
            } else if(-1 <= num && num <= 0) {
                return this.add(1);
            } else if (0 < num && num <= 1) {
                return this.exp10();
            } else if(Number.isFinite(num)) {
                return  new HugeNumber(1, 2, num);
            } else if(this.ord === 1) {
                return  new HugeNumber(1, 3, 2 + Math.log10(slog10(this.n) + 1));
            } else if(this.ord === 2) {
                return new HugeNumber(1, 3, sslog10(this.n) + 2);
            } else if(this.ord === 3) {
                return new HugeNumber(1, 3, this.n + 1);
            } else {
                return this.clone();
            }
        }

        tgh(ord) {
            var num = this.toNumber();
            var successor = typeof ord === "number" ? ord + 1 : normalizeOrd(ord.concat([[1,0]]));
            if(Number.isFinite(num)) {
                return  new HugeNumber(1, ord, num);
            } else if(cmpOrd(this.ord, successor) === -1) {
                var low = 1;
                var high = 2.4;
                var mid = (low + high) / 2;
                for(var i = 0; i < 100; i++) {
                    mid = (low + high) / 2;
                    var temp = new HugeNumber(1, successor, mid);
                    if(temp.lt(this)) {
                        low = mid;  
                    } else if(temp.gt(this)) {
                        high = mid;
                    } else {
                        break;
                    }
                }
                return new HugeNumber(1, successor, mid + 1).max(this);
            } else if(jsonEq(this.ord, successor)) {
                return new HugeNumber(1, successor, this.n + 1);
            } else {
                return this.clone();
            }
        }

        isFinite() {
            return Number.isFinite(this.n);
        }

        isNaN() {
            return Number.isNaN(this.n);
        }

        // Converts HugeNumber to JS number
        toNumber() {
            if(this.ord === 0) {
                return this.sign * this.n * 10;
            } else {
                return this.sign * Infinity;
            }
        }

        // Converts HugeNumber to a string representation
        toString() {
            if(this.ord === 0) {
                if(this.n >= (Number.MAX_VALUE / 10)) {
                    return this.n.toString().replace(/308/g,"309").replace(/307/g,"308");
                }
                return (this.n * 10).toString();
            } else if(this.ord === 1) {
                var exponent = Math.floor(this.n);
                var mantissa = Math.pow(10, this.n - exponent);
                return mantissa + "e+" + exponent;
            } else {
                return "[10]_" + ordToString(this.ord) + "(" + this.n + ")";
            }
        }
        
        static fromNumber(n) {
            return new HugeNumber(1, 0, n * 0.1);
        }
    }

    return HugeNumber;
})();

// Export if in node.js
if (typeof module === "object") {
    module.exports = HugeNumber;
}


// var HugeNumber = (function () {
//     const LNLN2 = -0.36651292058166435;

//     // function dh(ord, n) {
//     //     if(ord === 0) {
//     //         return n;
//     //     } else if(typeof ord === "number") {
//     //         return dh(ord - 1, Math.pow(10, n));
//     //     }
//     // }

//     function jsonEq(a, b) {
//         return JSON.stringify(a) === JSON.stringify(b);
//     }


//     function cmpOrd(a, b) {
//         if (typeof a === "number" && typeof b === "number") {
//             return (a < b ? -1 : (a === b ? 0 : 1));
//         } else if (typeof a === "number") {
//             return -1;
//         } else if (typeof b === "number") {
//             return 1;
//         } else {
//             for (var i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
//                 var t1 = i >= a.length ? 0 : a[i][1];
//                 var t2 = i >= a.length ? 0 : b[i][1];
//                 if (cmpOrd(t1, t2) === -1) {
//                     return -1;
//                 } else if (cmpOrd(t1, t2) === 1) {
//                     return 1;
//                 }
//                 var t3 = i >= a.length ? 0 : a[i][0];
//                 var t4 = i >= a.length ? 0 : b[i][0];
//                 if (t3 < t4) {
//                     return -1;
//                 } else if (t3 > t4) {
//                     return 1;
//                 }
//             }

//             return 0;
//         }
//     }

//     function normalizeOrd(ord) {
//         if (typeof ord === "number") {
//             return ord;
//         } else if (ord.length === 0) {
//             return 0;
//         } else if (ord.length === 1 && ord[0][1] === 0) {
//             return ord[0][0];
//         }

//         var result = [...ord].map((e) => [e[0], normalizeOrd(e[1])]).filter((e) => e !== 0 && (e[0] !== 0));
//         var largestExp = 0;
//         // var indicesToRemove = [];
//         for (var i = ord.length - 1; i >= 0; i--) {
//             if (cmpOrd(ord[i][1], largestExp) >= 0) {
//                 largestExp = ord[i][1];
//             } else {
//                 result = result.filter((e) => !jsonEq(e[1], ord[i][1]) && e[0] !== 0);
//             }
//         }

//         var largestExpTerms = result.filter((e) => jsonEq(e[1], largestExp));
//         if (largestExpTerms.length > 1) {
//             var sum = 0;
//             for (var i = 0; i < largestExpTerms.length; i++) {
//                 sum += largestExpTerms[i][0];
//             }
//             result = result.filter((e) => !largestExpTerms.includes(e));
//             result.push([sum, largestExp]);
//         }

//         return result;
//     }

//     // 

//     function ordToString(ord) {
//         if (typeof ord === "number") {
//             return ord;
//         } else {
//             var result = "";
//             for (var i = 0; i < ord.length; i++) {
//                 var coef = (ord[i][0] === 1 ? "" : "*" + ord[i][0].toString());
//                 var exp = ordToString(ord[i][1]);
//                 if (ord[i][1] === 0) {
//                     result += ord[i][0] + "+";
//                 } else if (ord[i][1] === 1) {
//                     result += "ω" + coef + "+";
//                 } else {
//                     if ((typeof ord[i][1] === "number") || (ord[i][1].length === 1 && ord[i][1][0][1] === 1)) {
//                         result += "ω^" + exp + coef + "+";
//                     } else {
//                         result += "ω^(" + exp + ")" + coef + "+";
//                     }
//                 }
//             }
//             return result.slice(0, -1);
//         }
//     }

//     // Check if ord is a limit ordinal

//     function isLimitOrd(ord) {
//         if (typeof ord === "number") {
//             return false;
//         }

//         return ord.filter((e) => e[1] === 0).length === 0;
//     }


//     // Decrement (subtract 1) from ord
//     // Only works for non-limit ordinals
//     function dec(ord) {
//         if(typeof ord === "number") {
//             return ord - 1;
//         }
        
//         var constantTerm = ord[ord.length - 1][0];
//         return ord.slice(0, -1).concat(constantTerm - 1);
//     }

//     // Get the nth term of the fundamental sequence of ord
//     function getFSTerm(ord, n) {
//         if (jsonEq(ord, [[1, 1]])) {
//             return n;
//         } else if (ord.length === 1) {
//             if (isLimitOrd(ord[0][1])) {
//                 return [[ord[0][0] - 1, ord[0][1]], [1, getFSTerm(ord[0][1], n)]];
//             } else {
//                 return [[ord[0][0] - 1, ord[0][1]], [n, dec(ord[0][1])]];
//             }
//         } else {
//             var higherTerms = ord.slice(0, -1);
//             var lowestTerm = [ord[ord.length - 1]];
//             return higherTerms.concat(getFSTerm(lowestTerm, n));
//         }
//     }

//     class HugeNumber {
//         constructor(sign, ord, n) {
//             // console.log("!", sign, ord, n);
//             this.sign = sign;
//             this.ord = normalizeOrd(ord);
//             this.n = n;
//             while(isLimitOrd(this.ord)) {
//                 this.ord = normalizeOrd(getFSTerm(this.ord, Math.ceil(n)));
//                 this.n = Math.ceil(n);
//             }
//             if(typeof this.ord === "number") {
//                 while(this.ord > 0 && this.n <= 308.25471555991675) {
//                     this.ord = dec(this.ord);
//                     this.n = Math.pow(10, this.n);                
//                 }
//             }
//         }

//         clone() {
//             return new HugeNumber(this.sign, [...this.ord], this.n);
//         }

//         cmp(other) {
//             if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().cmp(other.negAbs());
//             }
//             if (jsonEq(this.ord, other.ord)) {
//                 return (this.n < other.n ? -1 : (this.n === other.n ? 0 : 1));
//             } else {
//                 return cmpOrd(this.ord, other.ord);
//             }
//         }

//         eq(other) {
//             return this.cmp(other) === 0;
//         }

//         ne(other) {
//             return this.cmp(other) !== 0;
//         }

//         lt(other) {
//             return this.cmp(other) < 0;
//         }

//         le(other) {
//             return this.cmp(other) <= 0;
//         }

//         gt(other) {
//             return this.cmp(other) > 0;
//         }

//         ge(other) {
//             return this.cmp(other) >= 0;
//         }

//         min(other) {
//             return this.lt(other) ? this.clone() : other;
//         }

//         max(other) {
//             return this.gt(other) ? this.clone() : other;
//         }

//         add(other) {
//             if (this.lt(other)) {
//                 return other.add(this);
//             } else if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().add(other.negAbs()).negAbs();
//             } else if (this.sign === 1 && other.sign === -1) {
//                 return this.sub(other.negAbs());
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(1, 0, this.n + other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(1 + Math.pow(10, y - this.n));
//                 return new HugeNumber(1, 1, this.n + gaussianLog);
//             } else {
//                 return this.clone();
//             }
//         }

//         sub(other) {
//             if (this.lt(other)) {
//                 return other.sub(this).neg();
//             } else if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().sub(other.negAbs()).negAbs();
//             } else if (this.sign === 1 && other.sign === -1) {
//                 return this.add(other.negAbs());
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(1, 0, this.n - other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, y - this.n)));
//                 return new HugeNumber(1, 1, this.n + gaussianLog);
//             } else {
//                 return this.clone();
//             }
//         }

//         mul(other) {
//             var sign = this.sign * other.sign;
//             if (this.lt(other)) {
//                 return other.mul(this);
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(1, 0, this.n * other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 return new HugeNumber(1, 0, this.n + (other.ord === 0 ? Math.log10(other.n) : other.n));
//             } else if (this.ord === 2 && (other.ord === 1 || other.ord === 2)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(1 + Math.pow(10, y - this.n));
//                 return new HugeNumber(1, 2, this.n + gaussianLog);
//             } else {
//                 return this.clone();
//             }
//         }

//         div(other) {
//             var sign = this.sign * other.sign;
//             if (this.eq(other)) {
//                 return new HugeNumber(sign, 0, 1);
//             } else if (this.ord === 0 && other.ord === 0) {
//                 return new HugeNumber(sign, 0, this.n / other.n);
//             } else if (this.ord === 1 && (other.ord === 0 || other.ord === 1)) {
//                 return new HugeNumber(sign, 0, this.n - (other.ord === 0 ? Math.log10(other.n) : other.n));
//             } else if (this.lt(other)) {
//                 return new HugeNumber(sign, 0, 0);
//             } else if (this.ord === 2 && (other.ord === 1 || other.ord === 2)) {
//                 var y = other.n === 0 ? Math.log10(other.n) : other.n;
//                 var gaussianLog = Math.log10(Math.abs(1 - Math.pow(10, y - this.n)));
//                 return new HugeNumber(sign, 2, this.n + gaussianLog);
//             } else if (this.gt(other)) {
//                 return this.clone();
//             }
//         }

//         pow10() {
//             if(this.sign === -1) {
//                 return new HugeNumber(1, 0, Math.pow(10, -this.toNumber()));
//             } else if (typeof this.ord === "number") {
//                 return new HugeNumber(1, this.ord + 1, this.n);
//             } else if(jsonEq(this.ord, [[1, 1]])) {
//                 return new HugeNumber(1, this.ord, this.n + 1);                
//             } else {
//                 return this.clone();
//             }
//         }

//         log10() {
//             if(this.ord === 0) {
//                 return new HugeNumber(sign, 0, Math.log10(this.n));
//             } else if(typeof this.ord === "number") {
//                 return new HugeNumber(sign, this.ord - 1, this.n);
//             } else if(jsonEq(this.ord, [[1, 1]])) {
//                 return new HugeNumber(sign, this.ord, this.n - 1);                
//             } else {
//                 return this.clone();
//             }
//         }


//         pow(other) {
//             return other.mul(this.log10()).pow10();
//         }

//         tetr10() {
//             if (typeof this.ord === "number") {
//                 return new HugeNumber(1, Math.floor(this.n), Math.pow(10, this.n % 1));
//             } else if(cmpOrd(this.ord, [[1, 2]]) === -1) {
//                 return new HugeNumber(1, [[1, 1]].concat(this.ord), this.n);                
//             } else if(jsonEq(this.ord, [[1, 2]])) {
//                 return new HugeNumber(1, [[1, 2]], this.n + 1);
//             } else {
//                 return this.clone();
//             }
//         }

//         pent10() {
//             if (typeof this.ord === "number") {
//                 console.log([[this.n, 1]], Math.pow(10, this.n % 1));
//                 return new HugeNumber(1,  [[this.n, 1]], 1);                
//             } else if(cmpOrd(this.ord, [[1, 3]]) === -1) {
//                 return new HugeNumber(1, [[1, 3]].concat(this.ord), this.n);                
//             } else if(jsonEq(this.ord, [[1, 2]])) {
//                 return new HugeNumber(1, [[1, 3]], this.n + 1);
//             } else {
//                 return this.clone();
//             }
//         }

//         // slog10() {
//         //     if(cmpOrd(this.ord, [[1, 2]]) === -1) {
//         //         console.log("!");
//         //         return new HugeNumber(1, [[1, 1]].concat(this.ord), this.n);                
//         //     } else if(jsonEq(this.ord, [[1, 2]])) {
//         //         return new HugeNumber(1, [[1, 2]], this.n + 1);
//         //     } else {
//         //         return this.clone();
//         //     }
//         // }


//         toNumber() {
//             if(this.ord === 0) {
//                 return this.sign * this.n;
//             } else {
//                 return this.sign * Infinity;
//             }
//         }


//         toString() {
//             if(this.ord === 0) {
//                 return this.n.toString();
//             } else {
//                 return "D_" + ordToString(this.ord) + "(" + this.n + ")";
//             }
//         }
//     }

//     return HugeNumber;
// })();


// // Export if in node.js
// if (typeof module === "object") {
//     module.exports = HugeNumber;
// }