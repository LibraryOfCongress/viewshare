define([
    "./graphics",
    "./window-manager"
], function(Graphics, WindowManager) {
/**
 * Creates a nice, rounded bubble popup with the given page coordinates and
 * content dimensions.  The bubble will point to the location on the page
 * as described by pageX and pageY.  All measurements should be given in
 * pixels.
 *
 * @param {Number} pageX the x coordinate of the point to point to
 * @param {Number} pageY the y coordinate of the point to point to
 * @param {Number} contentWidth the width of the content box in the bubble
 * @param {Number} contentHeight the height of the content box in the bubble
 * @param {String} orientation a string ("top", "bottom", "left", or "right")
 *   that describes the orientation of the arrow on the bubble
 * @return {Element} a DOM element for the newly created bubble
 */
Graphics.createBubbleForPoint = function(pageX, pageY, contentWidth, contentHeight, orientation) {
    contentWidth = parseInt(contentWidth, 10); // harden against bad input bugs
    contentHeight = parseInt(contentHeight, 10); // getting numbers-as-strings
    
    var bubbleConfig = Graphics.bubbleConfig;
    var pngTransparencyClassSuffix = 
        Graphics.pngIsTranslucent ? "pngTranslucent" : "pngNotTranslucent";
    
    var bubbleWidth = contentWidth + 2 * bubbleConfig.borderGraphicSize;
    var bubbleHeight = contentHeight + 2 * bubbleConfig.borderGraphicSize;
    
    var generatePngSensitiveClass = function(className) {
        return className + " " + className + "-" + pngTransparencyClassSuffix;
    };
    
    /*
     *  Render container divs
     */
    var div = document.createElement("div");
    div.className = generatePngSensitiveClass(bubbleConfig.containerCSSClass);
    div.style.width = contentWidth + "px";
    div.style.height = contentHeight + "px";
    
    var divInnerContainer = document.createElement("div");
    divInnerContainer.className = generatePngSensitiveClass(bubbleConfig.innerContainerCSSClass);
    div.appendChild(divInnerContainer);
    
    /*
     *  Create layer for bubble
     */
    var close = function() { 
        if (!bubble._closed) {
            document.body.removeChild(bubble._div);
            bubble._doc = null;
            bubble._div = null;
            bubble._content = null;
            bubble._closed = true;
        }
    }
    var bubble = { _closed: false };
    var layer = WindowManager.pushLayer(close, true, div);
    bubble._div = div;
    bubble.close = function() { WindowManager.popLayer(layer); }
    
    /*
     *  Render border graphics
     */
    var createBorder = function(classNameSuffix) {
        var divBorderGraphic = document.createElement("div");
        divBorderGraphic.className = generatePngSensitiveClass(bubbleConfig.borderGraphicCSSClassPrefix + classNameSuffix);
        divInnerContainer.appendChild(divBorderGraphic);
    };
    createBorder("top-left");
    createBorder("top-right");
    createBorder("bottom-left");
    createBorder("bottom-right");
    createBorder("left");
    createBorder("right");
    createBorder("top");
    createBorder("bottom");
    
    /*
     *  Render content
     */
    var divContentContainer = document.createElement("div");
    divContentContainer.className = generatePngSensitiveClass(bubbleConfig.contentContainerCSSClass);
    divInnerContainer.appendChild(divContentContainer);
    bubble.content = divContentContainer;
    
    /*
     *  Render close button
     */
    var divClose = document.createElement("div");
    divClose.className = generatePngSensitiveClass(bubbleConfig.closeGraphicCSSClass);
    divInnerContainer.appendChild(divClose);
    WindowManager.registerEventWithObject(divClose, "click", bubble, "close");
    
    (function() {
        var dims = Graphics.getWindowDimensions();
        var docWidth = dims.w;
        var docHeight = dims.h;
        
        var halfArrowGraphicWidth = Math.ceil(bubbleConfig.arrowGraphicWidth / 2);
        
        var createArrow = function(classNameSuffix) {
            var divArrowGraphic = document.createElement("div");
            divArrowGraphic.className = generatePngSensitiveClass(bubbleConfig.arrowGraphicCSSClassPrefix + "point-" + classNameSuffix);
            divInnerContainer.appendChild(divArrowGraphic);
            return divArrowGraphic;
        };
        
        if (pageX - halfArrowGraphicWidth - bubbleConfig.borderGraphicSize - bubbleConfig.extraPadding > 0 &&
            pageX + halfArrowGraphicWidth + bubbleConfig.borderGraphicSize + bubbleConfig.extraPadding < docWidth) {
            
            /*
             *  Bubble can be positioned above or below the target point.
             */
            
            var left = pageX - Math.round(contentWidth / 2);
            left = pageX < (docWidth / 2) ?
                Math.max(left, bubbleConfig.extraPadding + bubbleConfig.borderGraphicSize) : 
                Math.min(left, docWidth - bubbleConfig.extraPadding - bubbleConfig.borderGraphicSize - contentWidth);
                
            if ((orientation && orientation == "top") || 
                (!orientation && 
                    (pageY 
                        - bubbleConfig.arrowGraphicTargetOffset 
                        - contentHeight 
                        - bubbleConfig.borderGraphicSize 
                        - bubbleConfig.extraPadding > 0))) {
                
                /*
                 *  Position bubble above the target point.
                 */
                
                var divArrow = createArrow("down");
                divArrow.style.left = (pageX - halfArrowGraphicWidth - left) + "px";
                
                div.style.left = left + "px";
                div.style.top = (pageY - bubbleConfig.arrowGraphicTargetOffset - contentHeight) + "px";
                
                return;
            } else if ((orientation && orientation == "bottom") || 
                (!orientation && 
                    (pageY 
                        + bubbleConfig.arrowGraphicTargetOffset 
                        + contentHeight 
                        + bubbleConfig.borderGraphicSize 
                        + bubbleConfig.extraPadding < docHeight))) {
                        
                /*
                 *  Position bubble below the target point.
                 */
                
                var divArrow = createArrow("up");
                divArrow.style.left = (pageX - halfArrowGraphicWidth - left) + "px";
                
                div.style.left = left + "px";
                div.style.top = (pageY + bubbleConfig.arrowGraphicTargetOffset) + "px";
                
                return;
            }
        }
        
        var top = pageY - Math.round(contentHeight / 2);
        top = pageY < (docHeight / 2) ?
            Math.max(top, bubbleConfig.extraPadding + bubbleConfig.borderGraphicSize) : 
            Math.min(top, docHeight - bubbleConfig.extraPadding - bubbleConfig.borderGraphicSize - contentHeight);
            
        if ((orientation && orientation == "left") || 
            (!orientation && 
                (pageX 
                    - bubbleConfig.arrowGraphicTargetOffset 
                    - contentWidth
                    - bubbleConfig.borderGraphicSize 
                    - bubbleConfig.extraPadding > 0))) {
            
            /*
             *  Position bubble left of the target point.
             */
            
            var divArrow = createArrow("right");
            divArrow.style.top = (pageY - halfArrowGraphicWidth - top) + "px";
            
            div.style.top = top + "px";
            div.style.left = (pageX - bubbleConfig.arrowGraphicTargetOffset - contentWidth) + "px";
        } else {
            
            /*
             *  Position bubble right of the target point, as the last resort.
             */
            
            var divArrow = createArrow("left");
            divArrow.style.top = (pageY - halfArrowGraphicWidth - top) + "px";
            
            div.style.top = top + "px";
            div.style.left = (pageX + bubbleConfig.arrowGraphicTargetOffset) + "px";
        }
    })();
    
    document.body.appendChild(div);
    
    return bubble;
};

/**
 * Creates a nice, rounded bubble popup with the given content in a div,
 * page coordinates and a suggested width. The bubble will point to the 
 * location on the page as described by pageX and pageY.  All measurements 
 * should be given in pixels.
 *
 * @param {Element} the content div
 * @param {Number} pageX the x coordinate of the point to point to
 * @param {Number} pageY the y coordinate of the point to point to
 * @param {Number} contentWidth a suggested width of the content
 * @param {String} orientation a string ("top", "bottom", "left", or "right")
 *   that describes the orientation of the arrow on the bubble
 * @param {Number} maxHeight. Add a scrollbar div if bubble would be too tall.
 *   Default of 0 or null means no maximum
 */
Graphics.createBubbleForContentAndPoint = function(
       div, pageX, pageY, contentWidth, orientation, maxHeight) {
    if (typeof contentWidth != "number") {
        contentWidth = 300;
    }
    if (typeof maxHeight != "number") {
        maxHeight = 0;
    }

    div.style.position = "absolute";
    div.style.left = "-5000px";
    div.style.top = "0px";
    div.style.width = contentWidth + "px";
    document.body.appendChild(div);
    
    window.setTimeout(function() {
        var width = div.scrollWidth + 10;
        var height = div.scrollHeight + 10;
        var scrollDivW = 0; // width of the possible inner container when we want vertical scrolling
        if (maxHeight > 0 && height > maxHeight) {
          height = maxHeight;
          scrollDivW = width - 25;
        }  
       
        var bubble = Graphics.createBubbleForPoint(pageX, pageY, width, height, orientation);
        
        document.body.removeChild(div);
        div.style.position = "static";
        div.style.left = "";
        div.style.top = "";
        
        // create a scroll div if needed
        if (scrollDivW > 0) {
          var scrollDiv = document.createElement("div");
          div.style.width = "";
          scrollDiv.style.width = scrollDivW + "px";
          scrollDiv.appendChild(div);
          bubble.content.appendChild(scrollDiv);
        } else {
          div.style.width = width + "px";
          bubble.content.appendChild(div);
        }
    }, 200);
};

    return Graphics;
});
