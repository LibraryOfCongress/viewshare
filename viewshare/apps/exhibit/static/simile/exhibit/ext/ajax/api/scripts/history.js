/*======================================================================
 *  History
 *
 *  This is a singleton that keeps track of undoable user actions and 
 *  performs undos and redos in response to the browser's Back and 
 *  Forward buttons.
 *
 *  Call addAction(action) to register an undoable user action. action
 *  must have 4 fields:
 *
 *      perform: an argument-less function that carries out the action
 *      undo:    an argument-less function that undos the action
 *      label:   a short, user-friendly string describing the action
 *      uiLayer: the UI layer on which the action takes place
 *
 *  By default, the history keeps track of upto 10 actions. You can 
 *  configure this behavior by setting 
 *      SAHistory.maxHistoryLength
 *  to a different number.
 *
 *  An iframe is inserted into the document's body element to track 
 *  onload events.
 *======================================================================
 */
define([
    "./ajax",
    "./dom",
    "./debug",
    "./window-manager"
], function(ListenerQueue, DOM, Debug, WindowManager) {
var SAHistory = {
    maxHistoryLength:       10,
    historyFile:            "__history__.html",
    enabled:               true,
    
    _initialized:           false,
    _listeners:             new ListenerQueue(),
    
    _actions:               [],
    _baseIndex:             0,
    _currentIndex:          0,
    
    _plainDocumentTitle:    document.title
};

SAHistory.formatHistoryEntryTitle = function(actionLabel) {
    return SAHistory._plainDocumentTitle + " {" + actionLabel + "}";
};

SAHistory.initialize = function() {
    if (SAHistory._initialized) {
        return;
    }
    
    if (SAHistory.enabled) {
        var iframe = document.createElement("iframe");
        iframe.id = "simile-ajax-history";
        iframe.style.position = "absolute";
        iframe.style.width = "10px";
        iframe.style.height = "10px";
        iframe.style.top = "0px";
        iframe.style.left = "0px";
        iframe.style.visibility = "hidden";
        iframe.src = SAHistory.historyFile + "?0";
        
        document.body.appendChild(iframe);
        DOM.registerEvent(iframe, "load", SAHistory._handleIFrameOnLoad);
        
        SAHistory._iframe = iframe;
    }
    SAHistory._initialized = true;
};

SAHistory.addListener = function(listener) {
    SAHistory._listeners.add(listener);
};

SAHistory.removeListener = function(listener) {
    SAHistory._listeners.remove(listener);
};

SAHistory.addAction = function(action) {
    SAHistory._listeners.fire("onBeforePerform", [ action ]);
    window.setTimeout(function() {
        try {
            action.perform();
            SAHistory._listeners.fire("onAfterPerform", [ action ]);
                
            if (SAHistory.enabled) {
                SAHistory._actions = SAHistory._actions.slice(
                    0, SAHistory._currentIndex - SAHistory._baseIndex);
                    
                SAHistory._actions.push(action);
                SAHistory._currentIndex++;
                
                var diff = SAHistory._actions.length - SAHistory.maxHistoryLength;
                if (diff > 0) {
                    SAHistory._actions = SAHistory._actions.slice(diff);
                    SAHistory._baseIndex += diff;
                }
                
                try {
                    SAHistory._iframe.contentWindow.location.search = 
                        "?" + SAHistory._currentIndex;
                } catch (e) {
                    /*
                     *  We can't modify location.search most probably because it's a file:// url.
                     *  We'll just going to modify the document's title.
                     */
                    var title = SAHistory.formatHistoryEntryTitle(action.label);
                    document.title = title;
                }
            }
        } catch (e) {
            Debug.exception(e, "Error adding action {" + action.label + "} to history");
        }
    }, 0);
};

SAHistory.addLengthyAction = function(perform, undo, label) {
    SAHistory.addAction({
        perform:    perform,
        undo:       undo,
        label:      label,
        uiLayer:    WindowManager.getBaseLayer(),
        lengthy:    true
    });
};

SAHistory._handleIFrameOnLoad = function() {
    /*
     *  This function is invoked when the user herself
     *  navigates backward or forward. We need to adjust
     *  the application's state accordingly.
     */
    
    try {
        var q = SAHistory._iframe.contentWindow.location.search;
        var c = (q.length == 0) ? 0 : Math.max(0, parseInt(q.substr(1)));
        
        var finishUp = function() {
            var diff = c - SAHistory._currentIndex;
            SAHistory._currentIndex += diff;
            SAHistory._baseIndex += diff;
                
            SAHistory._iframe.contentWindow.location.search = "?" + c;
        };
        
        if (c < SAHistory._currentIndex) { // need to undo
            SAHistory._listeners.fire("onBeforeUndoSeveral", []);
            window.setTimeout(function() {
                while (SAHistory._currentIndex > c && 
                       SAHistory._currentIndex > SAHistory._baseIndex) {
                       
                    SAHistory._currentIndex--;
                    
                    var action = SAHistory._actions[SAHistory._currentIndex - SAHistory._baseIndex];
                    
                    try {
                        action.undo();
                    } catch (e) {
                        Debug.exception(e, "History: Failed to undo action {" + action.label + "}");
                    }
                }
                
                SAHistory._listeners.fire("onAfterUndoSeveral", []);
                finishUp();
            }, 0);
        } else if (c > SAHistory._currentIndex) { // need to redo
            SAHistory._listeners.fire("onBeforeRedoSeveral", []);
            window.setTimeout(function() {
                while (SAHistory._currentIndex < c && 
                       SAHistory._currentIndex - SAHistory._baseIndex < SAHistory._actions.length) {
                       
                    var action = SAHistory._actions[SAHistory._currentIndex - SAHistory._baseIndex];
                    
                    try {
                        action.perform();
                    } catch (e) {
                        Debug.exception(e, "History: Failed to redo action {" + action.label + "}");
                    }
                    
                    SAHistory._currentIndex++;
                }
                
                SAHistory._listeners.fire("onAfterRedoSeveral", []);
                finishUp();
            }, 0);
        } else {
            var index = SAHistory._currentIndex - SAHistory._baseIndex - 1;
            var title = (index >= 0 && index < SAHistory._actions.length) ?
                SAHistory.formatHistoryEntryTitle(SAHistory._actions[index].label) :
                SAHistory._plainDocumentTitle;
                
            SAHistory._iframe.contentWindow.document.title = title;
            document.title = title;
        }
    } catch (e) {
        // silent
    }
};

SAHistory.getNextUndoAction = function() {
    try {
        var index = SAHistory._currentIndex - SAHistory._baseIndex - 1;
        return SAHistory._actions[index];
    } catch (e) {
        return null;
    }
};

SAHistory.getNextRedoAction = function() {
    try {
        var index = SAHistory._currentIndex - SAHistory._baseIndex;
        return SAHistory._actions[index];
    } catch (e) {
        return null;
    }
};

    return SAHistory;
});
