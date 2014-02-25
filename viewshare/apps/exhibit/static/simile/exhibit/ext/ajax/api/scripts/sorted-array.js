define(function() {
/**
 * A sorted array data structure
 *
 * @constructor
 */
var SortedArray = function(compare, initialArray) {
    this._a = (initialArray instanceof Array) ? initialArray : [];
    this._compare = compare;
};

SortedArray.prototype.add = function(elmt) {
    var sa = this;
    var index = this.find(function(elmt2) {
        return sa._compare(elmt2, elmt);
    });
    
    if (index < this._a.length) {
        this._a.splice(index, 0, elmt);
    } else {
        this._a.push(elmt);
    }
};

SortedArray.prototype.remove = function(elmt) {
    var sa = this;
    var index = this.find(function(elmt2) {
        return sa._compare(elmt2, elmt);
    });
    
    while (index < this._a.length && this._compare(this._a[index], elmt) == 0) {
        if (this._a[index] == elmt) {
            this._a.splice(index, 1);
            return true;
        } else {
            index++;
        }
    }
    return false;
};

SortedArray.prototype.removeAll = function() {
    this._a = [];
};

SortedArray.prototype.elementAt = function(index) {
    return this._a[index];
};

SortedArray.prototype.length = function() {
    return this._a.length;
};

SortedArray.prototype.find = function(compare) {
    var a = 0;
    var b = this._a.length;
    
    while (a < b) {
        var mid = Math.floor((a + b) / 2);
        var c = compare(this._a[mid]);
        if (mid == a) {
            return c < 0 ? a+1 : a;
        } else if (c < 0) {
            a = mid;
        } else {
            b = mid;
        }
    }
    return a;
};

SortedArray.prototype.getFirst = function() {
    return (this._a.length > 0) ? this._a[0] : null;
};

SortedArray.prototype.getLast = function() {
    return (this._a.length > 0) ? this._a[this._a.length - 1] : null;
};

    return SortedArray;
});
