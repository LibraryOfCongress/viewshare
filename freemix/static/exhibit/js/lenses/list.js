(function($, Freemix) {
    "use strict";

    var config = {
        type: "list",
        name: "List Lens",
        title: undefined,
        titleLink: undefined,
        properties: []
    };

    var expression = Freemix.exhibit.expression;

    var render = function(config) {
        config = config || this.config;

        var lens = $("<div class='list-lens' ex:role='lens' style='display:none'></div>");

        var title = $("<div class='exhibit-title ui-widget-header'></div>");
        if (config.title) {
            var html = $("<span></span>");
            html.attr("ex:content", expression(config.title));
            title.append(html);
            if (config.titleLink) {
                title.append("&nbsp;");
                html= $("<a target='_blank'>(link)</a>");
                html.attr("ex:href-content", expression(config.titleLink));
            }
            title.append(html);

        }

        var table = $("<table class='property-list-table exhibit-list-table table table-striped'></table>");
        $.each(config.properties, function(index, p) {
            var property = Freemix.exhibit.database.getProperty(p);

            var tr = $("<tr class='exhibit-property'></tr>");
            var label = property.getLabel();
            var td = $("<td class='exhibit-label'></td>");
            td.text(label);
            tr.append(td);
            td = $("<td class='exhibit-value'><span/></td>");
            td.find("span").attr("ex:content", expression(p));
            tr.append(td);
            table.append(tr);

        });
        lens.append(title);
        lens.append(table);
        return lens;

    };

    Freemix.lens.register(config, render);

})(window.Freemix.jQuery, window.Freemix);
