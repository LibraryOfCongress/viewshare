/*global jQuery */
(function($, Freemix) {


    $.fn.createChildCheck = function(config) {
        return this.each(function() {
            var $this = $(this);
            var type = config.radio ? 'radio' : 'checkbox';
            var name = config.name ? config.name : $.make_uuid();

            var disabled = "";
            if (config.enabled) {
                if (!config.enabled()) {
                    disabled = " disabled='true'";
                }
            }
            var check = $("<input type='" + type + "' name='" + name + "'" + disabled + "/>");
            $this.append(check);
            if (config.checked) {
                check.attr("checked", "checked");
            }
            if (config.change) {
                check.click(config.change);
            }
        });
    };

    // Set the record number.
    function setCurrentRecord(model, record_num) {
        model.getContent().data("record_num", record_num);
        return record_num;
    }

    function getCurrentRecord(model) {
        var record_num = model.getContent().data("record_num");
        if (!record_num) {
            record_num = setCurrentRecord(model, 0);
        }
        return record_num;
    }

    function nextRecord(model) {
        var next = getCurrentRecord(model) + 1;
        next = next % Freemix.exhibit.database.getAllItemsCount();
        setCurrentRecord(model, next);
    }

    function previousRecord(model) {
        var previous = getCurrentRecord(model) - 1;
        if (previous < 0) {
            previous = Freemix.exhibit.database.getAllItemsCount() - 1;
        }
        setCurrentRecord(model, previous);
    }

    function populateRecordDisplay(model) {

        var content = model.getContent();
        // Set the record counters.
        var record_num = getCurrentRecord(model);
        var database = Freemix.exhibit.database;
        var num_records = database.getAllItemsCount();
        var recordIds = database.getAllItems();
        var id = recordIds.toArray()[record_num];
        var record = database.getItem(id);

        content.find("#current-record").html(record_num + 1);
        content.find("#record-count").html(num_records);
        $("tr.property-row", content).each(function() {
            var row = $(this);
            renderProperty(model, row);
        });

        model.getContent().trigger("display-record", [record]);
    }

    function renderProperty(model, row) {
        var record_num = getCurrentRecord(model);
        var database = Freemix.exhibit.database;
        var recordIds = database.getAllItems();
        var id = recordIds.toArray()[record_num];
        var metadata = row.data("metadata");
        var value = database.getObjects(id, metadata.property).toArray();
        var property = Freemix.property.propertyList[metadata.property];
        var result = property.getValueHtml(value);
        row.find(".value").empty().append(result);
    }

    function deriveLabel(metadata) {
        return Freemix.property.propertyList[metadata.property].label();
    }

    function createRow(model, metadata, table, row_callback) {
        var row = $("<tr class='property-row'></tr>").data("metadata", metadata).hide();
        table.append(row);

        $("<td class='visible'></td>").appendTo(row).createChildCheck({
            checked: metadata.hidden !== true,
            change: function() {
                if ($(this).is(":checked")) {
                    metadata.hidden = undefined;
                } else {
                    metadata.hidden = true;
                }
            }
        });
        $("<td class='name'></td>").append("<span>" + deriveLabel(metadata) + "</span>").appendTo(row);
        $("<td class='value'></td>").appendTo(row);
        if (row_callback) {
            row_callback(row, model, metadata);
        }
        try {
            // Firefox 3.6+ (and others?) will display improperly
            // if this is set to 'block'.  This should get fixed in
            // jQuery some day so .show() does The Right Thing.
            row.css('display', 'table-row');
        } catch (ex) {
            // Older browsers don't understand that value, so use 'block' if
            // they barf.
            row.show();
        }
    }


    $.fn.recordPager =  function(row_callback) {
        return this.each(function() {

            var model= $(this).data("model");
            var root = model.getContent();
            var table = root.find(".record-box .property-list-table tbody");
            table.empty();

            $.each(model.config.metadata, function(index, metadata) {
                if (Freemix.property.propertyList[metadata.property]) {
                    createRow(model, metadata, table, row_callback);
                }
            });
            $.each(Freemix.property.enabledPropertiesArray(),
                function() {
                    var name = this.name();
                    var metadata = $.grep(model.config.metadata, function(p) {
                        return p.property == name;
                    });
                    if (metadata.length <= 0) {
                        metadata = {
                            property: name
                        };
                        model.config.metadata.push(metadata);
                        createRow(model, metadata, table, row_callback);
                    }
            });
            table.disableSelection().sortable({
                update: function(event, ui) {
                    var metadata = model.config.metadata;
                    metadata.length = 0;
                    $.each(ui.item.get(0).parentNode.childNodes,
                    function(index, row) {
                        var data = $(row).data("metadata");
                        if (data) {
                            metadata.push(data);
                        }
                    });
                },
                axis: 'y'
            });

            root.find(".left-record-button").button().click(function() {
                previousRecord(model);
                populateRecordDisplay(model);
            });
            root.find(".right-record-button").button().click(function() {
                nextRecord(model);
                populateRecordDisplay(model);
            }).parent().buttonset();
            root.find(".right-record-button").addClass("ui-corner-right");
            root.find(".left-record-button").addClass("ui-corner-left");

            populateRecordDisplay(model);
        });
    };
})(window.Freemix.jQuery, window.Freemix);
