/*global jQuery */
 (function($, Freemix) {

     // Display the view's UI.
     function display() {
         var content = this.getContent();
         var root = Freemix.getTemplate("timeline-view-template");
         content.empty();
         root.appendTo(content);
         var model = this;

         model._setupViewForm();
         model._setupLabelEditor();
         model._setupTitlePropertyEditor();

         var start = content.find("#start_property");
         var end = content.find("#end_property");
         var color = content.find("#color_property");
         var top_band = content.find("#top-band-unit");
         var bottom_band = content.find("#bottom-band-unit");

         this._setupSelectPropertyHandler(top_band, "topBandUnit");
         this._setupSelectPropertyHandler(bottom_band, "bottomBandUnit");
         top_band.change();
         bottom_band.change();

         var dates = Freemix.property.getPropertiesWithTypes(model.propertyTypes);
         var colors = Freemix.property.enabledPropertiesArray();

         model._setupPropertySelect(start, "startDate", dates);
         model._setupPropertySelect(end, "endDate", dates, true);
         model._setupPropertySelect(color, "colorKey", colors, true);

         start.change();
         end.change();
         color.change();

         model.findWidget().recordPager();

     }

    function generateExhibitHTML(config) {
        function expression(prop) {
            return "." + prop;
        }
        config = config || this.config;
        if (!config.startDate) {
            return $("<div ex:role='view' ex:viewLabel='Range Missing'></div>");
        }
        var colorKey = config.colorKey;
        var view = $("<div ex:role='view' ex:viewClass='Timeline'></div>");
        view.attr("ex:viewLabel", config.name);
        if (colorKey) {
            view.attr("ex:colorKey", expression(colorKey));
        }
        if (config.name) {
            view.attr("ex:label", config.name);
        }
        if (config.title) {
            view.attr("ex:eventLabel", expression(config.title));
        }
        if (config.startDate) {
            view.attr("ex:start", expression(config.startDate));
        }
        if (config.endDate) {
            view.attr("ex:end", expression(config.endDate));
        }
        if (config.topBandUnit && config.topBandUnit.length > 0 && config.topBandUnit !="auto") {
            view.attr("ex:topBandUnit", config.topBandUnit);
        }
        if (config.bottomBandUnit && config.bottomBandUnit.length > 0 && config.bottomBandUnit != "auto") {
            view.attr("ex:bottomBandUnit", config.bottomBandUnit);
        }
        if (config.topBandPixelsPerUnit) {
            view.attr("ex:topBandPixelsPerUnit", expression(config.topBandPixelsPerUnit));
        }
        if (config.bottomBandPixelsPerUnit) {
            view.attr("ex:bottomBandUnitsPerPixel", expression(config.bottomBandPixelsPerUnit));
        }

        this._renderFormats(view);
        view.append(this._renderListLens(config));

        return view;
    }

    Freemix.view.addViewType({
        propertyTypes: ["date"],
        label: "Timeline",
        thumbnail: "/static/exhibit/img/timeline-icon.png",
        display: display,
        generateExhibitHTML: generateExhibitHTML,

        config: {
            type: "timeline",
            title: undefined,
            titleLink: undefined,
            colorKey: undefined,
            startDate: undefined,
            endDate: undefined,
            topBandUnit: "auto",
            topBandPixelsPerUnit: undefined,
            bottomBandUnit: "auto",
            bottomBandPixelsPerUnit: undefined,
            metadata: []
        }
    });

})(window.Freemix.jQuery, window.Freemix);
