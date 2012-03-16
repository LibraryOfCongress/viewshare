/*global jQuery */
 (function($, Freemix) {

     // Display the view's UI.
     function display() {
         var content = this.getContent();
         var root = Freemix.getTemplate("thumbnail-view-template");

         content.empty();
         content.append(root);
         this._setupViewForm();
         this._setupLabelEditor();

         var images = Freemix.property.getPropertiesWithType("image");

         var image = content.find("#image_property");

         // Set up image property selector
         this._setupPropertySelect(image, "image", images);
         this._setupTitlePropertyEditor();
         this._setupMultiPropertySortEditor();

         image.change();
     }

    function generateExhibitHTML(config) {
        config = config || this.config;

        var view = $("<div ex:role='view' ex:viewClass='Thumbnail'></div>");
        view.attr("ex:viewLabel", config.name);
        view.attr("ex:showAll", config.showAll);
        view.attr("ex:abbreviatedCount", config.abbreviatedCount);
        this._renderFormats(view);
        this._renderOrder(view, config);


        var lens = $("<div ex:role='lens' style='display:none;' class='image-thumbnail ui-state-highlight'></div>");
        var img = $("<a class='lightbox'><img class='image-thumbnail'/></a>");
        img.attr("ex:href-content", "." + config.image);
        img.find("img").attr("ex:src-content", "." + config.image);
        lens.append(img);
        if (config.title) {
            var title = $("<div class='name'><span></span></div>");
            var span = title.find("span");
            span.attr("ex:content", "." + config.title);
            if (config.titleLink) {
                span.wrap($("<a></a>").attr("ex:href-content", "." + config.titleLink));
            }
            lens.append(title);

        }
        view.append(lens);

        return view;
    }

    Freemix.view.addViewType({
        propertyTypes: ["image"],
        label: "Gallery",
        thumbnail: "/static/exhibit/img/gallery.png",
        display: display,
        generateExhibitHTML: generateExhibitHTML,

        config: {
            type: "thumbnail",
            image: undefined,
            title: undefined,
            titleLink: undefined,
            abbreviatedCount: "12",
            orders: [],
            possibleOrders: []
        }
    });

})(window.Freemix.jQuery, window.Freemix);
