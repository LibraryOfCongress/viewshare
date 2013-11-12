/*global jQuery */
(function($, Freemix) {

    var identify, LoadingTransactionView;

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

    /**
     * Represents the display while polling results for a Transaction
     * @constructor
     * @param {Transaction} options.transaction - Transaction with profileURL
     * @param {jQuery} options.el - $() element that contains loading message
     */
    LoadingTransactionView = function(options) {
      this.transaction = options.transaction;
      this.el = options.el;
    };

    /** 
     * Handles DOM manipulation on a successful ajax request
     * @param {string} data - Data returned from successful jquery ajax request
     */
    LoadingTransactionView.prototype.pollSuccess = function(data) {
      if (data.hasOwnProperty('message')) {
        if (data.message === 'No Data' || data.message === '') {
          window.location.reload(true);
        }
      } else {
        this.el.hide();
        var editor = new Freemix.DatasetEditor();
        editor.setData(data);
      }
    };

    /** 
     * Handles DOM manipulation on a failed ajax request
     * @param {string} data - Data returned from successful jquery ajax request
     */
    LoadingTransactionView.prototype.pollError = function() {
      this.el.html(
        'Error while processing transaction.<br />Please try to reload the page later.'
      );
    };

    /** Controls display of LoadingTransactionView */
    LoadingTransactionView.prototype.render = function() {
      var success = $.proxy(this.pollSuccess, this)
      var error = $.proxy(this.pollError, this)

      this.el.show();
      this.transaction.sync({
        success: success,
        error: error
      });
    };


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
        var profileURL = $("link[rel='freemix/dataprofile']").attr("href");
        var statusURL = $("link[rel='freemix/transaction_status']").attr("href");
        var transaction = new window.FreemixTransaction({
            profileURL: profileURL,
            statusURL: statusURL
        });

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

        new LoadingTransactionView({
          el: $('#loading-transaction'),
          transaction: transaction
        }).render();
    });

})(window.Freemix.jQuery, window.Freemix);
