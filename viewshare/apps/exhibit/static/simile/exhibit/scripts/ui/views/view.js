/**
 * @fileOverview View component.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../util/history",
    "../widgets/toolbox-widget"
], function($, EHistory, ToolboxWidget) {
/**
 * @class
 * @constructor
 * @param {String} key
 * @param {Element|jQuery} div
 * @param {Exhibit.UIContext} uiContext
 */
var View = function(key, div, uiContext) {
    var self, _id, _instanceKey, _toolbox, _label, _viewPanel, _div, _uiContext, _registered, _setIdentifier;

    /**
     * @private
     */
    self = this;

    /**
     * @private
     */
    _instanceKey = key;

    /**
     * @private
     */
    _uiContext = uiContext;

    /**
     * @private
     */
    _div = $(div);

    /**
     * @private
     */
    _registered = false;

    /**
     * @private
     */
    _id = null;

    /**
     * @private
     */
    _toolbox = null;

    /**
     * @private
     */
    _label = null;

    /**
     * @private
     */
    _viewPanel = null;

    /**
     * @public
     */
    this._settingSpecs = {};

    /**
     * @public
     */
    this._settings = {};

    /**
     * @public
     * @param {String} label
     */
    this.setLabel = function(label) {
        _label = label;
    };
    
    /**
     * @public
     * @returns {String}
     */
    this.getLabel = function() {
        return _label;
    };
    
    /**
     * @public
     * @param {Exhibit.ViewPanel} panel
     */
    this.setViewPanel = function(panel) {
        _viewPanel = panel;
    };

    /**
     * @public
     * @returns {Exhibit.ViewPanel}
     */
    this.getViewPanel = function() {
        return _viewPanel;
    };

    /**
     * @public
     * @param {Object} specs
     */
    this.addSettingSpecs = function(specs) {
        $.extend(true, this._settingSpecs, specs);
    };
    
    /**
     * @public
     * @returns {Object}
     */
    this.getSettingSpecs = function() {
        return this._settingSpecs;
    };

    /**
     * @public
     * @param {Exhibit.ToolboxWidget} widget
     * @param {Function} [retriever]
     */
    this.setToolbox = function(widget, retriever) {
        _toolbox = widget;
        if (typeof retriever !== "undefined" && retriever !== null) {
            _toolbox.getGeneratedHTML = retriever;
        }
    };

    /**
     * Returns the toolbox widget associated with this view.
     * @returns {Exhibit.ToolboxWidget}
     */
    this.getToolbox = function() {
        return _toolbox;
    };

    /**
     * Returns the programmatic identifier used for this view.
     * @public
     * @returns {String}
     */
    this.getID = function() {
        return _id;
    };

    /**
     * Returns the UI context for this view.
     * @public
     * @returns {Exhibit.UIContext}
     */
    this.getUIContext = function() {
        return _uiContext;
    };

    /**
     * Returns the containing element for this view.
     * @public
     * @returns {jQuery}
     */
    this.getContainer = function() {
        return _div;
    };

    /**
     * Enter this view into the registry, making it easier to locate.
     * By convention, this should be called at the end of the constructor.
     * @example MyView = function() { ...; this.register(); };
     */
    this.register = function() {
        this.getUIContext().getMain().getRegistry().register(
            View.getRegistryKey(),
            this.getID(),
            this
        );
        _registered = true;
    };

    /**
     * Remove this view from the registry.
     */
    this.unregister = function() {
        self.getUIContext().getMain().getRegistry().unregister(
            View.getRegistryKey(),
            self.getID()
        );
        _registered = false;
    };

    /**
     * Free up all references to objects, empty related elements, unregister.
     */
    this._dispose = function() {
        _viewPanel = null;
        _label = null;
        this._settingSpecs = null;
        if (_toolbox !== null) {
            _toolbox.dispose();
        }
        _toolbox = null;
        this._settings = null;

        $(_div).empty();
        _div = null;

        this.unregister();
        _uiContext = null;
    };

    /**
     * @private
     */
    _setIdentifier = function() {
        _id = $(_div).attr("id");
        if (typeof _id === "undefined" || _id === null) {
            _id = _instanceKey
                + "-"
                + self.getUIContext().getCollection().getID()
                + "-"
                + self.getUIContext().getMain().getRegistry().generateIdentifier(View.getRegistryKey());
        }
    };

    _setIdentifier();
    this.addSettingSpecs(View._settingSpecs);
};

/**
 * Every view should call this method in its own UI initializing method,
 * by convention _initializeUI.
 *
 * @private
 * @param {Function} retriever
 */
View.prototype._initializeViewUI = function(retriever) {
    if (this._settings.showToolbox) {
        this.setToolbox(
            ToolboxWidget.create(
                { "toolboxHoverReveal": this._settings.toolboxHoverReveal },
                this.getContainer(),
                this.getUIContext()
            ),
            retriever
        );
    }
};

/**
 * @private
 * @constant
 */
View._registryKey = "view";

/**
 * @private
 * @constant
 */
View._settingSpecs = {
    "showToolbox":          { "type": "boolean", "defaultValue": true },
    "toolboxHoverReveal":   { "type": "boolean", "defaultValue": false }
};

/**
 * @public
 * @static
 * @returns {String}
 */
View.getRegistryKey = function() {
    return View._registryKey;
};

/**
 * @static
 * @public
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
View.registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(View.getRegistryKey())) {
        reg.createRegistry(View.getRegistryKey());
    }
};


/**
 * @static
 * @public
 * @param {String} id
 * @param {Object} state
 */
View.addViewState = function(id, state) {
    var fullState;

    fullState = EHistory.getState();
    // If History has been initialized already; don't worry if not
    if (fullState !== null) {
        if (typeof fullState.data.components[id] === "undefined") {
            fullState.data.components[id] = {
                "state": state,
                "type": View.getRegistryKey()
            };
            EHistory.replaceState(fullState.data);
        } else {
            $(document).trigger(
                "importReady.exhibit",
                [View.getRegistryKey(), id]
            );
        }
    }
};

$(document).on(
    "registerComponents.exhibit",
    View.registerComponent
);

    // end define
    return View;
});
