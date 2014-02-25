define(["./units", "./sorted-array"], function(NativeDateUnit, SortedArray) {
/*==================================================
 *  Event Index
 *==================================================
 */

var EventIndex = function(unit) {
    var eventIndex = this;
    
    this._unit = (unit != null) ? unit : NativeDateUnit;
    this._events = new SortedArray(
        function(event1, event2) {
            return eventIndex._unit.compare(event1.getStart(), event2.getStart());
        }
    );
    this._idToEvent = {};
    this._indexed = true;
};

EventIndex.prototype.getUnit = function() {
    return this._unit;
};

EventIndex.prototype.getEvent = function(id) {
    return this._idToEvent[id];
};

EventIndex.prototype.add = function(evt) {
    this._events.add(evt);
    this._idToEvent[evt.getID()] = evt;
    this._indexed = false;
};

EventIndex.prototype.removeAll = function() {
    this._events.removeAll();
    this._idToEvent = {};
    this._indexed = false;
};

EventIndex.prototype.getCount = function() {
    return this._events.length();
};

EventIndex.prototype.getIterator = function(startDate, endDate) {
    if (!this._indexed) {
        this._index();
    }
    return new EventIndex._Iterator(this._events, startDate, endDate, this._unit);
};

EventIndex.prototype.getReverseIterator = function(startDate, endDate) {
    if (!this._indexed) {
        this._index();
    }
    return new EventIndex._ReverseIterator(this._events, startDate, endDate, this._unit);
};

EventIndex.prototype.getAllIterator = function() {
    return new EventIndex._AllIterator(this._events);
};

EventIndex.prototype.getEarliestDate = function() {
    var evt = this._events.getFirst();
    return (evt == null) ? null : evt.getStart();
};

EventIndex.prototype.getLatestDate = function() {
    var evt = this._events.getLast();
    if (evt == null) {
        return null;
    }
    
    if (!this._indexed) {
        this._index();
    }
    
    var index = evt._earliestOverlapIndex;
    var date = this._events.elementAt(index).getEnd();
    for (var i = index + 1; i < this._events.length(); i++) {
        date = this._unit.later(date, this._events.elementAt(i).getEnd());
    }
    
    return date;
};

EventIndex.prototype._index = function() {
    /*
     *  For each event, we want to find the earliest preceding
     *  event that overlaps with it, if any.
     */
    
    var l = this._events.length();
    for (var i = 0; i < l; i++) {
        var evt = this._events.elementAt(i);
        evt._earliestOverlapIndex = i;
    }
    
    var toIndex = 1;
    for (var i = 0; i < l; i++) {
        var evt = this._events.elementAt(i);
        var end = evt.getEnd();
        
        toIndex = Math.max(toIndex, i + 1);
        while (toIndex < l) {
            var evt2 = this._events.elementAt(toIndex);
            var start2 = evt2.getStart();
            
            if (this._unit.compare(start2, end) < 0) {
                evt2._earliestOverlapIndex = i;
                toIndex++;
            } else {
                break;
            }
        }
    }
    this._indexed = true;
};

EventIndex._Iterator = function(events, startDate, endDate, unit) {
    this._events = events;
    this._startDate = startDate;
    this._endDate = endDate;
    this._unit = unit;
    
    this._currentIndex = events.find(function(evt) {
        return unit.compare(evt.getStart(), startDate);
    });
    if (this._currentIndex - 1 >= 0) {
        this._currentIndex = this._events.elementAt(this._currentIndex - 1)._earliestOverlapIndex;
    }
    this._currentIndex--;
    
    this._maxIndex = events.find(function(evt) {
        return unit.compare(evt.getStart(), endDate);
    });
    
    this._hasNext = false;
    this._next = null;
    this._findNext();
};

EventIndex._Iterator.prototype = {
    hasNext: function() { return this._hasNext; },
    next: function() {
        if (this._hasNext) {
            var next = this._next;
            this._findNext();
            
            return next;
        } else {
            return null;
        }
    },
    _findNext: function() {
        var unit = this._unit;
        while ((++this._currentIndex) < this._maxIndex) {
            var evt = this._events.elementAt(this._currentIndex);
            if (unit.compare(evt.getStart(), this._endDate) < 0 &&
                unit.compare(evt.getEnd(), this._startDate) > 0) {
                
                this._next = evt;
                this._hasNext = true;
                return;
            }
        }
        this._next = null;
        this._hasNext = false;
    }
};

EventIndex._ReverseIterator = function(events, startDate, endDate, unit) {
    this._events = events;
    this._startDate = startDate;
    this._endDate = endDate;
    this._unit = unit;
    
    this._minIndex = events.find(function(evt) {
        return unit.compare(evt.getStart(), startDate);
    });
    if (this._minIndex - 1 >= 0) {
        this._minIndex = this._events.elementAt(this._minIndex - 1)._earliestOverlapIndex;
    }
    
    this._maxIndex = events.find(function(evt) {
        return unit.compare(evt.getStart(), endDate);
    });
    
    this._currentIndex = this._maxIndex;
    this._hasNext = false;
    this._next = null;
    this._findNext();
};

EventIndex._ReverseIterator.prototype = {
    hasNext: function() { return this._hasNext; },
    next: function() {
        if (this._hasNext) {
            var next = this._next;
            this._findNext();
            
            return next;
        } else {
            return null;
        }
    },
    _findNext: function() {
        var unit = this._unit;
        while ((--this._currentIndex) >= this._minIndex) {
            var evt = this._events.elementAt(this._currentIndex);
            if (unit.compare(evt.getStart(), this._endDate) < 0 &&
                unit.compare(evt.getEnd(), this._startDate) > 0) {
                
                this._next = evt;
                this._hasNext = true;
                return;
            }
        }
        this._next = null;
        this._hasNext = false;
    }
};

EventIndex._AllIterator = function(events) {
    this._events = events;
    this._index = 0;
};

EventIndex._AllIterator.prototype = {
    hasNext: function() {
        return this._index < this._events.length();
    },
    next: function() {
        return this._index < this._events.length() ?
            this._events.elementAt(this._index++) : null;
    }
};

    return EventIndex;
});
