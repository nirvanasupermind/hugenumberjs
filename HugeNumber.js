// Wrapping all code in the function
// so I can have private variables
var HugeNumber = (function () {
    // log10(Number.MAX_VALUE)
    const LOG10_MAX_VALUE = 308.25471555991675;

    function normalizePoly(poly) {
        var result = poly.slice();
        while(result[result.length - 1] === 0) {
            result.pop();
        } 
        return result;
    }

    function addPoly(poly1, poly2) {
        var result = [];
        for(var i = 0; i < poly1.length; i++) {
            if(i >= poly2.length) {
                result.push(poly1[i]);
            } else {
                result.push(poly1[i] + poly2[i]);
            }
        }
        return normalizePoly(result);
    }

    function getFSTerm(poly, n) {
        if (poly.slice(0, -1).filter((e) => e).length === 0) {
            if(poly[poly.length - 1] < 1) {
                return poly.slice(0, -2).concat([n * poly[poly.length - 1]]);
            }
            return poly.slice(0, -2).concat([n, poly[poly.length - 1] - 1]);
        } else {
            var leadingZeros = [];
            var i = 0;
           while(poly[i] === 0) {
                leadingZeros.push(0);
                i++;
            }

            return addPoly(leadingZeros.concat([0]).concat(poly.slice(i + 1)), getFSTerm(leadingZeros.concat(poly[i]), n));
        }
    }
    
    class HugeNumber {
        constructor(sign, n, polys) {
            this.sign = sign;
            this.n = n;
            this.polys = polys.map(normalizePoly);

            if(this.polys.length) {
                if(this.polys[0][0] !== 0) {
                    var i = 0;
                    for(var i = 0; i < this.polys.length; i++) {
                        if(JSON.stringify(this.polys[i]) === JSON.stringify(this.polys[i - 1])) {
                            this.polys = this.polys.slice(0, Math.max(i - 2, 0)).concat([addPoly(this.polys[0], [1])]).concat(this.polys.slice(i + 1));                         
                        }
                    }
                } else {
                    this.polys[0] = getFSTerm(this.polsy[0], n);
                }    
            }
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

//     // function dh(poly, n) {
//     //     if(poly === 0) {
//     //         return n;
//     //     } else if(typeof poly === "number") {
//     //         return dh(poly - 1, Math.pow(10, n));
//     //     }
//     // }

//     function jsonEq(a, b) {
//         return JSON.stringify(a) === JSON.stringify(b);
//     }


//     function cmpPoly(a, b) {
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
//                 if (cmpPoly(t1, t2) === -1) {
//                     return -1;
//                 } else if (cmpPoly(t1, t2) === 1) {
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

//     function normalizePoly(poly) {
//         if (typeof poly === "number") {
//             return poly;
//         } else if (poly.length === 0) {
//             return 0;
//         } else if (poly.length === 1 && poly[0][1] === 0) {
//             return poly[0][0];
//         }

//         var result = [...poly].map((e) => [e[0], normalizePoly(e[1])]).filter((e) => e !== 0 && (e[0] !== 0));
//         var largestExp = 0;
//         // var indicesToRemove = [];
//         for (var i = poly.length - 1; i >= 0; i--) {
//             if (cmpPoly(poly[i][1], largestExp) >= 0) {
//                 largestExp = poly[i][1];
//             } else {
//                 result = result.filter((e) => !jsonEq(e[1], poly[i][1]) && e[0] !== 0);
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

//     function polyToString(poly) {
//         if (typeof poly === "number") {
//             return poly;
//         } else {
//             var result = "";
//             for (var i = 0; i < poly.length; i++) {
//                 var coef = (poly[i][0] === 1 ? "" : "*" + poly[i][0].toString());
//                 var exp = polyToString(poly[i][1]);
//                 if (poly[i][1] === 0) {
//                     result += poly[i][0] + "+";
//                 } else if (poly[i][1] === 1) {
//                     result += "ω" + coef + "+";
//                 } else {
//                     if ((typeof poly[i][1] === "number") || (poly[i][1].length === 1 && poly[i][1][0][1] === 1)) {
//                         result += "ω^" + exp + coef + "+";
//                     } else {
//                         result += "ω^(" + exp + ")" + coef + "+";
//                     }
//                 }
//             }
//             return result.slice(0, -1);
//         }
//     }

//     // Check if poly is a limit polyinal

//     function isLimitPoly(poly) {
//         if (typeof poly === "number") {
//             return false;
//         }

//         return poly.filter((e) => e[1] === 0).length === 0;
//     }


//     // Decrement (subtract 1) from poly
//     // Only works for non-limit polyinals
//     function dec(poly) {
//         if(typeof poly === "number") {
//             return poly - 1;
//         }
        
//         var constantTerm = poly[poly.length - 1][0];
//         return poly.slice(0, -1).concat(constantTerm - 1);
//     }

//     // Get the nth term of the fundamental sequence of poly
//     function getFSTerm(poly, n) {
//         if (jsonEq(poly, [[1, 1]])) {
//             return n;
//         } else if (poly.length === 1) {
//             if (isLimitPoly(poly[0][1])) {
//                 return [[poly[0][0] - 1, poly[0][1]], [1, getFSTerm(poly[0][1], n)]];
//             } else {
//                 return [[poly[0][0] - 1, poly[0][1]], [n, dec(poly[0][1])]];
//             }
//         } else {
//             var higherTerms = poly.slice(0, -1);
//             var lowestTerm = [poly[poly.length - 1]];
//             return higherTerms.concat(getFSTerm(lowestTerm, n));
//         }
//     }

//     class HugeNumber {
//         constructor(sign, poly, n) {
//             // console.log("!", sign, poly, n);
//             this.sign = sign;
//             this.poly = normalizePoly(poly);
//             this.n = n;
//             while(isLimitPoly(this.poly)) {
//                 this.poly = normalizePoly(getFSTerm(this.poly, Math.ceil(n)));
//                 this.n = Math.ceil(n);
//             }
//             if(typeof this.poly === "number") {
//                 while(this.poly > 0 && this.n <= 308.25471555991675) {
//                     this.poly = dec(this.poly);
//                     this.n = Math.pow(10, this.n);                
//                 }
//             }
//         }

//         clone() {
//             return new HugeNumber(this.sign, [...this.poly], this.n);
//         }

//         cmp(other) {
//             if (this.sign === -1 && other.sign === -1) {
//                 return this.negAbs().cmp(other.negAbs());
//             }
//             if (jsonEq(this.poly, other.poly)) {
//                 return (this.n < other.n ? -1 : (this.n === other.n ? 0 : 1));
//             } else {
//                 return cmpPoly(this.poly, other.poly);
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
//             } else if (this.poly === 0 && other.poly === 0) {
//                 return new HugeNumber(1, 0, this.n + other.n);
//             } else if (this.poly === 1 && (other.poly === 0 || other.poly === 1)) {
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
//             } else if (this.poly === 0 && other.poly === 0) {
//                 return new HugeNumber(1, 0, this.n - other.n);
//             } else if (this.poly === 1 && (other.poly === 0 || other.poly === 1)) {
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
//             } else if (this.poly === 0 && other.poly === 0) {
//                 return new HugeNumber(1, 0, this.n * other.n);
//             } else if (this.poly === 1 && (other.poly === 0 || other.poly === 1)) {
//                 return new HugeNumber(1, 0, this.n + (other.poly === 0 ? Math.log10(other.n) : other.n));
//             } else if (this.poly === 2 && (other.poly === 1 || other.poly === 2)) {
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
//             } else if (this.poly === 0 && other.poly === 0) {
//                 return new HugeNumber(sign, 0, this.n / other.n);
//             } else if (this.poly === 1 && (other.poly === 0 || other.poly === 1)) {
//                 return new HugeNumber(sign, 0, this.n - (other.poly === 0 ? Math.log10(other.n) : other.n));
//             } else if (this.lt(other)) {
//                 return new HugeNumber(sign, 0, 0);
//             } else if (this.poly === 2 && (other.poly === 1 || other.poly === 2)) {
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
//             } else if (typeof this.poly === "number") {
//                 return new HugeNumber(1, this.poly + 1, this.n);
//             } else if(jsonEq(this.poly, [[1, 1]])) {
//                 return new HugeNumber(1, this.poly, this.n + 1);                
//             } else {
//                 return this.clone();
//             }
//         }

//         log10() {
//             if(this.poly === 0) {
//                 return new HugeNumber(sign, 0, Math.log10(this.n));
//             } else if(typeof this.poly === "number") {
//                 return new HugeNumber(sign, this.poly - 1, this.n);
//             } else if(jsonEq(this.poly, [[1, 1]])) {
//                 return new HugeNumber(sign, this.poly, this.n - 1);                
//             } else {
//                 return this.clone();
//             }
//         }


//         pow(other) {
//             return other.mul(this.log10()).pow10();
//         }

//         tetr10() {
//             if (typeof this.poly === "number") {
//                 return new HugeNumber(1, Math.floor(this.n), Math.pow(10, this.n % 1));
//             } else if(cmpPoly(this.poly, [[1, 2]]) === -1) {
//                 return new HugeNumber(1, [[1, 1]].concat(this.poly), this.n);                
//             } else if(jsonEq(this.poly, [[1, 2]])) {
//                 return new HugeNumber(1, [[1, 2]], this.n + 1);
//             } else {
//                 return this.clone();
//             }
//         }

//         pent10() {
//             if (typeof this.poly === "number") {
//                 console.log([[this.n, 1]], Math.pow(10, this.n % 1));
//                 return new HugeNumber(1,  [[this.n, 1]], 1);                
//             } else if(cmpPoly(this.poly, [[1, 3]]) === -1) {
//                 return new HugeNumber(1, [[1, 3]].concat(this.poly), this.n);                
//             } else if(jsonEq(this.poly, [[1, 2]])) {
//                 return new HugeNumber(1, [[1, 3]], this.n + 1);
//             } else {
//                 return this.clone();
//             }
//         }

//         // slog10() {
//         //     if(cmpPoly(this.poly, [[1, 2]]) === -1) {
//         //         console.log("!");
//         //         return new HugeNumber(1, [[1, 1]].concat(this.poly), this.n);                
//         //     } else if(jsonEq(this.poly, [[1, 2]])) {
//         //         return new HugeNumber(1, [[1, 2]], this.n + 1);
//         //     } else {
//         //         return this.clone();
//         //     }
//         // }


//         toNumber() {
//             if(this.poly === 0) {
//                 return this.sign * this.n;
//             } else {
//                 return this.sign * Infinity;
//             }
//         }


//         toString() {
//             if(this.poly === 0) {
//                 return this.n.toString();
//             } else {
//                 return "D_" + polyToString(this.poly) + "(" + this.n + ")";
//             }
//         }
//     }

//     return HugeNumber;
// })();


// // Export if in node.js
// if (typeof module === "object") {
//     module.exports = HugeNumber;
// }