/**
 * @fileOverview View header option making widget
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../exhibit-core",
    "lib/jquery.simile.dom",
    "lib/jquery.simile.bubble"
], function($, Exhibit) {
/**
 * @constructor
 * @class
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var OptionWidget = function(configuration, containerElmt, uiContext) {
    this._label = configuration.label;
    this._checked = typeof configuration.checked !== "undefined" ?
        configuration.checked :
        false;
    this._onToggle = configuration.onToggle;
    
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._initializeUI();
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.OptionWidget}
 */
OptionWidget.create = function(configuration, containerElmt, uiContext) {
    return new OptionWidget(configuration, containerElmt, uiContext);
};

    /**
     * Set up local constants based on Exhibit settings.
     * @param {String} prefix
     */
    OptionWidget.config = function(prefix) {
        /**
         * @constant
         */
        OptionWidget.uncheckedImageURL = prefix + "images/option.png";

        /**
         * @constant
         */
        OptionWidget.checkedImageURL = prefix + "images/option-check.png";
    };

/**
 *
 */
OptionWidget.prototype.dispose = function() {
    $(this._containerElmt).empty();
    
    this._dom = null;
    this._containerElmt = null;
    this._uiContext = null;
};

/**
 * @constant
 */
OptionWidget.uncheckedTemplate = 
    "<span id=\"uncheckedSpan\" style=\"display: none;\"><img id=\"uncheckedImage\" /> %1$s</span>";
    
/**
 * @constant
 */
OptionWidget.checkedTemplate = 
    "<span id=\"checkedSpan\" style=\"display: none;\"><img id=\"checkedImage\" /> %1$s</span>";
    
/**
 *
 */
OptionWidget.prototype._initializeUI = function() {
    this._containerElmt.className = "exhibit-optionWidget";
    this._dom = $.simileDOM(
        "string",
        this._containerElmt,
        sprintf(
            OptionWidget.uncheckedTemplate + OptionWidget.checkedTemplate,
            this._label
        ),
        {   uncheckedImage: $.simileBubble("createTranslucentImage", OptionWidget.uncheckedImageURL),
            checkedImage:   $.simileBubble("createTranslucentImage", OptionWidget.checkedImageURL)
        }
    );
    
    if (this._checked) {
        $(this._dom.checkedSpan).show();
    } else {
        $(this._dom.uncheckedSpan).show();
    }

    $(this._containerElmt).bind("click", this._onToggle);
};

/**
 * @returns {Boolean}
 */
OptionWidget.prototype.getChecked = function() {
    return this._checked;
};

/**
 * @param {Boolean} checked
 */
OptionWidget.prototype.setChecked = function(checked) {
    if (checked !== this._checked) {
        this._checked = checked;
        if (checked) {
            $(this._dom.checkedSpan).show();
            $(this._dom.uncheckedSpan).hide();
        } else {
            $(this._dom.checkedSpan).hide();
            $(this._dom.uncheckedSpan).show();
        }
    }
};

/**
 *
 */
OptionWidget.prototype.toggle = function() {
    this.setChecked(!this._checked);
};

    // end define
    return OptionWidget;
});
