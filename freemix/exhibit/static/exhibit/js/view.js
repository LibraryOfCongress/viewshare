/*global jQuery */
(function($, Freemix) {

    function renderProperty(metadata) {
        var property = Freemix.property.propertyList[metadata.property];
        if (property.enabled()) {
            return property.getExhibitHtml();
        } else {
            return "";
        }
    }

    Freemix.exhibit.viewContainer = {
        id: "",
        findWidget: function() {
            return $(".view-container#" + this.id, Freemix.getBuilder());
        },
        getContent: function() {
            return $(".view-content", this.findWidget());
        },
        generateExhibitHTML: function() {
            var viewPanel = $("<div class='view-panel' ex:role='viewPanel'></div>");
            $("ul.view-set>li", this.findWidget()).each(function() {
                // TODO: the new view icon should be moved out of the list
                if (!$(this).hasClass("create-view")) {
                    var view = $(this).data("model");
                    viewPanel.append(view.generateExhibitHTML());
                }
            });
            return viewPanel;
        },
        serialize: function() {
            var config = [];
            $("ul.view-set>li", this.findWidget()).each(function() {
                if (!$(this).hasClass("create-view")) {
                    var view = $(this).data("model");
                    config.push(view.serialize());
                }
            });
            return config;
        },
        addView: function(view) {
            $('.view-set li.create-view', this.findWidget()).before(view.findWidget());
//            view.select();
        },
        getSelected: function() {
            return this.findWidget().find(".view-set>li.ui-state-active");
        },
        getPopupContent: function() {
            var fc = this;
            return $("<div class='chooser'></div>")
                .freemixThumbnails(Freemix.view.types, Freemix.view.prototypes, function(viewTemplate) {
                    var view = Freemix.view.createView({type: viewTemplate.config.type, name: viewTemplate.label});
                    view.showEditor(fc);
                });
        },
        getPopupButton: function() {
            return this.findWidget().find(".create-view-button");
        }
    };

    Freemix.exhibit.view = $.extend(true, {}, Freemix.exhibit.widget, {
        propertyTypes: ["text", "image", "currency", "url", "location", "date", "number"],
        getContainer: function() {
            if (!this._container) {
                this._container = this.findWidget().parents(".view-container");
            }
            return this._container;
        },
        getContent: function() {
            return this.getContainer().data("model").getContent();
        },
        generateWidget: function() {
             var view = this;
             return $("<li class='view ui-state-default'>" +
                 "<span class='ui-icon ui-icon-grip-dotted-vertical'/>" +
                 "<span class='label'></span>" +
                 "<a href='#' class='delete-button ui-icon ui-icon-closethick' title='Delete this view'/>" +
                 "</li>")
                .attr("id", view.config.id)
                .find("span.label").text(view.config.name).end()
                .data("model", view)
                .hover(function() {$(this).addClass('ui-state-hover');}, function() {$(this).removeClass('ui-state-hover');})
                .click(function() {
                    if (!$(this).hasClass("ui-state-active")) {
                        $(this).data("model").select();
                    }
                    return false;
                })

                .find(".delete-button").click(function() {
                     view.remove();
                     return false;
                 }).end();

        },
        select: function() {
            var control = this.findWidget();
            $(".view-set>li.view", this.getContainer()).removeClass("ui-state-active")
            .find(".popup-button").hide();

            control.addClass("ui-state-active");
            control.find('.popup-button').show();
            this.display();
        },
        remove: function() {
            var container = this.getContainer();
            if (container.find(".view-set>li.view").size() > 1) {
                this.findWidget().remove();
                var next = container.find(".view-set>li.view:first");
                if (next.size() > 0) {
                    next.data("model").select();
                } else {
                    container.find(".view-content").empty();
                }
            }
        },
        display: function() {},
        generateExhibitHTML: function(config) {},
        showEditor: function(vc) {
            vc._dialog.dialog("close");
            vc.addView(this);
            this.select();
        },
        _expression: function(p) {
            return "." + p;
        },
        _mapExpressions: function (arr) {
            return $.map(arr, this._expression).join(",");
        },
        _setupViewForm: function(config) {
            config = config || this.config;
            var content = this.getContent();

            content.find("form").submit(function() {return false;});

        },
        _setupLabelEditor: function(config) {
            config = config||this.config;
            var view = this;
            var label = this.getContent().find("#view_label_input");

            label.val(config.name);
            label.change(function() {
                view.rename($(this).val());
            });
        },
        _setupTitlePropertyEditor: function(config) {
            config = config||this.config;
            var links = Freemix.property.getPropertiesWithTypes(["image", "url"]);
            var titles = Freemix.property.enabledPropertiesArray();
            var content = this.getContent();
            var title = content.find("#title_property");
            var title_link = content.find("#title_link_property");

            this._setupPropertySelect(title, "title", titles, true);
            title.change(function() {
                 if (title.val() && links.length > 0) {
                     title_link.removeAttr("disabled");
                 } else {
                     title_link.attr("disabled", true);
                     title_link.val("");
                     title_link.change();
                 }
            });

            if (links.length > 0) {
                 this._setupPropertySelect(title_link, "titleLink", links, true);
            } else {
                 title_link.attr("disabled", true);
            }
            title.change();
            title_link.change();

        },

        _setupMultiPropertySortEditor: function() {
            var content = this.getContent();
            var sort = content.find("#sort_property");
            var order = content.find("#sort_order");
            var props = Freemix.property.enabledPropertiesArray();
            this._populatePropertySelect(sort, props, true);
            this._setupSelectMultiPropertyHandler(sort, "orders");
            this._setupSelectMultiPropertyHandler(order, "directions");
        },
        _populatePropertySelect: function(selector, collection, nullable) {
            $.each(collection, function() {
                var option = $("<option></option>");
                option.attr("value", this.name());
                option.text(this.label());
                selector.append(option);
            });

            if (nullable) {
                selector.prepend("<option value=''></option>");
            }
        },

        _setupSelectPropertyHandler: function(selector, key) {
            var config = this.config;

            selector.change(function() {
                 var value = $(this).val();
                 if (value && value != ( "" || undefined)) {
                     config[key] = value;
                 } else {
                     config[key] = undefined;
                 }
             }).val(config[key]);

            if (!selector.val()) {
               selector.get(0).options[0].selected = true;
            }
        },

        _setupSelectMultiPropertyHandler: function(selector, key) {
            var config = this.config;

            selector.change(function() {
                var value = $(this).val();
                if ($.isArray(value)) {
                    config[key] = value;
                } else if (value && value != ( "" || undefined)) {
                    config[key] = [value];
                } else {
                    config[key] = [];
                }
            });

            if (config[key] && config[key].length > 0) {
                selector.val(config[key][0]);
            } else {
                selector.val('');
            }
        },

        _setupPropertySelect: function(selector, key, collection, nullable) {
            this._populatePropertySelect(selector, collection, nullable);
            this._setupSelectPropertyHandler(selector, key);
        },
//        _setupMultiSelectOptionHandler: function(selector, key, collection) {
//            var config = this.config;
//            var value = this.config[key];
//            if (value) {
//                $.each(value, function() {
//                    var prop = Freemix.property.propertyList[this];
//                    if (prop.enabled()) {
//                        var option = $("<option selected='selected'></option>");
//                        option.attr("name", prop.name());
//                        option.text(prop.label());
//                        selector.append(option);
//                    }
//                });
//            }
//
//            $.each(collection, function() {
//                if ($.inArray(this.name(), value) < 0) {
//                    var option = $("<option></option>");
//                    option.attr("name", this.name());
//                    option.text(this.label());
//                    selector.append(option);
//                }
//            });
//
//            selector.parent().on('change', 'select', function() {
//                config[key] = $(this).val();
//            });
//
//            selector.multiselect({width: 400, height: 125, sortable: true});
//
//        },
        _renderListLens: function(config) {
            var lens = $("<div class='list-lens' ex:role='lens' style='display:none'></div>");
            var props = Freemix.property.propertyList;

            var title = $("<div class='exhibit-title ui-widget-header'></div>");
            if (config.title) {
                var html = $("<span></span>");
                html.attr("ex:content", props[config.title].expression());
                title.append(html);
                if (config.titleLink) {
                    title.append("&nbsp;");
                    html= $("<a target='_blank'>(link)</a>");
                    html.attr("ex:href-content", props[config.titleLink].expression());
                }
                title.append(html);

            }

            var table = $("<table class='property-list-table exhibit-list-table'></table>");
            $.each(config.metadata,
            function(index, metadata) {
                var property = metadata.property;
                var identify = props[property];
                if (!metadata.hidden && identify) {
                    var tr = $("<tr class='exhibit-property'></tr>");
                    var label = identify.label();
                    var td = $("<td class='exhibit-label'></td>");
                    td.text(label);
                    tr.append(td);
                    td = $("<td class='exhibit-value'>" +renderProperty(metadata) + "</td>");
                    tr.append(td);
                    table.append(tr);
                }

            });
            lens.append(title);
            lens.append(table);
            return lens;

        },
        _renderFormats: function(view, config) {
             config = config || this.config;
             if (config.title) {
                var props = Freemix.property.propertyList;
                view.attr("ex:formats", "item {title:expression(" + props[config.title].expression() + ")}");
             }
        },
        _renderOrder: function(view, config) {
            var show_directions = true;
            if (config.orders && (config.orders.length > 0)) {
                view.attr("ex:orders", this._mapExpressions(config.orders));
                if (config.directions && (config.directions.length == config.orders.length)) {
                    view.attr("ex:directions", config.directions.join(","));
                }
            } else {
                if (config.title) {
                    view.attr("ex:orders", this._expression(config.title));
                }
                if (config.directions && (config.directions.length > 0)) {
                    view.attr("ex:directions", config.directions[0]);
                }
            }

            if (config.possibleOrders && config.possibleOrders.length > 0) {
                view.attr("ex:possibleOrders", this._mapExpressions(config.possibleOrders));
            } else {
                var exp = this._expression;

                view.attr("ex:possibleOrders", $.map(Freemix.property.enabledPropertiesArray(), function(p) {
                    return exp(p.name());
                }).join(","));
            }
        }
     });


    Freemix.view = {
        types: [],
        addViewType: function(content) {
            var type = content.config.type;
            Freemix.view.types.push(type);

            var proto = $.extend(true, {},Freemix.exhibit.view,content);
            if (content.propertyTypes) {
                proto.propertyTypes = content.propertyTypes;
            }
            Freemix.view.prototypes[type]=proto;
        },
        prototypes: {},
        createView: function(properties) {
             var props = $.extend({}, properties);
             if (!props.id) {
                 props.id = $.make_uuid();
             }
             return $.extend(true, {}, Freemix.view.prototypes[props.type], {"config": props});

         },
        getViewContainer: function(id) {
            return $(".view-container#" + id, Freemix.getBuilder()).data("model");
        }
     };
})(window.Freemix.jQuery, window.Freemix);
