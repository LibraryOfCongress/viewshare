/*global jQuery */
(function($, Freemix) {

    function propertyName(row) {
        var property = row.data("property");
        var result;
        if (property.label() != property.name()) {
            result = $("<span class='changed'>" + property.label()  + "</span>");
        } else {
            result = $("<span>" + property.name() + "</span>");
        }
        return result;
    }
    Freemix.Identify = function(database) {
        this.database = database;
        var props = Freemix.property.propertyList;

        var table = this.getContent();
        var footer = $(".table-footer", table);
        footer.prevAll().remove();
        var identify = this;
        $.each(props, function(name, property) {
            if ((property.name() != "id" && property.name() != "label") || property.enabled() === true) {
                identify.addProperty(property);
            }
        });

        var $this = this;

        /* handle display in css */

        $(".left-record-button", table).unbind().button().click(function() {
                $this.previousRecord();
                $this.populateRecordDisplay();
        }).parent().buttonset().end().addClass("ui-corner-left");
        $(".right-record-button", table).unbind().button().click(function() {
                $this.nextRecord();
                $this.populateRecordDisplay();
        }).addClass("ui-corner-right");

        this.setCurrentRecord(0);
        this.populateRecordDisplay();

    };

    Freemix.Identify.prototype = {
        addProperty: function(property) {
            var identify = this;
            var footer = $(".table-footer", this.getContent());
            var row = $("<tr class='property-row' id='" + property.config.property + "'></tr>").data("property", property);
            footer.before(row);

            var td = $("<td class='enabled'></td>");
            var check = $("<input type='checkbox'/>");
            check.attr("name", $.make_uuid());
            if (property.enabled()) {
                check.attr("checked", "checked");
            }
            check.click(function() {
                property.enabled($(this).is(":checked"));
                identify.propertyChanged(property.config);
            });
            td.append(check).appendTo(row);

            var nameCol = $("<td class='name'></td>").append(propertyName(row)).appendTo(row);

            // Multi-Select requires that it's target is in the DOM
            identify.renderType(row, $("<td class='types'></td>").appendTo(row) );
            row.append("<td class='value'></td>");

            return row;

        },
        // Set the record number.
        setCurrentRecord: function (record_num) {
                var size = Freemix.exhibit.database.getAllItemsCount();
                var num = (record_num + size) % size;
                this.getContent().data("record_num", num);
                return num;
        },
        getCurrentRecord: function () {
                var record_num = this.getContent().data("record_num");
                if (!record_num) {
                        record_num = this.setCurrentRecord(0);
                }
                return record_num;
        },
        setCurrentRecordById: function(id) {
            this.setCurrentRecord(this.getRecordIndexById(id));
        },
        getRecordIndexById: function(id) {
            return this.database.getAllItems().toArray().indexOf(id);
        },
        nextRecord: function () {
                var next = this.getCurrentRecord()+1;
                this.setCurrentRecord(next);
        },
        previousRecord: function () {
                var previous = this.getCurrentRecord()-1;
                this.setCurrentRecord(previous);
        },
        getContent: function() {
            if (!this._content) {
                this._content = $("#identify-table");
            }
            return this._content;
        },
        populateRecordDisplay: function () {

            var content = this.getContent();

            var record_num = this.getCurrentRecord();
            var database = Freemix.exhibit.database;
            var num_records = database.getAllItemsCount();
            var recordIds = database.getAllItems();
            var id = recordIds.toArray()[record_num];
            var record = database.getItem(id);

            content.find("#current-record").html(record_num+1);
            content.find("#record-count").html(num_records);
            var identify = this;
            $("tr.property-row", content).each(function() {
                    var row = $(this);
                    identify.renderProperty(row);
                    });

            // Read in the current record.
            // content.find("#record-header").text(record.label);
        },
        renderProperty: function(row) {
            var record_num = this.getCurrentRecord();
            var database = Freemix.exhibit.database;
            var recordIds = database.getAllItems();
            var id = recordIds.toArray()[record_num];
            var property = row.data("property");
            var value = database.getObjects(id, property.name()).toArray();
            var result = property.getValueHtml(value);
            row.find(".value").empty().append(result);

        },

        renderType: function(row, column) {
            var property = row.data("property");
            var type = property.type();
            var label = Freemix.property.type[type].label || type;
            return $("<div>" + label + "</div>").appendTo(column);
        },
        propertyChanged: function(property) {
            if (Freemix.profile.localProperties) {
                Freemix.profile.localProperties[property.property] = property;
            }
        }
    };
})(window.Freemix.jQuery, window.Freemix);
