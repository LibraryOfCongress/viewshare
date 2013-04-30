(function ($, Freemix, Exhibit) {
    "use strict";

    // patch Exhibit database with editor specific functions


    Exhibit.Database._Impl.prototype.getPropertiesWithTypes = function(types) {
        var index = this._freemix_type_index || {};
        var db = this;
        if ($.isEmptyObject(index)) {
           $.each(this.getAllPropertyObjects(), function(inx,prop) {
               var type = prop.getValueType();
               index[type] = index[type] || [];
               index[type].push(prop);
           });
           this._freemix_type_index = index;
        }

        return [].concat($.map(types, function(x) {
           return index[x];
        }));
    };

    Exhibit.Database._Impl.prototype.getAllPropertyObjects = function() {
        var database = this;
        return $.map(database.getAllProperties(),function(key, index) {
            return database.getProperty(key);
        });
    };
}(window.Freemix.jQuery, window.Freemix, window.Exhibit));
