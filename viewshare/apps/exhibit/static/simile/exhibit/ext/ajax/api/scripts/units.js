define(["./date-time"], function(DateTime) {
/*==================================================
 *  Default Unit
 *==================================================
 */

var NativeDateUnit = new Object();

NativeDateUnit.makeDefaultValue = function() {
    return new Date();
};

NativeDateUnit.cloneValue = function(v) {
    return new Date(v.getTime());
};

NativeDateUnit.getParser = function(format) {
    if (typeof format == "string") {
        format = format.toLowerCase();
    }
    
    var parser = (format == "iso8601" || format == "iso 8601") ?
                    DateTime.parseIso8601DateTime : 
                    DateTime.parseGregorianDateTime;
                    
    return function(d) {
        if (typeof d != 'undefined' && d !== null && typeof d.toUTCString == "function") {
            return d;
        } else {
            return parser(d);
        }
    };
};

NativeDateUnit.parseFromObject = function(o) {
    return DateTime.parseGregorianDateTime(o);
};

NativeDateUnit.toNumber = function(v) {
    return v.getTime();
};

NativeDateUnit.fromNumber = function(n) {
    return new Date(n);
};

NativeDateUnit.compare = function(v1, v2) {
    var n1, n2;
    if (typeof v1 == "object") {
        n1 = v1.getTime();
    } else {
        n1 = Number(v1);
    }
    if (typeof v2 == "object") {
        n2 = v2.getTime();
    } else {
        n2 = Number(v2);
    }
    
    return n1 - n2;
};

NativeDateUnit.earlier = function(v1, v2) {
    return NativeDateUnit.compare(v1, v2) < 0 ? v1 : v2;
};

NativeDateUnit.later = function(v1, v2) {
    return NativeDateUnit.compare(v1, v2) > 0 ? v1 : v2;
};

NativeDateUnit.change = function(v, n) {
    return new Date(v.getTime() + n);
};


    return NativeDateUnit;
});
