/*global jQuery */
 (function($, Freemix) {

     // Display the view's UI.
     function display() {
         var content = this.getContent();
         var root = Freemix.getTemplate("piechart-view-template");
         content.empty();
         root.appendTo(content);
         this._setupViewForm();
         this._setupLabelEditor();
         this.findWidget().recordPager();
     }

    function generateExhibitHTML(config) {
        config = config || this.config;

        var view = $("<div ex:role='view' ex:viewClass='Piechart'></div>");
        view.attr("ex:viewLabel", config.name);
        var properties = [];
        var props = Freemix.property.propertyList;
        $.each(config.metadata,
        function(index, metadata) {
            var property = metadata.property;
            var identify = props[property];
            if (!metadata.hidden && identify) {
                properties[properties.length] = property;
            }

        });
        view.attr("ex:groupProperties", properties.join(', '));
        return view;
    }

    Freemix.view.addViewType({
        label: "Pie Chart",
        thumbnail: "/static/exhibit/img/piechart-icon.png",
        display: display,
        generateExhibitHTML: generateExhibitHTML,
        config: {
            type: "piechart",
            metadata: []
        }
    });

})(window.Freemix.jQuery, window.Freemix);
