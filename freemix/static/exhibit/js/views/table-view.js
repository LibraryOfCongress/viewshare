/*global jQuery */
 (function($, Freemix) {

      // Display the view's UI.
     function display() {
         var model = this;
         var content = this.getContent();
         var root = Freemix.getTemplate("table-view-template");
         content.empty();
         root.appendTo(content);
         this._setupViewForm();
         this._setupLabelEditor();

         var props = Freemix.property.enabledPropertiesArray();

         var sort  = content.find("#sort_property");

         model._setupPropertySelect(sort, "sortProperty", props, true);
         sort.change();

         var sort_order = content.find("#sort_order");
         sort_order.val(model.config.asc.toString());
         sort_order.change(function(e) {
             model.config.asc = $(this).val() === 'true';
         });
         sort_order.change();

         this.findWidget().recordPager();

     }

    function generateExhibitHTML(config) {
        config = config || this.config;
        var empty = true;

        var props = Freemix.property.propertyList;
        $.each(config.metadata, function(index, metadata) {
            var property = metadata.property;
            var identify = props[property];
            if (!metadata.hidden && identify) {
                empty = false;
            }

        });
        if (empty) {
            return $("<div ex:role='view' ex:viewLabel='Columns Missing'></div>");
        }
        var view = $("<div ex:role='view' ex:viewClass='Tabular' ></div>");
        view.attr("ex:viewLabel", config.name);
        var labels = [];
        var columns = [];
        $.each(config.metadata, function(index, metadata) {
            var property = metadata.property;
            var identify = props[property];
            if (!metadata.hidden && identify) {
                labels[labels.length] = identify.label();
                columns[columns.length] = identify.expression();
            }

        });
        view.attr("ex:columnLabels", labels.join(', '));
        view.attr("ex:columns", columns.join(', '));
        if (config.sortProperty) {
            var indexOffset = 0;
            $.each(config.metadata,
            function(index, metadata) {
                var property = metadata.property;
                if (config.sortProperty === property) {
                    view.attr("ex:sortColumn", index - indexOffset);
                }
                if (metadata.hidden) indexOffset++;
            });
        }
        view.attr("ex:sortAscending", config.asc);
        return view;
    }

    Freemix.view.addViewType({
        label: "Table",
        thumbnail: "/static/exhibit/img/table-icon.png",
        display: display,
        generateExhibitHTML: generateExhibitHTML,

        config: {
            type: "table",
            sortProperty: undefined,
            asc: true,
            metadata: []
        }
    });

})(window.Freemix.jQuery, window.Freemix);
