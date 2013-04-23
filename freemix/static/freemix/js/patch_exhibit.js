(function ($, Freemix, Exhibit) {
    "use strict";

    // Monkey patch formatters

    // The list formatter should output a ul
    Exhibit.Formatter._ListFormatter.prototype.formatList = function (values, count, valueType, appender) {
        var uiContext = this._uiContext,
            ul;

        if (count === 0) {
            if (this._emptyText !== undefined && this._emptyText.length > 0) {
                appender(document.createTextNode(this._emptyText));
            }
        } else if (count === 1) {
            values.visit(function (v) {
                uiContext.format(v, valueType, appender);
            });
        } else {
            ul = document.createElement("ul");

            values.visit(function (v) {

                var li = document.createElement("li");
                uiContext.format(v, valueType, function (n) {
                    li.appendChild(n);
                });
                ul.appendChild(li);
            });
            appender(ul);

        }
    };


    // Register a formatter for the location type -- just duplicate the text formatter for now
    Exhibit.Formatter._LocationFormatter = Exhibit.Formatter._TextFormatter;
    Exhibit.Formatter._LocationFormatter.format = Exhibit.Formatter._TextFormatter.format;
    Exhibit.Formatter._LocationFormatter.formatText = Exhibit.Formatter._TextFormatter.formatText;
    Exhibit.Formatter._constructors.location = Exhibit.Formatter._LocationFormatter;

    // Fork the ImageFormatter to
    // Wrap the img in a link and add the classes for lightbox
    Exhibit.Formatter._ImageFormatter.prototype.format = function (value, appender) {
        var img = document.createElement("img");
        if (Exhibit.params.safe) {
            /*jshint scripturl:true*/
            value = value.trim().startsWith("javascript:") ? "" : value;
        }

        img.src = value;

        if (this._tooltip !== undefined) {
            if (typeof this._tooltip === "string") {
                img.title = this._tooltip;
            } else {
                var itemID = this._uiContext.getSetting("itemID");
                var database = this._uiContext.getDatabase();
                img.title = this._tooltip.evaluateSingleOnItem(itemID, database).value;
            }
        }
        var a = document.createElement("a");
        a.href = value;
        a.className = "dialog-thumb lightbox";
        a.appendChild(img);
        appender(a);
    };

    // Hide the "Items" tag for item counts
    $("body").live('rendered.exhibit', function() {
        var extype = window.exhibit._database._types['Item'];
        extype._custom.label = "";
        extype._custom.pluralLabel = "";
        $('.exhibit-collectionSummaryWidget-count').parent().contents().filter(function(){
            return this.nodeType===3;
        }).remove();

    });
}(window.Freemix.jQuery, window.Freemix, window.Exhibit));