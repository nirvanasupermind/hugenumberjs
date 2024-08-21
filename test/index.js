const HugeNumber = require("../HugeNumber.js");
// console.log(new HugeNumber(1, [5,Number.MAX_VALUE-2,1]).inverseArrow10(Number.MAX_VALUE).toString());
console.log(new HugeNumber(1, 2, 1000).mul(new HugeNumber(1, 2, 1003)).toString());