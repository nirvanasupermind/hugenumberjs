
// 10-growing hierarchy
function tgh(alpha, n) {
    if (alpha == 0) {
        return 10 * n;
    } else if (alpha === 1) {
        return Math.pow(10, n);
    } /* else if ((alpha >= 2 && n >= 2.396009)
        || (alpha >= 3 && n >= 1.3794)) {
        return Infinity;
    } */
        else if ((alpha >= 2 && n >= 2.4)
            || (alpha >= 3 && n >= 1.4)) {
            return Infinity;
        } else {
        try {
            if (1 <= n && n <= 2) {
                return tgh(alpha - 1, Math.pow(10, n - 1));
            } else {
                var result = tgh(alpha, n % 1 + 1);
                for (var i = 0; i < Math.floor(n - 1); i++) {
                    result = tgh(alpha - 1, result);
                }
                return result;
            }
        }
        catch (e) {
            return Infinity;
        }
    }
}


var limits = [];
for (var alpha = 2; alpha < 50; alpha++) {
    var min = 1;
    var max = 2.4;
    var avg = (min + max) / 2;
    for (var i = 0; i < 50; i++) {
        avg = (min + max) / 2;
        if(Number.isFinite(tgh(alpha, avg))) {
            min = avg;
        } else {
            max = avg;
        }
    }
    limits.push(avg);
}
