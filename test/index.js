const HugeNumber = require("../HugeNumber.js");
console.log(new HugeNumber(1,[[31000,1,0],1,0]).div(new HugeNumber(1,[[30999,1,0],1,0])).toString());