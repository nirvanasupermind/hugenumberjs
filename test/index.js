const HugeNumber = require("../HugeNumber.js");
// console.log(new HugeNumber(1, [5,Numb
// er.MAX_VALUE-2,1]).inverseArrow10(Number.MAX_VALUE).toString());
console.log(HugeNumber.fromNumber(1e+308).mul(10).exp10().toString());