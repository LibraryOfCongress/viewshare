/**
 * @fileOverview Graphics utility functions and constants
 * @name SimileAjax.Graphics
 */

define([
    "./simile-ajax-base",
    "./platform"
], function(SimileAjax, Platform) {
    var Graphics = {
        "pngIsTranslucent": undefined,
        "createTranslucentImage": undefined,
        "createTranslucentImageHTML": undefined
    };

/*==================================================
 *  Opacity, translucency
 *==================================================
 */
Graphics._createTranslucentImage1 = function(url, verticalAlign) {
    var elmt = document.createElement("img");
    elmt.setAttribute("src", url);
    if (verticalAlign != null) {
        elmt.style.verticalAlign = verticalAlign;
    }
    return elmt;
};
Graphics._createTranslucentImage2 = function(url, verticalAlign) {
    var elmt = document.createElement("img");
    elmt.style.width = "1px";  // just so that IE will calculate the size property
    elmt.style.height = "1px";
    elmt.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url +"', sizingMethod='image')";
    elmt.style.verticalAlign = (verticalAlign != null) ? verticalAlign : "middle";
    return elmt;
};

Graphics._createTranslucentImageHTML1 = function(url, verticalAlign) {
    return "<img src=\"" + url + "\"" +
        (verticalAlign != null ? " style=\"vertical-align: " + verticalAlign + ";\"" : "") +
        " />";
};
Graphics._createTranslucentImageHTML2 = function(url, verticalAlign) {
    var style = 
        "width: 1px; height: 1px; " +
        "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url +"', sizingMethod='image');" +
        (verticalAlign != null ? " vertical-align: " + verticalAlign + ";" : "");
        
    return "<img src='" + url + "' style=\"" + style + "\" />";
};

/**
 * Consolidate graphics constant setting into a function dependent on
 * SimileAjax loading.
 * @param {Object} g Object to modify functions for.
 */
Graphics.initialize = function(g) {
    /**
     * A boolean value indicating whether PNG translucency is supported on the
     * user's browser or not.
     *
     * @type Boolean
     */
    g.pngIsTranslucent = (!Platform.browser.isIE) || (Platform.browser.majorVersion > 6);
    if (!g.pngIsTranslucent) {
        includeCssFile(document, SimileAjax.urlPrefix + "styles/graphics-ie6.css");
    }

    /**
     * Creates a DOM element for an <code>img</code> tag using the URL given.
     * This is a convenience method that automatically includes the necessary
     * CSS to allow for translucency, even on IE.
     * 
     * @function
     * @param {String} url the URL to the image
     * @param {String} verticalAlign the CSS value for the image's
     *     vertical-align
     * @return {Element} a DOM element containing the <code>img</code> tag
     */
    g.createTranslucentImage = g.pngIsTranslucent ?
        g._createTranslucentImage1 :
        g._createTranslucentImage2;
    
    /**
     * Creates an HTML string for an <code>img</code> tag using the URL given.
     * This is a convenience method that automatically includes the necessary
     * CSS to allow for translucency, even on IE.
     * 
     * @function
     * @param {String} url the URL to the image
     * @param {String} verticalAlign the CSS value for the image's
     *     vertical-align
     * @return {String} a string containing the <code>img</code> tag
     */
    g.createTranslucentImageHTML = g.pngIsTranslucent ?
        g._createTranslucentImageHTML1 :
        g._createTranslucentImageHTML2;

    return g;
};

/**
 * Sets the opacity on the given DOM element.
 *
 * @param {Element} elmt the DOM element to set the opacity on
 * @param {Number} opacity an integer from 0 to 100 specifying the opacity
 */
Graphics.setOpacity = function(elmt, opacity) {
    if (Platform.browser.isIE) {
        elmt.style.filter = "progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity=" + opacity + ")";
    } else {
        var o = (opacity / 100).toString();
        elmt.style.opacity = o;
        elmt.style.MozOpacity = o;
    }
};

/*==================================================
 *  Bubble
 *==================================================
 */

Graphics.bubbleConfig = {
    containerCSSClass:              "simileAjax-bubble-container",
    innerContainerCSSClass:         "simileAjax-bubble-innerContainer",
    contentContainerCSSClass:       "simileAjax-bubble-contentContainer",
    
    borderGraphicSize:              50,
    borderGraphicCSSClassPrefix:    "simileAjax-bubble-border-",
    
    arrowGraphicTargetOffset:       33,  // from tip of arrow to the side of the graphic that touches the content of the bubble
    arrowGraphicLength:             100, // dimension of arrow graphic along the direction that the arrow points
    arrowGraphicWidth:              49,  // dimension of arrow graphic perpendicular to the direction that the arrow points
    arrowGraphicCSSClassPrefix:     "simileAjax-bubble-arrow-",
    
    closeGraphicCSSClass:           "simileAjax-bubble-close",
    
    extraPadding:                   20
};

Graphics.getWindowDimensions = function() {
    if (typeof window.innerHeight == 'number') {
        return { w:window.innerWidth, h:window.innerHeight }; // Non-IE
    } else if (document.documentElement && document.documentElement.clientHeight) {
        return { // IE6+, in "standards compliant mode"
            w:document.documentElement.clientWidth,
            h:document.documentElement.clientHeight
        };
    } else if (document.body && document.body.clientHeight) {
        return { // IE 4 compatible
            w:document.body.clientWidth,
            h:document.body.clientHeight
        };
    }
};


/**
 * Creates a floating, rounded message bubble in the center of the window for
 * displaying modal information, e.g. "Loading..."
 *
 * @param {Document} doc the root document for the page to render on
 * @param {Object} an object with two properties, contentDiv and containerDiv,
 *   consisting of the newly created DOM elements
 */
Graphics.createMessageBubble = function(doc) {
    var containerDiv = doc.createElement("div");
    var prefix = "simileAjax-messageBubble";
    if (Graphics.pngIsTranslucent) {
        var topDiv = doc.createElement("div");
        topDiv.className = prefix + "-top";
        containerDiv.appendChild(topDiv);
        
        var topRightDiv = doc.createElement("div");
        topRightDiv.className = prefix + "-top-right";
        topDiv.appendChild(topRightDiv);
        
        var middleDiv = doc.createElement("div");
        middleDiv.className = prefix + "-middle";
        containerDiv.appendChild(middleDiv);
        
        var middleRightDiv = doc.createElement("div");
        middleRightDiv.className = prefix + "-middle-right";
        middleDiv.appendChild(middleRightDiv);
        
        var contentDiv = doc.createElement("div");
        middleRightDiv.appendChild(contentDiv);
        
        var bottomDiv = doc.createElement("div");
        bottomDiv.className = prefix + "-bottom";
        containerDiv.appendChild(bottomDiv);
        
        var bottomRightDiv = doc.createElement("div");
        bottomRightDiv.className = prefix + "-bottom-right";
        bottomDiv.appendChild(bottomRightDiv);
    } else {
        containerDiv.style.border = "2px solid #7777AA";
        containerDiv.style.padding = "20px";
        containerDiv.style.background = "white";
        Graphics.setOpacity(containerDiv, 90);
        
        var contentDiv = doc.createElement("div");
        containerDiv.appendChild(contentDiv);
    }
    
    return {
        containerDiv:   containerDiv,
        contentDiv:     contentDiv
    };
};

/*==================================================
 *  Animation
 *==================================================
 */

/**
 * Creates an animation for a function, and an interval of values.  The word
 * "animation" here is used in the sense of repeatedly calling a function with
 * a current value from within an interval, and a delta value.
 *
 * @param {Function} f a function to be called every 50 milliseconds throughout
 *   the animation duration, of the form f(current, delta), where current is
 *   the current value within the range and delta is the current change.
 * @param {Number} from a starting value
 * @param {Number} to an ending value
 * @param {Number} duration the duration of the animation in milliseconds
 * @param {Function} [cont] an optional function that is called at the end of
 *   the animation, i.e. a continuation.
 * @return {Graphics._Animation} a new animation object
 */
Graphics.createAnimation = function(f, from, to, duration, cont) {
    return new Graphics._Animation(f, from, to, duration, cont);
};

Graphics._Animation = function(f, from, to, duration, cont) {
    this.f = f;
    this.cont = (typeof cont == "function") ? cont : function() {};
    
    this.from = from;
    this.to = to;
    this.current = from;
    
    this.duration = duration;
    this.start = new Date().getTime();
    this.timePassed = 0;
};

/**
 * Runs this animation.
 */
Graphics._Animation.prototype.run = function() {
    var a = this;
    window.setTimeout(function() { a.step(); }, 50);
};

/**
 * Increments this animation by one step, and then continues the animation with
 * <code>run()</code>.
 */
Graphics._Animation.prototype.step = function() {
    this.timePassed += 50;
    
    var timePassedFraction = this.timePassed / this.duration;
    var parameterFraction = -Math.cos(timePassedFraction * Math.PI) / 2 + 0.5;
    var current = parameterFraction * (this.to - this.from) + this.from;
    
    try {
        this.f(current, current - this.current);
    } catch (e) {
    }
    this.current = current;
    
    if (this.timePassed < this.duration) {
        this.run();
    } else {
        this.f(this.to, 0);
        this["cont"]();
    }
};

/*==================================================
 *  CopyPasteButton
 *
 *  Adapted from http://spaces.live.com/editorial/rayozzie/demo/liveclip/liveclipsample/techPreview.html.
 *==================================================
 */

/**
 * Creates a button and textarea for displaying structured data and copying it
 * to the clipboard.  The data is dynamically generated by the given 
 * createDataFunction parameter.
 *
 * @param {String} image an image URL to use as the background for the 
 *   generated box
 * @param {Number} width the width in pixels of the generated box
 * @param {Number} height the height in pixels of the generated box
 * @param {Function} createDataFunction a function that is called with no
 *   arguments to generate the structured data
 * @return a new DOM element
 */
Graphics.createStructuredDataCopyButton = function(image, width, height, createDataFunction) {
    var div = document.createElement("div");
    div.style.position = "relative";
    div.style.display = "inline";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.overflow = "hidden";
    div.style.margin = "2px";
    
    if (Graphics.pngIsTranslucent) {
        div.style.background = "url(" + image + ") no-repeat";
    } else {
        div.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + image +"', sizingMethod='image')";
    }
    
    var style;
    if (Platform.browser.isIE) {
        style = "filter:alpha(opacity=0)";
    } else {
        style = "opacity: 0";
    }
    div.innerHTML = "<textarea rows='1' autocomplete='off' value='none' style='" + style + "' />";
    
    var textarea = div.firstChild;
    textarea.style.width = width + "px";
    textarea.style.height = height + "px";
    textarea.onmousedown = function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        if (evt.button == 2) {
            textarea.value = createDataFunction();
            textarea.select();
        }
    };
    
    return div;
};

/*==================================================
 *  getWidthHeight
 *==================================================
 */
Graphics.getWidthHeight = function(el) {
    // RETURNS hash {width:  w, height: h} in pixels
    
    var w, h;
    // offsetWidth rounds on FF, so doesn't work for us.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=458617
    if (el.getBoundingClientRect == null) {
    	// use offsetWidth
      w = el.offsetWidth;
      h = el.offsetHeight;
    } else {
    	// use getBoundingClientRect
      var rect = el.getBoundingClientRect();
      w = Math.ceil(rect.right - rect.left);
    	h = Math.ceil(rect.bottom - rect.top);
    }
    return {
        width:  w,
        height: h
    };
};
 

/*==================================================
 *  FontRenderingContext
 *==================================================
 */
Graphics.getFontRenderingContext = function(elmt, width) {
    return new Graphics._FontRenderingContext(elmt, width);
};

Graphics._FontRenderingContext = function(elmt, width) {
    this._elmt = elmt;
    this._elmt.style.visibility = "hidden";
    if (typeof width == "string") {
        this._elmt.style.width = width;
    } else if (typeof width == "number") {
        this._elmt.style.width = width + "px";
    }
};

Graphics._FontRenderingContext.prototype.dispose = function() {
    this._elmt = null;
};

Graphics._FontRenderingContext.prototype.update = function() {
    this._elmt.innerHTML = "A";
    this._lineHeight = this._elmt.offsetHeight;
};

Graphics._FontRenderingContext.prototype.computeSize = function(text, className) {
    // className arg is optional
    var el = this._elmt;
    el.innerHTML = text;
    el.className = className === undefined ? '' : className;
    var wh = Graphics.getWidthHeight(el);
    el.className = ''; // reset for the next guy
    
    return wh;
};

Graphics._FontRenderingContext.prototype.getLineHeight = function() {
    return this._lineHeight;
};

    return Graphics;
});
