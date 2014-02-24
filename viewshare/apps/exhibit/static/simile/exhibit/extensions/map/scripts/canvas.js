define(["lib/jquery"], function($) {
    var Canvas = {};

    /**
     * @param {Element} icon A canvas element
     * @param {Object} settings
     * @returns {Element} A canvas element
     */
    Canvas.makeShadow = function(icon, settings) {
        var width, height, shadowWidth, canvas, context;
        width = $(icon).width();
        height = $(icon).height();
        shadowWidth = width + height;
        canvas = $("<canvas>")
            .css("width", shadowWidth)
            .css("height", height)
            .attr("width", shadowWidth)
            .attr("height", height);
        
        context = $(canvas).get(0).getContext("2d");
    
        context.scale(1, 1 / 2);
        context.translate(height / 2, height);
        context.transform(1, 0, -1 / 2, 1, 0, 0); // shear the shadow diagonally
        context.fillRect(0, 0, width, height);
        context.globalAlpha = settings.shapeAlpha;
        context.globalCompositeOperation = "destination-in";
        context.drawImage(icon, 0, 0);
        return canvas;
    };

    /**
     * @param {Numeric} width
     * @param {Numeric} height
     * @param {String} color
     * @param {String} label
     * @param {Image} iconImg
     * @param {Numeric} iconSize
     * @param {Object} settings
     * @returns {Object}
     */
    Canvas.makeIcon = function(width, height, color, label, iconImg, iconSize, settings) {
        var pin, pinWidth, pinHeight, lineWidth, lineColor, alpha, bodyWidth, bodyHeight, markerHeight, radius, canvas, context, meetAngle, topY, botY, leftX, rightX, scale, heightScale, widthScale, shadow;
        
        pin = settings.pin;
        
        if (iconSize > 0) {
            width = iconSize;
            height = iconSize;
            pin = false;
        }
        
        pinWidth = settings.pinWidth;
        pinHeight = settings.pinHeight;
        lineWidth = 1; //maybe settings.borderWidth but may clash with polyline width usage
        lineColor = settings.borderColor || "black";
        alpha = settings.shapeAlpha;
        bodyWidth = width - lineWidth; //stroke is half outside circle on both sides
        bodyHeight = height - lineWidth;
        markerHeight = height + (pin ? pinHeight : 0);
        
        canvas = $("<canvas>")
            .css("width", width)
            .css("height", markerHeight)
            .attr("width", width)
            .attr("height", markerHeight);
        context = $(canvas).get(0).getContext("2d");
        context.clearRect(0, 0, width, markerHeight);
        
        context.beginPath();
        if (settings && (settings.shape === "circle")) {
            radius = bodyWidth / 2.0;
            if (!pin) {
                context.arc(width / 2.0, height / 2.0, radius, 0, 2 * Math.PI);
            } else {
                meetAngle = Math.atan2(pinWidth / 2.0, bodyHeight / 2.0);
                context.arc(width / 2.0, height / 2.0, radius, Math.PI / 2 + meetAngle, Math.PI / 2 - meetAngle);
                context.lineTo(width / 2.0, height + pinHeight - lineWidth / 2.0); // pin base
            }
        } else { // "square"
            radius = bodyWidth / 4.0;
            topY = leftX = lineWidth / 2.0;
            botY = height - lineWidth / 2.0;
            rightX = width - lineWidth / 2.0;
            
            context.moveTo(rightX - radius, topY);
            context.arcTo(rightX, topY, rightX, topY + radius, radius);
            context.lineTo(rightX, botY - radius);
            context.arcTo(rightX, botY, rightX - radius, botY, radius);
            if (pin) { 
                context.lineTo(width / 2.0 + pinWidth / 2.0, botY);
                context.lineTo(width / 2.0, height + pinHeight - lineWidth / 2.0);
                context.lineTo(width / 2.0 - pinWidth / 2.0, botY);
            }
            context.lineTo(leftX + radius, botY);
            context.arcTo(leftX, botY, leftX, botY - radius, radius);
            context.lineTo(leftX, topY + radius);
            context.arcTo(leftX, topY, leftX + radius, topY, radius);
        }
        context.closePath();
        context.fillStyle = color;
        context.globalAlpha = alpha;
        context.fill();
        
        if (iconImg !== null) {
            context.save();
            context.clip();
            context.globalAlpha = 1;
            context.translate(width / 2 + settings.iconOffsetX, 
                              height / 2 + settings.iconOffsetY);
            heightScale = parseFloat(height) / iconImg.naturalHeight;
            widthScale = parseFloat(width) / iconImg.naturalWidth;
            switch(settings.iconFit) {
            case "width":
                scale = widthScale;
                break;
            case "height":
                scale = heightScale;
                break;
            case "both":
            case "larger":
                scale = Math.min(heightScale, widthScale);
                break;
            case "smaller":
                scale = Math.max(heightScale, widthScale);
                break;
            }    
            context.scale(scale, scale);
            context.scale(settings.iconScale, settings.iconScale);
            context.drawImage(iconImg,
                              -iconImg.naturalWidth / 2.0,
                              -iconImg.naturalHeight / 2.0);
            context.restore();
        }
        
        context.strokeStyle = lineColor;
        context.lineWidth = lineWidth;
        context.stroke();
        
        // now we have what we need to make its shadow
        shadow = Canvas.makeShadow(canvas.get(0), settings);
        
        // Now decorate the marker's inside
        if (typeof label !== "undefined" && label !== null && label.length > 0) {
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.globalAlpha = 1;
            context.font = settings.markerFontFamily;
            context.fillStyle = settings.markerFontColor;
            context.fillText(label, width / 2.0, height / 2.0, width / 1.4);
        }
        
        return {
            "iconURL": canvas.get(0).toDataURL(),
            "shadowURL": shadow.get(0).toDataURL()
        };
    };

    // end define
    return Canvas;
});
