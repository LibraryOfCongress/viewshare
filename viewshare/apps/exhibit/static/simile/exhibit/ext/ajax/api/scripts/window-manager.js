/**
 * @fileOverview UI layers and window-wide dragging
 * @name SimileAjax.WindowManager
 */

/**
 *  This is a singleton that keeps track of UI layers (modal and 
 *  modeless) and enables/disables UI elements based on which layers
 *  they belong to. It also provides window-wide dragging 
 *  implementation.
 */ 
define([
    "./dom",
    "./debug",
    "./graphics",
    "./simile-ajax-base"
], function(DOM, Debug, Graphics, SimileAjax) {
var WindowManager = {
    _initialized:       false,
    _listeners:         [],
    
    _draggedElement:                null,
    _draggedElementCallback:        null,
    _dropTargetHighlightElement:    null,
    _lastCoords:                    null,
    _ghostCoords:                   null,
    _draggingMode:                  "",
    _dragging:                      false,
    
    _layers:            []
};

WindowManager.initialize = function() {
    if (WindowManager._initialized) {
        return;
    }
    
    DOM.registerEvent(document.body, "mousedown", WindowManager._onBodyMouseDown);
    DOM.registerEvent(document.body, "mousemove", WindowManager._onBodyMouseMove);
    DOM.registerEvent(document.body, "mouseup",   WindowManager._onBodyMouseUp);
    DOM.registerEvent(document, "keydown",       WindowManager._onBodyKeyDown);
    DOM.registerEvent(document, "keyup",         WindowManager._onBodyKeyUp);
    
    WindowManager._layers.push({index: 0});

    // @@@ There were pieces here to assemble a no-op history listener
    //     and add it to the SimileAjax.History listener stack, but I
    //     suspect it was only here to make sure history initialized
    //     before window manager.  I've simply put calls to init both
    //     in the overall SimileAjax.load() method.  This breaks a
    //     terrible dependency cycle that sat between them.  If I'm
    //     wrong, another solution needs to be found.

    WindowManager._initialized = true;
};

WindowManager.getBaseLayer = function() {
    return WindowManager._layers[0];
};

WindowManager.getHighestLayer = function() {
    return WindowManager._layers[WindowManager._layers.length - 1];
};

WindowManager.registerEventWithObject = function(elmt, eventName, obj, handlerName, layer) {
    WindowManager.registerEvent(
        elmt, 
        eventName, 
        function(elmt2, evt, target) {
            return obj[handlerName].call(obj, elmt2, evt, target);
        },
        layer
    );
};

WindowManager.registerEvent = function(elmt, eventName, handler, layer) {
    if (layer == null) {
        layer = WindowManager.getHighestLayer();
    }
    
    var handler2 = function(elmt, evt, target) {
        if (WindowManager._canProcessEventAtLayer(layer)) {
            WindowManager._popToLayer(layer.index);
            try {
                handler(elmt, evt, target);
            } catch (e) {
                Debug.exception(e);
            }
        }
        DOM.cancelEvent(evt);
        return false;
    }
    
    DOM.registerEvent(elmt, eventName, handler2);
};

WindowManager.pushLayer = function(f, ephemeral, elmt) {
    var layer = { onPop: f, index: WindowManager._layers.length, ephemeral: (ephemeral), elmt: elmt };
    WindowManager._layers.push(layer);
    
    return layer;
};

WindowManager.popLayer = function(layer) {
    for (var i = 1; i < WindowManager._layers.length; i++) {
        if (WindowManager._layers[i] == layer) {
            WindowManager._popToLayer(i - 1);
            break;
        }
    }
};

WindowManager.popAllLayers = function() {
    WindowManager._popToLayer(0);
};

WindowManager.registerForDragging = function(elmt, callback, layer) {
    WindowManager.registerEvent(
        elmt, 
        "mousedown", 
        function(elmt, evt, target) {
            WindowManager._handleMouseDown(elmt, evt, callback);
        }, 
        layer
    );
};

WindowManager._popToLayer = function(level) {
    while (level+1 < WindowManager._layers.length) {
        try {
            var layer = WindowManager._layers.pop();
            if (layer.onPop != null) {
                layer.onPop();
            }
        } catch (e) {
        }
    }
};

WindowManager._canProcessEventAtLayer = function(layer) {
    if (layer.index == (WindowManager._layers.length - 1)) {
        return true;
    }
    for (var i = layer.index + 1; i < WindowManager._layers.length; i++) {
        if (!WindowManager._layers[i].ephemeral) {
            return false;
        }
    }
    return true;
};

WindowManager.cancelPopups = function(evt) {
    var evtCoords = (evt) ? DOM.getEventPageCoordinates(evt) : { x: -1, y: -1 };
    
    var i = WindowManager._layers.length - 1;
    while (i > 0 && WindowManager._layers[i].ephemeral) {
        var layer = WindowManager._layers[i];
        if (layer.elmt != null) { // if event falls within main element of layer then don't cancel
            var elmt = layer.elmt;
            var elmtCoords = DOM.getPageCoordinates(elmt);
            if (evtCoords.x >= elmtCoords.left && evtCoords.x < (elmtCoords.left + elmt.offsetWidth) &&
                evtCoords.y >= elmtCoords.top && evtCoords.y < (elmtCoords.top + elmt.offsetHeight)) {
                break;
            }
        }
        i--;
    }
    WindowManager._popToLayer(i);
};

WindowManager._onBodyMouseDown = function(elmt, evt, target) {
    if (!("eventPhase" in evt) || evt.eventPhase == evt.BUBBLING_PHASE) {
        WindowManager.cancelPopups(evt);
    }
};

WindowManager._handleMouseDown = function(elmt, evt, callback) {
    WindowManager._draggedElement = elmt;
    WindowManager._draggedElementCallback = callback;
    WindowManager._lastCoords = { x: evt.clientX, y: evt.clientY };
        
    DOM.cancelEvent(evt);
    return false;
};

WindowManager._onBodyKeyDown = function(elmt, evt, target) {
    if (WindowManager._dragging) {
        if (evt.keyCode == 27) { // esc
            WindowManager._cancelDragging();
        } else if ((evt.keyCode == 17 || evt.keyCode == 16) && WindowManager._draggingMode != "copy") {
            WindowManager._draggingMode = "copy";
            
            var img = Graphics.createTranslucentImage(SimileAjax.urlPrefix + "images/copy.png");
            img.style.position = "absolute";
            img.style.left = (WindowManager._ghostCoords.left - 16) + "px";
            img.style.top = (WindowManager._ghostCoords.top) + "px";
            document.body.appendChild(img);
            
            WindowManager._draggingModeIndicatorElmt = img;
        }
    }
};

WindowManager._onBodyKeyUp = function(elmt, evt, target) {
    if (WindowManager._dragging) {
        if (evt.keyCode == 17 || evt.keyCode == 16) {
            WindowManager._draggingMode = "";
            if (WindowManager._draggingModeIndicatorElmt != null) {
                document.body.removeChild(WindowManager._draggingModeIndicatorElmt);
                WindowManager._draggingModeIndicatorElmt = null;
            }
        }
    }
};

WindowManager._onBodyMouseMove = function(elmt, evt, target) {
    if (WindowManager._draggedElement != null) {
        var callback = WindowManager._draggedElementCallback;
        
        var lastCoords = WindowManager._lastCoords;
        var diffX = evt.clientX - lastCoords.x;
        var diffY = evt.clientY - lastCoords.y;
        
        if (!WindowManager._dragging) {
            if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                try {
                    if ("onDragStart" in callback) {
                        callback.onDragStart();
                    }
                    
                    if ("ghost" in callback && callback.ghost) {
                        var draggedElmt = WindowManager._draggedElement;
                        
                        WindowManager._ghostCoords = DOM.getPageCoordinates(draggedElmt);
                        WindowManager._ghostCoords.left += diffX;
                        WindowManager._ghostCoords.top += diffY;
                        
                        var ghostElmt = draggedElmt.cloneNode(true);
                        ghostElmt.style.position = "absolute";
                        ghostElmt.style.left = WindowManager._ghostCoords.left + "px";
                        ghostElmt.style.top = WindowManager._ghostCoords.top + "px";
                        ghostElmt.style.zIndex = 1000;
                        Graphics.setOpacity(ghostElmt, 50);
                        
                        document.body.appendChild(ghostElmt);
                        callback._ghostElmt = ghostElmt;
                    }
                    
                    WindowManager._dragging = true;
                    WindowManager._lastCoords = { x: evt.clientX, y: evt.clientY };
                    
                    document.body.focus();
                } catch (e) {
                    Debug.exception("WindowManager: Error handling mouse down", e);
                    WindowManager._cancelDragging();
                }
            }
        } else {
            try {
                WindowManager._lastCoords = { x: evt.clientX, y: evt.clientY };
                
                if ("onDragBy" in callback) {
                    callback.onDragBy(diffX, diffY);
                }
                
                if ("_ghostElmt" in callback) {
                    var ghostElmt = callback._ghostElmt;
                    
                    WindowManager._ghostCoords.left += diffX;
                    WindowManager._ghostCoords.top += diffY;
                    
                    ghostElmt.style.left = WindowManager._ghostCoords.left + "px";
                    ghostElmt.style.top = WindowManager._ghostCoords.top + "px";
                    if (WindowManager._draggingModeIndicatorElmt != null) {
                        var indicatorElmt = WindowManager._draggingModeIndicatorElmt;
                        
                        indicatorElmt.style.left = (WindowManager._ghostCoords.left - 16) + "px";
                        indicatorElmt.style.top = WindowManager._ghostCoords.top + "px";
                    }
                    
                    if ("droppable" in callback && callback.droppable) {
                        var coords = DOM.getEventPageCoordinates(evt);
                        var target = DOM.hittest(
                            coords.x, coords.y, 
                            [   WindowManager._ghostElmt, 
                                WindowManager._dropTargetHighlightElement 
                            ]
                        );
                        target = WindowManager._findDropTarget(target);
                        
                        if (target != WindowManager._potentialDropTarget) {
                            if (WindowManager._dropTargetHighlightElement != null) {
                                document.body.removeChild(WindowManager._dropTargetHighlightElement);
                                
                                WindowManager._dropTargetHighlightElement = null;
                                WindowManager._potentialDropTarget = null;
                            }

                            var droppable = false;
                            if (target != null) {
                                if ((!("canDropOn" in callback) || callback.canDropOn(target)) &&
                                    (!("canDrop" in target) || target.canDrop(WindowManager._draggedElement))) {
                                    
                                    droppable = true;
                                }
                            }
                            
                            if (droppable) {
                                var border = 4;
                                var targetCoords = DOM.getPageCoordinates(target);
                                var highlight = document.createElement("div");
                                highlight.style.border = border + "px solid yellow";
                                highlight.style.backgroundColor = "yellow";
                                highlight.style.position = "absolute";
                                highlight.style.left = targetCoords.left + "px";
                                highlight.style.top = targetCoords.top + "px";
                                highlight.style.width = (target.offsetWidth - border * 2) + "px";
                                highlight.style.height = (target.offsetHeight - border * 2) + "px";
                                Graphics.setOpacity(highlight, 30);
                                document.body.appendChild(highlight);
                                
                                WindowManager._potentialDropTarget = target;
                                WindowManager._dropTargetHighlightElement = highlight;
                            }
                        }
                    }
                }
            } catch (e) {
                Debug.exception("WindowManager: Error handling mouse move", e);
                WindowManager._cancelDragging();
            }
        }
        
        DOM.cancelEvent(evt);
        return false;
    }
};

WindowManager._onBodyMouseUp = function(elmt, evt, target) {
    if (WindowManager._draggedElement != null) {
        try {
            if (WindowManager._dragging) {
                var callback = WindowManager._draggedElementCallback;
                if ("onDragEnd" in callback) {
                    callback.onDragEnd();
                }
                if ("droppable" in callback && callback.droppable) {
                    var dropped = false;
                    
                    var target = WindowManager._potentialDropTarget;
                    if (target != null) {
                        if ((!("canDropOn" in callback) || callback.canDropOn(target)) &&
                            (!("canDrop" in target) || target.canDrop(WindowManager._draggedElement))) {
                            
                            if ("onDropOn" in callback) {
                                callback.onDropOn(target);
                            }
                            target.ondrop(WindowManager._draggedElement, WindowManager._draggingMode);
                            
                            dropped = true;
                        }
                    }
                    
                    if (!dropped) {
                        // TODO: do holywood explosion here
                    }
                }
            }
        } finally {
            WindowManager._cancelDragging();
        }
        
        DOM.cancelEvent(evt);
        return false;
    }
};

WindowManager._cancelDragging = function() {
    var callback = WindowManager._draggedElementCallback;
    if ("_ghostElmt" in callback) {
        var ghostElmt = callback._ghostElmt;
        document.body.removeChild(ghostElmt);
        
        delete callback._ghostElmt;
    }
    if (WindowManager._dropTargetHighlightElement != null) {
        document.body.removeChild(WindowManager._dropTargetHighlightElement);
        WindowManager._dropTargetHighlightElement = null;
    }
    if (WindowManager._draggingModeIndicatorElmt != null) {
        document.body.removeChild(WindowManager._draggingModeIndicatorElmt);
        WindowManager._draggingModeIndicatorElmt = null;
    }
    
    WindowManager._draggedElement = null;
    WindowManager._draggedElementCallback = null;
    WindowManager._potentialDropTarget = null;
    WindowManager._dropTargetHighlightElement = null;
    WindowManager._lastCoords = null;
    WindowManager._ghostCoords = null;
    WindowManager._draggingMode = "";
    WindowManager._dragging = false;
};

WindowManager._findDropTarget = function(elmt) {
    while (elmt != null) {
        if ("ondrop" in elmt && (typeof elmt.ondrop) == "function") {
            break;
        }
        elmt = elmt.parentNode;
    }
    return elmt;
};

    return WindowManager;
});
