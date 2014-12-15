/**
 * @fileOverview Code values along a color gradient.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../exhibit-core",
    "../../util/localizer",
    "../../util/debug",
    "../../util/settings",
    "../../util/coders",
    "../ui-context",
    "./coder"
], function($, Exhibit, _, Debug, SettingsUtilities, Coders, UIContext, Coder) {
/**
 * @constructor
 * @class
 * @param {Element|jQuery} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
var ColorGradientCoder = function(containerElmt, uiContext) {
    $.extend(this, new Coder(
        "colorgradient",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(ColorGradientCoder._settingSpecs);
    
    this._gradientPoints = [];
    this._mixedCase = { 
        "label": _("%coders.mixedCaseLabel"),
        "color": Coders.mixedCaseColor
    };
    this._missingCase = { 
        "label": _("%coders.missingCaseLabel"),
        "color": Coders.missingCaseColor 
    };
    this._othersCase = { 
        "label": _("%coders.othersCaseLabel"),
        "color": Coders.othersCaseColor 
    };

    this.register();
};

/**
 * @constant
 */
ColorGradientCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorGradientCoder}
 */
ColorGradientCoder.create = function(configuration, uiContext) {
    var div, coder;
    div = $("<div>")
        .hide()
        .appendTo("body");
    coder = new ColorGradientCoder(
        div,
        UIContext.create(configuration, uiContext)
    );
    
    ColorGradientCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorGradientCoder}
 */
ColorGradientCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder, gradientPoints, i, point, value, colorIndex, red, green, blue;

    $(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new ColorGradientCoder(
        configElmt,
        UIContext.create(configuration, uiContext)
    );
    
    SettingsUtilities.collectSettingsFromDOM(
        configElmt,
        coder.getSettingSpecs(),
        coder._settings
    );
    
    try {
		gradientPoints = Exhibit.getAttribute(configElmt, "gradientPoints", ";");
		for (i = 0; i < gradientPoints.length; i++) {
			point = gradientPoints[i];
			value = parseFloat(point);
			colorIndex = point.indexOf("#") + 1;
			red = parseInt(point.slice(colorIndex, colorIndex + 2), 16);
			green = parseInt(point.slice(colorIndex + 2, colorIndex + 4), 16);
			blue = parseInt(point.slice(colorIndex + 4), 16);
			coder._gradientPoints.push({ value: value, red: red, green: green, blue: blue });
		}
		
        $(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                $(this).text().trim(),
                Exhibit.getAttribute(this, "color")
            );
        });
    } catch (e) {
        Debug.exception(e, _("%coders.error.configuration", "ColorGradientCoder"));
    }
    
    ColorGradientCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.ColorGradientCoder} coder
 * @param {Object} configuration
 */
ColorGradientCoder._configure = function(coder, configuration) {
    var entries, i;
    SettingsUtilities.collectSettings(
        configuration,
        coder.getSettingSpecs(),
        coder._settings
    );
    
    if (typeof configuration.entries !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].color);
        }
    }
};

/**
 *
 */
ColorGradientCoder.prototype.dispose = function() {
    this._gradientPoints = null;
    this._dispose();
};

/**
 * @param {String} kase
 * @param {String} key
 * @param {String} color
 */
ColorGradientCoder.prototype._addEntry = function(kase, key, color) {
    var entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.color = color;
	}
};

    /**
     * Given the final set of keys, return the key (used for translating to
     * color).
     * @param {Exhibit.Set} keys
     * @returns {Object|String} May be either the key or an object with
     *     property "flag", which is one of "missing", "others", or "mixed".
     */
    ColorGradientCoder.prototype.chooseKey = function(keys) {
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
     * translate to the appropriate color.
     * @param {String} key
     * @param {Object} flags
     * @param {Boolean} flags.missing
     * @param {Boolean} flags.others
     * @param {Boolean} flags.mixed
     */
    ColorGradientCoder.prototype.translateFinal = function(key, flags) {
        if (flags.others) {
            return this.getOthersColor();
        } else if (flags.missing) {
            return this.getMissingColor();
        } else if (flags.mixed) {
            return this.getMixedColor();
        } else {
            return this.translate(key);
        }
    };

/**
 * @param {String} key
 * @param {Object} flags
 * @returns {String}
 */
ColorGradientCoder.prototype.translate = function(key, flags) {
    var gradientPoints, getColor, rgbToHex;
	gradientPoints = this._gradientPoints;
	getColor = function(key) {
        var j, fraction, newRed, newGreen, newBlue;
		if (key.constructor !== Number) {
			key = parseFloat(key);
		}
		for (j = 0; j < gradientPoints.length; j++) {
			if (key === gradientPoints[j].value) {
				return rgbToHex(gradientPoints[j].red, gradientPoints[j].green, gradientPoints[j].blue);
			} else if (gradientPoints[j+1] !== null) {
				if (key < gradientPoints[j+1].value) {
					fraction = (key - gradientPoints[j].value)/(gradientPoints[j+1].value - gradientPoints[j].value);
					newRed = Math.floor(gradientPoints[j].red + fraction*(gradientPoints[j+1].red - gradientPoints[j].red));
					newGreen = Math.floor(gradientPoints[j].green + fraction*(gradientPoints[j+1].green - gradientPoints[j].green));
					newBlue = Math.floor(gradientPoints[j].blue + fraction*(gradientPoints[j+1].blue - gradientPoints[j].blue));
					return rgbToHex(newRed, newGreen, newBlue);
				}
			}
		}
	};

	rgbToHex = function(r, g, b) {
        var decToHex;
		decToHex = function(n) {
			if (n === 0) {
                return "00";
            }
			else {
                return n.toString(16);
            }
		};
		return "#" + decToHex(r) + decToHex(g) + decToHex(b);
	};
	
    if (key >= gradientPoints[0].value && key <= gradientPoints[gradientPoints.length-1].value) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.keys.add(key);
        }
        return getColor(key);
    } else if (typeof key === "undefined" || key === null) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.color;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.others = true;
        }
        return this._othersCase.color;
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @returns {String}
 */
ColorGradientCoder.prototype.translateSet = function(keys, flags) {
    var color, self;
    color = null;
    self = this;
    keys.visit(function(key) {
        var color2 = self.translate(key, flags);
        if (color === null) {
            color = color2;
        } else if (color !== color2) {
            if (typeof flags !== "undefined" && flags !==  null) {
                flags.mixed = true;
            }
            color = self._mixedCase.color;
            return true;
        }
        return false;
    });
    
    if (color !== null) {
        return color;
    } else {
        if (typeof flags !== "undefined" && flags !==  null) {
            flags.missing = true;
        }
        return this._missingCase.color;
    }
};

/**
 * @returns {String}
 */
ColorGradientCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {String}
 */
ColorGradientCoder.prototype.getOthersColor = function() {
    return this._othersCase.color;
};

/**
 * @returns {String}
 */
ColorGradientCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {String}
 */
ColorGradientCoder.prototype.getMissingColor = function() {
    return this._missingCase.color;
};

/**
 * @returns {String}
 */
ColorGradientCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {String}
 */
ColorGradientCoder.prototype.getMixedColor = function() {
    return this._mixedCase.color;
};

    // end define
    return ColorGradientCoder;
});
