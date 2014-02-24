/**
 * @fileOverview 
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

define([
    "lib/jquery",
    "../../exhibit-core",
    "lib/jquery.simile.bubble"
], function($, Exhibit) {
/**
 * @constructor
 * @class
 * @param {Element} elmt
 * @param {Exhibit._Impl} exhibit
 */ 
var Logo = function(elmt, exhibit) {
    this._exhibit = exhibit;
    this._elmt = elmt;
    this._color = "Silver";
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit._Impl} exhibit
 * @returns {Exhibit.Logo}
 */
Logo.create = function(configuration, elmt, exhibit) {
    var logo;

    logo = new Logo(elmt, exhibit);
    
    if (typeof configuration.color !== "undefined") {
        logo._color = configuration.color;
    }
    
    logo._initializeUI();
    return logo;
};

/**
 * @static
 * @param {Element} elmt
 * @param {Exhibit._Impl} exhibit
 * @returns {Exhibit.Logo}
 */
Logo.createFromDOM = function(elmt, exhibit) {
    var logo, color;
    logo = new Logo(elmt, exhibit);
    
    color = Exhibit.getAttribute(elmt, "color");
    if (color !== null && color.length > 0) {
        logo._color = color;
    }
    
    logo._initializeUI();
    return logo;
};

/**
 *
 */
Logo.prototype.dispose = function() {
    this._elmt = null;
    this._exhibit = null;
};

/**
 * @private
 */
Logo.prototype._initializeUI = function() {
    var logoURL, img, id, a;

    logoURL = Exhibit.urlPrefix + "images/logos/exhibit-small-" + this._color + ".png";
    img = $.simileBubble("createTranslucentImage", logoURL);
    id = "exhibit-logo-image";
    if ($('#' + id).length === 0) {
        $(img).attr("id", id);
    }
    a = $("<a>")
        .attr("href", Exhibit.exhibitLink)
        .attr("title", Exhibit.exhibitLink)
        .attr("targe", "_blank")
        .append(img);
    
    $(this._elmt).append(a);
};

    // end define
    return Logo;
});
