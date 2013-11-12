var exhibit;

define([
    "freemix/js/lib/jquery", "exhibit", "./freemix"
], function($, Exhibit, Freemix) {
    "use strict";

    $.fn.createExhibit = function() {
        return this.each(function() {
            exhibit = Exhibit.create(Freemix.exhibit.database);
            exhibit.configureFromDOM(this);
            $('body').trigger('rendered.exhibit');
        });
    };

    var expressionCache = {};

    function createDatabase() {
        var database = Exhibit.DatabaseUtilities.create();
//        if (database._properties) {
//            var ns = "http://simile.mit.edu/2006/11/exhibit#";
//            var ps = database._properties;
//            if (ps.change && typeof ps.change._uri == 'undefined') {
//                database._properties.change._uri=ns+"changed";
//            }
//            if (ps.changedItem && typeof ps.changedItem._uri == 'undefined') {
//                database._properties.changedItem._uri=ns+"changedItem";
//            }
//            if (ps.modified && typeof ps.modified._uri == 'undefined') {
//                database._properties.modified._uri=ns+"modified";
//            }
//        }
        return database;

    }

    Freemix.exhibit = {

        initializeDatabase: function(data, fDone) {

            var database = Freemix.exhibit.database = createDatabase();

            if (data.constructor == Array) {
                if (fDone) {
                    $(document.body).one(fDone);
                }
                database._loadLinks(data, database);

            } else {
                database.loadData(data);
                if (fDone) fDone();
            }
            return database;
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
        expression: function(property){return "." + property;},
        exportDatabase: function(database) {
            var db = database || this.database;
            var items = [];
            db.getAllItems().visit(function(id) {
                var obj = {id: id};
                var props = db.getAllProperties();
                for (var inx = 0 ; inx < props.length ; inx++) {
                    var p = props[inx];
                    var v = db.getObjects(id, p).toArray();
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
});
