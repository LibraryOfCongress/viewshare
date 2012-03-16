/*global jQuery */
(function($, Freemix) {
    var root;
    var refreshRequired = false;

    function showDescribeMessage(id) {
        $("#describe_messages li").hide();
        $("#describe_messages, #describe_messages #" + id).fadeIn().effect("highlight");
    }

    function validate() {
        root.find(".error").removeClass("error");
        root.find(".errorField").hide();

        var success = true;
        if (!($.trim(root.find("#id_name").val()).length > 0)) {
            $("#div_id_name").addClass("error");
            $("#div_id_name").find(".errorField").show();
            success = false;
        }
        if (root.find(".field_type.selected").length === 0) {
            $("#div_id_type").addClass("error");
            $("#div_id_type").find(".errorField").show();
            success = false;
        }

        if (success) {
            success = form_handler().validate();
        }

        return success;

    }

    function form_handler() {
        return root.find(".field_type.selected").data("handler");
    }

    function CompositeProperty() {

    }

    CompositeProperty.prototype = {
        showForm: function() {
            root.find(".pattern_form").hide();
            root.find("#edit_field_dialog_create,.composite_form").show();

        },
        validate: function() {
            var success=true;
            if (!root.find("#edit_field_dialog_fields").val() ||
                root.find("#edit_field_dialog_fields").val().length === 0) {

                $(".composite_form #div_id_fields").addClass("error");
                $(".composite_form #div_id_fields").find(".errorField").show();
                success = false;
            }
            return success;
        },
        serialize: function() {
            return {
                property: slugify(root.find("#id_name").val()),
                label: root.find("#id_name").val(),
                tags: ["property:type=" + root.find(".field_type.selected").attr("id")],
                composite: root.find("#edit_field_dialog_fields").val(),
                enabled:true
            };
        },
        reset: function() {

            root.find("#edit_field_dialog_create").hide();
            root.find(".advanced_pattern").hide();
            root.find("select#edit_field_dialog_fields").empty();
            $.each(Freemix.property.enabledPropertiesArray(), function() {
                var prop = this;
                $("<option>", {
                    id: prop.name(),
                    value: prop.name(),
                    text: prop.label()
                }).appendTo("select#edit_field_dialog_fields");
            });
            root.find("select#edit_field_dialog_fields").multiselect("refresh");
            root.find(".error").removeClass("error");
            root.find(".errorField").hide();
        }
    };

    function PatternProperty() {
        $("#edit_field_pattern_select", root).change(function() {
            var pattern_key = $(this).val();
            if (pattern_key !== "") {
                var pattern = $("#contents").data("list_extraction_patterns")[pattern_key];
                $("#edit_field_pattern_text").val(pattern.pattern);
                $("#edit_field_pattern_type_select").val(pattern.type);
            }
        });
    }

    PatternProperty.prototype = {
        showForm: function() {
            root.find(".composite_form").hide();
            root.find("#edit_field_dialog_create, .pattern_form").show();
        },
        validate: function() {
            var success=true;
            if (!root.find("#edit_field_pattern_text").val() ||
                root.find("#edit_field_pattern_text").val().length === 0) {

                $("#div_pattern").addClass("error");
                $("#div_id_pattern").find(".errorField").show();
                success = false;
            }
            if (!root.find("#edit_field_pattern_source_select").val() ||
                root.find("#edit_field_pattern_source_select").val().length === 0) {

                $(".pattern_form #div_id_pattern_source_select").addClass("error");
                $(".pattern_form #div_id_pattern_source_select").find(".errorField").show();
                success = false;
            }

            return success;
        },
        serialize: function() {
            var extract = root.find("#edit_field_pattern_source_select").val();
            var pattern_type = root.find("#edit_field_pattern_type_select").val();
            var type = Freemix.property.propertyList[extract].type();
            var pattern = root.find("#edit_field_pattern_text").val();
            var result = {
                property: slugify(root.find("#id_name").val()),
                label: root.find("#id_name").val(),
                tags: ["property:type=" + type, "property:type=shredded_list"],
                extract: extract,
                enabled:true
            };
            result[pattern_type] = pattern;
            return result;
        },
        reset: function() {
            root.find("#edit_field_pattern_select").val("");
            root.find("#edit_field_pattern_text").val("");
            root.find("#edit_field_pattern_text_user_input").val("");
            root.find("#edit_field_pattern_type_select").val("pattern");
            root.find("#edit_field_dialog_create").hide();
            root.find("select#edit_field_pattern_source_select").empty();
            $.each(Freemix.property.enabledPropertiesArray(), function() {
                var prop = this;
                $("<option>", {
                    id: prop.name(),
                    value: prop.name(),
                    text: prop.label()
                }).appendTo("select#edit_field_pattern_source_select");
            });
            root.find(".error").removeClass("error");
            root.find(".errorField").hide();
        }
    };

    function augmentedProperties() {
        var results = [];
        $.each(Freemix.property.propertyList, function(name, prop){
            if (prop.isAugmented()) {
                results.push(name);
            }
        });
        return results;
    }

    function resetForm() {
        root.find(".error").removeClass("error");
        root.find(".errorField").hide();
        root.find("select#edit_field_dialog_fields").empty();
        root.find(".pattern_form").hide();
        root.find(".composite_form").hide();
        root.find("#id_name").val("");
        root.find(".field_type").removeClass("selected");
        root.find(".field_type").removeClass("selected").find("img").removeClass("ui-state-active");
        $.each(root.find(".field_type"), function() {
            $(this).data("handler").reset();
        });
    }

    function slugify(name) {
        var slug = name.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'_');
        while(Freemix.property.propertyList[slug]) {
            slug += "_";
        }
        return slug;
    }
    function showProgressbar() {
        $("#identify #editor, #subnav, #buttons").hide();
        $("#identify #augmenting").fadeIn();
    }

    function hideProgressbar() {
        $("#identify #augmenting").hide();
        $("#identify #editor, #subnav, #buttons").fadeIn();

    }


    function mergeData(database, dataset) {
        var props=augmentedProperties();
        for (var inx = 0 ; inx < props.length ; inx++) {
            var p = props[inx];
            $.each(database.getAllItems(), function(inx, id) {
                database.removeObjects(id,p);
            });
        }
        database.loadData({"items": dataset.items});
    }

    function hideFailurePicker() {
        $("#identify #augment-failure-picker").hide();
        $("#identify #editor, #subnav").show();
    }

    function refresh() {
        function validate(data) {
            if (!data.items) {
                return false;
            }
            var props = augmentedProperties();
            for (var inx = 0 ; inx < props.length ; inx++) {
                var p = props[inx];
                var found = false;
                $.each(data.items, function(inx, item) {
                    if (item[p]) {
                        found = true;
                    }
                });
                if (!found) return false;

            }
            return true;
        }
        showProgressbar();
        var identify = $("#contents").data("identifier");
        var data = $.extend({},
                Freemix.exhibit.exportDatabase(identify.database),
                {"data_profile": Freemix.profile});
        $.ajax({
            url: "/augment/transform/",
            type: "POST",
            contentType: "application/json",
            data: $.toJSON(data),
            success: function(data, textStatus, XMLHttpRequest) {
                var failed = data.failed || {};
                var count = identify.database.getAllItemsCount();

                identify._augment_failed = failed;

                $(".property-row").removeClass("ui-state-error").removeClass("ui-state-highlight");
                $(".augmented.status").empty().append("" + count + " values generated");
                var msgClass = validate(data) ? "augmentation-success" : "augmentation-failure";
                $.each(failed, function(key, value){
                    if (value.length == count) {
                        $(".property-row#" + key).addClass("ui-state-error").find(".augmented.status").empty().append("No values generated for " + count + " records");
                    } else {
                        $(".property-row#" + key).addClass("ui-state-highlight").find(".augmented.status").empty().append("" + (count - value.length) + " of " + count + " values generated");
                    }
                    var p = key;
                    $("<span>&nbsp;(<a href=''>more info</a>)</span>").click(function(e) {
                        $("#augment-failure-picker").augmentFailurePicker(Freemix.property.propertyList[p], failed[p]);
                        e.preventDefault();
                    }).appendTo(".property-row#" + key + " .augmented.status");
                    msgClass = "augmentation-failure";
                });

                refreshRequired=false;
                mergeData(identify.database, data);
                $("#contents").data("identifier").populateRecordDisplay();
                showDescribeMessage(msgClass);
                hideProgressbar();

            },
            processData: false,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                refreshRequired=false;
                hideProgressbar();
                showDescribeMessage("augmentation-failure-server");
            },
            dataType: "json"
        });
    }


    Freemix.Identify.prototype.retrieveFailure = function(property) {
        if (!this._augment_failed) return false;
        if (!this._augment_failed[property.name()]) return false;
        var id = this.getCurrentId();
        var f = $.grep(this._augment_failed[property.name()], function(item, inx) {
            return item.id == id;
        });

        if (f.length > 0) {
            return f[0];
        }
    };

    Freemix.Identify.prototype.getCurrentId = function() {
        var record_num = this.getCurrentRecord();
        var database = this.database;
        var recordIds = database.getAllItems();
        return recordIds.toArray()[record_num];

    };
    function renderInput(input) {
        if (input.join) {
            return input.join(', ');
        } else {
            return input;
        }
    }

    function renderReason(reason) {
        var errors = $("#contents").data("augmentation_error_codes");
        if (errors[reason]) {
            return $("<span>" + reason + "&nbsp;(<a href='" + errors[reason] +"' target='_blank'>help</a>)</span>");
        } else {
            return reason;
        }
    }

    Freemix.Identify.prototype._renderProperty = Freemix.Identify.prototype.renderProperty;
    Freemix.Identify.prototype.renderProperty = function(row) {
        var record_num = this.getCurrentRecord();
        var database = this.database;
        var recordIds = database.getAllItems();
        var id = recordIds.toArray()[record_num];
        var property = row.data("property");

        var failure = this.retrieveFailure(property);
        if (failure) {
            var result = $("<em>").append(renderReason(failure.reason)).append("<div>Input: " + renderInput(failure.input) + "</div>");
        } else {
            var value = database.getObjects(id, property.name()).toArray();
            result = property.getValueHtml(value);
        }
        row.find(".value").empty().append(result);
    };


    Freemix.property.prototype._getValueHtmlForAugment  = Freemix.property.prototype.getValueHtml;
    Freemix.property.prototype.getValueHtml = function(value) {
        var response = this._getValueHtmlForAugment(value);

        if (this.isAugmented() && $(response).text() == "No Value" ) {
            if (refreshRequired) {
                response = $("<div id=\"systemMsg\"><ul class=\"messages\"><li class=\"warningMsg\">Click the 'Augment' button to generate data for this field.</li></ul></div>");
            } else {
                response = $("div id=\"systemMsg\"><ul class=\"messages\"><li class=\"validationMsg\">No " + this.type() + " data has been generated for this record.</li></ul></div>");
            }
        }
        return response;
    };

    Freemix.Identify.prototype._renderTypeForAugment = Freemix.Identify.prototype.renderType;
    Freemix.Identify.prototype.renderType = function(row, column) {
        var property = row.data("property");
        if (!property.isAugmented()) {
            return this._renderTypeForAugment(row, column);
        }
        var type = property.type();
        var label = Freemix.property.type[type].label || type;
        return $("<div>" + label + "</div>").appendTo(column);
    };

    Freemix.Identify.prototype._addPropertyForAugment = Freemix.Identify.prototype.addProperty;
    Freemix.Identify.prototype.addProperty = function(property) {
        var row = this._addPropertyForAugment(property);
        var nameCol = row.find("td.name");
        if (property.isAugmented()) {
            if (property.isComposite()) {
                nameCol.append('<p class="augmented">Derived from these fields:</p>');
                var ul = $("<ul></ul>", { "class": "augmented" }).appendTo(nameCol);

                $.each(property.config.composite, function(inx) {
                    ul.append("<li>" + property.config.composite[inx] + "</li>");
                });

            } else if (property.isExtract()) {
                nameCol.append("<p class='augmented'>Extracted from " + property.config.extract + "</p>");
            }
            nameCol.append("<div class='augmented status'></div>");

        }

    };
    Freemix.property.prototype.isAugmented = function() {
        return this.isComposite() || this.isExtract();
    };
    Freemix.property.prototype.isComposite = function() {
        if (this.config.composite) {
            return true;
        }
        return false;
    };
    Freemix.property.prototype.isExtract = function() {
        if (this.config.extract) {
            return true;
        }
        return false;
    };

    $.fn.augmentFailurePicker = function(property, failures) {

        if (property) {
            return this.each(function() {
                var root = $(this);
                root.data("property", property);

                var tbody = $("tbody", root);
                $("h1 span", root).text(property.label());
                var dt = root.data("dt");
                dt.fnClearTable();
                var identify = $("#contents").data("identifier");

                $.each(failures, function(inx, record) {
                    var recordInx = identify.getRecordIndexById(record.id);
                    if (recordInx >=0) {
                        var nodeInx = dt.fnAddData([recordInx+1, record.reason, renderInput(record.input)]);
                        var row = dt.fnGetNodes(nodeInx);
                        $(row).data("id", record.id).data("label", record.label);
                    }
                });
                dt.fnDraw();
                window.location.hash="";
                $("#identify #editor, #subnav").hide();
                root.show();
                dt.fnDraw();
            });
        } else {
            return this.each(function() {
                var root = $(this);
                var dt = $("table", root).dataTable({
                    "sScrollY": "200px",
                    "bScrollCollapse": true,
                    "bPaginate": false,
                    "bJQueryUI": true
                });

                root.data("dt", dt);

                $("tbody tr", root).live("mouseover", function() {$(this).addClass("ui-state-hover");$(this).css("cursor", "pointer");});
                $("tbody tr", root).live("mouseout", function() {$(this).removeClass("ui-state-hover");});
                $("tbody tr", root).live("click", function() {
                    var id = $(this).data("id");
                    var property = root.data("property");
                    var label = $(this).data("label");
                    var identify = $("#contents").data("identifier");
                    identify.setCurrentRecordById(id);
                    identify.populateRecordDisplay();
                    root.hide();
                    $("#identify #editor, #subnav").show();
                    window.location.hash=property.name();
                    $("tr#" + property.name()).effect("highlight");
                });
                $("#back-to-describe").button({
                        "icons": {"primary": "ui-icon-arrowreturnthick-1-w"}
                }).click(function() {
                    root.hide();
                    $("#identify #editor, #subnav").show();
                });
            });
        }

    };

    $(document).ready(function() {

        $.getJSON("/augment/patterns.json", function(data) {
            $("#contents").data("list_extraction_patterns", data);
        });
        $.getJSON("/augment/errors.json", function(data) {
            $("#contents").data("augmentation_error_codes", data);
        });
        $("#augment-failure-picker").augmentFailurePicker();

            root = $("#edit_field_dialog").dialog({
                    position: "top",
                    autoOpen: false,
                    width: 600,
                    height: "auto",
                    modal: true,
                    draggable: false,
                    resizable: false,
                    title: "Data Augmentation"
            });
            $(".multiselect", root).multiselect({width: 550, height: 250, sortable: true});

	    /*
            $("button.data-property-add").button({"icons": {"primary": "ui-icon-plus"}}).click(function(event) {
                resetForm();
                root.dialog("open");
                event.preventDefault();
                return false;
            });
	    */

	    /* handle buttong display via css */

            $("button.data-property-add").button().click(function(event) {
                resetForm();
                root.dialog("open");
                event.preventDefault();
                return false;
            });



            $(".field_type#location", root).data("handler", new CompositeProperty());
            $(".field_type#date", root).data("handler", new CompositeProperty());
            $(".field_type#pattern", root).data("handler", new PatternProperty());

            $(".field_type", root).click(function(event) {
                $(".field_type", root).removeClass("selected").find("img").removeClass("ui-state-active");

                $(this).addClass("selected").find("img").addClass("ui-state-active");
                $(this).data("handler").reset();
                $(this).data("handler").showForm();
                return false;
            });

            $(".field_type img", root).hover(
                function () {
                    $(this).addClass("ui-state-hover");
                },
                function () {
                    $(this).removeClass("ui-state-hover");
                }
            );

            $('#edit_field_pattern_text_user_input', root).bind('change', function() {
                $('#edit_field_pattern_text', root).val($(this).val());
            });

            $('#advanced_pattern_open', root).bind('click', function(e) {
                e.preventDefault();
                $('#edit_field_pattern_select', root).val('');
                $('.advanced_pattern', root).show();
                return false;
            });

            root.submit(function() {
                if (validate()) {
                    var identify = $("#contents").data("identifier");
                    var prop = Freemix.property.add(form_handler().serialize());
                    refreshRequired = true;
                    identify.addProperty(prop);
                    identify.populateRecordDisplay();
                    $("button.data-refresh").trigger("update");
                    root.dialog("close");
                }
                return false;
            });

            function enableRefresh() {
                var shouldEnable = false;
                if (Freemix.property.propertyList) {
                    $.each(Freemix.property.propertyList, function() {
                        if (this.isAugmented()) {
                            shouldEnable = true;
                        }
                    });
                }
                if (shouldEnable) {
                    $("button.data-refresh").show();
                } else {
                    $("button.data-refresh").hide();
                }

            }
            var augment = $("button.data-refresh");
            /* augment.button({"icons": {"primary": "ui-icon-arrowrefresh-1-s"}}); */
            
	    /* handle button display via css */
	    augment.button();
	    
            augment.click(function(event) {
                refresh();
                event.preventDefault();
                return false;
            }).bind("update", function(e, data) {
               enableRefresh();
            });

            $("#contents").bind("post_setup_identifier.dataset", function() {
                enableRefresh();
            });
        });

})(window.Freemix.jQuery, window.Freemix);

