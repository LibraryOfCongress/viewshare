/*global jQuery */
 (function($, Freemix) {
    // Display the view's UI.
    function display() {
        var content = this.getContent();
        var root = Freemix.getTemplate("list-view-template");
        content.empty();
        root.appendTo(content);
        this._setupViewForm();
        this._setupLabelEditor();
        this._setupTitlePropertyEditor();
        this._setupMultiPropertySortEditor();

        this.findWidget().recordPager();
    }

    function generateExhibitHTML(config) {
        config = config || this.config;
        var view = $("<div ex:role='view'></div>");
        view.attr("ex:viewLabel", config.name);
        this._renderOrder(view, config);
        this._renderFormats(view);
        view.append(this._renderListLens(config));
        return view;
    }

    Freemix.view.addViewType({
        thumbnail: "/static/exhibit/img/list-icon.png",
        label: "List",
        display: display,
        generateExhibitHTML: generateExhibitHTML,
        config: {
            type: "list",
            title: undefined,
            titleLink: undefined,
            orders: [],
            possibleOrders:[],
            directions: ["ascending"],
            metadata: []
        }
    });

})(window.Freemix.jQuery, window.Freemix);
