const ARROW_LIMITS = [308.25471555991675, 2.396009145337229,1.3794884713808426,1.1397180753577167,1.0567974360219186,1.0239917509322818,1.0102964580665499,1.0044488304267691,1.0019278174114663,1.000836434476243,1.0003631070410433,1.0001576667610421,1.0000684684068455,1.0000297344333546,1.0000129133083444,1.0000056081423478,1.0000024355784451,1.0000010577569909,1.0000004593777803,1.0000001995051901,1.0000000866439955,1.0000000376290075,1.0000000163420704,1.0000000070972699,1.0000000030823064,1.0000000013386274,1.000000000581359,1.0000000002524811,1.000000000109651,1.0000000000476201,1.0000000000206821,1.0000000000089813,1.0000000000039009,1.0000000000016946,1.000000000000735,1.0000000000003197,1.0000000000001381,1.0000000000000608,1.0000000000000262,1.000000000000011,1.0000000000000062,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013,1.0000000000000013];

const LNLN2 = -0.36651292058166435;

const FS_EXPANSION_CAP = 100;

function tetr10(x) {
    if(-1 <= x && x <= 0) {
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
        }
    }

    if(ord === 0) {
        return 10 * n;
    } else if(ord === 1) {
        return Math.pow(10, n);
    } else if((ord >= 2 && n >= ARROW_LIMITS[0])
        || (ord >= 3 && n >= ARROW_LIMITS[1])) {
        return Infinity;
    } else if(ord[0] === 0 && ord[1] === 1) {
        return Math.pow(tgh([Math.floor(n)], 10), 1 - (n % 1)) * Math.pow(tgh([Math.ceil(n)], 10), (n % 1));
    } else {
        try {
            if(0 <= n && n <= 1) {
                return Math.pow(10, n);
            } else {
                var result = Math.pow(10, Math.pow(Math.log10(tgh(ord - 1, 10)), n % 1));
                for(var i = 0; i < Math.floor(n - 1); i++) {
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

console.log(tgh([[1,1]],1.5));