/*global jQuery */
(function($, Freemix) {

    Freemix.exhibit.facetContainer = {
        id: "",
        findWidget: function() {
            if (!this._selector) {
                this._selector = $(".facet-container#" + this.id, Freemix.getBuilder());
            }
            return this._selector;
        },

        serialize: function() {
            var config = [];
            this.findWidget().find(".facet").each(function() {
                 var data = $(this).data("model");
                 config.push(data.serialize());
            });
            return config;
        },
        addFacet: function(facet) {
            facet.findWidget().appendTo(this.findWidget());
            facet.refresh();
            Freemix.getBuilder().on("freemix.show-builder", function() {
                facet.refresh();
            });

        },
        generateExhibitHTML: function() {
            var result = "";
             this.findWidget().find(".facet").each(function() {
                 result += $(this).data("model").generateExhibitHTML();
            });
            return result;
        },
        getDialog: function() {
            return this._dialog;
        },
        getPopupContent: function() {
            var fc = this;

            var chooserThumbnails = $("<div><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h3 id='addWidgetModalLabel'>Select Facet Widget</h3></div></div>");
            
            $("<div class='chooser modal-body'></div>").freemixThumbnails(
                                                                  Freemix.facet.types, Freemix.facet.prototypes,
                                                                  function(facetTemplate) {
                                                                      var facet = Freemix.facet.createFacet({type: facetTemplate.config.type});
                                                                      fc.findWidget().one("edit-facet", function() {
                                                                              fc.addFacet(facet);
                                                                          });
                                                                      facet.showEditor(fc);
                                                                  }).appendTo(chooserThumbnails);
            
            return chooserThumbnails;
            
        },
        getPopupButton: function() {
            return this.findWidget().find(".create-facet-button");
        }
    };

    Freemix.exhibit.facet = $.extend(true, {}, Freemix.exhibit.widget, {
        facetClass: Exhibit.ListFacet,
        findContainer: function() {
            return this.findWidget().parents(".facet-container").data("model");
        },
        generateWidget: function() {
            var facet = this;
            return $("<div class='facet ui-draggable'>" +
                "<div class='facet-header ui-state-default ui-helper-clearfix ui-dialog-titlebar' title='Click and drag to move to any other facet sidebar or to reorder facets'>" +
                "<span class='ui-icon ui-icon-grip-dotted-vertical'/>" +

                "<span class='label'/>" +
                "<a href='#' class='delete-button ui-icon ui-icon-closethick' title='Delete this facet'/>" +
                "</div>" +
                "<div class='facet-body ui-widget-content'>" +
                "<div class='facet-content'></div>" +
                "<div class='facet-menu'><a href='#' title='Edit this facet'><span class='ui-icon ui-icon-pencil'/>edit</a></div>" +

                "</div></div>")
            .attr("id", this.config.id)
            .find("span.label").text(this.label).end()
            .data("model", this)
            .find(".delete-button").click(function() {
                    facet.remove();
                    return false;
                }).end()
            .find(".facet-menu a").click(function() {
                    facet.showEditor();
                    return false;
                }).end();

        },

        refresh: function() {
            this.findWidget().find(".facet-content").empty().append(this.generateExhibitHTML());
            var exhibit = Freemix.getBuilderExhibit();
            this.facetClass.createFromDOM(this.findWidget().find(".facet-content div").get(0), null, exhibit.getUIContext());

        },

        showEditor: function(facetContainer){
            var facet = this;
            var config = $.extend(true, {}, facet.config);
            var template = Freemix.getTemplate("facet-editor");
            facetContainer = facetContainer || facet.findContainer();
            var dialog = facetContainer.getDialog();
            template.data("model", this);
            var form = Freemix.getTemplate(this.template_name);
            template.find(".facet-properties .facet-edit-body").append(form);

            form.submit(function() {return false;});

            template.bind("update-preview", function() {
                facet.updatePreview(template.find("#facet-preview"), config);
            });
            this.setupEditor(config, template);

            dialog.empty().append(template);
            dialog.find("#facet_save_button").click(function() {
               var model = template.data("model");
               model.config = config;
               facetContainer.findWidget().trigger("edit-facet");
               model.refresh();
               facetContainer.getDialog().modal("hide");
            });

            template.trigger("update-preview");
            dialog.modal("show");
        },
        updatePreview: function(target, config) {
            var preview = $(this.generateExhibitHTML(config));
            target.empty().append(preview);
            var exhibit = Freemix.getBuilderExhibit();
            this.facetClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());
        },
        generateExhibitHTML: function(config) {}
     });

    function isFacetCandidate(prop) {
        return (prop.values > 1 && prop.values + prop.missing != Freemix.exhibit.database.getAllItemsCount());
    }

    function simpleSort(a, b) {
        if (a.missing == b.missing) {
            return a.values - b.values;
        } else {
            return a.missing - b.missing;
        }
    }

    function sorter(a, b) {
        var aIsCandidate = isFacetCandidate(a);
        var bIsCandidate = isFacetCandidate(b);

        if ((aIsCandidate && bIsCandidate) || (!aIsCandidate && !bIsCandidate)) {
            return simpleSort(a, b);
        }
        return bIsCandidate ? 1: -1;
    }

     Freemix.facet = {
        createFacet: function(properties) {
            var props = $.extend({}, properties);
            if (!props.id) {
                props.id = $.make_uuid();
            }
            return $.extend(true, {},Freemix.facet.prototypes[properties.type], {config: props});
        },
        types: [],
        prototypes: {},
        addFacetType: function(content) {
            var type = content.config.type;
            Freemix.facet.types.push(type);

            var proto = $.extend(true, {},Freemix.exhibit.facet,content);
            if (content.propertyTypes) {
                proto.propertyTypes = content.propertyTypes;
            }
            Freemix.facet.prototypes[type]=proto;
        },
        getFacetContainer: function(id) {
          return $(".facet-container#" + id, Freemix.getBuilder()).data("model");
        },
        generatePropertyList: function(types) {
            var properties = [];
            var proplist = types? Freemix.property.getPropertiesWithTypes(types) : Freemix.property.enabledPropertiesArray();
            $.each(proplist, function() {
                properties.push(Freemix.exhibit.getExpressionCount(this.expression(), this.label()));
            });
            properties.sort(sorter);
            return properties;
        }
    };

})(window.Freemix.jQuery, window.Freemix);
