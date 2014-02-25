/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:karger@mit.edu">David Karger</a>
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @example
 */

define([
    "lib/jquery",
    "exhibit",
    "gmaps",
    "./base",
    "./marker",
    "scripts/util/debug",
    "scripts/util/set",
    "scripts/util/accessors",
    "scripts/util/settings",
    "scripts/util/views",
    "scripts/data/expression-parser",
    "scripts/ui/ui-context",
    "scripts/ui/views/view",
    "scripts/ui/coordinator",
    "scripts/ui/coders/coder",
    "scripts/ui/coders/default-color-coder"
], function($, Exhibit, google, MapExtension, Marker, Debug, Set, AccessorsUtilities, SettingsUtilities, ViewUtilities, ExpressionParser, UIContext, View, Coordinator, Coder, DefaultColorCoder) {
/**
 * @class
 * @constructor
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var MapView = function(containerElmt, uiContext) {
    MapView._initialize();

    var view = this;
    $.extend(this, new View(
        "map",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(MapView._settingSpecs);

    this._overlays = [];
    this._accessors = {
        "getProxy":  function(itemID, database, visitor) {
            visitor(itemID);
        },
        "getColorKey": null,
        "getSizeKey":  null,
        "getIconKey":  null,
        "getIcon":     null
    };
    this._colorCoder = null;
    this._sizeCoder = null;
    this._iconCoder = null;
    
    this._selectListener = null;
    this._itemIDToMarker = {};
    this._markerLabelExpression = null;
    this._markerCache = {};

    this._shown = false;
    
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
MapView._settingSpecs = {
    "latlngOrder":      { "type": "enum",     "defaultValue": "latlng", "choices": [ "latlng", "lnglat" ] },
    "latlngPairSeparator": { "type": "text",  "defaultValue": ";"   },
    "center":           { "type": "float",    "defaultValue": [20,0],   "dimensions": 2 },
    "zoom":             { "type": "float",    "defaultValue": 2         },
    "autoposition":     { "type": "boolean",  "defaultValue": false     },
    "scrollWheelZoom":  { "type": "boolean",  "defaultValue": true      },
    "size":             { "type": "text",     "defaultValue": "small"   },
    "scaleControl":     { "type": "boolean",  "defaultValue": true      },
    "overviewControl":  { "type": "boolean",  "defaultValue": false     },
    "type":             { "type": "enum",     "defaultValue": "normal", "choices": [ "normal", "satellite", "hybrid", "terrain" ] },
    "bubbleTip":        { "type": "enum",     "defaultValue": "top",    "choices": [ "top", "bottom" ] },
    "mapHeight":        { "type": "int",      "defaultValue": 400       },
    "mapConstructor":   { "type": "function", "defaultValue": null      },
    "markerLabel":      { "type": "text",     "defaultValue": ".label"  },
    "color":            { "type": "text",     "defaultValue": "#FF9000" },
    "colorCoder":       { "type": "text",     "defaultValue": null      },
    "sizeCoder":        { "type": "text",     "defaultValue": null      },
    "iconCoder":        { "type": "text",     "defaultValue": null      },
    "selectCoordinator":  { "type": "text",   "defaultValue": null      },
    
    "iconSize":         { "type": "int",      "defaultValue": 0         },
    "iconFit":          { "type": "text",     "defaultValue": "smaller" },
    "iconScale":        { "type": "float",    "defaultValue": 1         },
    "iconOffsetX":      { "type": "float",    "defaultValue": 0         },
    "iconOffsetY":      { "type": "float",    "defaultValue": 0         },
    "shape":            { "type": "text",     "defaultValue": "circle"  },
    "shapeWidth":       { "type": "int",      "defaultValue": 24        },
    "shapeHeight":      { "type": "int",      "defaultValue": 24        },
    "shapeAlpha":       { "type": "float",    "defaultValue": 0.7       },
    "pin":              { "type": "boolean",  "defaultValue": true      },
    "pinHeight":        { "type": "int",      "defaultValue": 6         },
    "pinWidth":         { "type": "int",      "defaultValue": 6         },
    "borderOpacity":    { "type": "float",    "defaultValue": 0.5       },
    "borderWidth":      { "type": "int",      "defaultValue": 1         },
    "borderColor":      { "type": "text",     "defaultValue": null      },
    "opacity":          { "type": "float",    "defaultValue": 0.7       },
    "sizeLegendLabel":  { "type": "text",     "defaultValue": null      },
    "colorLegendLabel": { "type": "text",     "defaultValue": null      },
    "iconLegendLabel":  { "type": "text",     "defaultValue": null      },
    "markerScale":      { "type": "text",     "defaultValue": null      },
    "markerFontFamily": { "type": "text",     "defaultValue": "12pt sans-serif" },
    "markerFontColor":  { "type": "text",     "defaultValue": "black"   },
    "showHeader":       { "type": "boolean",  "defaultValue": true      },
    "showSummary":      { "type": "boolean",  "defaultValue": true      },
    "showFooter":       { "type": "boolean",  "defaultValue": true      }
};

/**
 * @constant
 */
MapView._accessorSpecs = [
    {   "accessorName":   "getProxy",
        "attributeName":  "proxy"
    },
    {   "accessorName": "getLatlng",
        "alternatives": [
            {   "bindings": [
                    {   "attributeName":  "latlng",
                        "types":          [ "float", "float" ],
                        "bindingNames":   [ "lat", "lng" ]
                    },
                    {   "attributeName":  "maxAutoZoom",
                        "type":           "float",
                        "bindingName":    "maxAutoZoom",
                        "optional":       true
                    }
                ]
            },
            {   "bindings": [
                    {   "attributeName":  "lat",
                        "type":           "float",
                        "bindingName":    "lat"
                    },
                    {   "attributeName":  "lng",
                        "type":           "float",
                        "bindingName":    "lng"
                    },
                    {   "attributeName":  "maxAutoZoom",
                        "type":           "float",
                        "bindingName":    "maxAutoZoom",
                        "optional":       true
                    }
                ]
            }
        ]
    },
    {   "accessorName":   "getPolygon",
        "attributeName":  "polygon",
        "type":           "text"
    },
    {   "accessorName":   "getPolyline",
        "attributeName":  "polyline",
        "type":           "text"
    },
    {   "accessorName":   "getColorKey",
        "attributeName":  "marker", // backward compatibility
        "type":           "text"
    },
    {   "accessorName":   "getColorKey",
        "attributeName":  "colorKey",
        "type":           "text"
    },
    {   "accessorName":   "getSizeKey",
        "attributeName":  "sizeKey",
        "type":           "text"
    },
    {   "accessorName":   "getIconKey",
        "attributeName":  "iconKey",
        "type":           "text"
    },
    {   "accessorName":   "getIcon",
        "attributeName":  "icon",
        "type":           "url"
    }
];

/**
 * @private
 * @static
 */
MapView._initialize = function() {
    if (!MapExtension.initialized) {
        var rel, canvas;
        $('head link').each(function(i, el) {
            rel = $(el).attr("rel");
            if (rel.match(/\b(exhibit-map-painter|exhibit\/map-painter)\b/)) {
                MapExtension.markerUrlPrefix = $(el).attr("href") + "?";
            }
        });

        Marker.detectCanvas();
        MapExtension.initialized = true;
    }
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.MapView}
 */
MapView.create = function(configuration, containerElmt, uiContext) {
    var view = new MapView(
        containerElmt,
        UIContext.create(configuration, uiContext)
    );
    MapView._configure(view, configuration);
    
    view._internalValidate();
    view._initializeUI();
    return view;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.MapView}
 */
MapView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, view;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    view = new MapView(
        containerElmt !== null ? containerElmt : configElmt, 
        UIContext.createFromDOM(configElmt, uiContext)
    );
    
    AccessorsUtilities.createAccessorsFromDOM(configElmt, MapView._accessorSpecs, view._accessors);
    SettingsUtilities.collectSettingsFromDOM(configElmt, view.getSettingSpecs(), view._settings);
    MapView._configure(view, configuration);
    
    view._internalValidate();
    view._initializeUI();
    return view;
};

/**
 * @static
 * @param {Exhibit.MapView} view
 * @param {Object} configuration
 */
MapView._configure = function(view, configuration) {
    var accessors;
    AccessorsUtilities.createAccessors(configuration, MapView._accessorSpecs, view._accessors);
    SettingsUtilities.collectSettings(configuration, view.getSettingSpecs(), view._settings);
    
    accessors = view._accessors;
    view._getLatlng = accessors.getLatlng !== null ?
        function(itemID, database, visitor) {
            accessors.getProxy(itemID, database, function(proxy) {
                accessors.getLatlng(proxy, database, visitor);
            });
        } : 
        null;

    view._markerLabelExpression = ExpressionParser.parse(view._settings.markerLabel);
};

/**
 * @static
 * @param {Exhibit.Set} set
 * @param {String} addressExpressionString
 * @param {String} outputProperty
 * @param {Element} outputTextArea
 * @param {Exhibit.Database} database
 * @param {Numeric} accuracy
 */
MapView.lookupLatLng = function(set, addressExpressionString, outputProperty, outputTextArea, database, accuracy) {
    var expression, jobs, results, geocoder, cont;

    if (typeof accuracy === "undefined" || accuracy === null) {
        accuracy = 4;
    }
    
    expression = ExpressionParser.parse(addressExpressionString);
    jobs = [];
    set.visit(function(item) {
        var address = expression.evaluateSingle(
            { "value" : item },
            { "value" : "item" },
            "value",
            database
        ).value;
        if (address !== null) {
            jobs.push({ "item": item, "address": address });
        }
    });
    
    results = [];
    geocoder = new GClientGeocoder();
    cont = function() {
        var job;
        if (jobs.length > 0) {
            job = jobs.shift();
            geocoder.getLocations(
                job.address,
                function(json) {
                    var coords, lat, lng, segments;
                    if (typeof json.Placemark !== "undefined") {
                        json.Placemark.sort(function(p1, p2) {
                            return p2.AddressDetails.Accuracy - p1.AddressDetails.Accuracy;
                        });
                    }
                    
                    if (typeof json.Placemark !== "undefined" && 
                        json.Placemark.length > 0 && 
                        json.Placemark[0].AddressDetails.Accuracy >= accuracy) {
                        coords = json.Placemark[0].Point.coordinates;
                        lat = coords[1];
                        lng = coords[0];
                        results.push("\t{ id: '" + job.item + "', " + outputProperty + ": '" + lat + "," + lng + "' }");
                    } else {
                        segments = job.address.split(",");
                        if (segments.length === 1) {
                            results.push("\t{ id: '" + job.item + "' }");
                        } else {
                            job.address = segments.slice(1).join(",").replace(/^\s+/, "");
                            jobs.unshift(job); // do it again
                        }
                    }
                    cont();
                }
            );
        } else {
            outputTextArea.value = results.join(",\n");
        }
    };
    cont();
};

/**
 *
 */
MapView.prototype.dispose = function() {
    var view = this;
    $(this.getUIContext().getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );
    
    this._clearOverlays();
    this._map = null;
    
    if (this._selectListener !== null) {
        this._selectListener.dispose();
        this._selectListener = null;
    }

    this._itemIDToMarker = null;
    this._markerCache = null;
    
    this._dom.dispose();
    this._dom = null;

    this._dispose();
};

/**
 * @private
 */
MapView.prototype._internalValidate = function() {
    var exhibit, selectCoordinator, self;
    exhibit = this.getUIContext().getMain();
    if (typeof this._accessors.getColorKey !== "undefined" && this._accessors.getColorKey !== null) {
        if (typeof this._settings.colorCoder !== "undefined" && this._settings.colorCoder !== null) {
            this._colorCoder = this.getUIContext().getMain().getRegistry().get(Coder.getRegistryKey(), this._settings.colorCoder);
        }
        if (typeof this._colorCoder === "undefined" || this._colorCoder === null) {
            this._colorCoder = new DefaultColorCoder(this.getUIContext());
        }
    }
    if (typeof this._accessors.getSizeKey !== "undefined" && this._accessors.getSizeKey !== null) {  
        if (typeof this._settings.sizeCoder !== "undefined" && this._settings.sizeCoder !== null) {
            this._sizeCoder = this.getUIContext().getMain().getRegistry().get(Coder.getRegistryKey(), this._settings.sizeCoder);
            if (typeof this._settings.markerScale !== "undefined" && this._settings.markerScale !== null) {
                this._sizeCoder._settings.markerScale = this._settings.markerScale;
            }
        }
    }
    if (typeof this._accessors.getIconKey !== "undefined" && this._accessors.getIconKey !== null) {  
        if (typeof this._settings.iconCoder !== "undefined" && this._settings.iconCoder !== null) {
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
 * @private
 */
MapView.prototype._initializeUI = function() {
    var self, legendWidgetSettings, mapDiv;

    self = this;
    
    legendWidgetSettings = {};
    legendWidgetSettings.colorGradient = (this._colorCoder !== null && typeof this._colorCoder._gradientPoints !== "undefined");
    legendWidgetSettings.colorMarkerGenerator = this._createColorMarkerGenerator();
    legendWidgetSettings.sizeMarkerGenerator = this._createSizeMarkerGenerator();
    legendWidgetSettings.iconMarkerGenerator = this._createIconMarkerGenerator();
    
    $(this.getContainer()).empty();
    this._dom = ViewUtilities.constructPlottingViewDom(
        this.getContainer(), 
        this.getUIContext(),
        this._settings.showSummary && this._settings.showHeader,
        {
            "onResize": function() { 
	            google.maps.event.trigger(self._map, "resize");
            }
        },
        legendWidgetSettings
    );
    
    mapDiv = this._dom.plotContainer;
    $(mapDiv)
        .attr("class", "exhibit-mapView-map")
        .css("height", this._settings.mapHeight);
    
    this._map = this._constructGMap(mapDiv);
    this._reconstruct();
};

/**
 * @private
 * @param {Element} mapDiv
 * @returns {google.maps.Map}
 */
MapView.prototype._constructGMap = function(mapDiv) {
    var settings, mapOptions, map;
    settings = this._settings;
    if (typeof settings.mapConstructor !== "undefined" &&
        settings.mapConstructor !== null) {
        return settings.mapConstructor(mapDiv);
    } else {
	    mapOptions = {
	        "center": new google.maps.LatLng(
                settings.center[0],
                settings.center[1]
            ),
	        "zoom": settings.zoom,
	        "panControl": true,
	        "zoomControl": {
                "style": google.maps.ZoomControlStyle.DEFAULT
            },
	        "mapTypeId": google.maps.MapTypeId.ROADMAP
	    };

	    if (settings.size === "small") {
	        mapOptions.zoomControl.style = google.maps.ZoomControlStyle.SMALL;
	    } else if (settings.size === "large") {
	        mapOptions.zoomControl.style = google.maps.ZoomControlStyle.LARGE;
        }

	    if (typeof settings.overviewControl !== "undefined") {
	        mapOptions.overviewControl = settings.overviewControl;
        }

	    if (typeof settings.scaleControl !== "undefined") {
	        mapOptions.scaleControl = settings.scaleControl;
        }
   
	    if (typeof settings.scrollWheelZoom !== "undefined" &&
            !settings.scrollWheelZoom) {
	        mapOptions.scrollWheel = false;
        }

        switch (settings.type) {
        case "satellite":
            mapOptions.mapTypeId = google.maps.MapTypeId.SATELLITE;
            break;
        case "hybrid":
            mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
            break;
        case "terrain":
            mapOptions.mapTypeId = google.maps.MapTypeId.TERRAIN;
            break;
        }

        map = new google.maps.Map(mapDiv, mapOptions);

        /** @@@
        google.maps.event.addListener(map, "click", function() {
            SimileAjax.WindowManager.cancelPopups();
        });
        */
        
        return map;
    }
};

/**
 * @private
 * @returns {Function}
 */
MapView.prototype._createColorMarkerGenerator = function() {
    var settings = this._settings;

    return function(color) {
        return $.simileBubble(
            "createTranslucentImage",
            Marker.makeIcon(settings.shapeWidth, settings.shapeHeight, color, null, null, settings.iconSize, settings).iconURL,
            "middle"
        );
    };
};

/**
 * @returns {Function}
 */
MapView.prototype._createSizeMarkerGenerator = function() {
    var settings = $.extend({}, this._settings);
    settings.pinHeight = 0;
    return function(iconSize) {
        return $.simileBubble(
            "createTranslucentImage",
            Marker.makeIcon(settings.shapeWidth, settings.shapeHeight, settings.color, null, null, iconSize, settings).iconURL,
            "middle"
        );
    };
};

/**
 * @private
 * @returns {Function}
 */
MapView.prototype._createIconMarkerGenerator = function() {
    return function(iconURL) {
        var elmt = $("img")
            .attr("src", iconURL)
            .css("vertical-align", "middle")
            .css("height", 40);
        return $(elmt).get(0);
    };
};

/**
 * @private
 */
MapView.prototype._clearOverlays = function() {
    var i;
    if (typeof this._infoWindow !== "undefined" && this._infoWindow !== null) {
	    this._infoWindow.setMap(null);
    }

    for (i = 0; i < this._overlays.length; i++) {
	    this._overlays[i].setMap(null);
    }

    this._overlays = [];
};

/**
 * @private
 */
MapView.prototype._reconstruct = function() {
    var currentSize, unplottableItems;

    this._clearOverlays();

    if (typeof this._dom.legendWidget !== "undefined" && this._dom.legendWidget !== null) {
	    this._dom.legendWidget.clear();
    }

    if (typeof this._dom.legendGradientWidget !== "undefined" && this._dom.legendWidgetGradient !== null) {
        this._dom.legendGradientWidget.reconstruct();
    }

    this._itemIDToMarker = {};
    
    currentSize = this.getUIContext().getCollection().countRestrictedItems();
    unplottableItems = [];

    if (currentSize > 0) {
        this._rePlotItems(unplottableItems);
    }

    this._dom.setUnplottableMessage(currentSize, unplottableItems);
};

/**
 * @private
 * @param {Array} unplottableItems
 */
MapView.prototype._rePlotItems = function(unplottableItems) {
    var self, collection, database, settings, accessors, currentSet, locationToData, hasColorKey, hasSizeKey, hasIconKey, hasIcon, hasPoints, hasPolygons, hasPolylines, makeLatLng, bounds, maxAutoZoom, colorCodingFlags, sizeCodingFlags, iconCodingFlags, addMarkerAtLocation, latlngKey, legendWidget, colorCoder, keys, legendGradientWidget, k, key, color, sizeCoder, points, space, i, size, iconCoder, icon;

    self = this;
    collection = this.getUIContext().getCollection();
    database = this.getUIContext().getDatabase();
    settings = this._settings;
    accessors = this._accessors;

    currentSet = collection.getRestrictedItems();
    locationToData = {};
    hasColorKey = (accessors.getColorKey !== null);
    hasSizeKey = (accessors.getSizeKey !== null);
    hasIconKey = (accessors.getIconKey !== null);
    hasIcon = (accessors.getIcon !== null);
    
    hasPoints = (this._getLatlng !== null);
    hasPolygons = (accessors.getPolygon !== null);
    hasPolylines = (accessors.getPolyline !== null);
    
    makeLatLng = (settings.latlngOrder === "latlng") ?
        function (first, second) {
            return new google.maps.LatLng(first, second);
        } : function(first, second) {
            return new google.maps.LatLng(second, first);
        };

    colorCodingFlags = {
        "mixed": false,
        "missing": false,
        "others": false,
        "keys": new Set()
    };

     sizeCodingFlags = {
        "mixed": false,
        "missing": false,
        "others": false,
        "keys": new Set()
    };

    iconCodingFlags = {
        "mixed": false,
        "missing": false,
        "others": false,
        "keys": new Set()
    };

    bounds = Infinity;
    maxAutoZoom = Infinity;
    currentSet.visit(function(itemID) {
        var latlngs, polygons, polylines, color, colorKeys, sizeKeys, iconKeys, n, latlng, latlngKey, locationData, p;
        latlngs = [];
        polygons = [];
        polylines = [];
        
        if (hasPoints) {
            self._getLatlng(itemID, database, function(v) {
		        if (v !== null && typeof v.lat !== "undefined" && v.lat !== null && typeof v.lng !== "undefined" && v.lng !== null) {
		            latlngs.push(v);
                }
            });
        }

        if (hasPolygons) {
            accessors.getPolygon(itemID, database, function(v) {
                if (v !== null) {
                    polygons.push(v);
                }
            });
        }

        if (hasPolylines) {
            accessors.getPolyline(itemID, database, function(v) {
                if (v !== null) {
                    polylines.push(v);
                }
            });
        }
        
        if (latlngs.length > 0 || polygons.length > 0 || polylines.length > 0) {
            color = self._settings.color;
            colorKeys = null;
            if (hasColorKey) {
                colorKeys = new Set();
                accessors.getColorKey(itemID, database, function(v) {
                    colorKeys.add(v);
                });
                
                color = self._colorCoder.translateSet(colorKeys, colorCodingFlags);
            }
            
            if (latlngs.length > 0) {
                sizeKeys = null;
                if (hasSizeKey) {
                    sizeKeys = new Set();
                    accessors.getSizeKey(itemID, database, function(v) {
                        sizeKeys.add(v);
                    });
                }

                iconKeys = null;
                if (hasIconKey) {
                    iconKeys = new Set();
                    accessors.getIconKey(itemID, database, function(v) {
                        iconKeys.add(v);
                    });
                }

                for (n = 0; n < latlngs.length; n++) {
                    latlng = latlngs[n];
                    latlngKey = latlng.lat + "," + latlng.lng;
                    if (typeof locationToData[latlngKey] !== "undefined") {
                        locationData = locationToData[latlngKey];
                        locationData.items.push(itemID);
                        if (hasColorKey) {
                            locationData.colorKeys.addSet(colorKeys);
                        }
                        if (hasSizeKey) {
                            locationData.sizeKeys.addSet(sizeKeys);
                        }
                        if (hasIconKey) {
                            locationData.iconKeys.addSet(iconKeys);
                        }
                    } else {
                        locationData = {
                            "latlng":     latlng,
                            "items":      [ itemID ]
                        };
                        if (hasColorKey) {
                            locationData.colorKeys = colorKeys;
                        }
                        if (hasSizeKey) {
                            locationData.sizeKeys = sizeKeys;
                        }
                        if (hasIconKey) {
                            locationData.iconKeys = iconKeys;
                        }
                        locationToData[latlngKey] = locationData;
                    }
                }
            }
            
            for (n = 0; n < polygons.length; n++) {
                self._plotPolygon(itemID, polygons[n], color, makeLatLng); 
            }
            for (n = 0; n < polylines.length; n++) {
                self._plotPolyline(itemID, polylines[n], color, makeLatLng); 
            }
        } else {
            unplottableItems.push(itemID);
        }
    });
    
    addMarkerAtLocation = function(locationData) {
        var itemCount, shape, color, iconSize, icon, point, marker, x;

        itemCount = locationData.items.length;
        if (typeof bounds === "undefined" || bounds === null || !isFinite(bounds)) {
            bounds = new google.maps.LatLngBounds();
        }
        
        shape = self._settings.shape;
        
        color = self._settings.color;
        if (hasColorKey) {
            color = self._colorCoder.translateSet(locationData.colorKeys, colorCodingFlags);
        }
        iconSize = self._settings.iconSize;
        if (hasSizeKey) {
            iconSize = self._sizeCoder.translateSet(locationData.sizeKeys, sizeCodingFlags);
        }
        
        icon = null;
        if (itemCount === 1) {
            if (hasIcon) {
                accessors.getIcon(locationData.items[0], database, function(v) {
                    icon = v;
                });
            }
        }
        if (hasIconKey) {
            icon = self._iconCoder.translateSet(locationData.iconKeys, iconCodingFlags);
        }
	
	    point = new google.maps.LatLng(locationData.latlng.lat, locationData.latlng.lng);

	    if (typeof locationData.latlng.maxAutoZoom !== "undefined" && maxAutoZoom > locationData.latlng.maxAutoZoom) {
            maxAutoZoom = locationData.latlng.maxAutoZoom;
        }
        bounds.extend(point);

        marker = self._makeMarker(
	        point,
            shape,
            color,
            iconSize,
            icon,
            itemCount === 1 ? "" : itemCount.toString(),
            self._settings
        );

        google.maps.event.addListener(marker, "click", function() { 
	        self._showInfoWindow(locationData.items, null, marker);
            if (self._selectListener !== null) {
                self._selectListener.fire({ "itemIDs": locationData.items });
            }
        });
        marker.setMap(self._map);
	    self._overlays.push(marker);
        
        for (x = 0; x < locationData.items.length; x++) {
            self._itemIDToMarker[locationData.items[x]] = marker;
        }
    };

    try {
	    for (latlngKey in locationToData) {
            if (locationToData.hasOwnProperty(latlngKey)) {
	            addMarkerAtLocation(locationToData[latlngKey]);
            }
	    }
    } catch (e) {
        Debug.exception(e);
    }

    // create all legends for the map, one each for icons, colors, and sizes
    if (hasColorKey) {
        legendWidget = this._dom.legendWidget;
        colorCoder = this._colorCoder;
        keys = colorCodingFlags.keys.toArray().sort();

        if (typeof colorCoder._gradientPoints !== "undefined" && colorCoder._gradientPoints !== null) {
            legendGradientWidget = this._dom.legendGradientWidget;
            legendGradientWidget.addGradient(this._colorCoder._gradientPoints);
            if (typeof settings.colorLegendLabel !== "undefined" && settings.colorLegendLabel !== null) {
                legendGradientWidget.addLegendLabel(settings.colorLegendLabel);
            }
        } else {
            for (k = 0; k < keys.length; k++) {
                key = keys[k];
                color = colorCoder.translate(key);
                legendWidget.addEntry(color, key);
            }
            if (typeof settings.colorLegendLabel !== "undefined" && settings.colorLegendLabel !== null) {
                legendWidget.addLegendLabel(settings.colorLegendLabel, "color");
            }
        }

        if (colorCodingFlags.others) {
            legendWidget.addEntry(colorCoder.getOthersColor(), colorCoder.getOthersLabel());
        }
            
        if (colorCodingFlags.mixed && legendWidget) {
            legendWidget.addEntry(colorCoder.getMixedColor(), colorCoder.getMixedLabel());
        }

        if (colorCodingFlags.missing) {
            legendWidget.addEntry(colorCoder.getMissingColor(), colorCoder.getMissingLabel());
        }
    }
    
    if (hasSizeKey) {
        legendWidget = this._dom.legendWidget;
        sizeCoder = this._sizeCoder;
        keys = sizeCodingFlags.keys.toArray().sort();    
        if (typeof settings.sizeLegendLabel !== "undefined" && settings.sizeLegendLabel !== null) {
            legendWidget.addLegendLabel(settings.sizeLegendLabel, "size");
        }
        if (typeof sizeCoder._gradientPoints !== "undefined" && sizeCoder._gradientPoints !== null) {
            points = sizeCoder._gradientPoints;
            space = (points[points.length - 1].value - points[0].value)/5;
            keys = [];
            for (i = 0; i < 6; i++) {
                keys.push(Math.floor(points[0].value + space * i));
            }
            for (k = 0; k < keys.length; k++) {
                key = keys[k];
                size = sizeCoder.translate(key);
                legendWidget.addEntry(size, key, "size");
            }
        } else {       
            for (k = 0; k < keys.length; k++) {
                key = keys[k];
                size = sizeCoder.translate(key);
                legendWidget.addEntry(size, key, "size");
            }
            if (sizeCodingFlags.others) {
                legendWidget.addEntry(sizeCoder.getOthersSize(), sizeCoder.getOthersLabel(), "size");
            }
            if (sizeCodingFlags.mixed) {
                legendWidget.addEntry(sizeCoder.getMixedSize(), sizeCoder.getMixedLabel(), "size");
            }
            if (sizeCodingFlags.missing) {
                legendWidget.addEntry(sizeCoder.getMissingSize(), sizeCoder.getMissingLabel(), "size");
            }
        }
    }        

    if (hasIconKey) {
        legendWidget = this._dom.legendWidget;
        iconCoder = this._iconCoder;
        keys = iconCodingFlags.keys.toArray().sort();    
        if (typeof settings.iconLegendLabel !== "undefined" && settings.iconLegendLabel !== null) {
            legendWidget.addLegendLabel(settings.iconLegendLabel, "icon");
        }
        for (k = 0; k < keys.length; k++) {
            key = keys[k];
            icon = iconCoder.translate(key);
            legendWidget.addEntry(icon, key, "icon");
        }
        if (iconCodingFlags.others) {
            legendWidget.addEntry(iconCoder.getOthersIcon(), iconCoder.getOthersLabel(), "icon");
        }
        if (iconCodingFlags.mixed) {
            legendWidget.addEntry(iconCoder.getMixedIcon(), iconCoder.getMixedLabel(), "icon");
        }
        if (iconCodingFlags.missing) {
            legendWidget.addEntry(iconCoder.getMissingIcon(), iconCoder.getMissingLabel(), "icon");
        }
    }  

    // on first show, allow map to position itself based on content
    if (typeof bounds !== "undefined" && bounds !== null && settings.autoposition && !this._shown) {
	    self._map.fitBounds(bounds);
	    if (self._map.getZoom > maxAutoZoom) {
	        self._map_setZoom(maxAutoZoom);
	    }
    }

    this._shown = true; //don't reposition map again
};

/**
 * @private
 * @param {String} itemID
 * @param {String} polygonString
 * @param {String} color
 * @param {Function} makeLatLng
 * @returns {google.maps.Polygon}
 */
MapView.prototype._plotPolygon = function(itemID, polygonString, color, makeLatLng) {
    var coords, settings, borderColor, polygon;

    coords = this._parsePolygonOrPolyline(polygonString, makeLatLng);
    if (coords.length > 1) {
        settings = this._settings;
        borderColor = (typeof settings.borderColor !== "undefined" && settings.borderColor !== null) ? settings.borderColor : color;
	
	    polygon = new google.maps.Polygon({
	        "paths": coords,
	        "strokeColor": borderColor,
	        "strokeWeight": settings.borderWidth,
	        "strokeOpacity": settings.borderOpacity,
	        "fillColor": color,
	        "fillOpacity": settings.opacity
	    });
        
        return this._addPolygonOrPolyline(itemID, polygon);
    }

    return null;
};

/**
 * @private
 * @param {String} itemID
 * @param {String} polylineString
 * @param {String} color
 * @param {Function} makeLatLng
 * @returns {google.maps.Polyline}
 */
MapView.prototype._plotPolyline = function(itemID, polylineString, color, makeLatLng) {
    var coords, settings, borderColor, polyline;
    coords = this._parsePolygonOrPolyline(polylineString, makeLatLng);
    if (coords.length > 1) {
        settings = this._settings;
        borderColor = (typeof settings.borderColor !== "undefined" && settings.borderColor !== null) ? settings.borderColor : color;
	    polyline = new google.maps.Polyline({
	        "path": coords,
	        "strokeColor": borderColor,
	        "strokeWeight": settings.borderWidth,
	        "strokeOpacity": settings.borderOpacity
	    });

        return this._addPolygonOrPolyline(itemID, polyline);
    }
    return null;
};

/**
 * @param {String} itemID
 * @param {google.maps.Polygon|google.maps.Polyline} poly
 * @returns {google.maps.Polygon|google.maps.Polyline}
 */
MapView.prototype._addPolygonOrPolyline = function(itemID, poly) {
    var self, onclick;

    poly.setMap(this._map);
    this._overlays.push(poly);
    
    self = this;
    onclick = function(evt) {
	    self._showInfoWindow([itemID], evt.latLng);

        if (self._selectListener !== null) {
            self._selectListener.fire({ "itemIDs": [itemID] });
        }
    };

    google.maps.event.addListener(poly, "click", onclick);
    
    this._itemIDToMarker[itemID] = poly;
    
    return poly;
};

/**
 * @param {String} s
 * @param {Function} makeLatLng
 * @returns {Array}
 */
MapView.prototype._parsePolygonOrPolyline = function(s, makeLatLng) {
    var coords, a, i, pair;
    coords = [];
    
    a = s.split(this._settings.latlngPairSeparator);
    for (i = 0; i < a.length; i++) {
        pair = a[i].split(",");
        coords.push(makeLatLng(parseFloat(pair[0]), parseFloat(pair[1])));
    }
    
    return coords;
};

/**
 * @param {Object} selection
 */
MapView.prototype._select = function(selection) {
    var itemID, marker;
    itemID = selection.itemIDs[0];
    marker = this._itemIDToMarker[itemID];
    if (typeof marker !== "undefined" && marker !== null) {
	    this._showInfoWindow([itemID], null, marker);
    }
};

/**
 * @param {Array} items
 * @param {google.maps.Point} pos
 * @param {google.maps.Marker} marker
 */
MapView.prototype._showInfoWindow = function(items, pos, marker) {
    var content, win, markerSize, winAnchor;

    if (typeof this._infoWindow !== "undefined" && this._infoWindow !== null) {
	    this._infoWindow.setMap(null);
    }

    content = this._createInfoWindow(items);

    markerSize = marker.getIcon().size;
    // The origin (0, 0) is the top middle
    winAnchor = new google.maps.Size(
        0,
        (this._settings.bubbleTip === "bottom") ? markerSize.height : 0
    );
    win = new google.maps.InfoWindow({
	    "content": content,
        "pixelOffset": winAnchor
    });

    if (typeof pos !== "undefined" && pos !== null) {
        win.setPosition(pos);
    }

    win.open(this._map, marker);

    this._infoWindow = win;
};

/**
 * @param {Array} items
 * @returns {Element}
 */
MapView.prototype._createInfoWindow = function(items) {
    return ViewUtilities.fillBubbleWithItems(
        null,
        items,
        this._markerLabelExpression,
        this.getUIContext()
    );
};

/**
 * @static
 * @param {Exhibit.MapExtension.Marker} marker
 * @param {Object} position
 * @param {Numeric} position.lat
 * @param {Numeric} position.lng
 * @returns {google.maps.Marker}
 */
MapView.markerToMap = function(marker, position) {
    var icon, shadow;
    icon = marker.getIcon();
    shadow = marker.getShadow();
    return new google.maps.Marker({
	    "icon": new google.maps.MarkerImage(
            icon.url,
            new google.maps.Size(icon.size[0], icon.size[1]),
            null,
            new google.maps.Point(icon.anchor[0], icon.anchor[1]),
            null
        ),
	    "shadow": new google.maps.MarkerImage(
            shadow.url,
            new google.maps.Size(shadow.size[0], shadow.size[1]),
            null,
            new google.maps.Point(shadow.anchor[0], shadow.anchor[1]),
            null
        ),
	    "shape": marker.getShape(),
	    "position": position
	});
};

/**
 * Update a cached marker's display icon.
 * @param {String} key
 * @param {String} iconURL
 */
MapView.prototype.updateMarkerIcon = function(key, iconURL) {
    var cached;
    cached = this._markerCache[key];
    if (typeof cached !== "undefined" && cached !== null) {
        cached.setIcon(iconURL);
    }
};

/**
 * @private
 * @param {Object} position
 * @param {String} shape
 * @param {String} color
 * @param {Numeric} iconSize
 * @param {String} iconURL
 * @param {String} label
 * @param {Object} settings
 * @returns {google.maps.Marker}
 */
MapView.prototype._makeMarker = function(position, shape, color, iconSize, iconURL, label, settings) {
    var key, cached, marker, gmarker;

    key = Marker._makeMarkerKey(shape, color, iconSize, iconURL, label);

    cached = this._markerCache[key];

    // The settings comparison is of dubious use; ideally the settings would
    // be an actual type and have a comparison method instead of assuming all
    // settings refer to the same location in memory.  Also, it's a bit unclear
    // under what circumstances it would ever be different.
    if (typeof cached !== "undefined" && (cached.settings === settings)) {
	    gmarker = MapView.markerToMap(cached, position);
    } else {
        marker = Marker.makeMarker(shape, color, iconSize, iconURL, label, settings, this);
        gmarker = MapView.markerToMap(marker, position);
	    this._markerCache[key] = gmarker;
    }
    return gmarker;
};

    // end define
    return MapView;
});
