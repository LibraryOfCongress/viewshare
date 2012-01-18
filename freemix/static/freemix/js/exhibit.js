/*global jQuery, Exhibit */
// Global exhibit variable to work around Timeline view bug
var exhibit;

// Monkey patch formatters

// The list formatter should output a ul
Exhibit.Formatter._ListFormatter.prototype.formatList = function(values, count, valueType, appender) {
    var uiContext = this._uiContext;
    var self = this;
    if (count == 0) {
        if (this._emptyText != null && this._emptyText.length > 0) {
            appender(document.createTextNode(this._emptyText));
        }
    } else if (count == 1) {
        values.visit(function(v) {
            uiContext.format(v, valueType, appender);
        });
    } else {
        var ul = document.createElement("ul");

        values.visit(function(v) {

            var li = document.createElement("li");
            uiContext.format(v,valueType, function(n) {
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
Exhibit.Formatter._constructors["location"] = Exhibit.Formatter._LocationFormatter;

// Fork the ImageFormatter to
// Wrap the img in a link and add the classes for lightbox
Exhibit.Formatter._ImageFormatter.prototype.format = function(value, appender) {
    if (Exhibit.params.safe) {
        value = value.trim().startsWith("javascript:") ? "" : value;
    }

    var img = document.createElement("img");
    img.src = value;

    if (this._tooltip != null) {
        if (typeof this._tooltip == "string") {
            img.title = this._tooltip;
        } else {
            img.title = this._tooltip.evaluateSingleOnItem(
                this._uiContext.getSetting("itemID"), this._uiContext.getDatabase()).value;
        }
    }
    var a = document.createElement("a");
    a.href = value;
    a.className = "dialog-thumb lightbox";
    a.appendChild(img);
    appender(a);
};

(function($, Freemix) {

    $.fn.createExhibit = function() {
        return this.each(function() {
            exhibit = Exhibit.create(Freemix.exhibit.database);
            exhibit.configureFromDOM(this);
            $('body').trigger('rendered.exhibit');

        });
    };

    var expressionCache = {};

    function createDatabase() {
        var database = Exhibit.Database.create();
        if (database._properties) {
            var ns = "http://simile.mit.edu/2006/11/exhibit#";
            var ps = database._properties;
            if (ps.change && typeof ps.change._uri == 'undefined') {
                database._properties.change._uri=ns+"changed";
            }
            if (ps.changedItem && typeof ps.changedItem._uri == 'undefined') {
                database._properties.changedItem._uri=ns+"changedItem";
            }
            if (ps.modified && typeof ps.modified._uri == 'undefined') {
                database._properties.modified._uri=ns+"modified";
            }
        }
        return database;

    }

    Freemix.exhibit = {

        initializeDatabase: function(data, fDone) {

            var database = Freemix.exhibit.database = createDatabase();

            if (data.constructor == Array) {
                database._loadLinks(data, database, fDone);
            } else {
                database.loadData(data);
                if (fDone) fDone();
            }
            return database;
        },
        getPropertyList: function() {
            return Freemix.exhibit.database.getAllProperties();
        },
        createExhibit: function(root) {
            exhibit = Exhibit.create(Freemix.exhibit.database);
            exhibit.configureFromDOM(root.get(0));
            return exhibit;
        },
        getExpressionCount: function(expression, name) {
            var label = name || expression;

            var expressionCount = expressionCache[expression];
            if (!expressionCount) {
                var database = Freemix.exhibit.database;
                var items = database.getAllItems();

                var facet_cache = new Exhibit.FacetUtilities.Cache(database,
                Exhibit.Collection.createAllItemsCollection("default", database),
                Exhibit.ExpressionParser.parse(expression));

                var counts = facet_cache.getValueCountsFromItems(items);
                var missing = facet_cache.countItemsMissingValue(items);
                expressionCount = {
                    expression: expression,
                    values: counts.entries.length,
                    missing: missing
                };
                expressionCache[expression] = expressionCount;
            }
            return $.extend({}, expressionCount, {label: label});
        },
        exportDatabase: function(database) {
            var db = database || this.database;
            var items = [];
            db.getAllItems().visit(function(id) {
                var obj = {id: id};
                var props = db.getAllProperties();
                for (inx = 0 ; inx < props.length ; inx++) {
                    p = props[inx];
                    v = db.getObjects(id, p).toArray();
                    if (v.length == 1) {
                        obj[p] = v[0];
                    } else if (v.length > 1) {
                        obj[p] = v;
                    }
                }
                items.push(obj);
            });
            return {items: items};

        }
    };
})(window.Freemix.jQuery, window.Freemix);
