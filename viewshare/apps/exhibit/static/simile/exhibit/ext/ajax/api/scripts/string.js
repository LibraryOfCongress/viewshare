/*==================================================
 *  String Utility Functions and Constants
 *==================================================
 */

define(function() {
    var StringUtils = {};

    StringUtils.trim = function(s) {
        return s.replace(/^\s+|\s+$/g, '');
    };

    StringUtils.startsWith = function(s, prefix) {
        return s.length >= prefix.length && s.substr(0, prefix.length) === prefix;
    };

    StringUtils.endsWith = function(s, suffix) {
        return s.length >= suffix.length && s.substr(s.length - suffix.length) === suffix;
    };

    StringUtils.substitute = function(s, objects) {
        var result, start, percent, n;
        result = "";
        start = 0;
        while (start < s.length - 1) {
            percent = s.indexOf("%", start);
            if (percent < 0 || percent === s.length - 1) {
                break;
            } else if (percent > start && s.charAt(percent - 1) === "\\") {
                result += s.substring(start, percent - 1) + "%";
                start = percent + 1;
            } else {
                n = parseInt(s.charAt(percent + 1));
                if (isNaN(n) || n >= objects.length) {
                    result += s.substring(start, percent + 2);
                } else {
                    result += s.substring(start, percent) + objects[n].toString();
                }
                start = percent + 2;
            }
        }
        
        if (start < s.length) {
            result += s.substring(start);
        }
        return result;
    };

    return StringUtils;
});
