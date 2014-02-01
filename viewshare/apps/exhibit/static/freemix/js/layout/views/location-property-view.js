define(["jquery",
        "handlebars",
        "text!templates/layout/views/location-property.html",
        "models/composite-property",
        "bootstrap",
        "jquery.uuid"],
function($,
         Handlebars,
         template,
         CompositePropertyModel) {
    "use strict";

    function View(options) {
        this.element = options.element;
        this.model = new CompositePropertyModel({
            id: undefined,
            label: undefined,
            type: 'location',
            value: [],
            augmentation: 'composite',
            composite: [],
            property_url: undefined
        });
    }

    View.prototype.render = function() {
        this.element.append(this.template());
    }

    View.prototype.template = Handlebars.compile(template);

    View.prototype.destroy = function() {


        this.element.empty();
    }

    return View;
});