/**
 * @fileOverview List facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
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
    "../ui-context",
    "./facet"
], function($, Exhibit, _, Debug, Set, SettingsUtilities, FacetUtilities, EHistory, ExpressionParser, UIContext, Facet) {
/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var ListFacet = function(containerElmt, uiContext) {
    $.extend(this, new Facet("list", containerElmt, uiContext));
    this.addSettingSpecs(ListFacet._settingSpecs);

    this._colorCoder = null;
    this._valueSet = new Set();
    this._selectMissing = false;
    this._delayedUpdateItems = null;
    this._dom = null;
    this._cache = null;
    this._orderMap = null;
};

/**
 * @constant
 */
ListFacet._settingSpecs = {
    "fixedOrder":       { "type": "text" },
    "sortMode":         { "type": "text", "defaultValue": "value" },
    "sortDirection":    { "type": "text", "defaultValue": "forward" },
    "showMissing":      { "type": "boolean", "defaultValue": true },
    "missingLabel":     { "type": "text" },
    "scroll":           { "type": "boolean", "defaultValue": true },
    "height":           { "type": "text" },
    "colorCoder":       { "type": "text", "defaultValue": null },
    "collapsible":      { "type": "boolean", "defaultValue": false },
    "collapsed":        { "type": "boolean", "defaultValue": false },
    "formatter":        { "type": "text", "defaultValue": null}
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ListFacet}
 */
ListFacet.create = function(configuration, containerElmt, uiContext) {
    var facet, thisUIContext;
    thisUIContext = UIContext.create(configuration, uiContext);
    facet = new ListFacet(containerElmt, thisUIContext);
    
    ListFacet._configure(facet, configuration);
    
    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();
    
    return facet;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ListFacet}
 */
ListFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, thisUIContext, facet, expressionString, selection, selectMissing, i;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    thisUIContext = UIContext.createFromDOM(configElmt, uiContext);
    facet = new ListFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        thisUIContext
    );
    
    SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);
    
    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (typeof expressionString !== "undefined" && expressionString !== null && expressionString.length > 0) {
            facet.setExpression(ExpressionParser.parse(expressionString));
            facet.setExpressionString(expressionString);
        }

        selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (typeof selection !== "undefined" && selection !== null && selection.length > 0) {
            for (i = 0; i < selection.length; i++) {
                facet._valueSet.add(selection[i]);
            }
        }
        
        selectMissing = Exhibit.getAttribute(configElmt, "selectMissing");
        if (typeof selectMissing !== "undefined" && selectMissing !== null && selectMissing.length > 0) {
            facet._selectMissing = (selectMissing === "true");
        }
    } catch (e) {
        Debug.exception(e, _("%facets.error.configuration", "ListFacet"));
    }
    ListFacet._configure(facet, configuration);

    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @static
 * @private
 * @param {Exhibit.ListFacet} facet
 * @param {Object} configuration
 */
ListFacet._configure = function(facet, configuration) {
    var selection, i, segment, property, values, orderMap, formatter;
    SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);
    
    if (typeof configuration.expression !== "undefined") {
        facet.setExpressionString(configuration.expression);
        facet.setExpression(ExpressionParser.parse(configuration.expression));
    }
    if (typeof configuration.selection !== "undefined") {
        selection = configuration.selection;
        for (i = 0; i < selection.length; i++) {
            facet._valueSet.add(selection[i]);
        }
    }
    if (typeof configuration.selectMissing !== "undefined") {
        facet._selectMissing = configuration.selectMissing;
    }
    
    if (typeof facet._settings.facetLabel === "undefined") {
        if (facet.getExpression() !== null && facet.getExpression().isPath()) {
            segment = facet.getExpression().getPath().getLastSegment();
            property = facet.getUIContext().getDatabase().getProperty(segment.property);
            if (typeof property !== "undefined" && property !== null) {
                facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
    if (typeof facet._settings.fixedOrder !== "undefined") {
        values = facet._settings.fixedOrder.split(";");
        orderMap = {};
        for (i = 0; i < values.length; i++) {
            orderMap[values[i].trim()] = i;
        }
        
        facet._orderMap = orderMap;
    }
    
    if (facet._settings.colorCoder !== "undefined") {
        facet._colorCoder = facet.getUIContext().getMain().getComponent(facet._settings.colorCoder);
    }
    
    if (facet._settings.collapsed) {
        facet._settings.collapsible = true;
    }
    
    if (typeof facet._settings.formatter !== "undefined") {
        formatter = facet._settings.formatter;
        if (formatter !== null && formatter.length > 0) {
            try {
                facet._formatter = eval(formatter);
            } catch (e) {
                Debug.log(e);
            }
        }
    }
    
    facet._cache = new FacetUtilities.Cache(
        facet.getUIContext().getDatabase(),
        facet.getUIContext().getCollection(),
        facet.getExpression()
    );
};

/**
 *
 */
ListFacet.prototype._dispose = function() {
    this._cache.dispose();
    this._cache = null;
    this._colorCoder = null;
    this._dom = null;
    this._valueSet = null;
    this._orderMap = null;
};

/**
 * @returns {Boolean}
 */
ListFacet.prototype.hasRestrictions = function() {
    return this._valueSet.size() > 0 || this._selectMissing;
};

/**
 *
 */
ListFacet.prototype.clearAllRestrictions = function() {
    $(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    this._valueSet = new Set();
    this._selectMissing = false;
    this._notifyCollection();
};

/**
 * @param {Object} restrictions
 * @param {Array} restrictions.selection
 * @param {Boolean} restrictions.selectMissing
 */
ListFacet.prototype.applyRestrictions = function(restrictions) {
    var i;
    this._valueSet = new Set();
    for (i = 0; i < restrictions.selection.length; i++) {
        this._valueSet.add(restrictions.selection[i]);
    }
    this._selectMissing = restrictions.selectMissing;
    
    this._notifyCollection();
};

/**
 * @param {String} value
 * @param {Boolean} selected
 */
ListFacet.prototype.setSelection = function(value, selected) {
    if (selected) {
        this._valueSet.add(value);
    } else {
        this._valueSet.remove(value);
    }
    this._notifyCollection();
};

/**
 * @param {Boolean} selected
 */
ListFacet.prototype.setSelectMissing = function(selected) {
    if (selected !== this._selectMissing) {
        this._selectMissing = selected;
        this._notifyCollection();
    }
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
ListFacet.prototype.restrict = function(items) {
    if (this._valueSet.size() === 0 && !this._selectMissing) {
        return items;
    }
    
    var set = this._cache.getItemsFromValues(this._valueSet, items);
    if (this._selectMissing) {
        this._cache.getItemsMissingValue(items, set);
    }
    
    return set;
};

/**
 *
 */
ListFacet.prototype.onUncollapse = function() {
	if (this._delayedUpdateItems !== null) {
		this.update(this._delayedUpdateItems);
		this._delayedUpdateItems = null;
	}
};

/**
 * @param {Exhibit.Set} items
 */
ListFacet.prototype.update = function(items) {
	if (FacetUtilities.isCollapsed(this)) {
		this._delayedUpdateItems = items;
		return;
	}
    $(this._dom.valuesContainer)
        .hide()
        .empty();
    this._constructBody(this._computeFacet(items));
    $(this._dom.valuesContainer).show();
};

/**
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
ListFacet.prototype._computeFacet = function(items) {
    var database, r, entries, valueType, selection, labeler, i, entry, count, span;
    database = this.getUIContext().getDatabase();
    r = this._cache.getValueCountsFromItems(items);
    entries = r.entries;
    valueType = r.valueType;
    
    if (entries.length > 0) {
        selection = this._valueSet;
        labeler = valueType === "item" ?
            function(v) { var l = database.getObject(v, "label"); return l !== null ? l : v; } :
            function(v) { return v; };
            
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            entry.actionLabel = entry.selectionLabel = labeler(entry.value);
            entry.selected = selection.contains(entry.value);
        }
        
        entries.sort(this._createSortFunction(valueType));
    }
    
    if (this._settings.showMissing || this._selectMissing) {
        count = this._cache.countItemsMissingValue(items);
        if (count > 0 || this._selectMissing) {
            span = $("<span>")
                .attr("class", "exhibit-facet-value-missingThisField")
                .html((typeof this._settings.missingLabel !== "undefined") ? 
                      this._settings.missingLabel :
                      _("%facets.missingThisField"));
            
            entries.unshift({
                value:          null, 
                count:          count,
                selected:       this._selectMissing,
                selectionLabel: $(span).get(0),
                actionLabel:    _("%facets.missingThisField")
            });
        }
    }
    
    return entries;
};

/**
 *
 */
ListFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 *
 */
ListFacet.prototype._initializeUI = function() {
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

    if (typeof this._settings.height !== "undefined" && this._settings.scroll) {
        $(this._dom.valuesContainer).css("height", this._settings.height);
    }
};

/**
 * @param {Array} entries
 */
ListFacet.prototype._constructBody = function(entries) {
    var self, containerDiv, constructFacetItemFunction, facetHasSelection, constructValue, j;
    self = this;
    containerDiv = this._dom.valuesContainer;
    
    $(containerDiv).hide();
    
    constructFacetItemFunction = FacetUtilities[this._settings.scroll ? "constructFacetItem" : "constructFlowingFacetItem"];
    facetHasSelection = this._valueSet.size() > 0 || this._selectMissing;
    constructValue = function(entry) {
        var onSelect, onSelectOnly, elmt;
        onSelect = function(evt) {
            self._filter(entry.value, entry.actionLabel, false);
            evt.preventDefault();
            evt.stopPropagation();
        };
        onSelectOnly = function(evt) {
            self._filter(entry.value, entry.actionLabel, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        elmt = constructFacetItemFunction(
            entry.selectionLabel, 
            entry.count, 
            (typeof self._colorCoder !== "undefined" && self._colorCoder !== null) ? self._colorCoder.translate(entry.value) : null,
            entry.selected, 
            facetHasSelection,
            onSelect,
            onSelectOnly,
            self.getUIContext()
        );
        
        if (self._formatter) {
            self._formatter(elmt);
        }
        
        $(containerDiv).append(elmt);
    };
    
    for (j = 0; j < entries.length; j++) {
        constructValue(entries[j]);
    }

    $(containerDiv).show();
    
    this._dom.setSelectionCount(this._valueSet.size() + (this._selectMissing ? 1 : 0));
};

/**
 * @param {String} value
 * @param {String} label
 * @param {Boolean} selectOnly
 */
ListFacet.prototype._filter = function(value, label, selectOnly) {
    var self, selected, select, deselect, oldValues, oldSelectMissing, newValues, newSelectMissing, actionLabel, wasSelected, wasOnlyThingSelected, newRestrictions;
    self = this;
    
    oldValues = new Set(this._valueSet);
    oldSelectMissing = this._selectMissing;
    if (typeof value === "undefined" || value === null) { // the (missing this field) case
        wasSelected = oldSelectMissing;
        wasOnlyThingSelected = wasSelected && (oldValues.size() === 0);
        
        if (selectOnly) {
            if (oldValues.size() === 0) {
                newSelectMissing = !oldSelectMissing;
            } else {
                newSelectMissing = true;
            }
            newValues = new Set();
        } else {
            newSelectMissing = !oldSelectMissing;
            newValues = new Set(oldValues);
        }
    } else {
        wasSelected = oldValues.contains(value);
        wasOnlyThingSelected = wasSelected && (oldValues.size() === 1) && !oldSelectMissing;
        
        if (selectOnly) {
            newSelectMissing = false;
            newValues = new Set();
            
            if (!oldValues.contains(value)) {
                newValues.add(value);
            } else if (oldValues.size() > 1 || oldSelectMissing) {
                newValues.add(value);
            }
        } else {
            newSelectMissing = oldSelectMissing;
            newValues = new Set(oldValues);
            if (newValues.contains(value)) {
                newValues.remove(value);
            } else {
                newValues.add(value);
            }
        }
    }
    
    newRestrictions = { selection: newValues.toArray(), selectMissing: newSelectMissing };

    EHistory.pushComponentState(
        this,
        Facet.getRegistryKey(),
        newRestrictions,
        (selectOnly && !wasOnlyThingSelected) ?
            _("%facets.facetSelectOnlyActionTitle", label, this.getLabel()) :
            _(wasSelected ? "%facets.facetUnselectActionTitle" : "%facets.facetSelectActionTitle", label, this.getLabel()),
        true
    );
};

ListFacet.prototype._clearSelections = function() {
    EHistory.pushComponentState(
        this,
        Facet.getRegistryKey(),
        this.exportEmptyState(),
        _("%facets.facetClearSelectionsActionTitle", this.getLabel()),
        true
    );
};

/**
 * @param {String} valueType
 * @returns {Function}
 */
ListFacet.prototype._createSortFunction = function(valueType) {
    var sortValueFunction, orderMap, sortFunction, sortDirectionFunction;
    sortValueFunction = function(a, b) { return a.selectionLabel.localeCompare(b.selectionLabel); };
    if (this._orderMap !== null) {
        orderMap = this._orderMap;
        
        sortValueFunction = function(a, b) {
            if (typeof orderMap[a.selectionLabel] !== "undefined") {
                if (typeof orderMap[b.selectionLabel] !== "undefined") {
                    return orderMap[a.selectionLabel] - orderMap[b.selectionLabel];
                } else {
                    return -1;
                }
            } else if (typeof orderMap[b.selectionLabel] !== "undefined") {
                return 1;
            } else {
                return a.selectionLabel.localeCompare(b.selectionLabel);
            }
        };
    } else if (valueType === "number") {
        sortValueFunction = function(a, b) {
            a = parseFloat(a.value);
            b = parseFloat(b.value);
            return a < b ? -1 : a > b ? 1 : 0;
        };
    }
    
    sortFunction = sortValueFunction;
    if (this._settings.sortMode === "count") {
        sortFunction = function(a, b) {
            var c = b.count - a.count;
            return c !== 0 ? c : sortValueFunction(a, b);
        };
    }

    sortDirectionFunction = sortFunction;
    if (this._settings.sortDirection === "reverse"){
        sortDirectionFunction = function(a, b) {
            return sortFunction(b, a);
        };
    }
    
    return sortDirectionFunction;
};

/**
 * @returns {Object}
 */
ListFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @returns {Object}
 */
ListFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 * @private
 * @param {Boolean} empty
 * @returns {Object}
 */
ListFacet.prototype._exportState = function(empty) {
    var s = [];

    if (!empty) {
        s = this._valueSet.toArray();
    }

    return {
        "selection": s,
        "selectMissing": empty ? false : this._selectMissing
    };
};

/**
 * @param {Object} state
 * @param {Array} state.selection
 * @param {Boolean} state.selectMissing
 */
ListFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        if (state.selection.length === 0 && !state.selectMissing) {
            this.clearAllRestrictions();
        } else {
            this.applyRestrictions(state);
        }
    }
};

/**
 * Check if the state being requested for import is any different from the
 * current state.  This is only a worthwhile function to call if the check
 * is always faster than just going through with thei mport.
 * 
 * @param {Object} state
 */
ListFacet.prototype.stateDiffers = function(state) {
    var stateSet, stateStartCount, valueStartCount;

    if (state.selectMissing !== this._selectMissing) {
        return true;
    }

    stateStartCount = state.selection.length;
    valueStartCount = this._valueSet.size();

    if (stateStartCount !== valueStartCount) {
        return true;
    } else {
        stateSet = new Set(state.selection);
        stateSet.addSet(this._valueSet);
        if (stateSet.size() !== stateStartCount) {
            return true;
        }
    }

    return false;
};

    // end define
    return ListFacet;
});
