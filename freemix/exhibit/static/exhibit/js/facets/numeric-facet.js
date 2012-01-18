/*global jQuery */
(function($, Freemix) {

   Freemix.facet.addFacetType({
       facetClass: Exhibit.NumericRangeFacet,
       propertyTypes: ["number", "currency"],
       thumbnail: "/static/exhibit/img/numeric-facet.png",
       label: "Range",
       config: {
           type: "NumericRange",
           interval: 10
       },
       generateExhibitHTML: function (config) {
           config = config || this.config;
           var result = $("<div ex:role='facet' ex:facetClass='NumericRange'  class='exhibit-facet'></div>");
           result.attr("ex:expression", config.expression);
           if (config.name && config.name.length > 0) {
               result.attr("ex:facetLabel", config.name);
           }
           if (config.interval  && config.interval > 0) {
               result.attr("ex:interval", config.interval);
           }

           return result;

       },
       showEditor: function(facetContainer) {
           var facet = this;
           var config = $.extend(true, {}, facet.config);
           var template = Freemix.getTemplate("numeric-facet-editor");
           facetContainer = facetContainer || facet.findContainer();
           var dialog = facetContainer.getDialog();
           template.data("model", this);
           template.find("form").submit(function() {return false;});

           function updatePreview() {
               var preview = $(facet.generateExhibitHTML(config));
               template.find("#facet-preview").empty().append(preview);
               var exhibit = Freemix.getBuilderExhibit();
               facet.facetClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());

           }

           function roundPow10(value) {
               return Math.pow(10, Math.ceil(Math.log(value)/Math.log(10)));
           }

           function updateSlider() {
               var slider = template.find("#range_interval_slider");
               var input = template.find("$#range_interval");
               var database = Freemix.getBuilderExhibit().getUIContext().getDatabase();
               var path = Exhibit.ExpressionParser.parse(config.expression).getPath();

               var propertyID = path.getLastSegment().property;
               var property = database.getProperty(propertyID);
               var rangeIndex = property.getRangeIndex();

               var delta = rangeIndex.getMax() - rangeIndex.getMin();



               var max = roundPow10(Math.ceil(delta/2));
               var min = Math.max(Math.ceil(delta/100), 1);
               if (min > 100) {
                   min = Math.floor(min/100)*100;
               }

               var base = roundPow10(min);
               var step = Math.ceil(base/100);

               input.data("range", {"min": min, "max": max});

               clampInterval(base);

               slider.slider('option', {
                   max: max,
                   min: min,
                   value: config.interval,
                   step: step
               });


           }

           function clampInterval(base) {
               var input = template.find("$#range_interval");
               var range = input.data("range");
               if (config.interval < range.min) {

                   base = base||range.min;
                   config.interval = base;
               }
               config.interval = Math.min(config.interval, range.max);
               input.val(config.interval);
           }


           var select = template.find("#facet_property");
           var properties = Freemix.facet.generatePropertyList(facet.propertyTypes);

           $.each(properties, function() {
               var option = "<option value='" + this.expression + "'>" + this.label + "</option>";
               select.append(option);
           });
           if (config.expression) {
               select.val(config.expression);
           } else {
               select.get(0).options[0].selected=true;
               config.expression = select.val();
           }
           select.change(function() {
               config.expression = $(this).val();
               updateSlider();
               updatePreview();
           });

           var label = template.find("#facet_name");
           label.val(config.name);
           label.change(function() {
               config.name = label.val();
               updatePreview();
           });

           var interval = template.find("#range_interval");
           var slider = template.find("#range_interval_slider");

           interval.val(config.interval);
           interval.change(function(event) {
               config.interval = parseInt($(event.target).val());
               slider.slider("value", config.interval);
               updatePreview();

           });

           slider.slider({
               slide: function(event, ui) {
                   interval.val(ui.value);
                   config.interval=ui.value;
                   updatePreview();
                   return true;
               }
           });

           dialog.empty().append(template).dialog("option", {
               title: "Edit Numeric Range",
               position: "center",
               buttons: [{
                   text: "Ok",
                   id: "ok-button",
                   click: function() {
                           var model = template.data("model");
                           model.config = config;
                           facetContainer.findWidget().trigger("edit-facet");
                           model.refresh();
                           facetContainer.getDialog().dialog("close");
                       }
                   },
                   {
                   text: "Cancel",
                   click: function() {
                           $(this).dialog("close");
                       }
                   }
             ]
           }).dialog("option", "position", "center");
           updateSlider();
           updatePreview();
           dialog.dialog("open");
        }
   });
})(window.Freemix.jQuery, window.Freemix);
