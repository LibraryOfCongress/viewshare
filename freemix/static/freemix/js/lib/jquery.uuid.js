/*global jQuery, window, alert, console */
 (function($) {

    // UUID extension found at http://plugins.jquery.com/node/4131
    /*
    Usage 1: define the default prefix by using an object with the property prefix as a parameter which contains a string value; {prefix: 'id'}
    Usage 2: call the function jQuery.uuid() with a string parameter p to be used as a prefix to generate a random uuid;
    Usage 3: call the function jQuery.uuid() with no parameters to generate a uuid with the default prefix; defaul prefix: '' (empty string)
    */

    /*
    Generate fragment of random numbers
    */
    $._uuid_default_prefix = '';
    $._uuidlet = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    /*
    Generates random uuid
    */
    $.make_uuid = function(p) {
        if (typeof(p) == 'object' && typeof(p.prefix) == 'string') {
            $._uuid_default_prefix = p.prefix;
            return;
        } else {
            p = p || jQuery._uuid_default_prefix || '';
            return (p + $._uuidlet() + $._uuidlet() + "-" + $._uuidlet() + "-" + $._uuidlet() + "-" + $._uuidlet() + "-" + $._uuidlet() + $._uuidlet() + $._uuidlet());
        }
    };

 })(jQuery);
