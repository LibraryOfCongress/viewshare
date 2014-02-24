/**
 * @fileOverview Database property definition.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "../../util/date-time",
    "./range-index"
], function(DateTime, RangeIndex) {
/**
 * Represents a property within a database.
 *
 * @public
 * @constructor
 * @class
 * @param {String} id Property identifier.
 * @param {Exhibit.Database} database Database the property is grounded in.
 */
var Property = function(id, database) {
    this._id = id;
    this._database = database;
    this._rangeIndex = null;
};

/**
 * Return the property database identifier.
 *
 * @returns {String} The property database identifier.
 */
Property.prototype.getID = function() {
    return this._id;
};

/**
 * Return the property's URI.
 *
 * @returns {String} The property URI.
 */
Property.prototype.getURI = function() {
    return this._uri;
};

/**
 * Return the property value data type.
 *
 * @returns {String} The property value data type.
 */
Property.prototype.getValueType = function() {
    return this._valueType;
};

/**
 * Return the user-friendly property label.
 *
 * @returns {String} The property label.
 */
Property.prototype.getLabel = function() {
    return this._label;
};

/**
 * Return the user-friendly property label for plural values.
 *
 * @returns {String} The plural property label.
 */
Property.prototype.getPluralLabel = function() {
    return this._pluralLabel;
};

/**
 * Return the user-friendly label when the object is the subject of a
 * sentence (e.g., "is [property] of").
 *
 * @returns {String} The reverse property label.
 */
Property.prototype.getReverseLabel = function() {
    return this._reverseLabel;
};

/**
 * Return the user-friendly label when the many objects are the subject of a
 * sentence (e.g., "are [properties] of").
 *
 * @returns {String} The plural reverse property label.
 */
Property.prototype.getReversePluralLabel = function() {
    return this._reversePluralLabel;
};

/**
 * Return the user-friendly label when grouping values together.
 *
 * @returns {String} The property grouping label.
 */
Property.prototype.getGroupingLabel = function() {
    return this._groupingLabel;
};

/**
 * Return the user-friendly label when values grouped together are the
 * subject of a sentence.
 *
 * @returns {String} The property reverse grouping label. 
 */
Property.prototype.getReverseGroupingLabel = function() {
    return this._reverseGroupingLabel;
};

/**
 * Return the origin of the property.
 *
 * @returns {String} The property origin.
 */
Property.prototype.getOrigin = function() {
    return this._origin;
};

/**
 * Return the index for the range of property values.
 *
 * @returns {Exhibit.Database.RangeIndex} An index for the range of
 *     property values.
 */
Property.prototype.getRangeIndex = function() {
    if (this._rangeIndex === null) {
        this._buildRangeIndex();
    }
    return this._rangeIndex;
};

/**
 * Makes internal changes to representation if new data is added to
 * the database.
 *
 * @private
 */
Property.prototype._onNewData = function() {
    this._rangeIndex = null;
};

/**
 * Constructs the cached RangeIndex retrieved in getRangeIndex.
 *
 * @private
 */
Property.prototype._buildRangeIndex = function() {
    var getter, database, p;
    database = this._database;
    p = this._id;
    
    switch (this.getValueType()) {
    case "currency":
    case "number":
        getter = function(item, f) {
            database.getObjects(item, p, null, null).visit(function(value) {
                if (typeof value !== "number") {
                    value = parseFloat(value);
                }
                if (!isNaN(value)) {
                    f(value);
                }
            });
        };
        break;
    case "date":
        getter = function(item, f) {
            database.getObjects(item, p, null, null).visit(function(value) {
                if (typeof value !== "undefined" && value !== null && !(value instanceof Date)) {
                    value = DateTime.parseIso8601DateTime(value);
                }
                if (value instanceof Date) {
                    f(value.getTime());
                }
            });
        };
        break;
    default:
        getter = function(item, f) {};
    }
    
    this._rangeIndex = new RangeIndex(
        database.getAllItems(),
        getter
    );
};

    // end define
    return Property;
});
