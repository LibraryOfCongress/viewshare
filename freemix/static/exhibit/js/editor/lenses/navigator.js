(function($, Freemix, Exhibit) {
    "use strict";

    var editor,sidebar;
    $(document).ready(function() {
        editor = $("#lens_navigator");
        sidebar = editor.find(".sidebar");
    });

    function lensTableRow(lens) {
        var row = $("<li></li>");
        row.attr("id", lens.config.id);
        row.append("<a href='#'></a>");
        row.find("a").text(lens.config.name).click(lensClickHandler);
        return row;
    }

    function populateTable() {
        var list = sidebar.find("ul");

        list.empty();

        for (var inx = 0 ; inx < Freemix.lens._array.length ; inx++) {
            list.append(lensTableRow(Freemix.lens._array[inx]));
        }

    }

    function populateLensTypeSelect() {
        var select = $("#lens_type_select", editor);
        for (var type in Freemix.lens.prototypes) {
            var enabled = true;
            var proto = Freemix.lens.prototypes[type];
            if (proto.propertyTypes &&
                (Freemix.exhibit.database.getPropertiesWithTypes(proto.propertyTypes).length === 0)) {
                    enabled=false;
            }

            var option = $("<option></option>");
            option.attr("value", type);
            option.text(proto.label);
            if (!enabled) {
                option.attr("disabled", "disabled");
            }
            select.append(option);
        }
        select.on("change", function() {
            var old = editor.data("model");
            var config = {
                "id": old.config.id,
                "title": old.config.title,
                "titleLink": old.config.titleLink
            };
            if (old.config.name !== Freemix.lens.prototypes[old.config.type].prototype.config.name) {
                config.name = old.config.name;
            }
            var lens = Freemix.lens.construct(select.val(), config);
            Freemix.lens.add(lens);
            populateTable();
            selectDefault(false);
            activate(config.id);
        });

    }

    function activate(id) {
        var list = sidebar.find("ul");
        var li = list.find("li#" + id);
        var lens = Freemix.lens.getLens(id);
        li.addClass("active").siblings().removeClass("active");

        editor.data("model", lens);
        editor.trigger("model_refresh.lens");
    }

    function lensClickHandler(evt) {
        var target = $(evt.currentTarget).parent("li");
        var id = target.attr("id");
        activate(id);

    }

    function highlight(id) {
        var list = sidebar.find("ul");
        list.find("li a strong").contents().unwrap();
        var li = list.find("li#" + id).find("a").wrapInner("<strong></strong>");
    }

    function selectDefault(active) {
        var default_lens = Freemix.lens.getDefaultLens();

        highlight(default_lens.config.id);
        if (active) {
            activate(default_lens.config.id);
        }
    }

    function setDefaultHandler(evt) {
        var list = sidebar.find("ul");
        var id = list.find("li.active").attr("id");
        var lens = Freemix.lens._hash[id];
        highlight(id);

        Freemix.lens.setDefaultLens(lens);
        return false;
    }

    function newLensHandler() {
        var lens = Freemix.lens.createBasicLens();
        var row = lensTableRow(lens);
        var list = sidebar.find("ul");
        list.append(row);
        activate(lens.config.id);

        return false;
    }


    function lensLabelHandler() {
        var model = editor.data("model");
        model.config.name = $(this).val();
        populateTable();
        selectDefault(false);
        return false;
    }

    function modelRefresh() {
        var model = editor.data("model");
        editor.find("#lens_label_input").val(model.config.name);
        editor.find("#lens_type_select").val(model.config.type);
        model.initializeEditor(editor);
        editor.off(model.refreshEvent).on(model.refreshEvent, function() {
            editor.data("model").refreshPreview();
        });
        editor.trigger(model.refreshEvent);
    }

    Freemix.lens.setupEditor = function() {
        editor.on("show", function() {
            $("#lens_button").addClass("active").siblings().each(function() {
                var selector = $(this).attr("data-target");
                $(selector).collapse("hide");
            });
            var default_lens = Freemix.lens.getDefaultLens();

            populateTable();
            selectDefault(true);

        });

        editor.on("hide", function() {
            $("#lens_button").removeClass("active");
        });

        sidebar.find(".set-default-lens-button").on('click', setDefaultHandler);
        sidebar.find(".add-lens-button").on('click', newLensHandler);
        editor.find("#lens_label_input").on("change", lensLabelHandler);
        editor.on("model_refresh.lens", modelRefresh);

        populateLensTypeSelect();

    };


})(window.Freemix.jQuery, window.Freemix, window.Exhibit);