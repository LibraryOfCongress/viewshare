/*global define */
define(
    [
        'jquery',
        'models/composite-property'
    ],
    function (
        $,
        CompositePropertyModel
    ) {
    'use strict';
    /**
     * Extends CompositePropertyModel. Represents a property that is created
     * from other properties such an array created from a comma-separated value.
     * @param {string} options.delimiter - delimiter used to separate values
     * @param {string} options.pattern - pattern used to separate values
     */
    var PatternPropertyModel = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(PatternPropertyModel.prototype, CompositePropertyModel.prototype, {
        initialize: function(options) {
            CompositePropertyModel.prototype.initialize.apply(this, [options]);
            this.delimiter = options.delimiter || '';
            this.pattern = options.pattern || '';
        },

        /**
         * Validate that the data in this Model is in a state where it could
         * be sent to a server.
         * @param {array} propertyNames - names that already exist and should not
         * be duplicated
         */
        validate: function(propertyNames) {
            var existingNames = propertyNames || [],
            errors = CompositePropertyModel.prototype.validate.apply(this, [existingNames]);
            if (!this.delimiter || !this.pattern) {
                errors.delimiter = 'Please select a delimiter or pattern.';
            }
            return errors;
        },

        /** Return a simple object representation of this Property */
        toJSON: function() {
            var jsonProperty = CompositeModel.prototype.toJSON.apply(this, []);
            jsonProperty[this._id].delimiter = this.delimiter;
            jsonProperty[this._id].pattern = this.pattern;
            return jsonProperty;
        }
    });

    return PatternPropertyModel;
});
