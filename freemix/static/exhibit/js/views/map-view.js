/*global jQuery */
(function($, Freemix) {
    Freemix.mapViewLib = {
        viewClass: "Map",
        propertyTypes: ["location"],
        label: "Map",
        thumbnail: "/static/exhibit/img/map-icon.png",

        config: {
            type: "map",
            title: undefined,
            titleLink: undefined,
            latlng: undefined,
            colorKey: undefined,
            metadata: []
        }

    };

    // Display the view's UI.
    Freemix.mapViewLib.display = function() {
        var content = this.getContent();
        var root = Freemix.getTemplate("map-view-template");
        var model = this;
        content.empty();
        root.appendTo(content);
        this._setupViewForm();
        this._setupLabelEditor();
        this._setupTitlePropertyEditor();

        var latlng = content.find("#latlng_property");
        var points = Freemix.property.getPropertiesWithTypes(["location"]);
        this._setupPropertySelect(latlng, "latlng", points);
        latlng.change();

        var color = content.find("#color_property");
        this._setupPropertySelect(color, "colorKey", Freemix.property.enabledPropertiesArray(), true);
        color.change();

        var zoom = content.find("#zoom_level");
        this._setupSelectPropertyHandler(zoom, "zoom");
        zoom.change();

        this.findWidget().recordPager();

    };

    Freemix.mapViewLib.generateExhibitHTML = function(config) {
        config = config || this.config;
        var view = $("<div ex:role='view'></div>").attr("ex:viewClass", this.viewClass);
        if (!config.latlng) {
            return view.attr("ex:viewLabel", "Location Missing");
        }
        var latlng = config.latlng;
        var colorKey = config.colorKey;
        view.attr("ex:viewLabel", config.name);
        if (latlng) {
            view.attr("ex:latlng", '.' + latlng);
        }
        if (colorKey) {
            view.attr("ex:colorKey", '.' + colorKey);
        }
        if (config.zoom && config.zoom != "") {
            view.attr("ex:zoom", config.zoom)
        }
        this._renderFormats(view);

        view.append(this._renderListLens(config));
        this.annotate(view);
        return view;
    };

    Freemix.mapViewLib.annotate = function(view) {

    };

})(window.Freemix.jQuery, window.Freemix);
