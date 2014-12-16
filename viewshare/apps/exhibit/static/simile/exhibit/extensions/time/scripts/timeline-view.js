/**
 * @fileOverview Implements the glue between an Exhibit view and Timeline.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "exhibit",
    "timeline",
    "./base",
    "scripts/util/set",
    "scripts/util/date-time",
    "scripts/util/accessors",
    "scripts/util/settings",
    "scripts/util/views",
    "scripts/ui/ui-context",
    "scripts/ui/views/view",
    "scripts/ui/coordinator",
    "scripts/ui/coders/coder",
    "scripts/ui/coders/default-color-coder"
], function($, Exhibit, Timeline, TimeExtension, Set, DateTime, AccessorsUtilities, SettingsUtilities, ViewUtilities, UIContext, View, Coordinator, Coder, DefaultColorCoder) {
/**
 * @class
 * @constructor
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var TimelineView = function(containerElmt, uiContext) {
    var view = this;
    $.extend(this, new View(
        "time",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(TimelineView._settingSpecs);

    this._accessors = {
        "getEventLabel":  function(itemID, database, visitor) {
            visitor(database.getObject(itemID, "label"));
        },
        "getProxy":       function(itemID, database, visitor) {
            visitor(itemID);
        },
        "getColorKey":    null,
        "getIconKey":     null 
    };

    this._dom = null;
    this._selectListener = null;
    this._largestSize = 0;
    this._iconCoder = null;
    this._colorCoder = null;
    this._eventSource = null;
    this._timeline = null;

    this._onItemsChanged = function() {
        view._reconstruct(); 
    };

    $(uiContext.getCollection().getElement()).bind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    this.register();
};

/**
 * @constant
 */
TimelineView._intervalChoices = [
    "millisecond", "second", "minute", "hour", "day", "week", "month", "year", "decade", "century", "millennium"
];

/**
 * @constant
 */
TimelineView._settingSpecs = {
    "topBandHeight":           { "type": "int",        "defaultValue": 75 },
    "topBandUnit":             { "type": "enum",       "choices": TimelineView._intervalChoices },
    "topBandPixelsPerUnit":    { "type": "int",        "defaultValue": 200 },
    "bottomBandHeight":        { "type": "int",        "defaultValue": 25 },
    "bottomBandUnit":          { "type": "enum",       "choices": TimelineView._intervalChoices },
    "bottomBandPixelsPerUnit": { "type": "int",        "defaultValue": 200 },
    "timelineHeight":          { "type": "int",        "defaultValue": 400 },
    "timelineConstructor":     { "type": "function",   "defaultValue": null },
    "colorCoder":              { "type": "text",       "defaultValue": null },
    "iconCoder":               { "type": "text",       "defaultValue": null },
    "selectCoordinator":       { "type": "text",       "defaultValue": null },
    "showHeader":              { "type": "boolean",    "defaultValue": true },
    "showSummary":             { "type": "boolean",    "defaultValue": true },
    "showFooter":              { "type": "boolean",    "defaultValue": true }
};

/**
 * @constant
 */
TimelineView._accessorSpecs = [
    {   "accessorName":   "getProxy",
        "attributeName":  "proxy"
    },
    {   "accessorName": "getDuration",
        "bindings": [
            {   "attributeName":  "start",
                "type":           "date",
                "bindingName":    "start"
            },
            {   "attributeName":  "end",
                "type":           "date",
                "bindingName":    "end",
                "optional":       true
            }
        ]
    },
    {   "accessorName":   "getColorKey",
        "attributeName":  "marker", // backward compatibility
        "type":           "text"
    },
    {   "accessorName":   "getColorKey",
        "attributeName":  "colorKey",
        "type":           "text"
    },
    {   "accessorName":   "getIconKey",
        "attributeName":  "iconKey",
        "type":           "text"
    },
    {   "accessorName":   "getEventLabel",
        "attributeName":  "eventLabel",
        "type":           "text"
    },
    // hoverText is deprecated in Timeline, does not work at all with an event.
    // It will still work here as an attribute name, but it will be overridden
    // by caption.  Eventually hoverText will disappear as an option.
    {
        "accessorName":   "getHoverText",
        "attributeName":  "hoverText",
        "type":           "text"
    },
    {
        "accessorName":   "getCaption",
        "attributeName":  "caption",
        "type":           "text"
    }
];    

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TimelineView}
 */
TimelineView.create = function(configuration, containerElmt, uiContext) {
    var view = new TimelineView(
        containerElmt,
        UIContext.create(configuration, uiContext)
    );
    TimelineView._configure(view, configuration);
    
    view._internalValidate();
    view._initializeUI();
    return view;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TimelineView}
 */
TimelineView.createFromDOM = function(configElmt, containerElmt, uiContext) {

    var configuration, view;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    view = new TimelineView(
        containerElmt !== null ? containerElmt : configElmt, 
        UIContext.createFromDOM(configElmt, uiContext)
    );

    try {
        AccessorsUtilities.createAccessorsFromDOM(configElmt, TimelineView._accessorSpecs, view._accessors);
        SettingsUtilities.collectSettingsFromDOM(configElmt, view.getSettingSpecs(), view._settings);
        TimelineView._configure(view, configuration);

        view._internalValidate();

        view._initializeUI();
    } catch (ex) {
        view.dispose();
        throw ex;
    }

    return view;
};

/**
 * @param {Exhibit.TimelineView} view
 * @param {Object} configuration
 */
TimelineView._configure = function(view, configuration) {
    var accessors;
    AccessorsUtilities.createAccessors(configuration, TimelineView._accessorSpecs, view._accessors);
    SettingsUtilities.collectSettings(configuration, view.getSettingSpecs(), view._settings);
    
    accessors = view._accessors;
    view._getDuration = function(itemID, database, visitor) {
        accessors.getProxy(itemID, database, function(proxy) {
            accessors.getDuration(proxy, database, visitor);
        });
    };
};

/**
 *
 */
TimelineView.prototype.dispose = function() {
    $(this.getUIContext().getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        this._onItemsChanged
    );
    
    this._timeline = null;
    
    if (this._selectListener !== null) {
        this._selectListener.dispose();
        this._selectListener = null;
    }
    
    this._dom.dispose();
    this._dom = null;
    
    this._dispose();
};

/**
 *
 */
TimelineView.prototype._internalValidate = function() {
    var selectCoordinator, self;
    if (typeof this._accessors.getColorKey !== "undefined") {
        if (typeof this._settings.colorCoder !== "undefined") {
            this._colorCoder = this.getUIContext().getMain().getRegistry().get(Coder.getRegistryKey(), this._settings.colorCoder);
        }

        if (this._colorCoder === null) {
            this._colorCoder = new DefaultColorCoder(this.getUIContext());
        }
    }
    if (typeof this._accessors.getIconKey !== "undefined") {
        this._iconCoder = null;
        if (typeof this._settings.iconCoder !== "undefined") {
            this._iconCoder = this.getUIContext().getMain().getRegistry().get(Coder.getRegistryKey(), this._settings.iconCoder);
        }
    }
    if (typeof this._settings.selectCoordinator !== "undefined") {
        selectCoordinator = this.getUIContext().getMain().getRegistry().get(Coordinator.getRegistryKey(), this._settings.selectCoordinator);
        if (selectCoordinator !== null) {
            self = this;
            this._selectListener = selectCoordinator.addListener(function(o) {
                self._select(o);
            });
        }
    }
};

/**
 *
 */
TimelineView.prototype._initializeUI = function() {
    var self, legendWidgetSettings;
    self = this;
    legendWidgetSettings = {};
    
    legendWidgetSettings.colorGradient = (this._colorCoder !== null && typeof this._colorCoder._gradientPoints !== "undefined");
    legendWidgetSettings.iconMarkerGenerator = function(iconURL) {
        var elmt = $("<img>")
            .attr("src", iconURL)
            .css("verticalAlign", "middle");
        return elmt.get(0);
    };
    
    $(this.getContainer()).empty();

    this._dom = ViewUtilities.constructPlottingViewDom(
        this.getContainer(), 
        this.getUIContext(), 
        this._settings.showSummary && this._settings.showHeader,
        {
            "onResize": function() { 
                self._timeline.layout();
            } 
        },
        legendWidgetSettings
    );    
    
    this._eventSource = new Timeline.DefaultEventSource();
    self._initializeViewUI();

    this._reconstruct();
};

/**
 * @param {Array} newEvents
 */
TimelineView.prototype._reconstructTimeline = function(newEvents) {
    var settings, timelineDiv, theme, topIntervalUnit, bottomIntervalUnit, earliest, latest, totalDuration, totalEventCount, totalDensity, intervalDuration, eventsPerPixel, bandInfos, self, listener, i;
    settings = this._settings;
    
    if (this._timeline !== null) {
        this._timeline.dispose();
    }
    
    if (typeof newEvents !== "undefined" && newEvents !== null) {
        this._eventSource.addMany(newEvents);
    }
    
    timelineDiv = this._dom.plotContainer;
    if (settings.timelineConstructor !== null) {
        this._timeline = settings.timelineConstructor(timelineDiv, this._eventSource);
    } else {
        $(timelineDiv)
            .css("height", settings.timelineHeight + "px")
            .attr("class", "exhibit-timelineView-timeline");

        theme = Timeline.ClassicTheme.create();
        theme.event.bubble.width = this.getUIContext().getSetting("bubbleWidth");
        theme.event.bubble.height = this.getUIContext().getSetting("bubbleHeight");
        
        if ((typeof settings.topBandUnit !== "undefined" && settings.topBandUnit !== null) || (typeof settings.bottomBandUnit !== "undefined" && settings.bottomBandUnit !== null)) {
            if (typeof TimelineView._intervalLabelMap === "undefined" || TimelineView._intervalLabelMap === null) {
                TimelineView._intervalLabelMap = {
                    "millisecond":      DateTime.MILLISECOND,
                    "second":           DateTime.SECOND,
                    "minute":           DateTime.MINUTE,
                    "hour":             DateTime.HOUR,
                    "day":              DateTime.DAY,
                    "week":             DateTime.WEEK,
                    "month":            DateTime.MONTH,
                    "year":             DateTime.YEAR,
                    "decade":           DateTime.DECADE,
                    "century":          DateTime.CENTURY,
                    "millennium":       DateTime.MILLENNIUM
                };
            }
            
            if (typeof settings.topBandUnit === "undefined" || settings.topBandUnit === null) {
                bottomIntervalUnit = TimelineView._intervalLabelMap[settings.bottomBandUnit];
                topIntervalUnit = bottomIntervalUnit - 1;
            } else if (typeof settings.bottomBandUnit === "undefined" || settings.bottomBandUnit === null) {
                topIntervalUnit = TimelineView._intervalLabelMap[settings.topBandUnit];
                bottomIntervalUnit = topIntervalUnit + 1;
            } else {
                topIntervalUnit = TimelineView._intervalLabelMap[settings.topBandUnit];
                bottomIntervalUnit = TimelineView._intervalLabelMap[settings.bottomBandUnit];
            }
        } else { // figure this out dynamically
            earliest = this._eventSource.getEarliestDate();
            latest = this._eventSource.getLatestDate();
            
            totalDuration = latest.getTime() - earliest.getTime();
            totalEventCount = this._eventSource.getCount();
            if (totalDuration > 0 && totalEventCount > 1) {
                totalDensity = totalEventCount / totalDuration;
                
                topIntervalUnit = DateTime.MILLENNIUM;
                while (topIntervalUnit > 0) {
                    intervalDuration = DateTime.gregorianUnitLengths[topIntervalUnit];
                    eventsPerPixel = totalDensity * intervalDuration / settings.topBandPixelsPerUnit;
                    if (eventsPerPixel < 0.01) {
                        break;
                    }
                    topIntervalUnit--;
                }
            } else {
                topIntervalUnit = DateTime.YEAR;
            }
            bottomIntervalUnit = topIntervalUnit + 1;
        }
        
        bandInfos = [
            Timeline.createBandInfo({
                width:          settings.topBandHeight + "%", 
                intervalUnit:   topIntervalUnit, 
                intervalPixels: settings.topBandPixelsPerUnit,
                eventSource:    this._eventSource,
                //date:           earliest,
                theme:          theme
            }),
            Timeline.createBandInfo({
                width:          settings.bottomBandHeight + "%", 
                intervalUnit:   bottomIntervalUnit, 
                intervalPixels: settings.bottomBandPixelsPerUnit,
                eventSource:    this._eventSource,
                //date:           earliest,
                overview:       true,
                theme:          theme
            })
        ];
        bandInfos[1].syncWith = 0;
        bandInfos[1].highlight = true;

        this._timeline = Timeline.create(timelineDiv, bandInfos, Timeline.HORIZONTAL);
    }
    
    self = this;
    listener = function(eventID) {
        if (self._selectListener !== null) {
            self._selectListener.fire({ itemIDs: [ eventID ] });
        }
    };
    for (i = 0; i < this._timeline.getBandCount(); i++) {
        this._timeline.getBand(i).getEventPainter().addOnSelectListener(listener);
    }
};

/**
 *
 */
TimelineView.prototype._reconstruct = function() {
    var self, collection, database, settings, accessors, currentSize, unplottableItems, currentSet, hasColorKey, hasIconKey, hasHoverText, hasCaption, colorCodingFlags, iconCodingFlags, events, addEvent, legendWidget, colorCoder, keys, k, key, color, iconCoder, icon, plottableSize, band, centerDate, earliest, latest;

    self = this;
    collection = this.getUIContext().getCollection();
    database = this.getUIContext().getDatabase();
    settings = this._settings;
    accessors = this._accessors;

    /*
     *  Get the current collection and check if it's empty
     */
    currentSize = collection.countRestrictedItems();
    unplottableItems = [];

    this._dom.legendWidget.clear();
    this._eventSource.clear();

    if (currentSize > 0) {
        currentSet = collection.getRestrictedItems();
        hasColorKey = (this._accessors.getColorKey !== null);
        hasIconKey = (this._accessors.getIconKey !== null && this._iconCoder !== null);
        hasHoverText = this._accessors.getHoverText !== null;
        hasCaption = this._accessors.getCaption !== null;
        colorCodingFlags = { mixed: false, missing: false, others: false, keys: new Set() };
        iconCodingFlags = { mixed: false, missing: false, others: false, keys: new Set() };
        events = [];

        addEvent = function(itemID, duration, color, icon, hoverText) {
            var label, evt;
            accessors.getEventLabel(itemID, database, function(v) { label = v; return true; });

            evt = new Timeline.DefaultEventSource.Event({
                id:             itemID,
                eventID:        itemID,
                start:          duration.start,
                end:            duration.end,
                instant:        duration.end === null,
                text:           label,
                description:    "",
                icon:           icon,
                color:          color,
                textColor:      color,
                caption:        hoverText
            });
            evt._itemID = itemID;
            evt.getProperty = function(name) {
                return database.getObject(this._itemID, name);
            };
            evt.fillInfoBubble = function(elmt, theme, labeller) {
                self._fillInfoBubble(this, elmt, theme, labeller);
            };

            events.push(evt);
        };

        currentSet.visit(function(itemID) {
            var durations, color, icon, hoverText, colorKeys, iconKeys, hoverKeys, i;
            durations = [];
            self._getDuration(itemID, database, function(duration) {
                if (typeof duration.start !== "undefined") {
                    durations.push(duration);
                }
            });

            if (durations.length > 0) {
                color = null;
                icon = null;
                hoverText = null;
                if (hasColorKey) {
                    colorKeys = new Set();
                    accessors.getColorKey(itemID, database, function(key) { colorKeys.add(key); });

                    color = self._colorCoder.translateSet(colorKeys, colorCodingFlags);
                }

                icon = null;
                if (hasIconKey) {
                    iconKeys = new Set();
                    accessors.getIconKey(itemID, database, function(key) { iconKeys.add(key); });

                    icon = self._iconCoder.translateSet(iconKeys, iconCodingFlags);
                }

                // deprecated, will be overwritten by caption if caption is used
                if (hasHoverText) {
                    hoverKeys = new Set();
                    accessors.getHoverText(itemID, database, function(key) { hoverKeys.add(key); });
                    for (i in hoverKeys._hash) {
                        if (hoverKeys._hash.hasOwnProperty(i)) {
                            hoverText = i;
                        }
                    }
                }

                // caption supercedes hoverText
                if (hasCaption) {
                    hoverKeys = new Set();
                    accessors.getCaption(itemID, database, function(key) { hoverKeys.add(key); });
                    for (i in hoverKeys._hash) {
                        if (hoverKeys._hash.hasOwnProperty(i)) {
                            hoverText = i;
                        }
                    }
                }

                for (i = 0; i < durations.length; i++) {
                    addEvent(itemID, durations[i], color, icon, hoverText);
                }
            } else {
                unplottableItems.push(itemID);
            }
        });

        if (hasColorKey) {
            legendWidget = this._dom.legendWidget;
            colorCoder = this._colorCoder;
            keys = colorCodingFlags.keys.toArray().sort();
            if (typeof this._colorCoder._gradientPoints !== "undefined" && this._colorCoder._gradientPoints !== null) {
                legendWidget.addGradient(this._colorCoder._gradientPoints);
            } else {
                for (k = 0; k < keys.length; k++) {
                    key = keys[k];
                    color = colorCoder.translate(key);
                    legendWidget.addEntry(color, key);
                }
            }

            if (colorCodingFlags.others) {
                legendWidget.addEntry(colorCoder.getOthersColor(), colorCoder.getOthersLabel());
            }
            if (colorCodingFlags.mixed) {
                legendWidget.addEntry(colorCoder.getMixedColor(), colorCoder.getMixedLabel());
            }
            if (colorCodingFlags.missing) {
                legendWidget.addEntry(colorCoder.getMissingColor(), colorCoder.getMissingLabel());
            }
        }

        if (hasIconKey) {
            legendWidget = this._dom.legendWidget;
            iconCoder = this._iconCoder;
            keys = iconCodingFlags.keys.toArray().sort();    
            if (typeof settings.iconLegendLabel !== "undefined" && settings.iconLegendLabel !== null) {
                legendWidget.addLegendLabel(settings.iconLegendLabel, 'icon');
            }
            for (k = 0; k < keys.length; k++) {
                key = keys[k];
                icon = iconCoder.translate(key);
                legendWidget.addEntry(icon, key, 'icon');
            }
            if (iconCodingFlags.others) {
                legendWidget.addEntry(iconCoder.getOthersIcon(), iconCoder.getOthersLabel(), 'icon');
            }
            if (iconCodingFlags.mixed) {
                legendWidget.addEntry(iconCoder.getMixedIcon(), iconCoder.getMixedLabel(), 'icon');
            }
            if (iconCodingFlags.missing) {
                legendWidget.addEntry(iconCoder.getMissingIcon(), iconCoder.getMissingLabel(), 'icon');
            }
        }
        
        plottableSize = currentSize - unplottableItems.length;
        if (plottableSize > this._largestSize) {
            this._largestSize = plottableSize;
            this._reconstructTimeline(events);
        } else {
            this._eventSource.addMany(events);
        }

        band = this._timeline.getBand(0);
        centerDate = band.getCenterVisibleDate();
        earliest = this._eventSource.getEarliestDate();
        latest = this._eventSource.getLatestDate();
        if (typeof earliest !== "undefined" && earliest !== null && centerDate < earliest) {
            band.scrollToCenter(earliest);
        } else if (typeof latest !== "undefined" && latest !== null && centerDate > latest) {
            band.scrollToCenter(latest);
        }
    }
    this._dom.setUnplottableMessage(currentSize, unplottableItems);
};

/**
 * @param {Object} selection
 * @param {Array} selection.itemIDs
 */
TimelineView.prototype._select = function(selection) {
    var itemID, c, i, band, evt;
    itemID = selection.itemIDs[0];
    c = this._timeline.getBandCount();
    for (i = 0; i < c; i++) {
        band = this._timeline.getBand(i);
        evt = band.getEventSource().getEvent(itemID);
        if (typeof evt !== "undefined" && evt !== null) {
            band.showBubbleForEvent(itemID);
            break;
        }
    }
};

/**
 * @param {Timeline.DefaultEventSource.Event} evt
 * @param {Element} elmt
 * @param {Object} [theme] Ignored.
 * @param {Object} [labeller] Ignored.
 */
TimelineView.prototype._fillInfoBubble = function(evt, elmt, theme, labeller) {
    this.getUIContext().getLensRegistry().createLens(evt._itemID, $(elmt), this.getUIContext());
};

    // end define
    return TimelineView;
});
