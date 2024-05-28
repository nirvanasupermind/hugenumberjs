var HugeNumber = require("../HugeNumber.js");
var x = HugeNumber.fromNumber(1.449);
console.log(x.tetr(50).toString());
// function normalize(array, depth = 0) {
//     if(typeof array === "number") {
//         return array;
//     }

//     var a = array[0];
//     var b = normalize(array[1], ++depth);
//     if(b === 1) {
//         // (already handled by other rules, but added to speed things up)
//         return a;
//     }

//     if(depth > maxDepth && array[array.lengt
// h - 1] !== 1) {
//         return array;
//     } else if(array.length === 0) {
//         return 1;
//     } else if(array.length === 1) {
//         return a;
//     } else if(array.length === 2) {
//         var result = Math.pow(array[0], array[1])
//         return Number.isFinite(result) ? result : array;
//     } else if(array[array.length - 1] === 1) {
//         return normalize(array.slice(0, -1), ++depth);
//     } else if(normalize(array[2], ++depth) === 1 && 1 <= b && b < 2) {
//         var n = 0;
//         for(var i = 2; i < array.length; i++) {
//             if(array[i] === 1) {
//                 n++;
//             } else {
//                 break;
//             }
//         }
//         var c = array[n + 2];
//         var pound = array.slice(n + 3);
//         return normalize(new Array(n + 1).fill(a).concat([Math.pow(a, b - 1), c - 1]).concat(pound), ++depth);
//     } else if(array[2] === 1 && (b >= 2 && b < maxDepth || Array.isArray(b))) {
//         var n = 0;
//         for(var i = 2; i < array.length; i++) {
//             if(array[i] === 1) {
//                 n++;
//             } else {
//                 break;
//             }
//         }
//         var c = array[n + 2];
//         var pound = array.slice(n + 3);
//         var array2 = [...array];
//         if(typeof array2[1] === "number") {
//             array2[1]--;
//         }
//         return normalize(new Array(n + 1).fill(a).concat([normalize(array2, ++depth), c - 1, ...pound]), ++depth);
//     } else if(1 < array[2] && array[2] < 2) {
//         var pound = array.slice(3);
//         var x = normalize([a, b, 1, ...pound], ++depth);
//         var y = normalize([a, b, 2, ...pound], ++depth);
//         if(typeof x === "number" && typeof y === "number") {
//             return Math.pow(x, 2 - array[2]) * Math.pow(y, array[2] - 1);
//          } else if(typeof x === "number") {
//             x = [y[0], Math.log(x)/Math.log(y[0])];
//         }
        
//        if(typeof x[1] === "number" && typeof y[1] === "number") {
//             return [y[0], x[1] * (2 - array[2]) + y[1] * (array[2] - 1)];
//        }  else if(typeof x[1] === "number"  && typeof y[1][1] === "number") {
//             return [y[0], [y[0], y[1][1] + Math.log(array[2] - 1)/Math.log(y[0])]];
//         } else {
//             return y;
//         }
//     } else if(1 <= b && b < 2 && (array[2] >= 2 || Array.isArray(array[2]))) {
//         var pound = array.slice(3);
//         return normalize([a, Array.isArray(b) ? [a, b] : Math.pow(a, b - 1), (typeof array[2] === "number" ? array[2] - 1 : normalize(array[2], ++depth)), ...pound], ++depth);
//     } else if(((b >= 2 && b < 10) || Array.isArray(b)) && (array[2] >= 2 || Array.isArray(array[2]))) {
//         var pound = array.slice(3);
//         var array2 = [...array];
//         if(!Array.isArray(array2[1])) {
//             array2[1]--;
//         }
//         return normalize([a, normalize(array2, ++depth), array[2] - 1, ...pound], ++depth);
//     } else {
//         return array;
//         // throw new Error("no rule found: " + JSON.stringify(array));
//     }
// }




// function ban(array) {
//     var a = array[0];
//     var b = array[1];
//     if(array.length === 0) {
//         return 1;
//     } else if(array.length === 1 || b === 1) {
//         // b === 1 is redundant (done to speed things up)
//         return a;
//     } else if(array.length === 2) {
//         return Math.pow(a, b);
//     } else if(array[array.length - 1] === 1) {
//         return ban(array.slice(0, -1));
//     } else if(array[2] === 1 && 1 <= b && b < 2) {
//         var n = 0;
//         for(var i = 2; i < array.length; i++) {
//             if(array[i] === 1) {
//                 n++;
//             } else {
//                 break;
//             }
//         }
//         var c = array[n + 2];
//         var pound = array.slice(n + 3);
//         return ban(new Array(n + 2).fill(a).concat([Math.pow(a, b - 1), c - 1]).concat(pound));
//     } else if(array[2] === 1 && b >= 2) {
//         var n = 0;
//         for(var i = 2; i < array.length; i++) {
//             if(array[i] === 1) {
//                 n++;
//             } else {
//                 break;
//             }
//         }
//         var c = array[n + 2];
//         var pound = array.slice(n + 3);
//         var array2 = [...array];
//         array2[1]--;
//         return ban(new Array(n + 2).fill(a).concat([ban(array2), c - 1, ...pound]));
//     } else if(1 < array[2] && array[2] < 2) {
//         var pound = array.slice(3);
//         return ban([a, b, 1, ...pound]);
//     } else if(1 <= b && b < 2 && array[2] >= 2) {
//         var pound = array.slice(3);
//         return ban([a, Math.pow(a, b - 1), array[2] - 1, ...pound]);
//     } else if(b >= 2 && array[2] >= 2) {
//         var pound = array.slice(3);
//         var array2 = [...array];
//         array2[1]--;
//         return ban([a, ban(array2), array[2] - 1, ...pound]);
//     } else {
//         throw new Error("no rule found: " + array);
//     }
// }

// console.log(ban([10, 1.4, 3]));

// // function hyperE(a, h) {
// //     var n = a.length;
// //     var b = a[n - 2];
// //     var p = a[n - 1];
// //     var x = h[n - 2];
// //     if (n === 1) {
// //         console.log("1.", a, h);
// //         return Math.pow(10, p);
// //     } else if (p === 1) {
// //         console.log("2.", a, h);
// //         return hyperE(a.slice(0, n - 1), h.slice(0, n - 2));
// //     } else if (x > 1 && 1 < p && p <= 2) {
// //         console.log("3.", a, h);
// //         var at = a.slice(0, n - 2);
// //         return hyperE(at.concat([b, Math.pow(b, p - 1)]), h.slice(0, n - 3).concat([x - 1]));
// //     } else if (1 < p && p <= 2) {
// //         console.log("4.", a, h);
// //         var at = a.slice(0, n - 2);
// //         var temp = Math.pow(hyperE(at.concat([b]), h.slice(0, n - 2)), p - 1);
// //         return hyperE(at.concat(Math.pow(b, 2 - p) * temp), h.slice(0, n - 3));
// //     } else if (x > 1 && p > 2) {
// //         console.log("5.", a, h);
// //         var at = a.slice(0, n - 2);
// //         return hyperE(at.concat([b, b, p - 1]), h.slice(0, n - 3).concat([x - 1, x]));
// //     } else if (p > 2) {
// //         console.log("6.", a, h);
// //         var at = a.slice(0, n - 2);
// //         var temp = hyperE(at.concat([b, p - 1]), h.slice(0, n - 3).concat([1]));
// //         return hyperE(at.concat(temp), h.slice(0, n - 3).concat([1]));
// //     } else {
// //         console.log("7.", a, h);
// //         throw Error("No hyper-E rules are matched: a=" + a + ", h=" + h);
// //     }
// // // }