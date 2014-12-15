/**
 * @fileOverview Toolbox widget, the scissors, for exporting data.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../exhibit-core",
    "../ui-context",
    "../../util/settings",
    "../../util/localizer",
    "../../util/ui",
    "../../data/exporter",
    "lib/jquery.simile.dom"
], function($, Exhibit, UIContext, SettingsUtilities, _, UIUtilities, Exporter) {
/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */ 
var ToolboxWidget = function(containerElmt, uiContext) {
    var self = this;
    this._popup = null;
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._settings = {};
    this._hovering = false;
};

/**
 * @constant
 */
ToolboxWidget._settingSpecs = {
    "itemID":               { "type": "text" },
    "toolboxHoverReveal":   { "type": "boolean", "defaultValue": false }
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ToolboxWidget}
 */
ToolboxWidget.create = function(configuration, containerElmt, uiContext) {
    var widget = new ToolboxWidget(
        containerElmt,
        UIContext.create(configuration, uiContext)
    );
    ToolboxWidget._configure(widget, configuration);

    widget._initializeUI();
    return widget;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ToolboxWidget}
 */
ToolboxWidget.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, widget;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    widget = new ToolboxWidget(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        UIContext.createFromDOM(configElmt, uiContext)
    );

    SettingsUtilities.collectSettingsFromDOM(configElmt, ToolboxWidget._settingSpecs, widget._settings);    
    ToolboxWidget._configure(widget, configuration);
    
    widget._initializeUI();
    return widget;
};

/**
 * @param {Exhibit.ToolboxWidget} widget
 * @param {Object} configuration
 */
ToolboxWidget._configure = function(widget, configuration) {
    SettingsUtilities.collectSettings(configuration, ToolboxWidget._settingSpecs, widget._settings);
};

/**
 *
 */
ToolboxWidget.prototype.dispose = function() {
    $(this._containerElmt).unbind("mouseover mouseout");
    this._dismiss();
    this._settings = null;
    this._containerElmt = null;
    this._uiContext = null;
};

/**
 *
 */
ToolboxWidget.prototype._initializeUI = function() {
    var self = this;
    if (this._settings.toolboxHoverReveal) {
        $(this._containerElmt).bind("mouseover", function(evt) {
            self._onContainerMouseOver(evt);
        });
        $(this._containerElmt).bind("mouseout", function(evt) {
            self._onContainerMouseOut(evt);
        });
    } else {
        this._makePopup();
    }
};

/**
 *
 */
ToolboxWidget.prototype._makePopup = function() {
    var coords, docWidth, popup, self, right;
    self = this;

    coords = $(this._containerElmt).offset();
    docWidth = $(document.body).width();

    // Don't widen the page
    right = docWidth - coords.left - $(this._containerElmt).width();
    if (right <= 0) {
        right = 1;
    }

    popup = $("<div>")
        .attr("class", "exhibit-toolboxWidget-popup screen")
        .css("position", "absolute")
        .css("top", coords.top + "px")
        .css("right", right + "px");

    this._popup = popup;
    this._fillPopup(popup);
    $(this._containerElmt).append(popup);
};

/**
 * @param {jQuery.Event}
 */
ToolboxWidget.prototype._onContainerMouseOver = function(evt) {
    var self, coords, docWidth, popup;
    if (!this._hovering) {
        self = this;
        coords = $(this._containerElmt).offset();
        docWidth = $(document.body).width();

        popup = $("<div>")
            .hide()
            .attr("class", "exhibit-toolboxWidget-popup screen")
            .css("position", "absolute")
            .css("top", coords.top + "px")
            .css("right", (docWidth - coords.left - $(this._containerElmt).width()) + "px");
        this._fillPopup(popup);
        $(popup).fadeIn();
        $(document.body).append(popup);
        popup.bind("mouseover", function(evt) {
            self._onPopupMouseOver(evt);
        });
        popup.bind("mouseout", function(evt) {
            self._onPopupMouseOut(evt);
        });
        
        this._popup = popup;
        this._hovering = true;
    } else {
        this._clearTimeout();
    }
};

/**
 * @param {jQuery.Event} evt
 */
ToolboxWidget.prototype._onContainerMouseOut = function(evt) {
    if (ToolboxWidget._mouseOutsideElmt(evt, this._containerElmt)) {
        this._setTimeout();
    }
};

/**
 * @param {jQuery.Event} evt
 */
ToolboxWidget.prototype._onPopupMouseOver = function(evt) {
    this._clearTimeout();
};

/**
 * @param {jQuery.Event} evt
 */
ToolboxWidget.prototype._onPopupMouseOut = function(evt) {
    if (ToolboxWidget._mouseOutsideElmt(evt, this._containerElmt)) {
        this._setTimeout();
    }
};

/**
 *
 */
ToolboxWidget.prototype._setTimeout = function() {
    var self = this;
    this._timer = window.setTimeout(function() {
        self._onTimeout();
    }, 200);
};

/**
 *
 */
ToolboxWidget.prototype._clearTimeout = function() {
    if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = null;
    }
};

/**
 *
 */
ToolboxWidget.prototype._onTimeout = function() {
    this._dismiss();
    this._hovering = false;
    this._timer = null;
};

/**
 * @param {jQuery} elmt
 */
ToolboxWidget.prototype._fillPopup = function(elmt) {
    var self, exportImg;
    self = this;
    
    exportImg = UIUtilities.createTranslucentImage("images/liveclipboard-icon.png");
    $(exportImg).attr("class", "exhibit-toolboxWidget-button");
    $(exportImg).bind("click", function(evt) {
        self._showExportMenu(exportImg, evt);
    });
    $(elmt).append(exportImg);
};

ToolboxWidget.prototype._dismiss = function() {
    if (this._popup !== null) {
        $(this._popup).fadeOut("fast", function() {
            $(this).remove();
        });
        this._popup = null;
    }
};

/**
 * @param {jQuery.Event} evt
 * @param {Element|jQuery} elmt
 * @returns {Boolean}
 * @depends jQuery
 */
ToolboxWidget._mouseOutsideElmt = function(evt, elmt) {
    var eventCoords, coords;
    eventCoords = { "x": evt.pageX, "y": evt.pageY };
    coords = $(elmt).offset();
    return (eventCoords.x < coords.left ||
            eventCoords.x > coords.left + elmt.offsetWidth ||
            eventCoords.y < coords.top ||
            eventCoords.y > coords.top + elmt.offsetHeight);
};

/**
 * @param {Element} elmt
 * @param {jQuery.Event} evt
 */
ToolboxWidget.prototype._showExportMenu = function(elmt, evt) {
    var self, popupDom, makeMenuItem, exporters, i;

    self = this;

    popupDom = UIUtilities.createPopupMenuDom(elmt);
    
    makeMenuItem = function(exporter) {
        popupDom.appendMenuItem(
            exporter.getLabel(),
            null,
            function() {
                var database, text;
                database = self._uiContext.getDatabase();
                text = (typeof self._settings.itemID !== "undefined") ?
                    exporter.exportOne(self._settings.itemID, database) :
                    exporter.exportMany(
                        self._uiContext.getCollection().getRestrictedItems(), 
                        database
                    );
                ToolboxWidget.createExportDialogBox(text).open();
            }
        );
    };
    
    exporters = Exhibit.staticRegistry.getKeys(Exporter._registryKey);
    for (i = 0; i < exporters.length; i++) {
        makeMenuItem(Exhibit.staticRegistry.get(
            Exporter._registryKey,
            exporters[i]
        ));
    }
    
    if (typeof this.getGeneratedHTML === "function") {
        makeMenuItem({
            "getLabel":  function() { return _("%export.htmlExporterLabel"); },
            "exportOne":  this.getGeneratedHTML,
            "exportMany": this.getGeneratedHTML
        });
    }

    popupDom.open(evt);
};

/**
 * @param {String} string
 * @returns {Object}
 */
ToolboxWidget.createExportDialogBox = function(string) {
    var template, dom;
    template = {
        "tag":      "div",
        "class":    "exhibit-copyDialog exhibit-ui-protection",
        "children": [
            {   tag:        "button",
                field:      "closeButton",
                children:    [ _("%export.exportDialogBoxCloseButtonLabel") ]
            },
            {   tag:        "p",
                children:   [ _("%export.exportDialogBoxPrompt") ]
            },
            {   tag:        "div",
                field:      "textAreaContainer"
            }
        ]
    };
    dom = $.simileDOM("template", template);
    $(dom.textAreaContainer).html("<textarea wrap='off' rows='15'>" + string + "</textarea>");
        
    UIUtilities.setupDialog(dom, true);

    dom.open = function() {
        var textarea;

        $(dom.elmt).css("top", (document.body.scrollTop + 100) + "px");
        
        $(document.body).append($(dom.elmt));
        $(document).trigger("modalSuperseded.exhibit");
        
        textarea = $(dom.textAreaContainer).children().get(0);
        textarea.select();
        $(dom.closeButton).bind("click", function(evt) {
            dom.close();
        });
        $(textarea).bind("keyup", function(evt) {
            if (evt.keyCode === 27) { // ESC
                dom.close();
            }
        });
    };
    
    return dom;
};

    // end define
    return ToolboxWidget;
});
