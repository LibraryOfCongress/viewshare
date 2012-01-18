/*global jQuery */
(function($, Freemix) {
    Freemix.Identify.prototype.propertyEditor = function(row) {
            var property = row.data("property");
            var container = $("<div class='identify-type-editor'><select id='property-type-editor" + $.make_uuid() + "'></select></div>");
            var select = container.find("select");
            var buttons = $('<div class="identify-type-editor-buttons"><span class="ok-button button ui-state-default ui-corner-all" title="OK">OK</span> ' +
                            '<span class="cancel-button button ui-state-default ui-corner-all" title="Cancel">Cancel</span></div>').appendTo(container);

            $.each(Freemix.property.type, function(name, type) {
                var option = $("<option value='" + name + "'" + (property.hasType(name) ? " selected='selected'" : "") + ">" + (type.label || name) + "</option>");
                select.append(option);
            });
            return container;
    };

    Freemix.Identify.prototype._addPropertyForEdit = Freemix.Identify.prototype.addProperty;
    Freemix.Identify.prototype.addProperty = function(property) {
        var row = this._addPropertyForEdit(property);
        var placeholder = "Click to edit...";
        var identify = this;
        row.find(".name span").editable(function(value, settings) {
                identify.propertyChanged(property.config);
                if (value === property.name() || value === "" || value === placeholder || value === undefined) {
                    $(this).removeClass('changed');
                    property.label(property.name());
                    return property.label();

                } else {
                    property.label(value);
                    $(this).addClass('changed');
                    return property.label();
                }

        }, {
                submit  : "Rename",
                cancel : "Cancel",
                placeholder : placeholder,
                width: "none",
                onblur: "ignore",
                cssclass: "property-name-editable"
        });
        row.find("td.enabled input").removeAttr("disabled");

        return row;

    };

    Freemix.Identify.prototype._renderTypeForEdit = Freemix.Identify.prototype.renderType;
    Freemix.Identify.prototype.renderType = function(row, column) {
        var property = row.data("property");
        var container = $("<div class='identify-type-editor'><select id='property-type-editor" + $.make_uuid() + "'></select></div>").appendTo(column);
        var select = container.find("select");

        $.each(Freemix.property.type, function(name, type) {
            var option = $("<option value='" + name + "'" + (property.hasType(name) ? " selected='selected'" : "") + ">" + (type.label || name) + "</option>");
            select.append(option);
        });
        var identify = this;
        select.change(function() {
            var type = select.val();
            var currentType = property.type();
            property.type(type);
            if (!property.hasType(currentType)) {
                identify.renderProperty(row);
                identify.propertyChanged(property.config);
            }
        });

    };

})(window.Freemix.jQuery, window.Freemix);
