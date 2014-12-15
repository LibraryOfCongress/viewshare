/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheria.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../exhibit-core",
    "../../util/localizer",
    "../../util/debug",
    "../../util/set",
    "../../util/settings",
    "../../util/facets",
    "../../util/history",
    "../../data/expression-parser",
    "../../data/database/range-index",
    "../ui-context",
    "./facet"
], function($, Exhibit, _, Debug, Set, SettingsUtilities, FacetUtilities, EHistory, ExpressionParser, RangeIndex, UIContext, Facet) {
/**
 * @class
 * @constructor
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var AlphaRangeFacet = function(containerElmt, uiContext) {
    var self = this;
    $.extend(this, new Facet("alpharange", containerElmt, uiContext));
    this.addSettingSpecs(AlphaRangeFacet._settingSpecs);

    this._dom = null;
    this._ranges = [];
    
    this._onRootItemsChanged = function() {
        if (typeof self._rangeIndex !== "undefined") {
            delete self._rangeIndex;
        }
    };
    $(uiContext.getCollection().getElement()).bind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
};

/**
 * @private
 * @constant
 */
AlphaRangeFacet._settingSpecs = {
    "scroll":           { type: "boolean", defaultValue: true },
    "height":           { type: "text" },
    "interval":         { type: "int", defaultValue: 7 },
    "collapsible":      { type: "boolean", defaultValue: false },
    "collapsed":        { type: "boolean", defaultValue: false }
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.AlphaRangeFacet}
 */
AlphaRangeFacet.create = function(configuration, containerElmt, uiContext) {
    var facet;
    uiContext = UIContext.create(configuration, uiContext);
    facet = new AlphaRangeFacet(
        containerElmt,
        uiContext
    );
    
    AlphaRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();
    
    return facet;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.AlphaRangeFacet}
 */
AlphaRangeFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, facet, expressionString;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    uiContext = UIContext.createFromDOM(configElmt, uiContext);
    facet = new AlphaRangeFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ? containerElmt : configElmt,
        uiContext
    );
    
    SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);
    
    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString !== null && expressionString.length > 0) {
            facet.setExpressionString(expressionString);
            facet.setExpression(ExpressionParser.parse(expressionString));
        }
    } catch (e) {
        Debug.exception(e, _("%facets.error.configuration", "AlphaRangeFacet"));
    }
    AlphaRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();
    
    return facet;
};

/**
 * @static
 * @private
 * @param {Exhibit.AlphaRangeFacet} facet
 * @param {Object} configuration
 */
AlphaRangeFacet._configure = function(facet, configuration) {
    var segment, property;
    SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);
    
    if (typeof configuration.expression !== "undefined") {
        facet.setExpressionString(configuration.expression);
        facet.setExpression(ExpressionParser.parse(configuration.expression));
    }
    
    if (typeof facet._settings.facetLabel === "undefined") {
        if (facet.getExpression() !== null && facet.getExpression().isPath()) {
            segment = facet.getExpression().getPath().getLastSegment();
            property = facet.getUIContext().getDatabase().getProperty(segment.property);
            if (property !== null) {
                facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
    
    if (facet._settings.collapsed) {
        facet._settings.collapsible = true;
    }
};

/**
 *
 */
AlphaRangeFacet.prototype._dispose = function() {
    $(this.getUIContext().getCollection().getElement()).unbind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
    this._dom = null;
    this._ranges = null;
    this._rangeIndex = null;
};

/**
 * @returns {Boolean}
 */
AlphaRangeFacet.prototype.hasRestrictions = function() {
  return this._ranges.length > 0; 
};

/**
 *
 */
AlphaRangeFacet.prototype.clearAllRestrictions = function() {
    $(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    if (this._ranges.length > 0) {
        this._ranges = [];
        this._notifyCollection();
    }
};

/**
 * @param {Array} restrictions
 */
AlphaRangeFacet.prototype.applyRestrictions = function(restrictions) {
    this._ranges = restrictions;
    this._notifyCollection();
};

/**
 * @param {String} from
 * @param {String} to
 * @param {Boolean} selected
 * @param {Array} ranges
 * @returns {Array}
 */
AlphaRangeFacet.prototype.setRange = function(from, to, selected, ranges) {
    var i, range;
    if (selected) {
        for (i = 0; i < ranges.length; i++) {
            range = ranges[i];
            if (range.from === from && range.to === to) {
                return;
            }
        }
        ranges.push({ "from": from, "to": to });
    } else {
        for (i = 0; i < ranges.length; i++) {
            range = ranges[i];
            if (range.from === from && range.to === to) {
                ranges.splice(i, 1);
                break;
            }
        }
    }
    return ranges;
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
AlphaRangeFacet.prototype.restrict = function(items) {
    var path, database, set, i, range;
    if (this._ranges.length === 0) {
        return items;
    } else {
        this._buildRangeIndex();
        
        set = new Set();
        for (i = 0; i < this._ranges.length; i++) {
            range = this._ranges[i];
            this._rangeIndex.getSubjectsInRange(range.from, String.fromCharCode(range.to.charCodeAt(0)+1), true, set, items);
        }
        return set;
    }
};

/**
 * @param {Exhibit.Set} items
 */
AlphaRangeFacet.prototype.update = function(items) {
    $(this._dom.valuesContainer).hide().empty();
    
    this._reconstruct(items);
    $(this._dom.valuesContainer).show();
};

/**
 * @private
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
AlphaRangeFacet.prototype._reconstruct = function(items) {
    var self, ranges, rangeIndex, computeItems, countItems, alphaList, alphaInList, x, y, alphaChar, range, i, range2, facetHasSelection, containerDiv, constructFacetItemFunction, makeFacetValue;
    self = this;
    ranges = [];
    
    this._buildRangeIndex(); 
    rangeIndex = this._rangeIndex;

    countItems = function(range) {
        return rangeIndex.getSubjectsInRange(range.from, String.fromCharCode(range.to.charCodeAt(0)+1), true, null, items).size();
    };

    // Create list of alpha characters
    alphaList = [];
        
    alphaInList = function(a) {
        var x;
        for (x in alphaList) {
            if (alphaList.hasOwnProperty(x)) {
                if (alphaList[x] === a) {
                    return true;
                }
            }
        }
        return false;
    };
    
    for (y = 0; y < rangeIndex.getCount(); y++) {
        alphaChar = rangeIndex._pairs[y].value.substr(0,1).toUpperCase();
        if (!alphaInList(alphaChar)) {
            alphaList.push(alphaChar);
        }
    }

    for (x = 0; x < alphaList.length; x += this._settings.interval) {
        range = { 
            "from":       alphaList[x], 
            "to":         alphaList[(x + this._settings.interval >= alphaList.length ? alphaList.length-1 : x + this._settings.interval - 1)],
            "selected":   false
        };
        range.count = countItems(range);
        
        for (i = 0; i < this._ranges.length; i++) {
            range2 = this._ranges[i];
            if (range2.from === range.from && range2.to === range.to) {
                range.selected = true;
                facetHasSelection = true;
                break;
            }
        }
        
        ranges.push(range);
    }
    
    facetHasSelection = this._ranges.length > 0;
    containerDiv = this._dom.valuesContainer;
    $(containerDiv).hide();
    constructFacetItemFunction = FacetUtilities[this._settings.scroll ? "constructFacetItem" : "constructFlowingFacetItem"];
    makeFacetValue = function(from, to, count, selected) {
        var onSelect, onSelectOnly, elmt;
        onSelect = function(evt) {
            self._toggleRange(from, to, selected, false);
            evt.preventDefault();
            evt.stopPropagation();
        };
        onSelectOnly = function(evt) {
            self._toggleRange(from, to, selected, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        elmt = constructFacetItemFunction(
            _("%facets.alpha.rangeShort", from.substr(0, 1), to.substr(0, 1)),
            count, 
            null,
            selected, 
            facetHasSelection,
            onSelect,
            onSelectOnly,
            self.getUIContext()
        );
        $(containerDiv).append(elmt);
    };
        
    for (i = 0; i < ranges.length; i++) {
        range = ranges[i];
        if (range.selected || range.count > 0) {
            makeFacetValue(range.from, range.to, range.count, range.selected);
        }
    }
    $(containerDiv).show();
    
    this._dom.setSelectionCount(this._ranges.length);
};

/**
 * @private
 */
AlphaRangeFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 * @private
 */
AlphaRangeFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = FacetUtilities[this._settings.scroll ? "constructFacetFrame" : "constructFlowingFacetFrame"](
		this,
        this.getContainer(),
        this.getLabel(),
        function(elmt, evt, target) { self._clearSelections(); },
        this.getUIContext(),
        this._settings.collapsible,
        this._settings.collapsed
    );
    
    if (typeof this._settings.height !== "undefined" && this._settings.height !== null) {
        $(this._dom.valuesContainer).css("height", this._settings.height);
    }
};

/**
 * @private
 * @param {String} from
 * @param {String} to
 * @param {Boolean} wasSelected
 * @param {Boolean} singleSelection
 */
AlphaRangeFacet.prototype._toggleRange = function(from, to, wasSelected, singleSelection) {
    var self, label, wasOnlyThingSelected, newRestrictions, oldRestrictions;
    self = this;
    label = _("%facets.alpha.rangeWords", from, to);
    wasOnlyThingSelected = (this._ranges.length === 1 && wasSelected);
    if (singleSelection && !wasOnlyThingSelected) {
        newRestrictions = { "ranges": [ { from: from, to: to } ] };
        EHistory.pushComponentState(
            this,
            Facet.getRegistryKey(),
            newRestrictions,
            _("%facets.facetSelectOnlyActionTitle", label, this.getLabel()),
            true
        );
    } else {
        oldRestrictions = [].concat(this._ranges);
        newRestrictions = { "ranges": self.setRange(from, to, !wasSelected, oldRestrictions) };
        EHistory.pushComponentState(
            this,
            Facet.getRegistryKey(),
            newRestrictions,
            _(wasSelected ? "%facets.facetUnselectActionTitle" : "%facets.facetSelectActionTitle", label, this.getLabel()),
            true
        );
    }
};

/**
 * @private
 */
AlphaRangeFacet.prototype._clearSelections = function() {
    EHistory.pushComponentState(
        this,
        Facet.getRegistryKey(),
        this.exportEmptyState(),
        _("%facets.facetClearSelectionsActionTitle", this.getLabel()),
        true
    );
};

/**
 * @private
 */
AlphaRangeFacet.prototype._buildRangeIndex = function() {
    var expression, database, segment, property, getter;
    if (typeof this._rangeIndex === "undefined") {
        expression = this.getExpression();
        database = this.getUIContext().getDatabase();
        
        segment = expression.getPath().getLastSegment();
        property = database.getProperty(segment.property);
        
        getter = function(item, f) {
            database.getObjects(item, property.getID(), null, null).visit(function(value) {
                f(value.toUpperCase());
            });
        };

        this._rangeIndex = new RangeIndex(
            this.getUIContext().getCollection().getAllItems(),
            getter
        ); 
    }
};

/**
 *
 */
AlphaRangeFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 *
 */
AlphaRangeFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @param {Boolean} empty
 * @returns {Object}
 */
AlphaRangeFacet.prototype._exportState = function(empty) {
    var r = [];

    if (!empty) {
        r = this._ranges;
    }

    return {
        "ranges": r
    };
};

/**
 * @param {Object} state
 * @param {Array} state.ranges
 */
AlphaRangeFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        if (state.ranges.length === 0) {
            this.clearAllRestrictions();
        } else {
            this.applyRestrictions(state.ranges);
        }
    }
};

/**
 * @param {Object} state
 * @param {Array} state.ranges
 */
AlphaRangeFacet.prototype.stateDiffers = function(state) {
    var rangeStartCount, stateStartCount, stateSet;

    stateStartCount = state.ranges.length;
    rangeStartCount = this._ranges.length;

    if (stateStartCount !== rangeStartCount) {
        return true;
    } else {
        stateSet = new Set(state.ranges);
        stateSet.addSet(this._ranges);
        if (stateSet.size() !== stateStartCount) {
            return true;
        }
    }

    return false;
};

    // end define
    return AlphaRangeFacet;
});
