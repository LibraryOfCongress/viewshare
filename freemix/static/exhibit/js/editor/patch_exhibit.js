(function ($, Freemix, Exhibit) {
    "use strict";

    // patch Exhibit database with editor specific functions
    var filtered_properties = [
        "id",
        "label",
        "modified",
        "uri",
        "type",
        "change",
        "changedItem"
    ];

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

    Exhibit.Database._Impl.prototype.getFilteredProperties = function(filter) {
        filter = filter || filtered_properties;
        return $.map(this.getAllProperties(), function(key, index) {
            if (filter.indexOf(key) != -1) {
                return null;
            }
            return key;
        });
    };

    Exhibit.Database._Impl.prototype.getAllPropertyObjects = function() {
        var database = this;
        return $.map(database.getAllProperties(),function(key, index) {
            if (filtered_properties.indexOf(key) != -1) {
                return null;
            }
            return database.getProperty(key);
        });
    };
}(window.Freemix.jQuery, window.Freemix, window.Exhibit));
