/*global jQuery */
(function($, Freemix) {

    var identify;

    function setupIdentifier(data) {
        if (!Freemix.profile && "data_profile" in data) {
            Freemix.profile = {"properties": data.data_profile["properties"]};
        } else if ("properties" in data) {
            Freemix.profile = {"properties": data["properties"]};
        }

        Freemix.property.initializeDataProfile();
        var dataURL = $("link[rel='exhibit/data']").attr("href");
        var db = Freemix.exhibit.initializeDatabase([dataURL], function () {
            identify = new Freemix.Identify(db);

            if (db.getAllItemsCount()<=1) {
                $("button.data-record-delete").hide();
                $("span#record-selector").hide();
            }
            $("#contents").show();
            $("#contents").data("identifier", identify);

            $("#contents").trigger("post_setup_identifier.dataset", data);


        });
    }

    function setupCreateExhibitButton() {
        var url = $(".dataset_create").attr("href");
        $(".dataset_create").newExhibitDialog(url);
    }

    function deleteRecord() {
        var index = identify.getCurrentRecord();
        var id = Freemix.exhibit.database.getAllItems().toArray()[index];
        Freemix.exhibit.database.removeItem(id);

        if (Freemix.exhibit.database.getAllItemsCount() <= 1) {
            $("button.data-record-delete").hide();
        }

        identify.setCurrentRecord(identify.getCurrentRecord());
        identify.populateRecordDisplay();
    }

     Freemix.DatasetEditor = function() {

        $("#delete-record-dialog").dialog({
            resizable: false,
            height:"auto",
            modal: true,
            autoOpen: false,
            position: 'center',
            buttons: {
                'Delete': function() {
                    deleteRecord();
                    $(this).dialog('close');
                },
                Cancel: function() {
                        $(this).dialog('close');
                }
            }
        });

	/*
        $("button.data-record-delete").button({
		"icons": {"primary": "ui-icon-trash"}
        }).click(function(e) {
            $("#delete-record-dialog").dialog("open");
            return false;
        });
	*/

        $("button.data-record-delete").button().click(function(e) {
            $("#delete-record-dialog").dialog("open");
            return false;
        });

    };

    Freemix.DatasetEditor.prototype = {
        setData: function(data) {
            setupIdentifier(data);
        }

    };

    Freemix.Identify.prototype._addPropertyForProfileEditor = Freemix.Identify.prototype.addProperty;
    Freemix.Identify.prototype.addProperty = function(property) {
        var row = this._addPropertyForProfileEditor(property);
        var d = $("<td class='delete'></td>").appendTo(row);
        if (!(property.name() == "label" || property.name() == "id")) {
            $("<a href='' class='button_link negative-button delete_property'>X</a>").click(function(e) {
                $("#delete-property-dialog").data("property", property);
                $("#delete-property-dialog").dialog("open");
                e.preventDefault();
            }).appendTo(d).wrap('<p class="delete-property-wrap"></p>');
        }
        return row;

    };

    $(document).ready(function() {
        setupCreateExhibitButton();

        $("#delete-property-dialog").dialog({
            resizable: false,
            height:"auto",
            modal: true,
            autoOpen: false,
            position: 'center',
            buttons: {
                'Delete': function() {
                    var property = $("#delete-property-dialog").data("property");
                    property.remove();
                    var db = identify.database;
                    db.getAllItems().visit(function(id) {
                        db.removeObjects(id, property.name());
                    });

                    $("button.data-refresh").trigger("update");
                    identify.populateRecordDisplay();
                    $(".property-row#" + property.config.property).fadeOut().detach();
                    $(this).dialog('close');
                },
                Cancel: function() {
                        $(this).dialog('close');
                }
            }
        });

        var profileURL = $("link[rel='freemix/dataprofile']").attr("href");

        var xhr = $.ajax({
                 url: profileURL,
                 type: "GET",
                 dataType: "json",
                 success: function(data) {
                     var editor = new Freemix.DatasetEditor();
                     editor.setData(data);
                     
                 }
        });
    });

})(window.Freemix.jQuery, window.Freemix);
