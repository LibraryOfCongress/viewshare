/*global define */
define([
    'jquery',
    'observer',
    'models/composite-property'
], function (
    $,
    Observer,
    BaseCompositePropertyModel
) {
    'use strict';

    /**
     * Extends the dataset editor's CompositePropertyModel to override the format that loaded
     * items are stored in the 'items' property.
     */
    var CompositePropertyModel = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };

    $.extend(CompositePropertyModel.prototype, BaseCompositePropertyModel.prototype, {

        initialize: function(options) {
            BaseCompositePropertyModel.prototype.initialize.apply(this, [options]);
        },
        /**
         * Load data for this model from successful JSON response
         * @param {object} dataJSON - values for this property
         */
        loadDataSuccess: function(dataJSON) {
            this.items = dataJSON.items || [];
            this.Observer('loadDataSuccess').publish(this);
        }
    });


    return CompositePropertyModel;
});
