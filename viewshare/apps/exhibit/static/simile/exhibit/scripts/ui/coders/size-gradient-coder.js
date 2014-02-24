/**
 * @fileOverview Code values along a size gradient.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../exhibit-core",
    "../../util/localizer",
    "../../util/debug",
    "../../util/settings",
    "../ui-context",
    "./coder"
], function($, Exhibit, _, Debug, SettingsUtilities, UIContext, Coder) {
/**
 * @class
 * @constructor
 * @param {Element|jQuery} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var SizeGradientCoder = function(containerElmt, uiContext) {
    $.extend(this, new Coder(
        "sizegradient",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(SizeGradientCoder._settingSpecs);

    this._log = { 
        func: function(size) { return Math.ceil(Math.log(size)); },
        invFunc: function(size) { return Math.ceil(Math.exp(size)); }
    };
    this._linear = { 
        func: function(size) { return Math.ceil(size); },
        invFunc: function(size) { return Math.ceil(size); }
    };
    this._quad = {
        func: function(size) { return Math.ceil(Math.pow((size / 100), 2)); },
        invFunc: function(size) { return Math.sqrt(size) * 100; }
    };
    this._exp = { 
        func: function(size) { return Math.ceil(Math.exp(size)); },
        invFunc: function(size) { return Math.ceil(Math.log(size)); }
    };
    this._markerScale = this._quad; // default marker scale type
    this._valueScale = this._linear; // value scaling functionality needs to be added
    
    this._gradientPoints = [];
    this._mixedCase = {
        "label": _("%coders.mixedCaseLabel"),
        "size": 20
    };
    this._missingCase = {
        "label": _("%coders.missingCaseLabel"),
        "size": 20
    };
    this._othersCase = {
        "label": _("%coders.othersCaseLabel"),
        "size": 20
    };
    this.register();
};

/**
 * @constant
 */
SizeGradientCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @param {Exhibit.SizeGradientCoder}
 */
SizeGradientCoder.create = function(configuration, uiContext) {
    var coder, div;
    div = $("<div>")
        .hide()
        .appendTo("body");
    coder = new SizeGradientCoder(
        div,
        UIContext.create(configuration, uiContext)
    );
    
    SizeGradientCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Exhibit.SizeGradientCoder}
 */
SizeGradientCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder, markerScale, gradientPoints, i, point, value, size;

    $(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new SizeGradientCoder(configElmt, UIContext.create(configuration, uiContext));
    
    SettingsUtilities.collectSettingsFromDOM(
        configElmt,
        coder.getSettingSpecs(),
        coder._settings);
    
    try {
		markerScale = coder._settings.markerScale; 
		if (markerScale === "log") { coder._markerScale = coder._log; }
		if (markerScale === "linear") { coder._markerScale = coder._linear; }
		if (markerScale === "exp") { coder._markerScale = coder._exp; }
		
		gradientPoints = Exhibit.getAttribute(configElmt, "gradientPoints", ";");
		for (i = 0; i < gradientPoints.length; i++) {
			point = gradientPoints[i].split(',');
			value = parseFloat(point[0]); // add value scaling
			size = coder._markerScale.invFunc(parseFloat(point[1]));
			coder._gradientPoints.push({ value: value, size: size});
		}
		
        $(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                $(this).text().trim(),
                Exhibit.getAttribute(this, "size")
            );
        });
    } catch (e) {
        Debug.exception(e, _("%coders.error.configuration", "SizeGradientCoder"));
    }
    
    SizeGradientCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.SizeGradientCoder} coder
 * @param {Object} configuration
 */
SizeGradientCoder._configure = function(coder, configuration) {
    var entries, i;

    SettingsUtilities.collectSettings(
        configuration,
        coder.getSettingSpecs(),
        coder._settings);
    
    if (typeof configuration.entries !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].size);
        }
    }
};

/**
 *
 */
SizeGradientCoder.prototype.dispose = function() {
    this._gradientPoints = null;
    this._dispose();
};

/**
 * @param {String} kase
 * @param {String} key
 * @param {Number} size
 */
SizeGradientCoder.prototype._addEntry = function(kase, key, size) {
    var entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.size = size;
	}
};

    /**
     * Given the final set of keys, return the key (used for translating to
     * size).
     * @param {Exhibit.Set} keys
     * @returns {Object|String} May be either the key or an object with
     *     property "flag", which is one of "missing", "others", or "mixed".
     */
    SizeGradientCoder.prototype.chooseKey = function(keys) {
        var key, keysArr, gradientPoints;
        gradientPoints = this._gradientPoints;
        if (keys.size === 0) {
            key = { "flag": "missing" };
        }

        keysArr = keys.toArray();
        if (keysArr.length > 1) {
            key = { "flag": "mixed" };
        } else {
            key = keysArr[0];
            if (key < gradientPoints[0].value || key > gradientPoints[gradientPoints.length - 1].value) {
                key = { "flag": "others" };
            }
        }
        return key;
    };

    /**
     * Given a set of flags and keys that were already determined,
     * translate to the appropriate size.
     * @param {String} key
     * @param {Object} flags
     * @param {Boolean} flags.missing
     * @param {Boolean} flags.others
     * @param {Boolean} flags.mixed
     */
    SizeGradientCoder.prototype.translateFinal = function(key, flags) {
        if (flags.others) {
            return this.getOthersSize();
        } else if (flags.missing) {
            return this.getMissingSize();
        } else if (flags.mixed) {
            return this.getMixedSize();
        } else {
            return this.translate(key);
        }
    };

/**
 * @param {String} key
 * @param {Object} flags
 * @returns {Number}
 */
SizeGradientCoder.prototype.translate = function(key, flags) {
    var self, gradientPoints, getSize;
	self = this;
	gradientPoints = this._gradientPoints;
	getSize = function(key) {
        var j, fraction, newSize;
		if (key.constructor !== Number) {
			key = parseFloat(key);
		}
		for (j = 0; j < gradientPoints.length; j++) {
			if (key === gradientPoints[j].value) {
				return self._markerScale.func(gradientPoints[j].size);
			} else if (gradientPoints[j+1] !== null) {
				if (key < gradientPoints[j+1].value) {
					fraction = (key - gradientPoints[j].value)/(gradientPoints[j+1].value - gradientPoints[j].value);
					newSize = Math.floor(gradientPoints[j].size + fraction*(gradientPoints[j+1].size - gradientPoints[j].size));
					return self._markerScale.func(newSize);
				}
			}
		}
	};
	
    if (key >= gradientPoints[0].value && key <= gradientPoints[gradientPoints.length-1].value) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.keys.add(key);
        }
        return getSize(key);
    } else if (typeof key === "undefined" || key === null) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.size;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.others = true;
        }
        return this._othersCase.size;
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @returns {Number}
 */
SizeGradientCoder.prototype.translateSet = function(keys, flags) {
    var size, self;
    size = null;
    self = this;
    keys.visit(function(key) {
        var size2 = self.translate(key, flags);
        if (size === null) {
            size = size2;
        } else if (size !== size2) {
            if (typeof flags !== "undefined" && flags !== null) {
                flags.mixed = true;
            }
            size = self._mixedCase.size;
            return true;
        }
        return false;
    });
    
    if (size !== null) {
        return size;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.size;
    }
};

/**
 * @returns {String}
 */
SizeGradientCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {Number}
 */
SizeGradientCoder.prototype.getOthersSize = function() {
    return this._othersCase.size;
};

/**
 * @returns {String}
 */
SizeGradientCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {Number}
 */
SizeGradientCoder.prototype.getMissingSize = function() {
    return this._missingCase.size;
};

/**
 * @returns {String}
 */
SizeGradientCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {Number}
 */
SizeGradientCoder.prototype.getMixedSize = function() {
    return this._mixedCase.size;
};

    // end define
    return SizeGradientCoder;
});
