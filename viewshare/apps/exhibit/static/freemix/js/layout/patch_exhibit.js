define(["jquery", "scripts/data/database/local"],
        function ($, LocalImpl) {
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

    LocalImpl.prototype.getPropertiesWithTypes = function(types) {
        var index = {};
        $.each(this.getPropertyObjects(), function(inx,prop) {
            var type = prop.getValueType();
            index[type] = index[type] || [];
            index[type].push(prop);
        });


        return [].concat($.map(types, function(x) {
            return index[x];
        }));
    };

    LocalImpl.prototype.getFilteredProperties = function(f) {
        var filter = (f || []).concat(filtered_properties);
        return $.map(this.getAllProperties(), function(key, index) {
            if (filter.indexOf(key) != -1) {
                return null;
            }
            return key;
        });
    };



    LocalImpl.prototype.getPropertyObjects = function(properties) {
        var database = this;
        properties = properties || this.getFilteredProperties();
        return $.map(properties,function(key, index) {
            return database.getProperty(key);
        });
    };
    return LocalImpl;
});
