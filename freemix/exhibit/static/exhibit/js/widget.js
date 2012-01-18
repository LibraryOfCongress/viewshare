(function($, Freemix) {

    Freemix.exhibit = Freemix.exhibit || {};

    Freemix.exhibit.widget = {
        config: {
            name: ""
        },
        findWidget: function() {
            if (!this._selector) {
                this._selector = this.generateWidget();
            }
            return this._selector;
        },
        serialize: function() {
            return $.extend(true, {}, this.config);
        },
        generateWidget: function() {
            return $("<div>");
        },
        remove: function() {
            this.findWidget().remove();
        },
        rename: function(name) {
            this.config.name = name;
            this.findWidget().find("span.label").text(name);
        },
        propertyTypes: ["text", "image", "currency", "url", "location", "date", "number"],

        isAvailable: function() {
            return Freemix.property.getPropertiesWithTypes(this.propertyTypes).length > 0;
        }
    };

})(window.Freemix.jQuery, window.Freemix);
