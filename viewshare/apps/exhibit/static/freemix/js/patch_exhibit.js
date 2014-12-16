define(["jquery", "exhibit"], function($, Exhibit) {
    "use strict";

    // Monkey patch formatters

    // The list formatter should output a ul
    Exhibit.Formatter._ListFormatter.prototype.formatList = function (values, count, valueType, appender) {
        var uiContext, self, index;
        uiContext = this._uiContext;
        self = this;
        if (count === 0) {
            if (typeof this._emptyText !== "undefined" && this._emptyText !== null && this._emptyText.length > 0) {
                appender(document.createTextNode(this._emptyText));
            }
        } else if (count === 1) {
            values.visit(function (v) {
                uiContext.format(v, valueType, appender);
            });
        } else {
            var ul = $("<ul>");

            values.visit(function (v) {

                var li = $("<li>");
                uiContext.format(v, valueType, function (n) {
                    li.append($(n));
                });
                ul.append(li);
            });
            appender(ul.get(0));

        }
    };


    // Register a formatter for the location type -- just duplicate the text formatter for now
    Exhibit.Formatter._LocationFormatter = Exhibit.Formatter._TextFormatter;
//    Exhibit.Formatter._LocationFormatter.format = Exhibit.Formatter._TextFormatter.format;
//    Exhibit.Formatter._LocationFormatter.formatText = Exhibit.Formatter._TextFormatter.formatText;
    Exhibit.Formatter._constructors.location = Exhibit.Formatter._LocationFormatter;

    // Fork the ImageFormatter to
    // Wrap the img in a link and add the classes for lightbox
    Exhibit.Formatter._ImageFormatter.prototype.format = function (value, appender) {
        if (Exhibit.params.safe) {
            value = Exhibit.Util.isUnsafeLink(value.trim()) ? "" : value;
        }

        var img = $("<img>").attr("src", value);

        if (this._tooltip !== null && this._tooltip !== undefined) {
            if (typeof this._tooltip === "string") {
                img.attr("title", this._tooltip);
            } else {
                img.attr("title",
                         this._tooltip.evaluateSingleOnItem(
                             this._uiContext.getSetting("itemID"),
                             this._uiContext.getDatabase()
                         ).value);
            }
        }
        var a = $("<a>");
        a.attr("href", value);
        a.addClass("dialog-thumb lightbox");
        a.append(img);
        appender(a);
    };

    /**
     * @param {String} value
     * @param {Function} appender
     */
    Exhibit.Formatter._URLFormatter.prototype.format = function(value, appender) {
        var a = $("<a>").attr("href", value).html(value);

        if (this._target !== null) {
            a.attr("target", this._target);
        }
        // Unused
        //if (this._externalIcon !== null) {
        //
        //}
        appender(a);
    };

    Exhibit.Formatter._AudioFormatter = function(uiContext) {
    };

    Exhibit.Formatter._AudioFormatter.prototype.format = function(value, appender) {
        var audio = $("<audio>");
        audio.attr("controls", true);
        var source = $("<source>");
        source.attr("src", value);
        audio.html("Audio not supported");
        audio.prepend(source);
        appender(audio);

    };

    Exhibit.Formatter._AudioFormatter.prototype.formatText = function(value) {
        if (Exhibit.params.safe) {
            value = Util.isUnsafeLink(value.trim()) ? "" : value;
        }
        return value;
    };

    Exhibit.Formatter._constructors.audio = Exhibit.Formatter._AudioFormatter;

    
    Exhibit.Formatter._VideoFormatter = function(uiContext) {
    
    };

    Exhibit.Formatter._VideoFormatter.prototype.format = function(value, appender) {
        var Video = $("<Video>");
        Video.attr("controls", true);
        var source = $("<source>");
        source.attr("src", value);
        Video.html("Video not supported");
        Video.prepend(source);
        appender(Video);

    };

    Exhibit.Formatter._VideoFormatter.prototype.formatText = function(value) {
        if (Exhibit.params.safe) {
            value = Util.isUnsafeLink(value.trim()) ? "" : value;
        }
        return value;
    };

    Exhibit.Formatter._constructors.video = Exhibit.Formatter._VideoFormatter;

    
    // Hide the "Items" tag for item counts
    $("body").on('rendered.exhibit', function(evt, exhibit) {
        var extype = exhibit._database._types['Item'];
        extype._custom.label = "";
        extype._custom.pluralLabel = "";
        $('.exhibit-collectionSummaryWidget-count').parent().contents().filter(function(){
            return this.nodeType===3;
        }).remove();

    });
});
